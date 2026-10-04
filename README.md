# SIMPEN — Sistem Manajemen Penelitian Dosen
## Source Code Lengkap

---

## 📋 File Daftar

### **Frontend (GitHub Pages)**
| File | Ukuran | Fungsi |
|------|--------|--------|
| `index.html` | 1 KB | HTML skeleton, load semua JS/CSS |
| `css/style.css` | 8 KB | Design system: warna, tipografi, responsive, dark mode |
| `js/config.js` | <1 KB | **HARUS DIISI**: URL GAS backend (`GAS_URL`) |
| `js/api.js` | 1 KB | API layer: fetch ke Google Apps Script backend |
| `js/app.js` | 44 KB | SPA utama: state management, render publik/admin, event handler |

### **Backend (Google Apps Script)**
| File | Ukuran | Fungsi |
|------|--------|--------|
| `Kode.gs` | 20 KB | Apps Script backend: auth, CRUD, WhatsApp, trigger, thumbnail |
| `appsscript.json` | 1 KB | Manifest: oauth scopes, runtime V8, webapp config |

---

## 🚀 Setup Cepat (5 Menit)

### **Step 1: Backend (Google Apps Script)**

```
1. Buka https://script.google.com
2. New Project
3. Copy-paste SEMUA isi Kode.gs ke editor
4. (Jangan lupa: copy isi appsscript.json ke file appsscript.json)
5. Run setupAppEnvironment()  ← SEKALI SAJA
6. Run aturKataSandiAdmin()   ← atur password
7. Add Script Property:
   - FONNTE_TOKEN = (dari fonnte.com)
8. Run pasangTrigger()        ← untuk notifikasi harian
9. Deploy > Web App
   - Execute as: Me
   - Access: Anyone
   - Copy /exec URL → **SIMPAN UNTUK STEP 2**
```

### **Step 2: Frontend (GitHub Pages)**

```
1. Download simpen-source-code.zip
2. Extract
3. BUKA js/config.js → ubah GAS_URL dengan URL dari Step 1
4. Upload ke GitHub (atau Netlify/Vercel)
5. GitHub Settings > Pages > main branch > (root)
6. Tunggu 1 menit
7. Buka https://YOUR_GITHUB.github.io/repo-name
```

---

## 📖 Penjelasan Setiap File

### **index.html**
```html
<!doctype html>
<html lang="id">
  <head>
    <!-- Fonts: Inter (sans), Merriweather (serif), JetBrains Mono -->
    <!-- CSS: style.css -->
  </head>
  <body>
    <div id="app"></div>      <!-- SPA di sini -->
    <div id="modal"></div>    <!-- Modal form, terpisah dari app -->
    <div id="toast"></div>    <!-- Toast notifikasi -->
    
    <!-- JS: load berurutan config → api → app -->
  </body>
</html>
```

**Catatan:**
- Modal di `<div id="modal">` terpisah dari `#app` agar tidak ikut render ulang
- Ini fix untuk Revisi 1 (form terbuka saat klik di luar)

---

### **js/config.js**
```javascript
window.SIMPEN_CONFIG = {
  GAS_URL: 'ISI_DENGAN_URL_EXEC_APPS_SCRIPT'
  // Saat kosong → MODE DEMO (localhost, data dummy, sandi: admin)
  // Saat diisi → production (backend GAS asli)
};
```

**Cara mendapat URL:**
1. Apps Script > Deploy > Web App > copy /exec
2. Format: `https://script.google.com/macros/d/SCRIPT_ID/usercontent/exec`

---

### **js/api.js**

**Lapisan abstraksi antara app.js dan backend:**

```javascript
window.API = {
  tok()       // get token dari localStorage
  setTok(t)   // set/remove token
  get(action) // fetch GET ke GAS (publik, tanpa auth)
  post(action, data) // fetch POST ke GAS (wajib token)
}
```

Terhubung langsung ke backend Google Apps Script secara real-time.

---

### **js/app.js** (1100+ baris, SPA utama)

**State Management:**
```javascript
const S = {
  view: 'pub|login|admin',     // halaman utama
  tab: 'pub|proses|jur',       // tab publik
  page: 'dash|pen|jur|sub|cfp|set',  // halaman admin
  P: {...},                    // data publik (dari API.get)
  D: {...},                    // data admin (dari API.post bootstrap)
  q: '',                       // query pencarian global
  yr: '',                      // tahun filter publikasi
  jq: '',                      // query pencarian jurnal
  jbiaya: '',                  // filter biaya jurnal
  subv: 'kanban|tabel',        // view submission
  onlyCheck: false,            // hanya submission perlu dicek
  f: {kampus, akr, biaya, rumpun},  // filter katalog jurnal
  jview: 'grid|list',          // view katalog jurnal
  pubJurPage: 1,               // halaman aktif katalog publik
  pubJurPerPage: 12,           // limit item per halaman katalog publik (opsi 6, 12, 24, 48, 100)
  adminJurPage: 1,             // halaman aktif katalog admin
  adminJurPerPage: 10          // limit item per halaman katalog admin (opsi 5, 10, 25, 50, 100)
};
```

