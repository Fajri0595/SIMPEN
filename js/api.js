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
        { id: 'j1', nama: 'IEEE Internet of Things Journal', penerbit: 'IEEE', link: 'https://ieeexplore.ieee.org', thumbnail: '', tipe_biaya: 'Berbayar (APC)', apc: 'USD 1,995', indeks: 'Scopus Q1', impact_factor: '10.6', waktu_review: '6–10 minggu', scope: 'IoT, edge computing, jaringan sensor nirkabel.', catatan: '', tampil_publik: true },
        { id: 'j2', nama: 'JANAPATI', penerbit: 'Undiksha', link: 'https://ejournal.undiksha.ac.id', thumbnail: '', tipe_biaya: 'Gratis', apc: '', indeks: 'Sinta 2', impact_factor: '', waktu_review: '4–8 minggu', scope: 'Pendidikan teknik informatika dan sistem cerdas.', catatan: '', tampil_publik: true }],
      Submission: [
        { id: 's1', id_penelitian: 'p1', judul: 'Adaptive Deep Learning for Edge-IoT Anomaly Detection', id_jurnal: 'j1', status: 'Published', tgl_submit: dt(-400), tgl_cek: dt(-100), deadline_respon: '', link_feedback: '', link_final: 'https://doi.org/10.1109/JIOT.2026.0001', doi: '10.1109/JIOT.2026.0001', tahun_terbit: String(new Date().getFullYear()), catatan: '', tampil_publik: true },
        { id: 's2', id_penelitian: 'p1', judul: 'Multi-Modal Spectral Transformer for Crop Disease Detection', id_jurnal: 'j1', status: 'Under Review', tgl_submit: dt(-60), tgl_cek: dt(-18), deadline_respon: '', link_feedback: '', link_final: '', doi: '', tahun_terbit: '', catatan: '', tampil_publik: true },
        { id: 's3', id_penelitian: 'p1', judul: 'Deteksi Plagiarisme Kode Berbasis Graph Embedding', id_jurnal: 'j2', status: 'Revision Requested', tgl_submit: dt(-90), tgl_cek: dt(-2), deadline_respon: dt(10), link_feedback: '', link_final: '', doi: '', tahun_terbit: '', catatan: '', tampil_publik: true }],
      CFP: [
        { id: 'c1', nama: 'ICACSIS 2026 — Intl. Conf. on Advanced Computer Science', link: 'https://icacsis.org', id_jurnal: '', scope: 'AI, IoT, Computer Vision', deadline: dt(3), status: 'Disiapkan', catatan: '' },
        { id: 'c2', nama: 'Call for Papers Jurnal Tekno Komputasi Vol. 14', link: '', id_jurnal: 'j2', scope: 'Software Engineering, NLP', deadline: dt(40), status: 'Tertarik', catatan: '' }]
    };
  }
  const db = () => JSON.parse(localStorage.getItem(KEY) || 'null') || (localStorage.setItem(KEY, JSON.stringify(seed())), seed());
  const put = d => localStorage.setItem(KEY, JSON.stringify(d));

  function publicOf(d) {
    const J = Object.fromEntries(d.Jurnal.map(j => [j.id, j]));
    const row = s => { const j = J[s.id_jurnal] || {}; return { id: s.id, judul: s.judul, jurnal: j.nama || '-', indeks: j.indeks || '', link_jurnal: j.link || '', status: s.status, tgl_submit: s.tgl_submit, tgl_cek: s.tgl_cek, deadline_respon: s.deadline_respon, doi: s.doi, link_final: s.link_final, tahun_terbit: s.tahun_terbit }; };
    const S = d.Submission.filter(s => s.tampil_publik);
    const cf = (d.Pengaturan || [])[0] || {};
    return { profil: { nama: cf.nama || 'Dr. Nama Dosen, M.Kom.', afiliasi: cf.afiliasi || 'Fakultas / Universitas (Mode Demo)' }, publikasi: S.filter(s => s.status === 'Published').map(row), proses: S.filter(s => PROSES.includes(s.status)).map(row), jurnal: d.Jurnal.filter(j => j.tampil_publik).map(({ catatan, ...j }) => j) };
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
