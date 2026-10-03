// ============================================================
// SIMPEN — Backend Google Apps Script (Pure REST API)
// doGet  : data publik (showcase)
// doPost : login admin + CRUD (wajib token)
// ============================================================

const APP_NAME = 'SIMPEN';
const SESSION_HOURS = 8;           // durasi sesi admin
const MAX_FAIL = 5, LOCK_SECONDS = 900; // 5x salah → kunci 15 menit

// ---------- SKEMA SHEET (urutan kolom = urutan header) ----------
const SCHEMA = {
  Penelitian: ['id','judul','bidang','kolaborator','tanggal_mulai','status','link_berkas','link_pdf','catatan','tampil_publik'],
  // Catatan: kolom 'indeks','impact_factor','waktu_review' adalah kolom lama (tidak dipakai lagi, dibiarkan agar data lama tetap sejajar).
  // Kolom baru ditaruh di AKHIR: jenis_kampus, rumpun_ilmu, akreditasi.
  Jurnal:     ['id','nama','link','thumbnail','penerbit','tipe_biaya','apc','indeks','impact_factor','waktu_review','scope','catatan','tampil_publik','jenis_kampus','rumpun_ilmu','akreditasi'],
  Submission: ['id','id_penelitian','judul','id_jurnal','status','tgl_submit','tgl_cek','deadline_respon','link_feedback','link_final','doi','tahun_terbit','catatan','tampil_publik'],
  CFP:        ['id','nama','link','id_jurnal','scope','deadline','status','catatan','pengingat_terkirim'],
  Pengaturan: ['id','nama','afiliasi','wa','ambang_cfp','ambang_cek','jam'],
  StatusLog:  ['id_submission','status_lama','status_baru','waktu'],
  Log:        ['waktu','jenis','tujuan','hasil']
};
const EDITABLE = ['Penelitian','Jurnal','Submission','CFP','Pengaturan']; // entitas yang boleh di-upsert dari klien
const PROSES = ['Submitted','Under Review','Revision Requested','Resubmitted','Accepted'];

const PROPS = () => PropertiesService.getScriptProperties();
const CONFIG = { get SPREADSHEET_ID(){ return PROPS().getProperty('SPREADSHEET_ID'); } };

// ============================================================
// ENTRY POINTS
// ============================================================
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getPublic';
    if (action === 'getPublic') return out({ success: true, data: getPublic() });
    return out({ success: false, message: 'Action tidak dikenal' });
  } catch (err) { return out({ success: false, message: 'Terjadi kesalahan server.' }); }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const a = body.action, d = body.data || {};
    if (a === 'login') return out(login(d.password));
    if (!tokenValid(body.token)) return out({ success: false, message: 'Sesi berakhir. Silakan masuk kembali.' });
    switch (a) {
      case 'logout':    return out({ success: true });
      case 'bootstrap': return out({ success: true, data: bootstrap() });
      case 'upsert':    return out(upsert(d.entity, d.record));
      case 'delete':    return out(remove(d.entity, d.id));
      case 'thumb':     return out(fetchThumb(d.url));
      case 'testwa':    return out(testWA());
      default:          return out({ success: false, message: 'Action tidak dikenal' });
    }
  } catch (err) { return out({ success: false, message: 'Terjadi kesalahan server.' }); }
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// AUTENTIKASI (hash SHA-256 + salt, token HMAC stateless)
// ============================================================
function sha256(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
    .map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}
