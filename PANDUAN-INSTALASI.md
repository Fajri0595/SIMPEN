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

- Data publik hanya memuat entri bertanda *Tampil Publik*; catatan, feedback reviewer, kredensial OJS, dan nomor WA tidak pernah dikirim ke publik.
- Sesi admin berlaku 8 jam. Tombol *Keluar* menghapus sesi di browser. Jika sandi atau perangkat dicurigai bocor, ganti sandi dengan `aturKataSandiAdmin` lalu jalankan `cabutSemuaSesi` — semua sesi lama langsung tidak sah.
- Format laporan BKD tersedia dalam **Cetak PDF Resmi Standar Institusi** (A4 dengan Kop, NIDN/NIP, Rubrik KUM, dan Kolom Asesor) serta **Ekspor Excel / CSV BKD**.
- Perpindahan status naskah di papan Kanban mendukung **Drag-and-Drop** langsung.
- Akses mobile dilengkapi **Bottom Navigation Bar** dan dukungan **PWA** (bisa dipasang ke homescreen smartphone).

---

## 🔄 Panduan Memperbarui Aplikasi (Update Fitur BKD, KUM, & Mobile PWA)

Lakukan langkah-langkah berikut secara berurutan agar pembaruan berjalan mulus tanpa merusak data yang sudah ada:

### Langkah 1: Update Backend (Google Apps Script)
1. Buka [script.google.com](https://script.google.com) dan buka proyek **SIMPEN** Anda.
2. Buka berkas `Kode.gs` (atau `Code.gs`), **hapus isinya lalu tempelkan seluruh kode dari berkas `Kode.js` lokal terbaru**.
3. Simpan perubahan dengan menekan `Ctrl + S`.
4. Lakukan deploy versi baru:
   * Klik tombol biru **Deploy** (kanan atas) → **Kelola deployment** (*Manage deployments*).
   * Klik **ikon pensil** (Edit) pada deployment aktif Anda.
   * Pada dropdown **Versi**, pilih **Versi baru** (*New version*).
   * Klik tombol **Deploy** lalu **Selesai**.
   > **Catatan Database:** Anda **TIDAK PERLU** mengedit tabel Google Sheet secara manual. Backend memiliki fitur *auto-migration* yang otomatis menambahkan kolom-kolom baru (`semester_bkd`, `peran_penulis`, `total_penulis`, `sks_bkd`, `nidn`, `nip`, `jabatan_fungsional`, `prodi`, `fakultas`, dll.) saat data disimpan, sehingga data lama tetap aman.

### Langkah 2: Update Frontend ke GitHub Pages
1. Pastikan berkas di folder lokal sudah mencakup:
   * `js/app.js` (Logika BKD, kalkulator KUM, bottom nav)
   * `css/style.css` (Tampilan mobile bottom nav & layout cetak BKD)
   * `index.html` (Meta tags PWA)
   * `manifest.json` (Konfigurasi instalasi aplikasi mobile)
2. Buka PowerShell / Terminal di folder proyek SIMPEN, lalu jalankan:
   ```powershell
   git add .
   git commit -m "feat: integrasi laporan BKD semester, kalkulator KUM, bottom nav mobile, dan PWA"
   git push origin main
   ```
3. Tunggu 1–2 menit hingga GitHub Pages selesai memproses *build*.

### Langkah 3: Pengisian Identitas BKD Dosen (Di Panel Admin)
1. Buka situs SIMPEN di browser Anda (tekan `Ctrl + F5` atau `Ctrl + Shift + R` untuk memastikan browser memuat file terbaru).
2. Masuk ke **Panel Admin** → buka menu **Pengaturan**.
3. Isi bagian baru **Identitas BKD Dosen**:
   * **NIDN / NIDK** dan **NIP / NPK Pegawai**
   * **Jabatan Fungsional** (Asisten Ahli / Lektor / Lektor Kepala / Guru Besar)
   * **Program Studi** dan **Fakultas / Unit Kerja**
   * (Opsional) Nama Asesor BKD 1 & 2 serta Pimpinan Fakultas (Dekan/Kaprodi)
4. Klik **Simpan Pengaturan**.

### Langkah 4: Menyesuaikan Data Naskah untuk Pelaporan BKD
1. Buka menu **Submission**.
2. Klik tombol **Ubah** pada artikel ilmiah yang ingin dilaporkan:
   * Pilih **Periode Semester BKD** (misal: `2024/2025 Genap`, `2025/2026 Ganjil`, dll.).
   * Pilih **Peran / Posisi Penulis** (Penulis Pertama & Korespondensi, Penulis Tunggal, Penulis Pertama, Penulis Korespondensi, atau Penulis Anggota).
   * Masukkan **Jumlah Total Penulis**.
   * Perhatikan kotak hijau di bawah: estimasi perolehan **KUM** dan beban **SKS BKD** akan langsung terhitung secara otomatis.
3. Klik **Simpan Perubahan**.

### Langkah 5: Mengunduh Laporan BKD Semester
1. Di Dashboard atau menu Submission, klik tombol **"Laporan BKD & Rekapitulasi KUM"**.
2. Pada modal yang muncul, pilih **Semester BKD** yang bersangkutan dan filter status naskah.
3. Klik **🖨️ Cetak / PDF Resmi** untuk membuka lembar laporan A4 formal (siap cetak atau pilih *Save as PDF*), atau klik **📊 Unduh Excel / CSV** untuk mengunduh rekap spreadsheet.

### Langkah 6: Memasang di Smartphone (Mobile PWA)
1. Buka URL GitHub Pages SIMPEN melalui browser di ponsel (Chrome Android atau Safari iOS).
2. Perhatikan bar navigasi bawah (*Bottom Navigation*) yang langsung aktif untuk memudahkan kontrol dengan jempol.
3. Buka menu browser ponsel → pilih **"Tambahkan ke Layar Utama"** (*Add to Home Screen*) atau **"Install App"**.
4. Ikon toga SIMPEN akan muncul di daftar aplikasi ponsel dan bisa dibuka langsung layaknya aplikasi native.
