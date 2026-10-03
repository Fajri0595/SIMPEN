// Lapisan API: fetch ke GAS (POST wajib text/plain) + MODE DEMO bila GAS_URL belum diisi.
(() => {
  const C = window.SIMPEN_CONFIG, KEY = 'sp_demo';
  const demo = !/^https:\/\/script\.google\.com\//.test(C.GAS_URL);
  const PROSES = ['Submitted', 'Under Review', 'Revision Requested', 'Accepted'];
  const dt = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

  function seed() {
    return {
      Penelitian: [{ id: 'p1', judul: 'Arsitektur Edge-AI Hemat Daya untuk Monitoring Panel Surya', bidang: 'IoT & Smart Grid', kolaborator: 'Budi Santoso, Ph.D.; Siti Rahmawati, M.T.', tanggal_mulai: dt(-300), status: 'Berjalan', link_berkas: '', link_pdf: '', catatan: '', tampil_publik: true }],
      Jurnal: [
        { id: 'j1', nama: 'Tadris: Jurnal Pendidikan Islam', penerbit: 'UIN Madura', jenis_kampus: 'PTN', rumpun_ilmu: 'Pendidikan', akreditasi: 'Sinta 4', link: 'https://ejournal.uinmadura.ac.id', thumbnail: '', tipe_biaya: 'Berbayar (APC)', apc: '500000', scope: 'Pendidikan Islam, pembelajaran, dan kurikulum.', catatan: 'Review cepat', tampil_publik: true },
        { id: 'j2', nama: 'LISANUNA', penerbit: 'Universitas Islam Negeri Ar-Raniry', jenis_kampus: 'PTN', rumpun_ilmu: 'Pendidikan', akreditasi: 'Non-Sinta', link: 'https://jurnal.ar-raniry.ac.id', thumbnail: '', tipe_biaya: 'Gratis', apc: '', scope: 'Linguistik dan pengajaran bahasa Arab.', catatan: '', tampil_publik: true },
        { id: 'j3', nama: 'Asalibuna', penerbit: 'UIN Syekh Wasil Kediri', jenis_kampus: 'PTN', rumpun_ilmu: 'Pendidikan', akreditasi: 'Sinta 2', link: 'https://asalibuna.example.ac.id', thumbnail: '', tipe_biaya: 'Berbayar (APC)', apc: '1500000', scope: 'Kajian pendidikan dan bahasa.', catatan: '', tampil_publik: true },
        { id: 'j4', nama: 'GIAT: Jurnal Teknologi untuk Masyarakat', penerbit: 'Universitas Swasta Contoh', jenis_kampus: 'PTS', rumpun_ilmu: 'Teknologi', akreditasi: 'Non-Sinta', link: 'https://giat.example.ac.id', thumbnail: '', tipe_biaya: 'Gratis', apc: '', scope: 'Pengabdian masyarakat berbasis teknologi.', catatan: '', tampil_publik: true },
        { id: 'j5', nama: 'JANAPATI', penerbit: 'Universitas Pendidikan Ganesha', jenis_kampus: 'PTN', rumpun_ilmu: 'Teknologi', akreditasi: 'Sinta 2', link: 'https://ejournal.undiksha.ac.id', thumbnail: '', tipe_biaya: 'Gratis', apc: '', scope: 'Pendidikan teknik informatika dan sistem cerdas.', catatan: '', tampil_publik: true },
        { id: 'j6', nama: 'IEEE Internet of Things Journal', penerbit: 'IEEE', jenis_kampus: 'Lainnya', rumpun_ilmu: 'Teknologi', akreditasi: 'Non-Sinta', link: 'https://ieeexplore.ieee.org', thumbnail: '', tipe_biaya: 'Berbayar (APC)', apc: 'USD 1,995', scope: 'IoT, edge computing, jaringan sensor.', catatan: '', tampil_publik: false }],
      Submission: [
        { id: 's1', id_penelitian: 'p1', judul: 'Adaptive Deep Learning for Edge-IoT Anomaly Detection', id_jurnal: 'j6', status: 'Published', tgl_submit: dt(-400), tgl_cek: dt(-100), deadline_respon: '', link_feedback: '', link_final: 'https://doi.org/10.1109/JIOT.2026.0001', doi: '10.1109/JIOT.2026.0001', tahun_terbit: String(new Date().getFullYear()), catatan: '', tampil_publik: true },
        { id: 's2', id_penelitian: 'p1', judul: 'Multi-Modal Spectral Transformer for Crop Disease Detection', id_jurnal: 'j6', status: 'Under Review', tgl_submit: dt(-60), tgl_cek: dt(-18), deadline_respon: '', link_feedback: '', link_final: '', doi: '', tahun_terbit: '', catatan: '', tampil_publik: true },
        { id: 's3', id_penelitian: 'p1', judul: 'Deteksi Plagiarisme Kode Berbasis Graph Embedding', id_jurnal: 'j5', status: 'Revision Requested', tgl_submit: dt(-90), tgl_cek: dt(-2), deadline_respon: dt(10), link_feedback: '', link_final: '', doi: '', tahun_terbit: '', catatan: '', tampil_publik: true }],
      CFP: [
        { id: 'c1', nama: 'ICACSIS 2026 — Intl. Conf. on Advanced Computer Science', link: 'https://icacsis.org', id_jurnal: '', scope: 'AI, IoT, Computer Vision', deadline: dt(3), status: 'Disiapkan', catatan: '' },
        { id: 'c2', nama: 'Call for Papers Jurnal Tekno Komputasi Vol. 14', link: '', id_jurnal: 'j5', scope: 'Software Engineering, NLP', deadline: dt(40), status: 'Tertarik', catatan: '' }]
    };
  }
  const db = () => JSON.parse(localStorage.getItem(KEY) || 'null') || (localStorage.setItem(KEY, JSON.stringify(seed())), seed());
  const put = d => localStorage.setItem(KEY, JSON.stringify(d));

  function publicOf(d) {
    const J = Object.fromEntries(d.Jurnal.map(j => [j.id, j]));
    const row = s => { const j = J[s.id_jurnal] || {}; return { id: s.id, judul: s.judul, jurnal: j.nama || '-', indeks: j.akreditasi || j.indeks || '', link_jurnal: j.link || '', status: s.status, tgl_submit: s.tgl_submit, tgl_cek: s.tgl_cek, deadline_respon: s.deadline_respon, doi: s.doi, link_final: s.link_final, tahun_terbit: s.tahun_terbit }; };
    const S = (d.Submission || []).filter(s => s.tampil_publik);
    const P = (d.Penelitian || []).filter(p => p.tampil_publik).map(p => ({
      id: p.id, judul: p.judul, bidang: p.bidang, kolaborator: p.kolaborator,
      tanggal_mulai: p.tanggal_mulai, status: p.status, link_pdf: p.link_pdf || '', link_berkas: p.link_berkas || ''
    }));
    const cf = (d.Pengaturan || [])[0] || {};
    return {
      profil: { nama: cf.nama || 'Dr. Nama Dosen, M.Kom.', afiliasi: cf.afiliasi || 'Fakultas / Universitas (Mode Demo)' },
      publikasi: S.filter(s => s.status === 'Published').map(row),
      proses: S.filter(s => PROSES.includes(s.status)).map(row),
      penelitian: P,
      jurnal: (d.Jurnal || []).filter(j => j.tampil_publik).map(({ catatan, ...j }) => j)
    };
  }

  async function demoPost(a, data) {
    const d = db();
    if (a === 'login') return data.password === 'admin' ? { success: true, token: 'demo' } : { success: false, message: 'Kata sandi salah (mode demo: admin).' };
    if (a === 'bootstrap') return { success: true, data: d };
    if (a === 'thumb') return { success: false, message: 'Ambil otomatis aktif setelah backend terhubung. Isi URL gambar secara manual.' };
    if (a === 'upsert') { const L = (d[data.entity] = d[data.entity] || []), i = L.findIndex(x => x.id === data.record.id); i < 0 ? L.push(data.record) : (L[i] = data.record); put(d); }
    if (a === 'testwa') return { success: false, message: 'Uji WhatsApp aktif setelah backend terhubung.' };
    if (a === 'delete') { d[data.entity] = (d[data.entity] || []).filter(x => x.id !== data.id); put(d); }
    return { success: true };
  }

  window.API = {
    demo,
    tok: () => localStorage.getItem('sp_tok'),
    setTok: t => t ? localStorage.setItem('sp_tok', t) : localStorage.removeItem('sp_tok'),
    async get(action) {
      if (demo) return { success: true, data: publicOf(db()) };
      try { return await (await fetch(C.GAS_URL + '?action=' + action)).json(); }
      catch (e) { return { success: false, message: 'Gagal terhubung ke server.' }; }
    },
    async post(action, data) {
      if (demo) return demoPost(action, data || {});
      try {
        const res = await fetch(C.GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, token: API.tok(), data }) });
        return await res.json();
      } catch (e) { return { success: false, message: 'Gagal terhubung ke server.' }; }
    }
  };
})();