function hmac(s) {
  const sig = Utilities.computeHmacSha256Signature(s, PROPS().getProperty('TOKEN_SECRET'));
  return Utilities.base64EncodeWebSafe(sig);
}
function login(pw) {
  const cache = CacheService.getScriptCache();
  const fails = Number(cache.get('fails') || 0);
  if (fails >= MAX_FAIL) return { success: false, message: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' };
  const p = PROPS(), salt = p.getProperty('ADMIN_SALT'), hash = p.getProperty('ADMIN_HASH');
  if (!hash) return { success: false, message: 'Kata sandi admin belum diatur. Jalankan aturKataSandiAdmin().' };
  if (sha256(salt + String(pw || '')) !== hash) {
    cache.put('fails', String(fails + 1), LOCK_SECONDS);
    return { success: false, message: 'Kata sandi salah. Sisa percobaan: ' + (MAX_FAIL - fails - 1) };
  }
  cache.remove('fails');
  const exp = Date.now() + SESSION_HOURS * 3600 * 1000;
  return { success: true, token: exp + '.' + hmac(String(exp)) };
}
function tokenValid(t) {
  if (!t || String(t).indexOf('.') < 0) return false;
  const [exp, sig] = String(t).split('.');
  return Number(exp) > Date.now() && hmac(exp) === sig;
}

// ============================================================
// SHEET HELPERS (baca/tulis batch)
// ============================================================
function sheet(name) { return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(name); }

function norm(v) {
  if (v === true || v === 'TRUE') return true;
  if (v === false || v === 'FALSE') return false;
  if (v instanceof Date) return Utilities.formatDate(v, 'Asia/Jakarta', 'yyyy-MM-dd');
  return v === null || v === undefined ? '' : String(v);
}
function readAll(name) {
  const cache = CacheService.getScriptCache(), key = 'sp_' + name;
  const hit = cache.get(key); if (hit) return JSON.parse(hit);
  const sh = sheet(name), cols = SCHEMA[name], n = sh.getLastRow() - 1;
  const rows = n > 0 ? sh.getRange(2, 1, n, cols.length).getValues() : [];
  const data = rows.map(r => { const o = {}; cols.forEach((c, i) => o[c] = norm(r[i])); return o; })
                   .filter(o => o[cols[0]] !== '');
  try { cache.put(key, JSON.stringify(data), 600); } catch (e) {}
  return data;
}
function bust() { CacheService.getScriptCache().removeAll(Object.keys(SCHEMA).map(k => 'sp_' + k).concat('sp_pub')); }

function clean(v) {
  if (typeof v === 'boolean') return v;
  return String(v === null || v === undefined ? '' : v).slice(0, 4000); // batasi panjang
}

function upsert(entity, rec) {
  if (EDITABLE.indexOf(entity) < 0 || !rec || !rec.id) return { success: false, message: 'Data tidak valid.' };
  const cols = SCHEMA[entity], lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = sheet(entity), last = sh.getLastRow();
    const ids = last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().map(r => String(r[0])) : [];
    const i = ids.indexOf(String(rec.id));
    const row = cols.map(c => clean(rec[c]));
    if (entity === 'Submission' && i >= 0) {
      const old = readAll('Submission').find(x => x.id === rec.id);
      if (old && old.status !== rec.status) logStatus(rec.id, old.status, rec.status);
    }
    if (i < 0) sh.getRange(last + 1, 1, 1, cols.length).setValues([row]);
    else sh.getRange(i + 2, 1, 1, cols.length).setValues([row]);
    bust();
    return { success: true };
  } finally { lock.releaseLock(); }
}

function remove(entity, id) {
  if (EDITABLE.indexOf(entity) < 0) return { success: false, message: 'Data tidak valid.' };
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = sheet(entity), last = sh.getLastRow();
    if (last < 2) return { success: true };
    const ids = sh.getRange(2, 1, last - 1, 1).getValues().map(r => String(r[0]));
    const i = ids.indexOf(String(id));
    if (i >= 0) sh.deleteRow(i + 2);
    bust();
    return { success: true };
  } finally { lock.releaseLock(); }
}