**Views:**
1. **viewPub()** — showcase publik (3 tab)
   - Tab Publikasi: daftar artikel terbit, filter tahun
   - Tab Dalam Proses: stepper 6 tahap
   - Tab Katalog Jurnal: grid/list, 4 filter, 4 stat card, pagination nomor halaman (1, 2, 3...) & pemilih jumlah per halaman

2. **viewLogin()** — form login admin

3. **viewAdmin()** — panel admin (6 pages)
   - `pDash()` — dashboard, 5 stat card, perlu perhatian split, 3 chart, WA log
   - `pPen()` — CRUD Penelitian
   - `pJur()` — CRUD Jurnal + thumbnail, pagination nomor halaman (1, 2, 3...) & pemilih jumlah per halaman
   - `pSub()` — kanban/tabel, riwayat status
   - `pCfp()` — CFP aktif/lama
   - `pSet()` — pengaturan + log notifikasi

**Optimistic UI:**
- `upsert()` → update S.D langsung, terus `draw()`
- Jika backend gagal → `loadAdmin()` ulang

**Event Handlers:**
- Click: CRUD, nav, modal, export CSV
- Change: dropdown status, select filter
- Input: pencarian (debounce 250ms)
- Submit: form login, form CRUD

---

### **css/style.css** (400+ baris, minified)

**Design System:**
```css
:root {
  --navy: #1E3A5F        /* warna utama */
  --navy-d: #022448      /* sidebar dark */
  --amber: #F5A623       /* aksen warning */
  --bg: #F5F2FF          /* background app */
  --lav: #EFECFF         /* card bg */
  --bd: #E2E8F0          /* border */
  --tx: #1A1A2E          /* text gelap */
  --mu: #475569          /* text muted */
  --sh: ...              /* shadow */
}
```

**Breakpoint:**
- Tablet/mobile: `max-width: 768px`
  - Admin: layout sidebar flex horizontal (bukan column)
  - Table: konversi ke block (card-style)
  - Grid: 1 kolom instead of 2

**Key Classes:**
- `.btn` — tombol standard
- `.btn.pri` — tombol primary (navy)
- `.btn.sm` — tombol kecil
- `.btn.dng` — tombol berbahaya (merah)
- `.card` — kartu putih + shadow
- `.bd` — badge (pill badge)
- `.tabs` — tab header dengan underline amber
- `.stats` — grid stat card
- `.adm` — layout admin (sidebar 260px + main)
- `.ov` — overlay untuk modal
- `.mod` — modal box

---

### **Kode.gs** (600+ baris, Apps Script backend)

**Key Functions:**

#### **ENTRY POINTS**
```javascript
doGet(e)     // GET public data (no auth)
doPost(e)    // POST login/CRUD (wajib token)
```

#### **AUTH**
```javascript
login(pw)    // → {token, success, message}
tokenValid(t)// → boolean (check expiry + HMAC)
sha256(s)    // → hash SHA-256
hmac(s)      // → HMAC SHA-256 signature
```

**Token format:** `expiry_timestamp.hmac_signature`  
**Duration:** 8 jam

#### **SHEET I/O**
```javascript
readAll(name)     // baca sheet ke array object (cached)
upsert(ent, rec)  // insert/update record
remove(ent, id)   // hapus record
bust()            // clear cache
```

#### **DATA API**
```javascript
getPublic()     // publik endpoint: whitelist columns + tampil_publik=true
bootstrap()     // admin endpoint: semua data (wajib token)
```

#### **WHATSAPP (Fonnte)**
```javascript
sendWA(target, message)  // kirim via fonnte.com
testWA()                 // test kirim
cekPengingat()           // trigger harian: CFP dekat + submission lama
```

#### **SETUP (run SEKALI)**
```javascript
setupAppEnvironment()    // create folder, sheets, properties
aturKataSandiAdmin()     // set admin password
pasangTrigger()          // attach daily trigger
perbaruiHeaderSheet()    // migrate new columns safely
```

---

## 📊 Data Model

### **Sheets in SIMPEN_DB Spreadsheet**

