# PANDUAN INSTALASI — SIMPEN

Urutan: **A. Backend (Apps Script) → B. Frontend (GitHub Pages) → C. Uji**.
Folder kerja frontend = **folder hasil ekstrak ZIP `simpen-frontend`** (di dalamnya langsung ada `index.html`). Di folder inilah `git init` dijalankan — jangan masuk lebih dalam, jangan naik satu level.

## A. Backend (Google Apps Script)

1. Buka https://script.google.com → **Proyek Baru**. Beri nama `SIMPEN`.
2. Ganti isi `Code.gs` dengan isi berkas **Kode.gs** (nama berkas boleh diganti menjadi `Kode`).
3. Menu **Pengaturan Proyek (ikon roda gigi)** → centang **Tampilkan file manifes "appsscript.json" di editor** → buka `appsscript.json` dan ganti isinya dengan berkas **appsscript.json** yang diberikan.
4. Jalankan **setupAppEnvironment** (dropdown fungsi → ▶ Run) — **HANYA SEKALI**. Klik *Review permissions* dan izinkan akses. Cek Execution Log: harus ada ✅, dan di Google Drive muncul folder `📁 SIMPEN` berisi spreadsheet database.
5. **Atur kata sandi admin**: di fungsi `aturKataSandiAdmin`, ganti `GANTI_DENGAN_SANDI_ANDA` dengan sandi Anda (minimal 8 karakter) → Run → lalu **kembalikan tulisan itu ke placeholder semula** agar sandi tidak tersimpan di kode.
6. **Token WhatsApp Fonnte**: daftar di fonnte.com, sambungkan perangkat WhatsApp, salin token. Di Apps Script: **Pengaturan Proyek → Properti Skrip → Tambah properti**: nama `FONNTE_TOKEN`, nilai = token Anda.
7. Jalankan **pasangTrigger** (sekali) → membuat pengingat harian dan cadangan mingguan.
8. **Deploy → Deployment baru → Aplikasi web**: *Execute as* = **Saya (Me)**, *Who has access* = **Siapa saja (Anyone)** → Deploy → **salin URL `/exec`**.
9. Setiap kali Kode.gs diubah: Deploy → **Kelola deployment → Edit → Versi baru → Deploy** (URL tetap sama).

## B. Frontend (GitHub Pages)

1. Ekstrak ZIP `simpen-frontend`. Buka `js/config.js`, ganti `ISI_DENGAN_URL_EXEC_APPS_SCRIPT` dengan URL `/exec` dari langkah A.8. Simpan.
2. Buat repository **Public** baru di github.com (jangan centang README/.gitignore/license).
3. Buka PowerShell **di folder hasil ekstrak** (File Explorer → klik address bar → ketik `powershell` → Enter). Cek dulu:
   ```
   dir
   ```
   Harus terlihat `index.html`, `css`, `js`. Jika tidak, Anda di folder yang salah.
4. Satu per satu:
   ```
   git init
   git add .
   git commit -m "Upload pertama"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
   Saat diminta password, tempel **Personal Access Token** (github.com/settings/tokens → Generate new token (classic) → centang `repo`). Layar tampak kosong saat paste — itu normal.
5. Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch `main` / `(root)` → Save. Centang **Enforce HTTPS**. Tunggu 1–2 menit; situs ada di `https://USERNAME.github.io/NAMA-REPO/`.
6. Update berikutnya: `git add .` → `git commit -m "pesan"` → `git push`. Jika tampilan lama, tekan Ctrl+Shift+R.

## C. Uji

1. Buka situs: halaman showcase publik tampil (kosong sampai ada data).
2. Klik **Masuk Admin**, masuk dengan sandi dari langkah A.5.
3. Pengaturan → isi nama, afiliasi, nomor WhatsApp (format 62812…) → Simpan → **Kirim Pesan Uji WhatsApp**.
4. Tambah jurnal (coba **Ambil Thumbnail Otomatis**), penelitian, submission, dan CFP. Tandai *Tampilkan di showcase publik* lalu cek halaman publik di jendela Incognito.
5. Buka DevTools (F12) → Console: tidak boleh ada error merah selain peringatan font.

## Catatan penting

- Data publik hanya memuat entri bertanda *Tampil Publik*; catatan, feedback reviewer, dan nomor WA tidak pernah dikirim ke publik.
- Sesi admin berlaku 8 jam. Tombol *Keluar* menghapus sesi di browser. Jika sandi atau perangkat dicurigai bocor, ganti sandi dengan `aturKataSandiAdmin` lalu jalankan `cabutSemuaSesi` — semua sesi lama langsung tidak sah.
- Ekspor saat ini berformat **CSV** (dibuka langsung oleh Excel). Ekspor PDF belum tersedia.
- Perpindahan status di Kanban memakai dropdown pada kartu (belum drag-and-drop).
- Kuota gratis Fonnte dapat berubah; cek di akun Fonnte Anda.

---

## Memperbarui aplikasi yang sudah terpasang (revisi katalog jurnal)

Lakukan **berurutan**. Data lama Anda tidak hilang: kolom baru ditambahkan di sebelah kanan, dan jurnal lama yang punya isian "Sinta 2" di kolom lama tetap terbaca sebagai Sinta 2.

**A. Backend**
1. Buka proyek Apps Script → buka `Kode.gs` → **ganti seluruh isinya** dengan `Kode.gs` terbaru. Simpan (`Ctrl + S`).
2. **Pertahankan** pengaturan yang sudah ada: sandi admin dan `FONNTE_TOKEN` tersimpan di Properti Skrip, bukan di kode, jadi tidak terhapus.
3. Pilih fungsi **`perbaruiHeaderSheet`** di dropdown → **Jalankan** (sekali). Log harus menampilkan ✅. Fungsi ini hanya menulis judul kolom baris 1, data tidak disentuh.
4. **Deploy → Kelola deployment → ikon pensil → Versi: Versi baru → Deploy**. URL `/exec` tetap sama, tidak perlu mengubah `config.js`.

**B. Frontend**
1. Ekstrak `simpen-frontend.zip` terbaru. Buka `js/config.js` dan pastikan `GAS_URL` berisi URL `/exec` Anda (file di ZIP berisi placeholder, jadi isi lagi).
2. Salin hasil ekstrak menimpa isi folder repository Anda, lalu di PowerShell: `git add .` → `git commit -m "Revisi katalog jurnal"` → `git push`.
3. Tunggu 1–2 menit, buka situs, tekan `Ctrl + Shift + R`.

**C. Isi ulang data jurnal (disarankan)**
Buka Katalog Jurnal → **Ubah Data** pada tiap jurnal, lalu atur **Jenis Kampus**, **Rumpun Ilmu**, dan **Akreditasi**. Sampai itu dilakukan, jurnal lama dianggap PTN dan Non-Sinta di tampilan publik.
