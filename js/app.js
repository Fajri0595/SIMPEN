// SIMPEN — logika UI (vanilla JS, SPA). Navigasi instan, Optimistic UI, pencarian lokal.
(() => {
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const today = () => new Date().toISOString().slice(0, 10);
  const dayDiff = d => d ? Math.ceil((new Date(d + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 864e5) : null;
  const fmt = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const STAT = ['Draft', 'Submitted', 'Under Review', 'Revision Requested', 'Resubmitted', 'Accepted', 'Published', 'Rejected', 'Withdrawn'];
  const STC = { Draft: 'sl', Submitted: 'bl', 'Under Review': 'bl', 'Revision Requested': 'am', Resubmitted: 'am', Accepted: 'gr', Published: 'gr', Rejected: 'rs', Withdrawn: 'rs' };
  const PROSES = ['Submitted', 'Under Review', 'Revision Requested', 'Resubmitted', 'Accepted'];
  const STAGE = { Submitted: 2, 'Under Review': 3, 'Revision Requested': 4, Resubmitted: 4, Accepted: 5 };
  const STEPS = ['Drafting', 'Submitted', 'Under Review', 'Revision', 'Accepted', 'Published'];
  const badge = s => `<span class="bd ${STC[s] || 'sl'}">${esc(s)}</span>`;
  const S = { view: 'pub', tab: 'pub', page: 'dash', P: null, D: null, q: '', yr: '', jq: '', jbiaya: '', subv: 'kanban', onlyCheck: false, modal: null };

  const cfg = () => Object.assign({ nama: '', afiliasi: '', wa: '', ambang_cek: 14, ambang_cfp: '7,3,0', jam: '08:00' }, (S.D && S.D.Pengaturan && S.D.Pengaturan[0]) || {});
  const jname = id => ((S.D?.Jurnal || []).find(j => j.id === id) || {}).nama || '—';
  const perluCek = s => PROSES.includes(s.status) && s.tgl_cek && -dayDiff(s.tgl_cek) > Number(cfg().ambang_cek);
  const cfpNear = c => c.status !== 'Sudah Submit' && c.status !== 'Ditutup' && dayDiff(c.deadline) >= 0 && dayDiff(c.deadline) <= 7;

  function toast(m, err) { const t = $('#toast'), d = document.createElement('div'); d.textContent = m; if (err) d.className = 'e'; t.appendChild(d); setTimeout(() => d.remove(), 3500); }
  const pill = n => n < 0 ? `<span class="bd sl">Lewat</span>` : `<span class="bd ${n <= 3 ? 'rs' : n <= 7 ? 'am' : 'sl'}">${n === 0 ? 'Hari-H' : 'H-' + n}</span>`;

  // ============ PUBLIK ============
  function pubIdx(i) { return i ? `<span class="bd nv">${esc(i)}</span>` : ''; }
  function viewPub() {
    const P = S.P; if (!P) return `<div class="wrap">Memuat data…</div>`;
    const q = S.q.toLowerCase();
    const match = x => !q || JSON.stringify(x).toLowerCase().includes(q);
    const pubs = P.publikasi.filter(x => match(x) && (!S.yr || x.tahun_terbit === S.yr));
    const years = [...new Set(P.publikasi.map(x => x.tahun_terbit).filter(Boolean))].sort().reverse();
    let list = '';
    if (S.tab === 'pub') list = pubs.map(x => `<div class="card item"><div>${pubIdx(x.indeks)} <span class="bd sl">${esc(x.tahun_terbit)}</span></div><h3>${esc(x.judul)}</h3><div class="mu">${esc(x.jurnal)}</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;gap:8px;flex-wrap:wrap"><span class="mono bd bl">${esc(x.doi || 'DOI belum tersedia')}</span>${(x.link_final || x.doi) ? `<a class="btn" href="${esc(x.link_final || 'https://doi.org/' + x.doi)}" target="_blank" rel="noopener">Buka Artikel / DOI ↗</a>` : ''}</div></div>`).join('') || '<div class="card mu">Belum ada publikasi yang ditampilkan.</div>';
    if (S.tab === 'proses') list = P.proses.filter(match).map(x => { const st = STAGE[x.status] || 2, dl = dayDiff(x.deadline_respon); return `<div class="card item"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><div>${badge(x.status)} <b>${esc(x.jurnal)}</b> ${pubIdx(x.indeks)}</div>${x.link_jurnal ? `<a href="${esc(x.link_jurnal)}" target="_blank" rel="noopener">Buka Link Jurnal ↗</a>` : ''}</div><h3>${esc(x.judul)}</h3><div class="mu">Tanggal submit: ${fmt(x.tgl_submit)} · Terakhir diperbarui: ${fmt(x.tgl_cek)}${x.deadline_respon ? ` · Batas respon: ${fmt(x.deadline_respon)} ${dl != null ? pill(dl) : ''}` : ''}</div><div class="steps">${STEPS.map((_, i) => `<i class="${i < st - 1 ? 'd' : i === st - 1 ? 'c' : ''}"></i>`).join('')}</div><div class="mu" style="display:flex;justify-content:space-between;margin-top:6px"><span>${STEPS[st - 1]}</span><span>Tahap ${st} dari 6</span></div></div>`; }).join('') + `<div class="card mu" style="background:#EFF6FF">Catatan internal dan feedback reviewer tidak ditampilkan.</div>`;
    if (S.tab === 'jur') list = `<div class="stats">${P.jurnal.filter(match).filter(j => !S.jbiaya || (S.jbiaya === 'g' ? j.tipe_biaya === 'Gratis' : j.tipe_biaya !== 'Gratis')).map(jCard).join('')}</div>`;
    return `<header class="top"><div class="brand"><div class="logo">SP</div><div><b class="serif">SIMPEN</b><small>${esc(P.profil.nama)} · ${esc(P.profil.afiliasi)}</small></div></div><button class="btn pri" data-a="goLogin">Masuk Admin</button></header>
    <div class="wrap"><div class="stats"><div class="card stat"><span>Publikasi terbit</span><b>${P.publikasi.length}</b></div><div class="card stat"><span>Artikel dalam proses</span><b>${P.proses.length}</b></div><div class="card stat"><span>Katalog jurnal</span><b>${P.jurnal.length}</b></div></div>
    <div class="tabs">${[['pub', 'Publikasi'], ['proses', 'Dalam Proses'], ['jur', 'Katalog Jurnal']].map(([k, l]) => `<button data-a="tab" data-id="${k}" class="${S.tab === k ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div class="card" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;background:#EFECFF"><input class="in" id="q" style="flex:1;min-width:200px" placeholder="Cari judul, jurnal, atau kata kunci…" value="${esc(S.q)}">${S.tab === 'pub' ? `<select id="yr" style="width:140px"><option value="">Semua tahun</option>${years.map(y => `<option ${y === S.yr ? 'selected' : ''}>${y}</option>`).join('')}</select>` : ''}${S.tab === 'jur' ? `<select id="jb" style="width:160px"><option value="">Semua biaya</option><option value="g" ${S.jbiaya === 'g' ? 'selected' : ''}>Gratis</option><option value="b" ${S.jbiaya === 'b' ? 'selected' : ''}>Berbayar (APC)</option></select>` : ''}</div>${list}
    <p class="mu" style="text-align:center;margin-top:32px">© ${new Date().getFullYear()} SIMPEN · Repositori penelitian dosen</p></div>`;
  }
  function jCard(j) {
    const th = j.thumbnail ? `<img src="${esc(j.thumbnail)}" alt="" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0" onerror="this.outerHTML='<div class=&quot;logo&quot; style=&quot;width:100%;height:120px;border-radius:8px 8px 0 0;font-size:28px&quot;>${esc((j.nama || '?').slice(0, 3).toUpperCase())}</div>'">` : `<div class="logo" style="width:100%;height:120px;border-radius:8px 8px 0 0;font-size:28px">${esc((j.nama || '?').slice(0, 3).toUpperCase())}</div>`;
    return `<div class="card" style="padding:0;overflow:hidden">${th}<div style="padding:16px"><div class="mu" style="font-size:11px;text-transform:uppercase">${esc(j.penerbit)}</div><h3 style="margin:4px 0 8px">${esc(j.nama)}</h3><span class="bd ${j.tipe_biaya === 'Gratis' ? 'gr' : 'am'}">${j.tipe_biaya === 'Gratis' ? 'Gratis' : 'APC ' + esc(j.apc)}</span> ${j.indeks ? `<span class="bd nv">${esc(j.indeks)}</span>` : ''}<div class="mu" style="margin:10px 0">IF: <b>${esc(j.impact_factor || '—')}</b> · Review: <b>${esc(j.waktu_review || '—')}</b></div><div class="mu" style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(j.scope)}</div><a class="btn" style="display:block;text-align:center;margin-top:12px;line-height:38px" href="${esc(j.link)}" target="_blank" rel="noopener">Buka Jurnal ↗</a></div></div>`;
  }

  // ============ LOGIN ============
  const viewLogin = () => `<div class="login card"><div class="logo" style="margin:0 auto 12px;width:56px;height:56px">SP</div><h1>Masuk Admin</h1><p class="mu">Sistem Manajemen Penelitian Dosen (SIMPEN)</p><span class="bd bl">Akses khusus pengelola data dan publikasi</span>${API.demo ? '<p class="mu" style="margin-top:12px">Mode demo — kata sandi: <b>admin</b></p>' : ''}<form id="lf" style="text-align:left"><label for="pw">Kata Sandi Admin <span style="color:#BA1A1A">*</span></label><input class="in" id="pw" type="password" placeholder="Masukkan kata sandi pengelola…" autocomplete="current-password" required><div class="mu" style="margin:6px 0 16px">Sesi admin aktif selama 8 jam setelah berhasil masuk.</div><button class="btn pri" style="width:100%">Masuk ke Panel Pengelola</button><div class="err" id="le"></div></form><p><a href="#" data-a="goPub">← Kembali ke Showcase Publik</a></p></div>`;

  // ============ ADMIN ============
  const NAV = [['dash', 'Dashboard'], ['pen', 'Penelitian'], ['jur', 'Katalog Jurnal'], ['sub', 'Submission'], ['cfp', 'CFP & Deadline'], ['set', 'Pengaturan']];
  function viewAdmin() {
    const D = S.D; if (!D) return `<div class="wrap">Memuat data…</div>`;
    const nSub = D.Submission.filter(perluCek).length, nCfp = D.CFP.filter(cfpNear).length;
    const cnt = { sub: nSub, cfp: nCfp };
    const body = { dash: pDash, pen: pPen, jur: pJur, sub: pSub, cfp: pCfp, set: pSet }[S.page]();
    return `<div class="adm"><aside class="side"><div class="brand"><div class="logo">SP</div><b class="serif" style="color:#fff">SIMPEN Admin</b></div>${NAV.map(([k, l]) => `<button data-a="nav" data-id="${k}" class="${S.page === k ? 'on' : ''}"><span>${l}</span>${cnt[k] ? `<span class="cnt">${cnt[k]}</span>` : ''}</button>`).join('')}<button data-a="logout" style="margin-top:24px">Keluar</button></aside><main class="main">${body}</main></div>`;
  }
  const head = (t, sub, act = '') => `<div class="bar"><div><h1>${t}</h1><div class="mu">${sub}</div></div><div style="display:flex;gap:8px;flex-wrap:wrap">${act}</div></div>`;

  function pDash() {
    const D = S.D, pub = D.Submission.filter(s => s.status === 'Published'), proses = D.Submission.filter(s => PROSES.includes(s.status));
    const tol = D.Submission.filter(s => ['Rejected', 'Withdrawn'].includes(s.status)), cf = D.CFP.filter(cfpNear).sort((a, b) => a.deadline.localeCompare(b.deadline)), pc = D.Submission.filter(perluCek);
    const yrs = {}; pub.forEach(s => { if (s.tahun_terbit) yrs[s.tahun_terbit] = (yrs[s.tahun_terbit] || 0) + 1; });
    const ys = Object.keys(yrs).sort(), mx = Math.max(1, ...Object.values(yrs));
    const dist = STAT.map(s => [s, D.Submission.filter(x => x.status === s).length]).filter(x => x[1]);
    const COL = { Draft: '#94A3B8', Submitted: '#93C5FD', 'Under Review': '#1E3A5F', 'Revision Requested': '#F5A623', Resubmitted: '#FCD34D', Accepted: '#10B981', Published: '#047857', Rejected: '#BE123C', Withdrawn: '#FB7185' };
    let acc = 0; const tot = D.Submission.length || 1; const cg = dist.map(([s, n]) => { const a = acc / tot * 360; acc += n; return `${COL[s]} ${a}deg ${acc / tot * 360}deg`; }).join(',');
    const jc = {}; D.Submission.forEach(s => { const n = jname(s.id_jurnal); jc[n] = (jc[n] || 0) + 1; }); const jt = Object.entries(jc).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const log = (D.Log || [])[0];
    return head('Dashboard', 'Ringkasan kondisi penelitian dan publikasi Anda', `<button class="btn" data-a="add" data-e="Penelitian">+ Tambah Penelitian</button><button class="btn pri" data-a="add" data-e="Submission">+ Catat Submission</button>`) +
      `<div class="stats">${[['Total Penelitian', D.Penelitian.length], ['Dalam Proses', proses.length], ['Artikel Terbit', pub.length], ['Ditolak / Withdrawn', tol.length], ['CFP Aktif', D.CFP.filter(c => dayDiff(c.deadline) >= 0 && c.status !== 'Ditutup').length]].map(([l, n]) => `<div class="card stat"><span>${l}</span><b>${n}</b></div>`).join('')}</div>
    <h2 style="margin:8px 0 12px">Perlu Perhatian Segera</h2><div class="grid2"><div class="card"><h3>CFP Mendekati Deadline <span class="bd am">${cf.length}</span></h3>${cf.map(c => `<div class="row" style="display:block"><div style="display:flex;justify-content:space-between;gap:8px"><b class="serif" style="font-size:14px">${esc(c.nama)}</b>${pill(dayDiff(c.deadline))}</div><div class="mu">Batas submit: ${fmt(c.deadline)}</div><div style="margin-top:8px;display:flex;gap:8px"><button class="btn pri sm" data-a="cfp2sub" data-id="${c.id}">+ Jadikan Submission</button>${c.link ? `<a class="btn sm" style="line-height:30px" href="${esc(c.link)}" target="_blank" rel="noopener">Buka Tautan CFP</a>` : ''}</div></div>`).join('') || '<p class="mu">Tidak ada yang perlu perhatian.</p>'}</div>
    <div class="card"><h3>Submission Lama Tidak Dicek <span class="bd am">${pc.length}</span></h3>${pc.map(s => `<div class="row" style="display:block"><div style="display:flex;justify-content:space-between;gap:8px"><b class="serif" style="font-size:14px">${esc(s.judul)}</b><span class="bd am">Perlu dicek · ${-dayDiff(s.tgl_cek)} hari</span></div><div class="mu">Target: ${esc(jname(s.id_jurnal))}</div><div style="margin-top:8px;display:flex;gap:8px">${linkOf(s.id_jurnal, 'Buka Portal Jurnal')}<button class="btn pri sm" data-a="cek" data-id="${s.id}">✓ Sudah Saya Cek</button></div></div>`).join('') || '<p class="mu">Semua submission sudah dicek.</p>'}</div></div>
    <h2 style="margin:24px 0 12px">Statistik & Distribusi</h2><div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))"><div class="card"><h3>Publikasi per Tahun</h3><div style="display:flex;gap:12px;align-items:flex-end;height:160px;margin-top:12px">${ys.map(y => `<div style="flex:1;max-width:64px;text-align:center"><div class="mu">${yrs[y]}</div><div style="height:${yrs[y] / mx * 120}px;background:var(--navy);border-radius:4px 4px 0 0"></div><div class="mu mono">${y}</div></div>`).join('') || '<span class="mu">Belum ada data.</span>'}</div></div>
    <div class="card"><h3>Distribusi Status</h3><div style="display:flex;gap:16px;align-items:center;margin-top:12px"><div style="width:130px;height:130px;border-radius:50%;background:conic-gradient(${cg || '#E2E8F0 0 360deg'});display:grid;place-items:center"><div style="width:84px;height:84px;border-radius:50%;background:#fff;display:grid;place-items:center"><b class="serif">${D.Submission.length}</b></div></div><div>${dist.map(([s, n]) => `<div><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${COL[s]}"></span> ${s}: ${n}</div>`).join('')}</div></div></div>
    <div class="card"><h3>Jurnal Paling Sering Dituju</h3>${jt.map(([n, c]) => `<div style="display:flex;justify-content:space-between;margin-top:10px"><span>${esc(n)}</span><b>${c} naskah</b></div><div class="hb"><i style="width:${c / jt[0][1] * 100}%"></i></div>`).join('') || '<p class="mu">Belum ada data.</p>'}</div></div>
    <div class="card" style="margin-top:16px;background:#EFF6FF">${log ? `Pengingat WhatsApp terakhir: <b>${esc(log.waktu)}</b> — ${esc(log.hasil)}` : 'Belum ada pengingat WhatsApp yang terkirim.'} <a href="#" data-a="nav" data-id="set">Lihat Log Notifikasi →</a></div>`;
  }
  const linkOf = (idj, l) => { const j = (S.D.Jurnal || []).find(x => x.id === idj); return j && j.link ? `<a class="btn sm" style="line-height:30px" href="${esc(j.link)}" target="_blank" rel="noopener">${l} ↗</a>` : ''; };

  function pPen() {
    const q = S.q.toLowerCase(), L = S.D.Penelitian.filter(p => !q || JSON.stringify(p).toLowerCase().includes(q));
    return head('Data Penelitian & Berkas', 'Penyimpanan tautan berkas, kolaborator, dan naskah terkait', `<button class="btn" data-a="csv" data-e="Penelitian">Ekspor Excel</button><button class="btn pri" data-a="add" data-e="Penelitian">+ Tambah Penelitian</button>`) +
      `<input class="in" id="q" placeholder="Cari judul, bidang, atau kolaborator…" value="${esc(S.q)}" style="margin-bottom:12px"><div class="card" style="padding:0;overflow:auto"><table><thead><tr><th>Judul</th><th>Bidang</th><th>Kolaborator</th><th>Status</th><th>Submission</th><th>Publik</th><th>Aksi</th></tr></thead><tbody>${L.map(p => `<tr><td><b class="serif" style="font-size:14px">${esc(p.judul)}</b></td><td>${esc(p.bidang)}<div class="mu">${fmt(p.tanggal_mulai)}</div></td><td>${esc(p.kolaborator)}</td><td><span class="bd ${p.status === 'Selesai' ? 'gr' : p.status === 'Berjalan' ? 'am' : 'sl'}">${esc(p.status)}</span></td><td><span class="bd bl">${S.D.Submission.filter(s => s.id_penelitian === p.id).length} naskah</span></td><td>${p.tampil_publik ? 'Ya' : 'Tidak'}</td><td style="white-space:nowrap">${p.link_berkas ? `<a class="btn sm" style="line-height:30px" href="${esc(p.link_berkas)}" target="_blank" rel="noopener">Drive</a> ` : ''}<button class="btn sm" data-a="edit" data-e="Penelitian" data-id="${p.id}">Ubah</button> <button class="btn sm dng" data-a="del" data-e="Penelitian" data-id="${p.id}">Hapus</button></td></tr>`).join('') || '<tr><td colspan="7" class="mu">Belum ada penelitian.</td></tr>'}</tbody></table></div>`;
  }

  function pJur() {
    const q = S.jq.toLowerCase(), L = S.D.Jurnal.filter(j => (!q || JSON.stringify(j).toLowerCase().includes(q)) && (!S.jbiaya || (S.jbiaya === 'g' ? j.tipe_biaya === 'Gratis' : j.tipe_biaya !== 'Gratis')));
    return head('Katalog Jurnal Rekomendasi', 'Basis data jurnal target: APC, indeks, metrik, dan visibilitas showcase', `<button class="btn" data-a="csv" data-e="Jurnal">Ekspor Excel</button><button class="btn pri" data-a="add" data-e="Jurnal">+ Tambah Jurnal Baru</button>`) +
      `<div class="stats"><div class="card stat"><span>Total jurnal</span><b>${S.D.Jurnal.length}</b></div><div class="card stat"><span>Bebas biaya</span><b>${S.D.Jurnal.filter(j => j.tipe_biaya === 'Gratis').length}</b></div><div class="card stat"><span>Tampil di showcase</span><b>${S.D.Jurnal.filter(j => j.tampil_publik).length}</b></div></div>
      <div class="card" style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap"><input class="in" id="jq" style="flex:1;min-width:200px" placeholder="Cari nama jurnal, penerbit, atau cakupan fokus…" value="${esc(S.jq)}"><select id="jb" style="width:170px"><option value="">Semua biaya</option><option value="g" ${S.jbiaya === 'g' ? 'selected' : ''}>Gratis</option><option value="b" ${S.jbiaya === 'b' ? 'selected' : ''}>Berbayar (APC)</option></select></div>
      ${L.map(j => `<div class="card item" style="display:flex;gap:16px;flex-wrap:wrap"><div style="width:160px">${(() => { const h = jCard({ ...j, scope: '' }); return h.split('<div style="padding:16px">')[0].replace('<div class="card" style="padding:0;overflow:hidden">', ''); })()}</div><div style="flex:1;min-width:240px"><div class="mu" style="font-size:11px;text-transform:uppercase">${esc(j.penerbit)} · Publik: ${j.tampil_publik ? 'AKTIF' : 'NON-AKTIF'}</div><h3>${esc(j.nama)}</h3><span class="bd ${j.tipe_biaya === 'Gratis' ? 'gr' : 'am'}">${j.tipe_biaya === 'Gratis' ? 'Gratis' : 'APC ' + esc(j.apc)}</span> ${j.indeks ? `<span class="bd nv">${esc(j.indeks)}</span>` : ''} <span class="bd sl">IF: ${esc(j.impact_factor || '—')}</span> <span class="bd sl">Review: ${esc(j.waktu_review || '—')}</span><p class="mu">${esc(j.scope)}</p><div style="display:flex;gap:8px"><a class="btn sm" style="line-height:30px" href="${esc(j.link)}" target="_blank" rel="noopener">Buka Jurnal ↗</a><button class="btn pri sm" data-a="edit" data-e="Jurnal" data-id="${j.id}">Ubah Data</button><button class="btn sm dng" data-a="del" data-e="Jurnal" data-id="${j.id}">Hapus</button></div></div></div>`).join('') || '<div class="card mu">Belum ada jurnal.</div>'}`;
  }

  function subCard(s) {
    const pc = perluCek(s), dl = dayDiff(s.deadline_respon);
    return `<div class="card" style="padding:12px;margin-bottom:8px">${pc ? `<span class="bd am">⏱ Perlu dicek · ${-dayDiff(s.tgl_cek)} hari</span>` : ''}<h3 style="font-size:14px;margin:6px 0">${esc(s.judul)}</h3><div class="mu">${esc(jname(s.id_jurnal))}</div><div class="mu">Submit: ${fmt(s.tgl_submit)} · Cek: ${fmt(s.tgl_cek)}</div>${dl != null && PROSES.includes(s.status) ? `<div>Batas revisi ${pill(dl)}</div>` : ''}<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">${linkOf(s.id_jurnal, 'Buka')}<button class="btn pri sm" data-a="cek" data-id="${s.id}">✓ Dicek</button><button class="btn sm" data-a="edit" data-e="Submission" data-id="${s.id}">Ubah</button></div><select data-a="chg" data-id="${s.id}" style="margin-top:8px;min-height:32px;font-size:12px">${STAT.map(x => `<option ${x === s.status ? 'selected' : ''}>${x}</option>`).join('')}</select></div>`;
  }
  function pSub() {
    let L = S.D.Submission; const q = S.q.toLowerCase();
    L = L.filter(s => (!q || (s.judul + jname(s.id_jurnal)).toLowerCase().includes(q)) && (!S.onlyCheck || perluCek(s)));
    const tgl = `<div class="card" style="padding:4px;display:flex"><button class="btn sm ${S.subv === 'kanban' ? 'pri' : ''}" data-a="subv" data-id="kanban">Kanban</button><button class="btn sm ${S.subv === 'tabel' ? 'pri' : ''}" data-a="subv" data-id="tabel">Tabel</button></div>`;
    const body = S.subv === 'kanban' ? `<div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:12px">${STAT.map(st => `<div style="min-width:270px;width:270px;background:var(--lav);border-radius:12px;padding:12px"><h3 style="margin-bottom:10px">${st} <span class="bd sl">${L.filter(s => s.status === st).length}</span></h3>${L.filter(s => s.status === st).map(subCard).join('')}</div>`).join('')}</div>`
      : `<div class="card" style="padding:0;overflow:auto"><table><thead><tr><th>Naskah</th><th>Jurnal</th><th>Status</th><th>Submit</th><th>Cek terakhir</th><th>Aksi</th></tr></thead><tbody>${L.map(s => `<tr><td><b class="serif" style="font-size:14px">${esc(s.judul)}</b>${perluCek(s) ? '<div><span class="bd am">Perlu dicek</span></div>' : ''}</td><td>${esc(jname(s.id_jurnal))}</td><td>${badge(s.status)}</td><td>${fmt(s.tgl_submit)}</td><td>${fmt(s.tgl_cek)}</td><td style="white-space:nowrap">${linkOf(s.id_jurnal, 'Buka')} <button class="btn pri sm" data-a="cek" data-id="${s.id}">✓ Dicek</button> <button class="btn sm" data-a="hist" data-id="${s.id}">Riwayat</button> <button class="btn sm" data-a="edit" data-e="Submission" data-id="${s.id}">Ubah</button> <button class="btn sm dng" data-a="del" data-e="Submission" data-id="${s.id}">Hapus</button></td></tr>`).join('')}</tbody></table></div>`;
    return head('Submission Tracker', 'Pantau naskah dari pengiriman hingga terbit', `${tgl}<button class="btn" data-a="csv" data-e="Submission">Ekspor Excel</button><button class="btn pri" data-a="add" data-e="Submission">+ Catat Submission Baru</button>`) +
      `<div class="card" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px"><input class="in" id="q" style="flex:1;min-width:200px" placeholder="Cari judul naskah atau jurnal…" value="${esc(S.q)}"><label style="margin:0;font-weight:500"><input type="checkbox" id="oc" ${S.onlyCheck ? 'checked' : ''}> Hanya yang perlu dicek</label></div>${body}<p class="mu">Ubah status lewat dropdown di kartu. Setiap perubahan tercatat di riwayat status.</p>`;
  }

  function pCfp() {
    const A = S.D.CFP.filter(c => dayDiff(c.deadline) >= 0).sort((a, b) => a.deadline.localeCompare(b.deadline)), O = S.D.CFP.filter(c => dayDiff(c.deadline) < 0);
    const tr = (c, old) => `<tr style="${old ? 'opacity:.6' : ''}"><td><b class="serif" style="font-size:14px">${esc(c.nama)}</b>${c.link ? ` <a href="${esc(c.link)}" target="_blank" rel="noopener">↗</a>` : ''}</td><td>${esc(c.scope)}</td><td>${fmt(c.deadline)}</td><td>${pill(dayDiff(c.deadline))}</td><td>${esc(c.status)}</td><td style="white-space:nowrap">${old ? '' : `<button class="btn pri sm" data-a="cfp2sub" data-id="${c.id}">Jadikan Submission</button> `}<button class="btn sm" data-a="edit" data-e="CFP" data-id="${c.id}">Ubah</button> <button class="btn sm dng" data-a="del" data-e="CFP" data-id="${c.id}">Hapus</button></td></tr>`;
    const th = '<thead><tr><th>Nama CFP</th><th>Scope</th><th>Batas submit</th><th>Sisa</th><th>Status</th><th>Aksi</th></tr></thead>';
    return head('Call for Papers & Deadline', 'Pantau batas pengiriman naskah; pengingat WhatsApp otomatis', `<button class="btn pri" data-a="add" data-e="CFP">+ Tambah CFP Baru</button>`) +
      `<div class="card" style="padding:0;overflow:auto"><h3 style="padding:16px">CFP Aktif (${A.length})</h3><table>${th}<tbody>${A.map(c => tr(c)).join('') || '<tr><td colspan="6" class="mu">Belum ada CFP aktif.</td></tr>'}</tbody></table></div>
      <div class="card" style="padding:0;overflow:auto;margin-top:16px"><div class="bar" style="padding:16px;margin:0"><h3>CFP yang Telah Melewati Deadline (${O.length})</h3>${O.length ? '<button class="btn sm dng" data-a="delOld">Hapus Semua yang Sudah Lewat</button>' : ''}</div>${O.length ? `<table>${th}<tbody>${O.map(c => tr(c, 1)).join('')}</tbody></table>` : ''}</div>`;
  }

  function pSet() {
    const c = cfg(), D = S.D;
    return head('Pengaturan Aplikasi', 'Pengingat WhatsApp (Fonnte) dan aturan pemantauan', '') +
      `<div class="grid2"><div class="card"><h3>Pengingat & WhatsApp</h3><form id="sf"><label>Nama pemilik (tampil di showcase)</label><input class="in" name="nama" value="${esc(c.nama)}"><label>Afiliasi</label><input class="in" name="afiliasi" value="${esc(c.afiliasi)}"><label>Nomor WhatsApp admin</label><input class="in" name="wa" value="${esc(c.wa)}" placeholder="62812xxxxxxx"><label>Ambang pengingat CFP (hari, pisahkan koma)</label><input class="in" name="ambang_cfp" value="${esc(c.ambang_cfp)}"><label>Ambang "lama tidak dicek" (hari)</label><input class="in" type="number" name="ambang_cek" value="${esc(c.ambang_cek)}"><label>Jam kirim pengingat</label><input class="in" name="jam" value="${esc(c.jam)}"><p class="mu">Token Fonnte disimpan aman di Script Properties backend (bukan di sini).</p><div style="display:flex;gap:8px"><button class="btn pri">Simpan Pengaturan</button><button type="button" class="btn" data-a="testwa">Kirim Pesan Uji WhatsApp</button></div></form></div>
      <div class="card"><h3>Log Notifikasi</h3>${(D.Log || []).slice(0, 10).map(l => `<div class="row"><span class="mono">${esc(l.waktu)}</span><span>${esc(l.jenis)}</span><span class="bd ${/berhasil/i.test(l.hasil) ? 'gr' : 'rs'}">${esc(l.hasil)}</span></div>`).join('') || '<p class="mu">Belum ada log.</p>'}</div></div>`;
  }

  // ============ MODAL FORM ============
  const FIELDS = {
    Penelitian: [['judul', 'Judul Penelitian *', 'text'], ['bidang', 'Bidang / Disiplin Ilmu', 'text'], ['kolaborator', 'Kolaborator (pisahkan titik koma)', 'textarea'], ['tanggal_mulai', 'Tanggal Mulai', 'date'], ['status', 'Status', 'select', [['Draft'], ['Berjalan'], ['Selesai']]], ['link_berkas', 'Tautan Folder Google Drive', 'url'], ['link_pdf', 'Tautan PDF Naskah', 'url'], ['catatan', 'Catatan Internal', 'textarea'], ['tampil_publik', 'Tampilkan di showcase publik', 'check']],
    Jurnal: [['nama', 'Nama Jurnal *', 'text'], ['link', 'Tautan Resmi Jurnal *', 'url'], ['thumbnail', 'URL Thumbnail / Cover', 'url'], ['penerbit', 'Penerbit', 'text'], ['tipe_biaya', 'Tipe Biaya', 'select', [['Gratis'], ['Berbayar (APC)']]], ['apc', 'Nominal APC', 'text'], ['indeks', 'Akreditasi / Indeks', 'text'], ['impact_factor', 'Impact Factor', 'text'], ['waktu_review', 'Perkiraan Waktu Review', 'text'], ['scope', 'Scope & Focus', 'textarea'], ['catatan', 'Catatan Internal (tidak tampil publik)', 'textarea'], ['tampil_publik', 'Tampilkan di showcase publik', 'check']],
    Submission: [['id_penelitian', 'Penelitian Induk', 'select', 'pen'], ['judul', 'Judul Artikel *', 'text'], ['id_jurnal', 'Jurnal Tujuan', 'select', 'jur'], ['status', 'Status', 'select', STAT.map(x => [x])], ['tgl_submit', 'Tanggal Submit', 'date'], ['tgl_cek', 'Tanggal Cek Terakhir', 'date'], ['deadline_respon', 'Deadline Respon / Revisi', 'date'], ['link_feedback', 'Tautan Feedback Reviewer (internal)', 'url'], ['link_final', 'Tautan Artikel Final', 'url'], ['doi', 'DOI', 'text'], ['tahun_terbit', 'Tahun Terbit', 'text'], ['catatan', 'Catatan Internal', 'textarea'], ['tampil_publik', 'Tampilkan di showcase publik', 'check']],
    CFP: [['nama', 'Nama CFP *', 'text'], ['link', 'Tautan CFP', 'url'], ['id_jurnal', 'Jurnal Terkait', 'select', 'jur'], ['scope', 'Scope', 'textarea'], ['deadline', 'Deadline Submit *', 'date'], ['status', 'Status', 'select', [['Tertarik'], ['Disiapkan'], ['Sudah Submit'], ['Ditutup']]], ['catatan', 'Catatan', 'textarea']]
  };
  const opts = (f, v) => {
    let o = f[3];
    if (o === 'pen') o = [['', '— pilih —'], ...S.D.Penelitian.map(p => [p.id, p.judul])];
    if (o === 'jur') o = [['', '— pilih —'], ...S.D.Jurnal.map(j => [j.id, j.nama])];
    return o.map(([a, b]) => `<option value="${esc(a)}" ${a === v ? 'selected' : ''}>${esc(b || a)}</option>`).join('');
  };
  function openForm(ent, rec) {
    rec = rec || {};
    S.modal = `<div class="ov" data-a="mclose"><div class="mod"><h2>${rec.id ? 'Ubah' : 'Tambah'} ${ent}</h2><form id="mf" data-e="${ent}" data-id="${esc(rec.id || '')}">${FIELDS[ent].map(f => {
      const v = rec[f[0]] ?? '', n = `name="${f[0]}"`;
      if (f[2] === 'check') return `<label style="font-weight:500"><input type="checkbox" ${n} ${rec[f[0]] ? 'checked' : ''}> ${f[1]}</label>`;
      let ctl = f[2] === 'textarea' ? `<textarea ${n}>${esc(v)}</textarea>` : f[2] === 'select' ? `<select ${n}>${opts(f, v)}</select>` : `<input class="in" ${n} type="${f[2]}" value="${esc(v)}">`;
      if (ent === 'Jurnal' && f[0] === 'thumbnail') ctl += `<button type="button" class="btn sm" style="margin-top:6px" data-a="thumb">Ambil Thumbnail Otomatis</button>`;
      return `<label>${f[1]}</label>${ctl}`;
    }).join('')}<div class="act"><button type="button" class="btn" data-a="mclose">Batal</button><button class="btn pri">Simpan</button></div></form></div></div>`;
    draw();
  }

  // ============ DATA OPS (Optimistic UI) ============
  async function upsert(ent, rec) {
    const L = S.D[ent] = S.D[ent] || [], i = L.findIndex(x => x.id === rec.id), old = i < 0 ? null : L[i];
    i < 0 ? L.push(rec) : (L[i] = rec);
    if (ent === 'Submission' && old && old.status !== rec.status) (S.D.StatusLog = S.D.StatusLog || []).unshift({ id_submission: rec.id, status_lama: old.status, status_baru: rec.status, waktu: new Date().toLocaleString('id-ID') });
    draw();
    const r = await API.post('upsert', { entity: ent, record: rec });
    if (!r.success) { toast(r.message || 'Gagal menyimpan; memuat ulang…', true); await loadAdmin(); }
  }
  async function remove(ent, id) {
    S.D[ent] = S.D[ent].filter(x => x.id !== id); draw();
    const r = await API.post('delete', { entity: ent, id });
    if (!r.success) { toast(r.message || 'Gagal menghapus', true); await loadAdmin(); } else toast('Data dihapus');
  }
  function csv(ent) {
    const L = S.D[ent] || []; if (!L.length) return toast('Tidak ada data untuk diekspor', true);
    const k = Object.keys(L[0]).filter(x => !/catatan|link_feedback/.test(x));
    const t = [k.join(','), ...L.map(r => k.map(x => '"' + String(r[x] ?? '').replace(/"/g, '""') + '"').join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + t], { type: 'text/csv' })); a.download = `SIMPEN-${ent}-${today()}.csv`; a.click();
  }

  // ============ RENDER & EVENTS ============
  function draw() {
    const v = S.view === 'pub' ? viewPub() : S.view === 'login' ? viewLogin() : viewAdmin();
    const f = document.activeElement && document.activeElement.id, pos = document.activeElement && document.activeElement.selectionStart;
    $('#app').innerHTML = v + (S.modal || '');
    if (f && ['q', 'jq'].includes(f)) { const e = $('#' + f); if (e) { e.focus(); try { e.setSelectionRange(pos, pos); } catch (_) { } } }
  }
  async function loadPub() { const r = await API.get('getPublic'); if (r.success) S.P = r.data; else toast(r.message || 'Gagal memuat', true); draw(); }
  async function loadAdmin() { const r = await API.post('bootstrap'); if (!r.success) { API.setTok(null); S.view = 'login'; toast(r.message || 'Sesi berakhir', true); } else S.D = r.data; draw(); }

  document.addEventListener('click', async e => {
    const t = e.target.closest('[data-a]'); if (!t || t.tagName === 'SELECT') return;
    const a = t.dataset.a, id = t.dataset.id, ent = t.dataset.e;
    if (a === 'goLogin') { S.view = 'login'; draw(); }
    else if (a === 'goPub') { e.preventDefault(); S.view = 'pub'; draw(); }
    else if (a === 'tab') { S.tab = id; S.q = ''; draw(); }
    else if (a === 'nav') { e.preventDefault(); S.page = id; S.q = ''; draw(); }
    else if (a === 'subv') { S.subv = id; draw(); }
    else if (a === 'logout') { API.post('logout'); API.setTok(null); S.view = 'pub'; S.D = null; loadPub(); }
    else if (a === 'mclose') { if (e.target === t) { S.modal = null; draw(); } }
    else if (a === 'add') openForm(ent, ent === 'Submission' ? { status: 'Draft', tgl_cek: today() } : { tampil_publik: false });
    else if (a === 'edit') openForm(ent, S.D[ent].find(x => x.id === id));
    else if (a === 'del') { if (confirm('Hapus data ini? Tindakan tidak dapat dibatalkan.')) remove(ent, id); }
    else if (a === 'delOld') { const o = S.D.CFP.filter(c => dayDiff(c.deadline) < 0); if (confirm(`Hapus ${o.length} CFP yang sudah lewat?`)) for (const c of o) await remove('CFP', c.id); }
    else if (a === 'cek') { const s = S.D.Submission.find(x => x.id === id); upsert('Submission', { ...s, tgl_cek: today() }); toast('Ditandai sudah dicek'); }
    else if (a === 'cfp2sub') { const c = S.D.CFP.find(x => x.id === id); S.page = 'sub'; openForm('Submission', { status: 'Draft', id_jurnal: c.id_jurnal, tgl_cek: today() }); }
    else if (a === 'csv') csv(ent);
    else if (a === 'hist') { const h = (S.D.StatusLog || []).filter(x => x.id_submission === id); S.modal = `<div class="ov" data-a="mclose"><div class="mod"><h2>Riwayat Status</h2>${h.map(x => `<div class="row"><span>${badge(x.status_lama)} → ${badge(x.status_baru)}</span><span class="mono">${esc(x.waktu)}</span></div>`).join('') || '<p class="mu">Belum ada perubahan status.</p>'}<div class="act"><button class="btn" data-a="mclose">Tutup</button></div></div></div>`; draw(); }
    else if (a === 'thumb') { const u = $('#mf [name=link]').value; if (!u) return toast('Isi tautan jurnal dulu', true); t.textContent = 'Mengambil…'; const r = await API.post('thumb', { url: u }); t.textContent = 'Ambil Thumbnail Otomatis'; if (r.success) { $('#mf [name=thumbnail]').value = r.thumbnail; toast('Thumbnail berhasil diambil'); } else toast(r.message || 'Thumbnail tidak ditemukan', true); }
    else if (a === 'testwa') { const r = await API.post('testwa'); toast(r.message || (r.success ? 'Pesan uji terkirim' : 'Gagal'), !r.success); }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset && t.dataset.a === 'chg') { const s = S.D.Submission.find(x => x.id === t.dataset.id); upsert('Submission', { ...s, status: t.value, tgl_cek: today() }); toast('Status diperbarui: ' + t.value); }
    else if (t.id === 'yr') { S.yr = t.value; draw(); } else if (t.id === 'jb') { S.jbiaya = t.value; draw(); } else if (t.id === 'oc') { S.onlyCheck = t.checked; draw(); }
  });
  let tm; document.addEventListener('input', e => { const t = e.target; if (t.id === 'q' || t.id === 'jq') { clearTimeout(tm); tm = setTimeout(() => { t.id === 'q' ? S.q = t.value : S.jq = t.value; draw(); }, 250); } });
  document.addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target;
    if (f.id === 'lf') { const b = f.querySelector('button'); b.disabled = true; b.textContent = 'Memeriksa…'; const r = await API.post('login', { password: $('#pw').value }); if (r.success) { API.setTok(r.token); S.view = 'admin'; S.page = 'dash'; S.D = null; draw(); loadAdmin(); } else { b.disabled = false; b.textContent = 'Masuk ke Panel Pengelola'; $('#le').textContent = r.message || 'Gagal masuk.'; } }
    else if (f.id === 'mf') {
      const ent = f.dataset.e, old = f.dataset.id ? S.D[ent].find(x => x.id === f.dataset.id) : {}, rec = { ...old, id: f.dataset.id || uid() };
      FIELDS[ent].forEach(fl => { const el = f.elements[fl[0]]; rec[fl[0]] = fl[2] === 'check' ? el.checked : el.value.trim(); });
      if (ent === 'Jurnal' && rec.tipe_biaya === 'Gratis') rec.apc = '';
      S.modal = null; await upsert(ent, rec); toast('Data tersimpan');
    }
    else if (f.id === 'sf') { const o = Object.fromEntries(new FormData(f)); const cur = (S.D.Pengaturan || [])[0] || { id: 'cfg' }; await upsert('Pengaturan', { ...cur, ...o, id: 'cfg' }); toast('Pengaturan tersimpan'); }
  });

  // ============ INIT ============
  (async () => { if (API.tok()) { S.view = 'admin'; draw(); loadAdmin(); } else { draw(); } loadPub(); })();
})();