**Penelitian**
```
id, judul, bidang, kolaborator, tanggal_mulai, status, 
link_berkas, link_pdf, catatan, tampil_publik
```

**Jurnal**
```
id, nama, link, thumbnail, penerbit, tipe_biaya, apc,
indeks (old), impact_factor (old), waktu_review (old),
scope, catatan, tampil_publik,
jenis_kampus (new), rumpun_ilmu (new), akreditasi (new)
```

**Submission**
```
id, id_penelitian, judul, id_jurnal, status, tgl_submit, 
tgl_cek, deadline_respon, link_feedback, link_final, doi, 
tahun_terbit, catatan, tampil_publik
```

**CFP**
```
id, nama, link, id_jurnal, scope, deadline, status, catatan, 
pengingat_terkirim
```

**Pengaturan**
```
id, nama, afiliasi, wa, ambang_cfp, ambang_cek, jam
```

**StatusLog** (read-only dari backend)
```
id_submission, status_lama, status_baru, waktu
```

**Log** (read-only dari backend)
```
waktu, jenis, tujuan, hasil
```

---

## ✅ Testing Checklist

### **Public Showcase**
- [ ] Tab Publikasi: daftar artikel, filter tahun
- [ ] Tab Dalam Proses: stepper status
- [ ] Tab Katalog: grid/list, 4 filter, search, stat card

### **Admin Dashboard**
- [ ] Login (sandi yang sudah diset)
- [ ] Dashboard: 5 stat, perlu perhatian, 3 chart
- [ ] Penelitian CRUD
- [ ] Jurnal CRUD + thumbnail auto
- [ ] Submission: kanban/tabel, riwayat status
- [ ] CFP: aktif/lewat, delete bulk
- [ ] Pengaturan: save, WA test

### **Backend**
- [ ] `setupAppEnvironment()` → folder/sheets/properties ✓
- [ ] `aturKataSandiAdmin()` → password ✓
- [ ] `pasangTrigger()` → daily trigger ✓
- [ ] `cekPengingat()` → WA message
- [ ] Token auth: 8 jam, invalid setelah exp

### **Edge Cases**
- [ ] Mode demo (GAS_URL kosong)
- [ ] Login: 5x salah → kunci 15 menit
- [ ] CSV export: UTF-8 BOM
- [ ] Backward compat: kolom indeks lama tetap terbaca
- [ ] Mobile: sidebar horizontal, table menjadi card

---

## 🔒 Security

**Authentication:**
- Hash: SHA-256(salt + password)
- Token: exp.hmac(exp) — stateless, 8 jam
- Fail: 5x → lock 15 menit

**Data:**
- Public endpoint: whitelist columns only
- Admin endpoint: full data, wajib valid token
- Sheet: append-only untuk Log, StatusLog
- Catatan/feedback/WA: tidak pernah dikirim ke publik

**Scripts:**
- Input validation: max 4000 char per field
- HTML escape: mencegah XSS
- URL validation: mencegah localhost/private IP

---

## 📚 Reference

**Functions:**
- `esc()` — HTML escape
- `uid()` — unique ID (x + timestamp + random)
- `today()` — YYYY-MM-DD
- `dayDiff()` — hari sejak hari ini
- `fmt()` — format tanggal lokal ID
- `toast()` — pop notifikasi

**Constants:**
- `STAT` — 9 status Submission
- `STC` — status → badge color
- `PROSES` — 5 status dalam proses
- `STAGE` — status → angka tahap 1–6
- `AKR` — akreditasi Sinta 1–4, Non-Sinta
- `KAMPUS` — PTN, PTS, Lainnya

---

## ❓ FAQ

**Q: Gimana cara reset password?**  
A: Buka Apps Script, run `aturKataSandiAdmin()` ulang.

**Q: Bagaimana cara backup data?**  
A: Backend otomatis backup setiap Jumat (cadanganMingguan). Cek folder Backups di Drive.

**Q: WhatsApp tidak terkirim?**  
A: Run `diagnosaFonnte()` di Apps Script, check log. Atau buka fonnte.com, pastikan token valid + device QR sudah di-scan.

**Q: Gimana cara ubah jam pengingat?**  
A: Admin > Pengaturan > ubah "Jam kirim pengingat" → simpan.

**Q: Kolom lama (indeks, impact_factor, waktu_review) masih ada?**  
A: Iya, untuk backward compatibility. Kolom baru (jenis_kampus, rumpun_ilmu, akreditasi) ditaruh di akhir.

---

**© 2026 SIMPEN — Sistem Manajemen Penelitian Dosen**

Deploy dengan confidence! 🚀