function logStatus(idSub, lama, baru) {
  sheet('StatusLog').appendRow([idSub, lama, baru, Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm')]);
}
function logNotif(jenis, tujuan, hasil) {
  sheet('Log').appendRow([Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm'), jenis, tujuan, hasil]);
  bust();
}

// ============================================================
// DATA ENDPOINT
// ============================================================
function bootstrap() {
  const log = readAll('Log').reverse().slice(0, 20);
  return {
    Penelitian: readAll('Penelitian'), Jurnal: readAll('Jurnal'), Submission: readAll('Submission'),
    CFP: readAll('CFP'), Pengaturan: readAll('Pengaturan'),
    StatusLog: readAll('StatusLog').reverse().slice(0, 300), Log: log
  };
}

// Akreditasi: "Sinta 1–4" atau "Non-Sinta". Data lama (kolom indeks teks bebas) tetap terbaca.
function akreditasiOf(j) {
  const m = String(j.akreditasi || j.indeks || '').match(/sinta\s*([1-4])\b/i);
  return m ? 'Sinta ' + m[1] : 'Non-Sinta';
}

// Publik: hanya kolom whitelist & entri bertanda tampil_publik. Tidak ada catatan/feedback/nomor WA.
function getPublic() {
  const cache = CacheService.getScriptCache(), hit = cache.get('sp_pub');
  if (hit) return JSON.parse(hit);
  const J = {}; readAll('Jurnal').forEach(j => J[j.id] = j);
  const cfg = readAll('Pengaturan')[0] || {};
  const row = s => { const j = J[s.id_jurnal] || {}; return {
    id: s.id, judul: s.judul, jurnal: j.nama || '-', indeks: akreditasiOf(j), link_jurnal: j.link || '',
    status: s.status, tgl_submit: s.tgl_submit, tgl_cek: s.tgl_cek, deadline_respon: s.deadline_respon,
    doi: s.doi, link_final: s.link_final, tahun_terbit: s.tahun_terbit }; };
  const S = readAll('Submission').filter(s => s.tampil_publik === true || s.tampil_publik === 'TRUE' || s.tampil_publik === 'true');
  const P = readAll('Penelitian').filter(p => p.tampil_publik === true || p.tampil_publik === 'TRUE' || p.tampil_publik === 'true').map(p => ({
    id: p.id, judul: p.judul, bidang: p.bidang, kolaborator: p.kolaborator,
    tanggal_mulai: p.tanggal_mulai, status: p.status, link_pdf: p.link_pdf || '', link_berkas: p.link_berkas || ''
  }));
  const data = {
    profil: { nama: cfg.nama || APP_NAME, afiliasi: cfg.afiliasi || '' },
    publikasi: S.filter(s => s.status === 'Published').map(row),
    proses: S.filter(s => PROSES.indexOf(s.status) >= 0).map(row),
    penelitian: P,
    jurnal: Object.keys(J).map(k => J[k]).filter(j => j.tampil_publik === true || j.tampil_publik === 'TRUE' || j.tampil_publik === 'true').map(j => ({
      id: j.id, nama: j.nama, link: j.link, thumbnail: j.thumbnail, penerbit: j.penerbit, tipe_biaya: j.tipe_biaya,
      apc: j.apc, jenis_kampus: j.jenis_kampus || 'PTN', rumpun_ilmu: j.rumpun_ilmu, akreditasi: akreditasiOf(j), scope: j.scope }))
  };
  try { cache.put('sp_pub', JSON.stringify(data), 600); } catch (e) {}
  return data;
}

// ============================================================
// THUMBNAIL OTOMATIS (og:image)
// ============================================================
function fetchThumb(url) {
  url = String(url || '').trim();
  if (!/^https?:\/\//i.test(url)) return { success: false, message: 'Tautan tidak valid.' };
  if (/^https?:\/\/(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.)/i.test(url)) return { success: false, message: 'Tautan tidak diizinkan.' };
  try {
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true, headers: { 'User-Agent': 'Mozilla/5.0 SIMPEN' } });
    const html = res.getContentText().slice(0, 200000);
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
           || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (!m) return { success: false, message: 'Thumbnail tidak ditemukan. Isi URL gambar secara manual.' };
    let img = m[1].replace(/&amp;/g, '&');
    if (img.indexOf('//') === 0) img = 'https:' + img;
    else if (img.charAt(0) === '/') img = url.match(/^https?:\/\/[^\/]+/i)[0] + img;
    return { success: true, thumbnail: img };
  } catch (e) { return { success: false, message: 'Gagal mengambil halaman jurnal.' }; }
}

// ============================================================
// WHATSAPP VIA FONNTE
// ============================================================
function sendWA(target, message) {
  const token = PROPS().getProperty('FONNTE_TOKEN');
  if (!token) return { ok: false, msg: 'FONNTE_TOKEN belum diatur di Script Properties.' };
  if (!target) return { ok: false, msg: 'Nomor WhatsApp admin belum diisi di Pengaturan.' };
  try {
    const res = UrlFetchApp.fetch('https://api.fonnte.com/send', {
      method: 'post', headers: { Authorization: token }, muteHttpExceptions: true,
      payload: { target: String(target), message: message, countryCode: '62' } });
    const j = JSON.parse(res.getContentText());
    return j.status ? { ok: true, msg: 'Berhasil' } : { ok: false, msg: String(j.reason || 'Gagal dikirim') };
  } catch (e) { return { ok: false, msg: 'Tidak dapat menghubungi Fonnte.' }; }
}
function testWA() {
  const cfg = readAll('Pengaturan')[0] || {};
  const r = sendWA(cfg.wa, '[SIMPEN] Pesan uji berhasil. Pengingat WhatsApp aktif.');
  logNotif('Pesan Uji', cfg.wa || '-', r.ok ? 'Berhasil' : 'Gagal: ' + r.msg);
  return { success: r.ok, message: r.ok ? 'Pesan uji terkirim.' : r.msg };
}

// ============================================================
// PENGINGAT HARIAN (dipasang trigger — maksimal 1 pesan gabungan per hari)
// ============================================================
function cekPengingat() {
  const cfg = readAll('Pengaturan')[0] || {};
  const ambang = String(cfg.ambang_cfp || '7,3,0').split(',').map(x => Number(x.trim())).filter(x => !isNaN(x));
  const batasCek = Number(cfg.ambang_cek || 14);
  const hari = d => Math.ceil((new Date(d + 'T00:00:00+07:00') - new Date(Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd') + 'T00:00:00+07:00')) / 864e5);
  const J = {}; readAll('Jurnal').forEach(j => J[j.id] = j.nama);
  const baris = [], tandai = [];

  readAll('CFP').forEach(c => {
    if (c.status === 'Sudah Submit' || c.status === 'Ditutup' || !c.deadline) return;
    const n = hari(c.deadline), kunci = 'H' + n, sent = String(c.pengingat_terkirim || '').split(',');
    if (ambang.indexOf(n) >= 0 && sent.indexOf(kunci) < 0) {
      baris.push('• CFP ' + c.nama + ' — ' + (n === 0 ? 'HARI INI' : 'H-' + n) + ' (' + c.deadline + ')' + (c.link ? '\n  ' + c.link : ''));
      tandai.push({ c: c, kunci: kunci, sent: sent });
    }
  });
  readAll('Submission').forEach(s => {
    if (PROSES.indexOf(s.status) < 0) return;
    if (s.tgl_cek && -hari(s.tgl_cek) > batasCek) baris.push('• Perlu dicek (' + (-hari(s.tgl_cek)) + ' hari): ' + s.judul + ' — ' + (J[s.id_jurnal] || '-'));
    if (s.deadline_respon) { const n = hari(s.deadline_respon); if (n >= 0 && n <= 7) baris.push('• Batas revisi H-' + n + ': ' + s.judul); }
  });
  if (!baris.length) return; // tidak ada pemicu → tidak kirim apa pun (hemat kuota)

  const pesan = '[SIMPEN — Pengingat]\n' + baris.join('\n');
  const r = sendWA(cfg.wa, pesan);
  logNotif('Pengingat Harian', cfg.wa || '-', r.ok ? 'Berhasil' : 'Gagal: ' + r.msg);
  if (r.ok) {
    tandai.forEach(t => { // tandai ambang yang sudah terkirim agar tidak ganda
      const rec = Object.assign({}, t.c, { pengingat_terkirim: t.sent.filter(Boolean).concat(t.kunci).join(',') });
      upsert('CFP', rec);
    });
  } else {
    try { MailApp.sendEmail(Session.getEffectiveUser().getEmail(), '[SIMPEN] Pengingat', pesan); } catch (e) {}
  }
}

// ============================================================
// SETUP — jalankan SEKALI
// ============================================================
function setupAppEnvironment() {
  const p = PROPS();
  if (p.getProperty('SPREADSHEET_ID')) { Logger.log('⚠️ Setup sudah pernah dijalankan. Dibatalkan agar tidak ada duplikat.'); return; }
  Logger.log('🚀 Memulai setup ' + APP_NAME + '...');
  const root = DriveApp.createFolder('📁 ' + APP_NAME);
  const uploads = root.createFolder('📂 Uploads'), exportsF = root.createFolder('📂 Exports'), backups = root.createFolder('📂 Backups');
  const ss = SpreadsheetApp.create('🗃️ Database — ' + APP_NAME);
  DriveApp.getFileById(ss.getId()).moveTo(root);

  const cfgSheet = ss.getActiveSheet().setName('AppConfig');
  cfgSheet.appendRow(['key', 'value', 'keterangan']);
  [['APP_NAME', APP_NAME, 'Nama aplikasi'], ['ROOT_FOLDER_ID', root.getId(), 'Folder root Drive'],
   ['UPLOADS_ID', uploads.getId(), 'Folder uploads'], ['EXPORTS_ID', exportsF.getId(), 'Folder exports'],
   ['BACKUPS_ID', backups.getId(), 'Folder cadangan'], ['SPREADSHEET_ID', ss.getId(), 'ID spreadsheet'],
   ['CREATED_AT', new Date().toISOString(), 'Tanggal setup']].forEach(r => cfgSheet.appendRow(r));
  cfgSheet.setFrozenRows(1);
  cfgSheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#1E3A5F').setFontColor('#ffffff');

  Object.keys(SCHEMA).forEach(name => {
    const sh = ss.insertSheet(name), cols = SCHEMA[name];
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold').setBackground('#1E3A5F').setFontColor('#ffffff');
    sh.getRange(1, 1, sh.getMaxRows(), cols.length).setNumberFormat('@'); // teks polos: cegah auto-format tanggal & injeksi formula
    sh.setFrozenRows(1);
  });
  sheetOf(ss, 'Pengaturan').getRange(2, 1, 1, SCHEMA.Pengaturan.length).setValues([['cfg', 'Nama Dosen, gelar', 'Fakultas / Universitas', '', '7,3,0', '14', '08:00']]);

  const secret = Utilities.getUuid() + Utilities.getUuid();
  p.setProperties({
    SPREADSHEET_ID: ss.getId(), ROOT_FOLDER_ID: root.getId(), UPLOADS_FOLDER: uploads.getId(),
    EXPORTS_FOLDER: exportsF.getId(), BACKUPS_FOLDER: backups.getId(), TOKEN_SECRET: secret
  });
  Logger.log('✅ Setup selesai.');
  Logger.log('   Spreadsheet : ' + ss.getUrl());
  Logger.log('   Folder Drive: ' + root.getUrl());
  Logger.log('➡️ Langkah berikut: jalankan aturKataSandiAdmin(), isi FONNTE_TOKEN di Script Properties, lalu pasangTrigger().');
}
function sheetOf(ss, name) { return ss.getSheetByName(name); }

// Atur kata sandi admin. Ganti nilai di bawah, jalankan SEKALI, lalu kembalikan ke placeholder.
function aturKataSandiAdmin() {
  const SANDI_BARU = 'GANTI_DENGAN_SANDI_ANDA';
  if (SANDI_BARU === 'GANTI_DENGAN_SANDI_ANDA' || SANDI_BARU.length < 8) throw new Error('Isi SANDI_BARU (minimal 8 karakter) dahulu.');
  const salt = Utilities.getUuid();
  PROPS().setProperties({ ADMIN_SALT: salt, ADMIN_HASH: sha256(salt + SANDI_BARU) });
  Logger.log('✅ Kata sandi admin tersimpan (dalam bentuk hash). Kembalikan SANDI_BARU ke placeholder.');
}

// Pasang trigger harian (pengingat) + cadangan mingguan. Jalankan SEKALI.
function pasangTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  const cfg = (readAll('Pengaturan')[0] || {}), jam = Number(String(cfg.jam || '08:00').split(':')[0]) || 8;
  ScriptApp.newTrigger('cekPengingat').timeBased().everyDays(1).atHour(jam).inTimezone('Asia/Jakarta').create();
  ScriptApp.newTrigger('cadanganMingguan').timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(2).inTimezone('Asia/Jakarta').create();
  Logger.log('✅ Trigger terpasang: pengingat harian jam ' + jam + ' WIB & cadangan mingguan (Minggu 02:00).');
}
function cadanganMingguan() {
  const folder = DriveApp.getFolderById(PROPS().getProperty('BACKUPS_FOLDER'));
  DriveApp.getFileById(CONFIG.SPREADSHEET_ID).makeCopy('Cadangan ' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd'), folder);
  const files = []; const it = folder.getFiles(); while (it.hasNext()) files.push(it.next());
  files.sort((a, b) => b.getDateCreated() - a.getDateCreated()).slice(8).forEach(f => f.setTrashed(true)); // simpan 8 salinan terakhir
}

// Cabut SEMUA sesi admin yang sedang aktif (mis. jika sandi atau perangkat dicurigai bocor).
function cabutSemuaSesi() {
  PROPS().setProperty('TOKEN_SECRET', Utilities.getUuid() + Utilities.getUuid());
  Logger.log('✅ Semua sesi lama dicabut. Admin harus masuk ulang.');
}

// Jalankan SEKALI setelah memperbarui kode: menulis ulang baris judul (header) semua sheet agar sesuai skema terbaru.
// Aman: hanya baris 1 yang diubah; data tidak disentuh.
function perbaruiHeaderSheet() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  Object.keys(SCHEMA).forEach(name => {
    const sh = ss.getSheetByName(name), cols = SCHEMA[name];
    if (!sh) return;
    sh.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold').setBackground('#1E3A5F').setFontColor('#ffffff');
    sh.getRange(2, 1, Math.max(sh.getMaxRows() - 1, 1), cols.length).setNumberFormat('@');
  });
  bust();
  Logger.log('✅ Header semua sheet diperbarui sesuai skema terbaru.');
}