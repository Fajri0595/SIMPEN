// SIMPEN — Logika UI & Interaksi (Vanilla JS, SPA Modern).
// Navigasi instan, Optimistic UI, Pencarian lokal, & Design System Akademik Profesional.
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

  // Ikon SVG Vektor Ringan (Lucide-style)
  const SVG = {
    search: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    plus: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    ext: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>',
    check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    edit: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
    trash: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
    book: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
    file: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
    folder: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
    dash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>',
    pen: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
    jur: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
    sub: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>',
    cfp: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    set: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    print: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>',
    logout: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
    user: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    alert: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    calendar: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    clock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    download: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
    bld: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V5l7-2 7 2v16M9 9h2M13 9h2M9 13h2M13 13h2M10 21v-4h4v4"/></svg>',
    logo: '<svg width="24" height="24" viewBox="0 0 64 64" fill="none"><polygon points="32,14 54,23 32,32 10,23" fill="#FFFFFF"/><path d="M19,27.2 L19,37 C19,41.5 24.5,44.5 32,44.5 C39.5,44.5 45,41.5 45,37 L45,27.2 L32,32.8 Z" fill="#CBD5E1"/><path d="M49,25 L52,36 L50.5,45 L48.5,45 L50,36 Z" fill="#F59E0B"/><circle cx="51.5" cy="26" r="2" fill="#F59E0B"/><path d="M16,48 C24,44 30,46 32,49 C34,46 40,44 48,48 L48,51 C40,47 34,49 32,52 C30,49 24,47 16,51 Z" fill="#93C5FD"/></svg>',
    eye: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    eyeOff: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>',
    copy: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
  };

  const badge = s => `<span class="bd ${STC[s] || 'sl'}">${esc(s)}</span>`;
  const initialAdminPage = (() => {
    const p = sessionStorage.getItem('sp_admin_page');
    return ['dash', 'pen', 'jur', 'sub', 'cfp', 'set'].includes(p) ? p : 'dash';
  })();
  const S = { view: 'pub', tab: 'pub', page: initialAdminPage, P: null, D: null, q: '', yr: '', jq: '', jbiaya: '', subv: 'kanban', onlyCheck: false, f: { kampus: '', akr: '', biaya: '', rumpun: '' }, jview: 'grid', pubJurPage: 1, pubJurPerPage: 12, adminJurPage: 1, adminJurPerPage: 10 };

  const SEMESTERS = [
    ['', '— Pilih Semester BKD —'],
    ['2025/2026 Genap', '2025/2026 Genap'],
    ['2025/2026 Ganjil', '2025/2026 Ganjil'],
    ['2024/2025 Genap', '2024/2025 Genap'],
    ['2024/2025 Ganjil', '2024/2025 Ganjil'],
    ['2023/2024 Genap', '2023/2024 Genap'],
    ['2023/2024 Ganjil', '2023/2024 Ganjil']
  ];

  const PERAN_PENULIS = [
    ['Penulis Pertama & Korespondensi', 'Penulis Pertama & Korespondensi (Porsi 60%)'],
    ['Penulis Tunggal', 'Penulis Tunggal (Porsi 100%)'],
    ['Penulis Pertama', 'Penulis Pertama (Porsi 50% / 60%)'],
    ['Penulis Korespondensi', 'Penulis Korespondensi (Porsi 40%)'],
    ['Penulis Anggota', 'Penulis Anggota (Porsi 40% dibagi anggota)']
  ];

  const cfg = () => Object.assign({
    nama: '', afiliasi: '', wa: '', foto: '', link_sinta: '', link_scholar: '', link_scopus: '',
    ambang_cek: 14, ambang_cfp: '7,3,0', jam: '08:00',
    nidn: '', nip: '', jabatan_fungsional: 'Lektor', prodi: '', fakultas: '',
    nama_asesor_1: '', nama_asesor_2: '', nama_pimpinan: ''
  }, (S.D && S.D.Pengaturan && S.D.Pengaturan[0]) || {});
  const jname = id => ((S.D?.Jurnal || []).find(j => j.id === id) || {}).nama || '—';
  const perluCek = s => PROSES.includes(s.status) && s.tgl_cek && -dayDiff(s.tgl_cek) > Number(cfg().ambang_cek);
  const cfpNear = c => c.status !== 'Sudah Submit' && c.status !== 'Ditutup' && dayDiff(c.deadline) >= 0 && dayDiff(c.deadline) <= 7;

  // Modal hidup di wadah #modal sendiri
  const openModal = html => { $('#modal').innerHTML = html; const f = $('#modal input,#modal textarea,#modal select'); if (f) f.focus(); };
  const closeModal = () => { $('#modal').innerHTML = ''; };

  // ---- Katalog jurnal: akreditasi, kampus, biaya ----
  const AKR = ['Sinta 1', 'Sinta 2', 'Sinta 3', 'Sinta 4', 'Non-Sinta'];
  const KAMPUS = ['PTN', 'PTS', 'Lainnya'];
  const akr = j => { const m = String((j && (j.akreditasi || j.indeks)) || '').match(/sinta\s*([1-4])\b/i); return m ? 'Sinta ' + m[1] : 'Non-Sinta'; };
  const AKC = { 'Sinta 1': 'am', 'Sinta 2': 'bl', 'Sinta 3': 'ix', 'Sinta 4': 'gr', 'Non-Sinta': 'sl' };
  const akrBadge = j => `<span class="bd ${AKC[akr(j)]}" style="text-transform:uppercase;font-size:11px">${akr(j)}</span>`;

  // Kalkulasi Angka Kredit (KUM) & Beban SKS BKD
  const hitungKumBkd = (s, j) => {
    const akreditasi = akr(j);
    let kumMaks = 10;
    let labelKat = 'Jurnal Nasional';

    if (/sinta\s*1\b/i.test(akreditasi)) { kumMaks = 25; labelKat = 'Jurnal Nasional Terakreditasi SINTA 1'; }
    else if (/sinta\s*2\b/i.test(akreditasi)) { kumMaks = 25; labelKat = 'Jurnal Nasional Terakreditasi SINTA 2'; }
    else if (/sinta\s*3\b/i.test(akreditasi)) { kumMaks = 20; labelKat = 'Jurnal Nasional Terakreditasi SINTA 3'; }
    else if (/sinta\s*4\b/i.test(akreditasi)) { kumMaks = 20; labelKat = 'Jurnal Nasional Terakreditasi SINTA 4'; }
    else if (/sinta\s*5\b/i.test(akreditasi)) { kumMaks = 15; labelKat = 'Jurnal Nasional Terakreditasi SINTA 5'; }
    else if (/sinta\s*6\b/i.test(akreditasi)) { kumMaks = 15; labelKat = 'Jurnal Nasional Terakreditasi SINTA 6'; }
    else if (/scopus|wos|internasional bereputasi/i.test((j?.nama || '') + ' ' + (s?.catatan || ''))) {
      kumMaks = 40; labelKat = 'Jurnal Internasional Bereputasi';
    } else if (/internasional/i.test((j?.nama || ''))) {
      kumMaks = 30; labelKat = 'Jurnal Internasional';
    } else {
      labelKat = 'Jurnal Nasional (Non-Akreditasi)';
    }

    const peran = s?.peran_penulis || 'Penulis Pertama & Korespondensi';
    const total = Math.max(1, parseInt(s?.total_penulis || 1, 10));
    let porsi = 0.6;
    let porsiTxt = '60%';

    if (peran === 'Penulis Tunggal' || total === 1) {
      porsi = 1.0;
      porsiTxt = '100%';
    } else if (peran === 'Penulis Pertama & Korespondensi') {
      porsi = 0.6;
      porsiTxt = '60%';
    } else if (peran === 'Penulis Pertama') {
      porsi = 0.5;
      porsiTxt = '50%';
    } else if (peran === 'Penulis Korespondensi') {
      porsi = 0.4;
      porsiTxt = '40%';
    } else if (peran === 'Penulis Anggota') {
      const nAnggota = Math.max(1, total - 1);
      porsi = 0.4 / nAnggota;
      porsiTxt = `40% / ${nAnggota} (${(porsi * 100).toFixed(1)}%)`;
    }

    const kumDidapat = Number((kumMaks * porsi).toFixed(2));
    let sks = s?.sks_bkd ? parseFloat(s.sks_bkd) : 0;
    if (!sks || isNaN(sks)) {
      if (kumMaks >= 25) sks = 3;
      else if (kumMaks >= 20) sks = 2;
      else sks = 1.5;
    }

    return {
      kumMaks,
      porsi,
      porsiTxt,
      kumDidapat,
      sks: Number(sks.toFixed(2)),
      labelKat
    };
  };

  const apcVal = j => {
    if (j.tipe_biaya === 'Gratis') return { t: 'Gratis', c: '#047857' };
    const n = String(j.apc || '').replace(/[.\s]/g, '');
    return { t: /^\d+$/.test(n) ? 'Rp ' + Number(n).toLocaleString('id-ID') : (j.apc || 'Berbayar'), c: '#1E3A8A' };
  };

  // Normalisasi & Deteksi Duplikasi Data Jurnal
  const normCleanJournalName = s => String(s || '').trim().toLowerCase().replace(/[\u2018\u2019`']/g, '').replace(/[\u201C\u201D"]/g, '').replace(/[^a-z0-9]/g, '');
  const isSameJournalName = (a, b) => {
    if (!a || !b) return false;
    const s1 = String(a).trim().toLowerCase();
    const s2 = String(b).trim().toLowerCase();
    if (s1 === s2) return true;
    const p1 = s1.replace(/[\u2018\u2019`']/g, "'").replace(/[\u2013\u2014]/g, '-').replace(/\s*:\s*/g, ': ').replace(/\s+/g, ' ');
    const p2 = s2.replace(/[\u2018\u2019`']/g, "'").replace(/[\u2013\u2014]/g, '-').replace(/\s*:\s*/g, ': ').replace(/\s+/g, ' ');
    if (p1 === p2) return true;
    const c1 = normCleanJournalName(s1);
    const c2 = normCleanJournalName(s2);
    return c1.length >= 3 && c1 === c2;
  };
  const findDuplicateJournal = (nama, curId) => {
    if (!nama || !nama.trim()) return null;
    const list = S.D?.Jurnal || [];
    return list.find(j => (!curId || String(j.id) !== String(curId)) && isSameJournalName(j.nama, nama)) || null;
  };
  const findSimilarJournal = (nama, curId) => {
    if (!nama || nama.trim().length < 3) return null;
    const targetClean = normCleanJournalName(nama);
    if (targetClean.length < 4) return null;
    const list = S.D?.Jurnal || [];
    return list.find(j => {
      if (curId && String(j.id) === String(curId)) return false;
      const jClean = normCleanJournalName(j.nama);
      if (jClean.length >= 4 && (jClean.includes(targetClean) || targetClean.includes(jClean)) && jClean !== targetClean) {
        return true;
      }
      return false;
    }) || null;
  };

  function checkJournalDuplicateLive(inputEl) {
    const f = inputEl.form;
    if (!f || f.dataset.e !== 'Jurnal') return;
    const curId = f.dataset.id || '';
    const val = inputEl.value.trim();
    const notice = $('#jurnal-dup-notice');
    if (!notice) return;
    
    if (!val) {
      notice.style.display = 'none';
      inputEl.style.borderColor = '';
      return;
    }
    
    const dup = findDuplicateJournal(val, curId);
    if (dup) {
      inputEl.style.borderColor = '#EF4444';
      notice.style.display = 'block';
      notice.style.background = '#FEF2F2';
      notice.style.border = '1px solid #FCA5A5';
      notice.style.color = '#991B1B';
      notice.innerHTML = `⛔ <b>Data Sudah Ada di Database:</b> Jurnal "<b>${esc(dup.nama)}</b>" (${esc(akr(dup))}, ${esc(dup.penerbit || 'Penerbit')}) sudah pernah diinput. Sistem akan menolak penambahan data duplikat ini.`;
      return;
    }
    
    const sim = findSimilarJournal(val, curId);
    if (sim) {
      inputEl.style.borderColor = '#F59E0B';
      notice.style.display = 'block';
      notice.style.background = '#FFFBEB';
      notice.style.border = '1px solid #FCD34D';
      notice.style.color = '#92400E';
      notice.innerHTML = `ℹ️ <b>Peringatan Kemiripan:</b> Ditemukan jurnal dengan nama serupa di database: "<b>${esc(sim.nama)}</b>" (${esc(akr(sim))}, ${esc(sim.penerbit || 'Penerbit')}). Mohon pastikan bukan jurnal yang sama.`;
      return;
    }
    
    notice.style.display = 'none';
    inputEl.style.borderColor = '';
  }
  const formatImgUrl = url => {
    if (!url) return '';
    let u = String(url).trim();
    if (u.includes('drive.google.com')) {
      const m = u.match(/\/d\/([a-zA-Z0-9_-]+)/) || u.match(/id=([a-zA-Z0-9_-]+)/);
      if (m && m[1]) return `https://lh3.googleusercontent.com/d/${m[1]}`;
    }
    if (u.includes('dropbox.com')) {
      return u.replace('?dl=0', '?raw=1').replace('&dl=0', '&raw=1');
    }
    return u;
  };

  const thumb = (j, w, h) => {
    const ini = esc((j.nama || '?').split(' ').map(w => w[0]).filter(Boolean).slice(0, 3).join('').toUpperCase() || 'JUR');
    const pub = esc(j.penerbit || 'Jurnal');
    const akreditasi = akr(j);
    const box = `<div class="journal-cover-placeholder" style="width:100%;height:100%">
      <span class="jcp-badge">${akreditasi}</span>
      <b class="jcp-title">${ini}</b>
      <small class="jcp-sub">${pub}</small>
    </div>`;

    const rawThumb = j.thumbnail ? String(j.thumbnail).trim() : '';
    const imgUrl = formatImgUrl(rawThumb);
    const hasThumb = imgUrl.length > 10;
    return `
      <div class="journal-cover-wrap" style="width:${w};height:${h}">
        ${hasThumb ? `
          <img src="${esc(imgUrl)}" alt="${esc(j.nama)}" class="journal-cover-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div style="display:none;width:100%;height:100%">${box}</div>
        ` : box}
      </div>
    `;
  };
  function toast(m, err) {
    const t = $('#toast'), d = document.createElement('div');
    d.innerHTML = (err ? SVG.alert : SVG.check) + `<span>${esc(m)}</span>`;
    if (err) d.className = 'e';
    t.appendChild(d);
    setTimeout(() => d.remove(), 3500);
  }
  const pill = n => n < 0 ? `<span class="bd sl">Lewat</span>` : `<span class="bd ${n <= 3 ? 'rs' : n <= 7 ? 'am' : 'sl'}">${n === 0 ? 'Hari-H' : 'H-' + n}</span>`;

  function renderPagination(curPage, totalPages, totalItems, perPage, type, perPageOptions = [6, 12, 24, 48, 100]) {
    if (totalItems <= 0) return '';
    const start = (curPage - 1) * perPage + 1;
    const end = Math.min(curPage * perPage, totalItems);

    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (curPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (curPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(curPage - 1);
        pages.push(curPage);
        pages.push(curPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    const selectId = type === 'pub' ? 'pub_perpage' : 'admin_perpage';
    const actionName = type === 'pub' ? 'pubPage' : 'adminPage';
    const optsHtml = perPageOptions.map(n => `<option value="${n}" ${n === perPage ? 'selected' : ''}>${n} per halaman</option>`).join('');

    return `
      <div class="pag-wrap" id="${type}-pagination">
        <div class="pag-info-group">
          <div class="pag-info">Menampilkan <b>${start}–${end}</b> dari <b>${totalItems}</b> jurnal <span class="mu" style="font-size:12px">(Hal. ${curPage}/${totalPages})</span></div>
          <div class="pag-perpage-wrap">
            <label for="${selectId}" style="margin:0;font-size:12.5px;color:var(--mu);cursor:pointer">Tampilkan:</label>
            <select id="${selectId}" class="pag-perpage-select">
              ${optsHtml}
            </select>
          </div>
        </div>
        <div class="pag-nav" role="navigation" aria-label="Navigasi Halaman Katalog">
          <button type="button" class="btn sm pag-btn" data-a="${actionName}" data-page="1" ${curPage === 1 ? 'disabled title="Halaman pertama"' : 'title="Ke halaman pertama"'}>«</button>
          <button type="button" class="btn sm pag-btn" data-a="${actionName}" data-page="${curPage - 1}" ${curPage === 1 ? 'disabled title="Halaman sebelumnya"' : 'title="Ke halaman sebelumnya"'}>‹ Prev</button>
          ${pages.map(p => {
            if (p === '...') return `<span class="pag-ellipsis">…</span>`;
            const isActive = p === curPage;
            return `<button type="button" class="btn sm pag-btn ${isActive ? 'pri' : ''}" data-a="${actionName}" data-page="${p}" ${isActive ? 'aria-current="page"' : ''}>${p}</button>`;
          }).join('')}
          <button type="button" class="btn sm pag-btn" data-a="${actionName}" data-page="${curPage + 1}" ${curPage === totalPages ? 'disabled title="Halaman berikutnya"' : 'title="Ke halaman berikutnya"'}>Next ›</button>
          <button type="button" class="btn sm pag-btn" data-a="${actionName}" data-page="${totalPages}" ${curPage === totalPages ? 'disabled title="Halaman terakhir"' : 'title="Ke halaman terakhir"'}>»</button>
        </div>
      </div>
    `;
  }

  // ============ PUBLIK ============
  function pubIdx(i) { return i ? `<span class="bd nv">${esc(i)}</span>` : ''; }
  function viewPub() {
    const P = S.P; if (!P) return `<div class="wrap" style="text-align:center;padding:80px 20px"><div class="card" style="display:inline-block;padding:24px 40px">Memuat data riset & publikasi…</div></div>`;
    const q = S.q.toLowerCase();
    const match = x => !q || JSON.stringify(x).toLowerCase().includes(q);
    const pubs = P.publikasi.filter(x => match(x) && (!S.yr || x.tahun_terbit === S.yr));
    const years = [...new Set(P.publikasi.map(x => x.tahun_terbit).filter(Boolean))].sort().reverse();
    
    let list = '';
    if (S.tab === 'pub') {
      list = pubs.map(x => `
        <div class="card item">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
            <div style="display:flex;gap:8px;align-items:center">
              ${pubIdx(x.indeks)}
              <span class="bd sl">${x.tahun_terbit ? 'Tahun ' + esc(x.tahun_terbit) : 'Terbit'}</span>
            </div>
            ${x.doi ? `<span class="mono bd bl" style="font-size:11px">${esc(x.doi)}</span>` : ''}
          </div>
          <h3>${esc(x.judul)}</h3>
          <div class="mu" style="display:flex;align-items:center;gap:6px;font-size:13.5px">
            ${SVG.book} <b>${esc(x.jurnal)}</b>
          </div>
          <div style="display:flex;justify-content:flex-end;margin-top:14px;padding-top:12px;border-top:1px solid var(--bd)">
            ${(x.link_final || x.doi) ? `<a class="btn pri sm" href="${esc(x.link_final || 'https://doi.org/' + x.doi)}" target="_blank" rel="noopener">${SVG.ext} Buka Artikel / DOI</a>` : '<span class="mu" style="font-size:12px">Tautan artikel belum tersedia</span>'}
          </div>
        </div>
      `).join('') || '<div class="card mu" style="text-align:center;padding:32px">Belum ada publikasi yang sesuai pencarian.</div>';
    }
    
    if (S.tab === 'proses') {
      list = P.proses.filter(match).map(x => {
        const st = STAGE[x.status] || 2, dl = dayDiff(x.deadline_respon);
        return `
          <div class="card item">
            <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center">
              <div style="display:flex;gap:8px;align-items:center">
                ${badge(x.status)}
                <b style="font-size:14px">${esc(x.jurnal)}</b>
                ${pubIdx(x.indeks)}
              </div>
              ${x.link_jurnal ? `<a class="btn sm" href="${esc(x.link_jurnal)}" target="_blank" rel="noopener">${SVG.ext} Buka Jurnal</a>` : ''}
            </div>
            <h3>${esc(x.judul)}</h3>
            <div class="mu" style="font-size:13px;display:flex;gap:16px;flex-wrap:wrap;margin:8px 0">
              <span style="display:inline-flex;align-items:center;gap:4px">${SVG.calendar} Submit: <b>${fmt(x.tgl_submit)}</b></span>
              <span style="display:inline-flex;align-items:center;gap:4px">${SVG.clock} Update: <b>${fmt(x.tgl_cek)}</b></span>
              ${x.deadline_respon ? `<span>⚠️ Batas respon: <b>${fmt(x.deadline_respon)}</b> ${dl != null ? pill(dl) : ''}</span>` : ''}
            </div>
            <div class="steps-container">
              <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:600;color:var(--mu);margin-bottom:4px">
                <span style="color:var(--accent)">Tahap Saat Ini: ${STEPS[st - 1]}</span>
                <span>Tahap ${st} dari 6</span>
              </div>
              <div class="steps">${STEPS.map((_, i) => `<i class="${i < st - 1 ? 'd' : i === st - 1 ? 'c' : ''}"></i>`).join('')}</div>
            </div>
          </div>
        `;
      }).join('') + `<div class="card mu" style="background:#EFF6FF;border-color:#BFDBFE;color:#1E40AF;font-size:13px">ℹ️ Catatan internal telaah naskah dan feedback reviewer bersifat rahasia dan tidak ditampilkan ke publik.</div>`;
    }

    if (S.tab === 'pen') {
      const penList = (P.penelitian || []).filter(match);
      list = penList.map(x => `
        <div class="card item">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
            <div style="display:flex;gap:8px;align-items:center">
              <span class="bd ${x.status === 'Selesai' ? 'gr' : x.status === 'Berjalan' ? 'am' : 'sl'}">${esc(x.status)}</span>
              ${x.bidang ? `<span class="bd bl">${esc(x.bidang)}</span>` : ''}
            </div>
            <div class="mu" style="font-size:12.5px;display:inline-flex;align-items:center;gap:4px">${SVG.calendar} Mulai: ${fmt(x.tanggal_mulai)}</div>
          </div>
          <h3>${esc(x.judul)}</h3>
          <div class="mu" style="font-size:13px;display:flex;align-items:center;gap:6px">
            ${SVG.user} <span><b>Kolaborator / Tim:</b> ${esc(x.kolaborator || 'Mandiri')}</span>
          </div>
          ${(x.link_pdf || x.link_berkas) ? `
            <div style="display:flex;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid var(--bd)">
              ${x.link_pdf ? `<a class="btn sm" href="${esc(x.link_pdf)}" target="_blank" rel="noopener">${SVG.file} Naskah PDF ${SVG.ext}</a>` : ''}
              ${x.link_berkas ? `<a class="btn sm" href="${esc(x.link_berkas)}" target="_blank" rel="noopener">${SVG.folder} Berkas Drive ${SVG.ext}</a>` : ''}
            </div>
          ` : ''}
        </div>
      `).join('') || '<div class="card mu" style="text-align:center;padding:32px">Belum ada riset/penelitian yang ditampilkan ke publik.</div>';
    }

    if (S.tab === 'jur') list = pubKatalog(P, match);
    const totPen = (P.penelitian || []).length;
    
    const initials = esc((P.profil.nama || 'Dosen').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase());
    const fotoUrl = esc(P.profil.foto || P.profil.foto_profil || '');
    const avatarHtml = fotoUrl ? `<img src="${fotoUrl}" alt="${esc(P.profil.nama)}">` : initials;
    const hero = `
      <div class="hero-academic">
        <div class="hero-profile">
          <div class="hero-avatar">${avatarHtml}</div>
          <div>
            <div class="hero-title">${esc(P.profil.nama)}</div>
            <div class="hero-subtitle">
              <span>${esc(P.profil.afiliasi)}</span>
              <span class="hero-tag">Dosen &amp; Peneliti</span>
            </div>
            <div class="hero-badges">
              <a href="${esc(P.profil.link_sinta || 'https://sinta.kemdikbud.go.id')}" target="_blank" rel="noopener">🏛️ SINTA Kemdikbud ↗</a>
              <a href="${esc(P.profil.link_scholar || 'https://scholar.google.com')}" target="_blank" rel="noopener">🎓 Google Scholar ↗</a>
              <a href="${esc(P.profil.link_scopus || 'https://www.scopus.com')}" target="_blank" rel="noopener">🔬 Scopus ID ↗</a>
            </div>
          </div>
        </div>
      </div>
    `;

    return `
      <header class="top">
        <div class="brand">
          <div class="logo">${SVG.logo}</div>
          <div>
            <div class="brand-name">SIMPEN</div>
            <small>${esc(P.profil.nama)} · ${esc(P.profil.afiliasi)}</small>
          </div>
        </div>
        <button class="btn pri" data-a="goLogin">${SVG.user} Masuk Admin</button>
      </header>
      <div class="wrap">
        ${hero}
        ${S.tab === 'jur' ? '' : `
          <div class="stats">
            <div class="card stat"><span>Publikasi Terbit</span><b>${P.publikasi.length}</b><small>Artikel Terverifikasi</small></div>
            <div class="card stat"><span>Dalam Proses</span><b style="color:#2563EB">${P.proses.length}</b><small>Review & Revisi</small></div>
            <div class="card stat"><span>Riset &amp; Penelitian</span><b style="color:#059669">${totPen}</b><small>Proyek Riset</small></div>
            <div class="card stat"><span>Katalog Jurnal</span><b style="color:#7C3AED">${P.jurnal.length}</b><small>Target Publikasi</small></div>
          </div>
        `}
        <div class="tabs">
          ${[['pub', 'Publikasi Terbit'], ['proses', 'Dalam Proses'], ['pen', 'Riset & Penelitian'], ['jur', 'Katalog Jurnal']].map(([k, l]) => `<button data-a="tab" data-id="${k}" class="${S.tab === k ? 'on' : ''}">${l}</button>`).join('')}
        </div>
        ${S.tab === 'jur' ? '' : `
          <div class="card" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:20px;padding:12px 16px">
            <div class="input-icon-wrap" style="flex:1;min-width:220px">
              ${SVG.search}
              <input class="in" id="q" placeholder="Cari judul artikel, topik riset, atau kolaborator…" value="${esc(S.q)}">
            </div>
            ${S.tab === 'pub' ? `
              <select id="yr" style="width:160px">
                <option value="">Semua tahun terbit</option>
                ${years.map(y => `<option ${y === S.yr ? 'selected' : ''}>Tahun ${y}</option>`).join('')}
              </select>
            ` : ''}
          </div>
        `}
        ${list}
        <p class="mu" style="text-align:center;margin-top:40px;font-size:13px">© ${new Date().getFullYear()} SIMPEN · Sistem Manajemen Penelitian &amp; Publikasi Dosen</p>
      </div>
    `;
  }

  // Kartu katalog publik
  function jPub(j) {
    const v = apcVal(j), rum = esc(j.rumpun_ilmu || '—');

    if (S.jview === 'list') {
      return `
        <div class="card jc jl" data-a="jdetail" data-id="${esc(j.id)}" role="button" tabindex="0" title="Klik untuk rincian: ${esc(j.nama)}">
          <div class="jc-cover-list">
            ${thumb(j, '100%', '100%')}
          </div>
          <div style="flex:1;min-width:240px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span class="bd sl" style="font-size:11px">${esc(j.jenis_kampus || 'PTN')}</span>
              ${akrBadge(j)}
            </div>
            <h3 class="jn" style="margin:0 0 4px;font-size:16px">${esc(j.nama)}</h3>
            <div class="mu kp" style="font-size:12.5px">${SVG.bld} <span>${esc(j.penerbit || '—')}</span></div>
            <div class="mu sc" style="font-size:13px;margin-top:6px">${esc(j.scope)}</div>
          </div>
          <div class="jc-footer-list">
            <div style="margin-bottom:8px">
              <div class="lbl">Biaya (APC)</div>
              <b style="color:${v.c};font-size:14px">${esc(v.t)}</b>
            </div>
            <div>
              <div class="lbl">Rumpun Ilmu</div>
              <b style="font-size:13.5px">${rum}</b>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="card jc" data-a="jdetail" data-id="${esc(j.id)}" role="button" tabindex="0" title="Klik untuk rincian: ${esc(j.nama)}">
        <div class="jc-header">
          <div class="jc-cover-box">
            ${thumb(j, '100%', '100%')}
          </div>
          <div class="jc-body">
            <div class="jc-badges">
              <span class="bd sl" style="font-size:11px">${esc(j.jenis_kampus || 'PTN')}</span>
              ${akrBadge(j)}
            </div>
            <h3 class="jn">${esc(j.nama)}</h3>
            <div class="mu kp">${SVG.bld} <span>${esc(j.penerbit || '—')}</span></div>
          </div>
        </div>
        <div class="mu sc">${esc(j.scope)}</div>
        <div class="jc-footer">
          <div>
            <div class="lbl">Biaya (APC)</div>
            <b style="color:${v.c};font-size:13.5px">${esc(v.t)}</b>
          </div>
          <div style="text-align:right">
            <div class="lbl">Rumpun Ilmu</div>
            <b style="font-size:13.5px">${rum}</b>
          </div>
        </div>
      </div>
    `;
  }

  // Modal rincian katalog jurnal publik (Focus & Scope, Metrik, Link Resmi)
  function openJournalDetail(j) {
    const v = apcVal(j), rum = esc(j.rumpun_ilmu || '—');
    const kampus = esc(j.jenis_kampus || 'PTN');
    const scope = esc(j.scope || 'Belum ada rincian fokus dan ruang lingkup (focus & scope) untuk jurnal ini.');

    openModal(`
      <div class="ov">
        <div class="mod" style="max-width:580px;padding:26px 28px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:20px">
            <div style="display:flex;gap:16px;align-items:flex-start">
              <div class="jc-cover-box" style="width:72px;height:96px;flex-shrink:0">
                ${thumb(j, '100%', '100%')}
              </div>
              <div style="flex:1;min-width:0">
                <h2 style="font-size:18px;line-height:1.35;margin:0 0 6px;color:var(--tx);font-weight:700">${esc(j.nama)}</h2>
                <div style="display:flex;align-items:center;gap:6px;color:var(--pri);font-size:13px;font-weight:600">
                  ${SVG.bld} <span>${esc(j.penerbit || '—')}</span>
                </div>
              </div>
            </div>
            <button type="button" class="btn sm" data-a="mclose" aria-label="Tutup" style="padding:4px 8px;font-size:16px;line-height:1;border-radius:50%;width:32px;height:32px;display:grid;place-items:center;color:var(--mu);cursor:pointer">✕</button>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px">
            <div class="j-detail-metric">
              <div class="lbl">STATUS INSTITUSI</div>
              <b style="font-size:14.5px;color:var(--tx);margin-top:2px">${kampus}</b>
            </div>
            <div class="j-detail-metric">
              <div class="lbl">AKREDITASI</div>
              <div style="margin-top:2px">${akrBadge(j)}</div>
            </div>
            <div class="j-detail-metric">
              <div class="lbl">ESTIMASI BIAYA</div>
              <b style="font-size:14.5px;color:${v.c};margin-top:2px">${esc(v.t)}</b>
            </div>
            <div class="j-detail-metric">
              <div class="lbl">RUMPUN ILMU</div>
              <b style="font-size:14.5px;color:var(--tx);margin-top:2px">${rum}</b>
            </div>
          </div>

          <div class="j-detail-scope-box">
            <div style="font-weight:700;font-size:13.5px;color:#1E40AF;margin-bottom:6px;display:flex;align-items:center;gap:6px">
              ${SVG.book} <span>Focus &amp; Scope</span>
            </div>
            <div style="font-size:13px;line-height:1.6;color:var(--tx-sec);max-height:200px;overflow-y:auto;white-space:pre-line;padding-right:4px">${scope}</div>
          </div>

          <div class="act" style="margin-top:22px;display:flex;justify-content:flex-end;gap:10px">
            <button type="button" class="btn" data-a="mclose">Tutup</button>
            <a href="${esc(j.link)}" target="_blank" rel="noopener" class="btn pri" style="display:inline-flex;align-items:center;gap:6px">
              ${SVG.ext} Kunjungi Web
            </a>
          </div>
        </div>
      </div>
    `);
  }

  function pubKatalog(P, match) {
    const f = S.f, J = P.jurnal;
    const rum = [...new Set(J.map(x => x.rumpun_ilmu).filter(Boolean))].sort();
    const L = J.filter(j => (!f.kampus || (j.jenis_kampus || 'PTN') === f.kampus) && (!f.akr || akr(j) === f.akr) && (!f.biaya || (f.biaya === 'g' ? j.tipe_biaya === 'Gratis' : j.tipe_biaya !== 'Gratis')) && (!f.rumpun || j.rumpun_ilmu === f.rumpun) && match(j));
    const sel = (id, lab, opts, cur) => `<div><div class="lbl" style="margin-bottom:6px">${lab}</div><select id="f_${id}">${opts.map(([v, t]) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div>`;
    const kap = x => (x.jenis_kampus || 'PTN');
    const stats = `
      <div class="stats">
        <div class="card stat"><span>Total Jurnal</span><b>${J.length}</b><small>Terdaftar</small></div>
        <div class="card stat"><span>Jurnal PTN</span><b style="color:#B45309">${J.filter(x => kap(x) === 'PTN').length}</b><small>Perguruan Tinggi Negeri</small></div>
        <div class="card stat"><span>Jurnal PTS</span><b style="color:#0E7490">${J.filter(x => kap(x) === 'PTS').length}</b><small>Perguruan Tinggi Swasta</small></div>
        <div class="card stat"><span>Terakreditasi SINTA</span><b style="color:#047857">${J.filter(x => akr(x) !== 'Non-Sinta').length}</b><small>S1 – S4 Nasional</small></div>
      </div>
    `;
    const bar = `
      <div class="card" style="margin-bottom:20px">
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <div class="input-icon-wrap" style="flex:1;min-width:240px">
            ${SVG.search}
            <input class="in" id="q" placeholder="Cari nama jurnal, kampus, rumpun ilmu…" value="${esc(S.q)}">
          </div>
          <div class="card" style="padding:4px;display:flex;gap:2px;box-shadow:none">
            <button class="btn sm ${S.jview === 'grid' ? 'pri' : ''}" data-a="jview" data-id="grid" aria-label="Tampilan kartu">▦ Grid</button>
            <button class="btn sm ${S.jview === 'list' ? 'pri' : ''}" data-a="jview" data-id="list" aria-label="Tampilan daftar">☰ List</button>
          </div>
          <button class="btn sm" data-a="resetf">⟲ Reset Filter</button>
        </div>
        <div class="fgrid">
          ${sel('kampus', 'Jenis Kampus', [['', 'Semua'], ['PTN', 'PTN'], ['PTS', 'PTS'], ['Lainnya', 'Lainnya']], f.kampus)}
          ${sel('akr', 'Akreditasi SINTA', [['', 'Semua'], ...AKR.map(x => [x, x])], f.akr)}
          ${sel('biaya', 'Biaya (APC)', [['', 'Semua Biaya'], ['g', 'Gratis'], ['b', 'Berbayar']], f.biaya)}
          ${sel('rumpun', 'Rumpun Ilmu', [['', 'Semua Ilmu'], ...rum.map(x => [x, x])], f.rumpun)}
        </div>
      </div>
    `;

    const totalItems = L.length;
    const perPage = S.pubJurPerPage || 12;
    const totalPages = Math.ceil(totalItems / perPage) || 1;
    const page = Math.min(Math.max(1, S.pubJurPage || 1), totalPages);
    S.pubJurPage = page;
    const startIdx = (page - 1) * perPage;
    const endIdx = Math.min(startIdx + perPage, totalItems);
    const pageItems = L.slice(startIdx, endIdx);

    const paginationHtml = renderPagination(page, totalPages, totalItems, perPage, 'pub', [6, 12, 24, 48, 100]);

    return stats + bar + '<div id="katalog-top"></div>' +
      (totalItems ? `<div class="${S.jview === 'list' ? 'jlist' : 'jgrid'}">${pageItems.map(jPub).join('')}</div>` : '<div class="card mu" style="text-align:center;padding:32px">Tidak ada jurnal yang sesuai filter.</div>') +
      paginationHtml;
  }

  // ============ LOGIN ============
  const viewLogin = () => `
    <div class="login card">
      <div class="logo" style="margin:0 auto 16px;width:56px;height:56px;padding:8px">${SVG.logo}</div>
      <h1>Masuk Panel Admin</h1>
      <p class="mu" style="margin-bottom:14px">Sistem Manajemen Penelitian Dosen (SIMPEN)</p>
      <span class="bd bl" style="font-size:12px;padding:4px 12px">Akses khusus pengelola data &amp; publikasi</span>
      ${API.demo ? '<div class="card" style="margin:16px 0;padding:10px;background:#F8FAFC;border:1px dashed #CBD5E1;font-size:12.5px">Mode demo aktif — kata sandi: <b>admin</b></div>' : ''}
      <form id="lf" style="text-align:left;margin-top:20px">
        <label for="pw">Kata Sandi Admin <span style="color:#DC2626">*</span></label>
        <input class="in" id="pw" type="password" placeholder="Masukkan kata sandi pengelola…" autocomplete="current-password" required>
        <div class="mu" style="margin:8px 0 20px;font-size:12.5px">Sesi admin aktif selama 8 jam setelah berhasil masuk.</div>
        <button class="btn pri" style="width:100%;height:44px;font-size:14px">Masuk ke Panel Pengelola</button>
        <div class="err" id="le" style="display:none"></div>
      </form>
      <p style="margin-top:24px"><a href="#" data-a="goPub" style="color:var(--mu);text-decoration:none;font-weight:600;font-size:13px">← Kembali ke Halaman Utama</a></p>
    </div>
  `;

  // ============ ADMIN ============
  const NAV = [
    ['dash', 'Dashboard', SVG.dash],
    ['pen', 'Penelitian', SVG.pen],
    ['jur', 'Katalog Jurnal', SVG.jur],
    ['sub', 'Submission', SVG.sub],
    ['cfp', 'CFP & Deadline', SVG.cfp],
    ['set', 'Pengaturan', SVG.set]
  ];

  function viewAdmin() {
    const D = S.D; if (!D) return `<div class="wrap" style="text-align:center;padding:80px 20px"><div class="card" style="display:inline-block;padding:24px 40px">Memuat data panel pengelola…</div></div>`;
    const nSub = D.Submission.filter(perluCek).length, nCfp = D.CFP.filter(cfpNear).length;
    const cnt = { sub: nSub, cfp: nCfp };
    const body = { dash: pDash, pen: pPen, jur: pJur, sub: pSub, cfp: pCfp, set: pSet }[S.page]();
    
    return `
      <div class="adm">
        <aside class="side">
          <div>
            <div class="brand">
              <div class="logo">${SVG.logo}</div>
              <div>
                <b style="color:#fff;font-size:16px">SIMPEN Admin</b>
                <small style="color:#94a3b8;display:block;font-size:11px">Panel Pengelola Dosen</small>
              </div>
            </div>
            <div class="side-nav">
              ${NAV.map(([k, l, icon]) => `
                <button data-a="nav" data-id="${k}" class="${S.page === k ? 'on' : ''}">
                  <span class="nav-left">${icon} <span>${l}</span></span>
                  ${cnt[k] ? `<span class="cnt">${cnt[k]}</span>` : ''}
                </button>
              `).join('')}
            </div>
          </div>
          <div class="side-footer">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding:0 8px">
              <div style="width:32px;height:32px;border-radius:50%;background:#3B82F6;display:grid;place-items:center;font-weight:700;font-size:12px;color:#fff">${esc((cfg().nama || 'D').slice(0, 1).toUpperCase())}</div>
              <div style="overflow:hidden">
                <div style="color:#F8FAFC;font-weight:600;font-size:12px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden">${esc(cfg().nama || 'Admin Dosen')}</div>
                <div style="color:#64748B;font-size:11px">Pengelola Aktif</div>
              </div>
            </div>
            <button data-a="logout" style="color:#EF4444;justify-content:flex-start">
              <span class="nav-left">${SVG.logout} <span>Keluar Sistem</span></span>
            </button>
          </div>
        </aside>
        <main class="main">${body}</main>
        
        <!-- Bottom Navigation Bar Mobile -->
        <nav class="mobile-bottom-nav" aria-label="Navigasi Bawah Mobile">
          <button type="button" class="mb-btn ${S.page === 'dash' ? 'active' : ''}" data-a="nav" data-id="dash">
            ${SVG.dash}
            <span>Beranda</span>
          </button>
          <button type="button" class="mb-btn ${S.page === 'pen' ? 'active' : ''}" data-a="nav" data-id="pen">
            ${SVG.pen}
            <span>Penelitian</span>
          </button>
          <button type="button" class="mb-btn ${S.page === 'sub' ? 'active' : ''}" data-a="nav" data-id="sub">
            ${SVG.sub}
            <span>Naskah</span>
            ${cnt.sub ? `<span class="mb-badge">${cnt.sub}</span>` : ''}
          </button>
          <button type="button" class="mb-btn ${S.page === 'jur' ? 'active' : ''}" data-a="nav" data-id="jur">
            ${SVG.jur}
            <span>Jurnal</span>
          </button>
          <button type="button" class="mb-btn ${['cfp', 'set'].includes(S.page) ? 'active' : ''}" data-a="mobileMenu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            <span>Menu</span>
            ${cnt.cfp ? `<span class="mb-badge">${cnt.cfp}</span>` : ''}
          </button>
        </nav>
      </div>
    `;
  }

  const head = (t, sub, act = '') => `
    <div class="bar">
      <div>
        <h1>${t}</h1>
        <div class="mu">${sub}</div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">${act}</div>
    </div>
  `;

  function pDash() {
    const D = S.D, pub = D.Submission.filter(s => s.status === 'Published'), proses = D.Submission.filter(s => PROSES.includes(s.status));
    const tol = D.Submission.filter(s => ['Rejected', 'Withdrawn'].includes(s.status)), cf = D.CFP.filter(cfpNear).sort((a, b) => a.deadline.localeCompare(b.deadline)), pc = D.Submission.filter(perluCek);
    const yrs = {}; pub.forEach(s => { if (s.tahun_terbit) yrs[s.tahun_terbit] = (yrs[s.tahun_terbit] || 0) + 1; });
    const ys = Object.keys(yrs).sort(), mx = Math.max(1, ...Object.values(yrs));
    const dist = STAT.map(s => [s, D.Submission.filter(x => x.status === s).length]).filter(x => x[1]);
    const COL = { Draft: '#94A3B8', Submitted: '#60A5FA', 'Under Review': '#2563EB', 'Revision Requested': '#F59E0B', Resubmitted: '#FBBF24', Accepted: '#10B981', Published: '#059669', Rejected: '#DC2626', Withdrawn: '#F43F5E' };
    let acc = 0; const tot = D.Submission.length || 1; const cg = dist.map(([s, n]) => { const a = acc / tot * 360; acc += n; return `${COL[s]} ${a}deg ${acc / tot * 360}deg`; }).join(',');
    const jc = {}; D.Submission.forEach(s => { const n = jname(s.id_jurnal); jc[n] = (jc[n] || 0) + 1; }); const jt = Object.entries(jc).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const log = (D.Log || [])[0];

    return head('Dashboard Ringkasan', 'Kondisi riil penelitian, publikasi artikel, dan target deadline naskah', `
      <button class="btn" data-a="pdfBkd">${SVG.print} Cetak Rekap BKD</button>
      <button class="btn" data-a="add" data-e="Penelitian">${SVG.plus} Tambah Penelitian</button>
      <button class="btn pri" data-a="add" data-e="Submission">${SVG.plus} Catat Submission</button>
    `) + `
      <div class="stats">
        <div class="card stat"><span>Total Penelitian</span><b>${D.Penelitian.length}</b><small>Basis Riset</small></div>
        <div class="card stat"><span>Dalam Proses</span><b style="color:#2563EB">${proses.length}</b><small>Review &amp; Revisi</small></div>
        <div class="card stat"><span>Artikel Terbit</span><b style="color:#059669">${pub.length}</b><small>Published</small></div>
        <div class="card stat"><span>Ditolak / Withdrawn</span><b style="color:#DC2626">${tol.length}</b><small>Evaluasi</small></div>
        <div class="card stat"><span>CFP Aktif</span><b style="color:#D97706">${D.CFP.filter(c => dayDiff(c.deadline) >= 0 && c.status !== 'Ditutup').length}</b><small>Peluang Kirim</small></div>
      </div>

      <h2 style="margin:28px 0 14px">Perlu Perhatian Segera</h2>
      <div class="grid2">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h3>CFP Mendekati Deadline</h3>
            <span class="bd ${cf.length ? 'rs' : 'sl'}">${cf.length} Perlu Respon</span>
          </div>
          ${cf.map(c => `
            <div class="alert-row ${dayDiff(c.deadline) <= 3 ? 'danger' : 'warning'}">
              <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
                <b style="font-size:14px;color:var(--tx)">${esc(c.nama)}</b>
                ${pill(dayDiff(c.deadline))}
              </div>
              <div class="mu" style="font-size:13px;margin:6px 0">${SVG.calendar} Batas submit: <b>${fmt(c.deadline)}</b></div>
              <div style="margin-top:10px;display:flex;gap:8px">
                <button class="btn pri sm" data-a="cfp2sub" data-id="${c.id}">${SVG.plus} Jadikan Submission</button>
                ${c.link ? `<a class="btn sm" href="${esc(c.link)}" target="_blank" rel="noopener">${SVG.ext} Buka Tautan</a>` : ''}
              </div>
            </div>
          `).join('') || '<p class="mu" style="padding:16px 0;text-align:center">Tidak ada CFP mendesak saat ini.</p>'}
        </div>

        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h3>Submission Lama Belum Dicek</h3>
            <span class="bd ${pc.length ? 'am' : 'sl'}">${pc.length} Naskah</span>
          </div>
          ${pc.map(s => `
            <div class="alert-row warning">
              <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
                <b style="font-size:14px;color:var(--tx)">${esc(s.judul)}</b>
                <span class="bd am">⏱ Belum cek ${-dayDiff(s.tgl_cek)} hari</span>
              </div>
              <div class="mu" style="font-size:13px;margin:6px 0">${SVG.book} Sasaran: <b>${esc(jname(s.id_jurnal))}</b></div>
              <div style="margin-top:10px;display:flex;gap:8px">
                ${linkOf(s.id_jurnal, 'Portal Jurnal')}
                <button class="btn pri sm" data-a="cek" data-id="${s.id}">${SVG.check} Sudah Saya Cek</button>
              </div>
            </div>
          `).join('') || '<p class="mu" style="padding:16px 0;text-align:center">Semua naskah dalam pantauan berkala.</p>'}
        </div>
      </div>

      <h2 style="margin:32px 0 14px">Statistik &amp; Distribusi Publikasi</h2>
      <div class="grid2" style="grid-template-columns:repeat(auto-fit, minmax(300px, 1fr))">
        <div class="card">
          <h3>Publikasi per Tahun</h3>
          <div style="display:flex;gap:14px;align-items:flex-end;height:160px;margin-top:20px;padding-bottom:8px">
            ${ys.map(y => `
              <div style="flex:1;max-width:54px;text-align:center">
                <div class="mu" style="font-size:12px;font-weight:700;margin-bottom:4px">${yrs[y]}</div>
                <div style="height:${yrs[y] / mx * 110}px;background:linear-gradient(180deg, #3B82F6 0%, #1E3A8A 100%);border-radius:6px 6px 0 0"></div>
                <div class="mu mono" style="margin-top:6px">${y}</div>
              </div>
            `).join('') || '<span class="mu" style="margin:auto">Belum ada publikasi terbit.</span>'}
          </div>
        </div>

        <div class="card">
          <h3>Distribusi Status Naskah</h3>
          <div style="display:flex;gap:20px;align-items:center;margin-top:16px">
            <div style="width:130px;height:130px;border-radius:50%;background:conic-gradient(${cg || '#E2E8F0 0 360deg'});display:grid;place-items:center;flex-shrink:0;box-shadow:var(--sh-xs)">
              <div style="width:84px;height:84px;border-radius:50%;background:#FFF;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;box-shadow:0 1px 2px rgba(0,0,0,0.04)">
                <span class="mu" style="font-size:11px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;line-height:1;margin-bottom:3px">Total</span>
                <b style="font-size:22px;font-weight:700;line-height:1;color:var(--tx)">${D.Submission.length}</b>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;font-size:12.5px;max-height:160px;overflow-y:auto;padding-right:6px">
              ${dist.map(([s, n]) => `
                <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
                  <span style="display:flex;align-items:center;gap:6px">
                    <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${COL[s]}"></span>
                    <span>${s}</span>
                  </span>
                  <b>${n}</b>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Jurnal Sasaran Terbanyak</h3>
          <div style="margin-top:14px">
            ${jt.map(([n, c]) => `
              <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:13px">
                <span style="font-weight:600;color:var(--tx-sec)">${esc(n)}</span>
                <b style="color:var(--pri)">${c} naskah</b>
              </div>
              <div class="hb"><i style="width:${c / jt[0][1] * 100}%"></i></div>
            `).join('') || '<p class="mu">Belum ada data jurnal tercatat.</p>'}
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:20px;background:#F0FDF4;border-color:#BBF7D0;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:10px;font-size:13.5px;color:#166534">
          ${SVG.check}
          <span>${log ? `Notifikasi WA terakhir: <b>${esc(log.waktu)}</b> — ${esc(log.hasil)}` : 'Pengingat WhatsApp aktif dan berjalan sesuai jadwal harian.'}</span>
        </div>
        <a href="#" data-a="nav" data-id="set" class="btn sm" style="background:#FFF">${SVG.set} Konfigurasi Pengingat →</a>
      </div>
    `;
  }

  const linkOf = (idj, l) => {
    const j = (S.D?.Jurnal || []).find(x => x.id === idj);
    return j && j.link ? `<a class="btn sm" href="${esc(j.link)}" target="_blank" rel="noopener">${SVG.ext} ${l}</a>` : '';
  };

  function pPen() {
    const q = S.q.toLowerCase(), L = S.D.Penelitian.filter(p => !q || JSON.stringify(p).toLowerCase().includes(q));
    return head('Data Riset & Dokumen', 'Penyimpanan berkas Google Drive, naskah PDF, dan kolaborator riset', `
      <button class="btn" data-a="csv" data-e="Penelitian">${SVG.download} Ekspor Excel</button>
      <button class="btn pri" data-a="add" data-e="Penelitian">${SVG.plus} Tambah Penelitian</button>
    `) + `
      <div class="input-icon-wrap" style="margin-bottom:16px">
        ${SVG.search}
        <input class="in" id="q" placeholder="Cari judul riset, bidang, atau kolaborator…" value="${esc(S.q)}">
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Judul Penelitian</th>
              <th>Bidang &amp; Mulai</th>
              <th>Kolaborator</th>
              <th>Status</th>
              <th>Naskah</th>
              <th>Publik</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${L.map(p => `
              <tr>
                <td><b style="color:var(--tx);font-size:14px">${esc(p.judul)}</b></td>
                <td>
                  <div>${esc(p.bidang || '—')}</div>
                  <small class="mu">${fmt(p.tanggal_mulai)}</small>
                </td>
                <td>${esc(p.kolaborator || 'Mandiri')}</td>
                <td><span class="bd ${p.status === 'Selesai' ? 'gr' : p.status === 'Berjalan' ? 'am' : 'sl'}">${esc(p.status)}</span></td>
                <td><span class="bd bl">${S.D.Submission.filter(s => s.id_penelitian === p.id).length} naskah</span></td>
                <td><span class="bd ${p.tampil_publik ? 'gr' : 'sl'}">${p.tampil_publik ? 'Tampil' : 'Privat'}</span></td>
                <td style="white-space:nowrap">
                  ${p.link_berkas ? `<a class="btn sm" href="${esc(p.link_berkas)}" target="_blank" rel="noopener">${SVG.folder} Drive</a> ` : ''}
                  <button class="btn sm" data-a="edit" data-e="Penelitian" data-id="${p.id}">${SVG.edit} Ubah</button>
                  <button class="btn sm dng" data-a="del" data-e="Penelitian" data-id="${p.id}">${SVG.trash}</button>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="7" class="mu" style="text-align:center;padding:24px">Belum ada data penelitian.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  function pJur() {
    const q = S.jq.toLowerCase(), L = S.D.Jurnal.filter(j => (!q || JSON.stringify(j).toLowerCase().includes(q)) && (!S.jbiaya || (S.jbiaya === 'g' ? j.tipe_biaya === 'Gratis' : j.tipe_biaya !== 'Gratis')));
    const totalItems = L.length;
    const perPage = S.adminJurPerPage || 10;
    const totalPages = Math.ceil(totalItems / perPage) || 1;
    const page = Math.min(Math.max(1, S.adminJurPage || 1), totalPages);
    S.adminJurPage = page;
    const startIdx = (page - 1) * perPage;
    const endIdx = Math.min(startIdx + perPage, totalItems);
    const pageItems = L.slice(startIdx, endIdx);

    const paginationHtml = renderPagination(page, totalPages, totalItems, perPage, 'admin', [5, 10, 25, 50, 100]);

    return head('Katalog Jurnal Target', 'Basis data jurnal: akreditasi SINTA, biaya APC, dan visibilitas publik', `
      <button class="btn" data-a="csv" data-e="Jurnal">${SVG.download} Ekspor Excel</button>
      <button class="btn pri" data-a="add" data-e="Jurnal">${SVG.plus} Tambah Jurnal Baru</button>
    `) + `
      <div class="stats">
        <div class="card stat"><span>Total Jurnal</span><b>${S.D.Jurnal.length}</b><small>Tersimpan</small></div>
        <div class="card stat"><span>Bebas Biaya</span><b style="color:#059669">${S.D.Jurnal.filter(j => j.tipe_biaya === 'Gratis').length}</b><small>Gratis APC</small></div>
        <div class="card stat"><span>Tampil di Publik</span><b style="color:#2563EB">${S.D.Jurnal.filter(j => j.tampil_publik).length}</b><small>Publik</small></div>
      </div>
      <div class="card" style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;align-items:center">
        <div class="input-icon-wrap" style="flex:1;min-width:240px">
          ${SVG.search}
          <input class="in" id="jq" placeholder="Cari nama jurnal, kampus, atau rumpun ilmu…" value="${esc(S.jq)}">
        </div>
        <select id="jb" style="width:180px">
          <option value="">Semua Biaya APC</option>
          <option value="g" ${S.jbiaya === 'g' ? 'selected' : ''}>Gratis</option>
          <option value="b" ${S.jbiaya === 'b' ? 'selected' : ''}>Berbayar (APC)</option>
        </select>
      </div>
      <div id="admin-jur-top"></div>
      ${pageItems.map(j => {
        const v = apcVal(j);
        return `
          <div class="card item" style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start">
            <div class="jc-cover-box" style="flex:none">${thumb(j, '100%', '100%')}</div>
            <div style="flex:1;min-width:260px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                <span class="mu" style="font-size:12px;font-weight:600">${esc(j.penerbit || '—')}</span>
                <span class="bd ${j.tampil_publik ? 'gr' : 'sl'}">${j.tampil_publik ? 'Publik' : 'Privat'}</span>
              </div>
              <h3 style="margin:2px 0 8px">${esc(j.nama)}</h3>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
                <span class="bd sl">${esc(j.jenis_kampus || 'PTN')}</span>
                ${akrBadge(j)}
                <span class="bd ${j.tipe_biaya === 'Gratis' ? 'gr' : 'am'}">${j.tipe_biaya === 'Gratis' ? 'Gratis' : 'APC: ' + esc(v.t)}</span>
                ${j.rumpun_ilmu ? `<span class="bd bl">${esc(j.rumpun_ilmu)}</span>` : ''}
              </div>
              <p class="mu" style="font-size:13px;margin:6px 0 12px">${esc(j.scope)}</p>
              <div style="display:flex;gap:8px">
                <a class="btn sm" href="${esc(j.link)}" target="_blank" rel="noopener">${SVG.ext} Buka Jurnal</a>
                <button class="btn pri sm" data-a="edit" data-e="Jurnal" data-id="${j.id}">${SVG.edit} Ubah Data</button>
                <button class="btn sm dng" data-a="del" data-e="Jurnal" data-id="${j.id}">${SVG.trash} Hapus</button>
              </div>
            </div>
          </div>
        `;
      }).join('') || '<div class="card mu" style="text-align:center;padding:32px">Belum ada data jurnal yang tersimpan.</div>'}
      ${paginationHtml}
    `;
  }

  function subCard(s) {
    const pc = perluCek(s), dl = dayDiff(s.deadline_respon);
    const j = (S.D?.Jurnal || []).find(x => x.id === s.id_jurnal);
    const kumInfo = hitungKumBkd(s, j);
    const ojsInfo = s.akun_ojs ? `
      <div style="margin-top:6px;padding:5px 8px;background:#F1F5F9;border-radius:6px;font-size:11.5px;display:flex;justify-content:space-between;align-items:center;gap:6px">
        <span class="mono" style="font-weight:600;color:var(--tx);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="Akun OJS: ${esc(s.akun_ojs)}">🔑 ${esc(s.akun_ojs)}</span>
        ${s.password_ojs ? `
          <div class="pwd-cell" style="display:inline-flex;align-items:center;gap:4px;padding:1px 5px">
            <span class="pwd-text mono" data-val="${esc(s.password_ojs)}" style="letter-spacing:1px;font-size:11px">••••••</span>
            <button type="button" data-a="togglePwd" title="Lihat Password" style="border:none;background:transparent;cursor:pointer;color:#2563EB;padding:0;display:inline-flex;align-items:center">${SVG.eye}</button>
            <button type="button" data-a="copyPwd" data-pwd="${esc(s.password_ojs)}" title="Salin Password" style="border:none;background:transparent;cursor:pointer;color:var(--mu);padding:0;display:inline-flex;align-items:center">${SVG.copy}</button>
          </div>
        ` : ''}
      </div>
    ` : '';
    return `
      <div class="card kanban-card" draggable="true" data-drag-id="${s.id}">
        ${pc ? `<div style="margin-bottom:6px"><span class="bd am">⏱ Perlu dicek · ${-dayDiff(s.tgl_cek)} hr</span></div>` : ''}
        <h3 style="font-size:14px;margin:4px 0 6px;line-height:1.3">${esc(s.judul)}</h3>
        <div class="mu" style="font-size:12.5px;margin-bottom:4px;display:flex;align-items:center;gap:4px">${SVG.book} ${esc(jname(s.id_jurnal))}</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin:4px 0">
          ${s.semester_bkd ? `<span class="bd bl" style="font-size:10px">🗓️ ${esc(s.semester_bkd)}</span>` : ''}
          <span class="bd gr" style="font-size:10px">KUM: ${kumInfo.kumDidapat} (${kumInfo.porsiTxt})</span>
        </div>
        ${ojsInfo}
        <div class="mu" style="font-size:11.5px;margin-top:6px">Submit: ${fmt(s.tgl_submit)} · Cek: ${fmt(s.tgl_cek)}</div>
        ${dl != null && PROSES.includes(s.status) ? `<div style="margin-top:6px;font-size:12px">Batas revisi: ${pill(dl)}</div>` : ''}
        <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
          ${linkOf(s.id_jurnal, 'Portal')}
          <button class="btn pri sm" data-a="cek" data-id="${s.id}">${SVG.check} Dicek</button>
          <button class="btn sm" data-a="edit" data-e="Submission" data-id="${s.id}">${SVG.edit}</button>
        </div>
        <select data-a="chg" data-id="${s.id}" style="margin-top:8px;min-height:32px;font-size:12px">
          ${STAT.map(x => `<option ${x === s.status ? 'selected' : ''}>${x}</option>`).join('')}
        </select>
      </div>
    `;
  }

  function pSub() {
    let L = S.D.Submission; const q = S.q.toLowerCase();
    L = L.filter(s => (!q || (s.judul + jname(s.id_jurnal)).toLowerCase().includes(q)) && (!S.onlyCheck || perluCek(s)));
    const tgl = `
      <div class="card" style="padding:4px;display:flex;box-shadow:none">
        <button class="btn sm ${S.subv === 'kanban' ? 'pri' : ''}" data-a="subv" data-id="kanban">Kanban Board</button>
        <button class="btn sm ${S.subv === 'tabel' ? 'pri' : ''}" data-a="subv" data-id="tabel">Tabel Data</button>
      </div>
    `;
    const J = Object.fromEntries((S.D?.Jurnal || []).map(j => [j.id, j]));
    const body = S.subv === 'kanban'
      ? `<div style="display:flex;gap:14px;overflow-x:auto;padding-bottom:16px">${STAT.map(st => `
          <div class="kanban-col" data-drop-status="${st}">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <h3 style="font-size:14px">${st}</h3>
              <span class="bd sl">${L.filter(s => s.status === st).length}</span>
            </div>
            ${L.filter(s => s.status === st).map(subCard).join('')}
          </div>
        `).join('')}</div>`
      : `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Judul Naskah</th>
                <th>Jurnal Sasaran</th>
                <th>Semester &amp; KUM</th>
                <th style="min-width:110px">Akun OJS</th>
                <th style="min-width:120px">Password</th>
                <th>Status</th>
                <th>Submit</th>
                <th>Cek Terakhir</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${L.map(s => {
                const k = hitungKumBkd(s, J[s.id_jurnal]);
                return `
                <tr>
                  <td>
                    <b style="color:var(--tx);font-size:14px">${esc(s.judul)}</b>
                    ${perluCek(s) ? '<div><span class="bd am" style="margin-top:4px">Perlu dicek</span></div>' : ''}
                  </td>
                  <td>${esc(jname(s.id_jurnal))}</td>
                  <td>
                    ${s.semester_bkd ? `<span class="bd bl" style="font-size:10.5px">${esc(s.semester_bkd)}</span>` : '<span class="mu" style="font-size:11px">—</span>'}
                    <div style="font-weight:700;color:#1E3A8A;font-size:11px;margin-top:2px">${k.kumDidapat} KUM <small class="mu">(${k.sks} SKS)</small></div>
                  </td>
                  <td>
                    ${s.akun_ojs ? `<span class="mono" style="font-size:12px;font-weight:600;color:var(--tx)">${esc(s.akun_ojs)}</span>` : '<span class="mu" style="font-size:12px">—</span>'}
                  </td>
                  <td>
                    ${s.password_ojs ? `
                      <div class="pwd-cell" style="display:inline-flex;align-items:center;gap:6px">
                        <span class="pwd-text mono" data-val="${esc(s.password_ojs)}" style="font-size:11.5px;letter-spacing:1px;font-weight:600;color:var(--tx)">••••••</span>
                        <button type="button" class="btn sm" data-a="togglePwd" title="Lihat/Sembunyikan Password" style="padding:2px 6px;min-height:24px;border:none;background:transparent;cursor:pointer;color:#2563EB;display:inline-flex;align-items:center">
                          ${SVG.eye}
                        </button>
                        <button type="button" class="btn sm" data-a="copyPwd" data-pwd="${esc(s.password_ojs)}" title="Salin Password" style="padding:2px 6px;min-height:24px;border:none;background:transparent;cursor:pointer;color:var(--mu);display:inline-flex;align-items:center">
                          ${SVG.copy}
                        </button>
                      </div>
                    ` : '<span class="mu" style="font-size:12px">—</span>'}
                  </td>
                  <td>${badge(s.status)}</td>
                  <td>${fmt(s.tgl_submit)}</td>
                  <td>${fmt(s.tgl_cek)}</td>
                  <td style="white-space:nowrap">
                    ${linkOf(s.id_jurnal, 'Buka')}
                    <button class="btn pri sm" data-a="cek" data-id="${s.id}">${SVG.check} Dicek</button>
                    <button class="btn sm" data-a="hist" data-id="${s.id}">${SVG.clock} Riwayat</button>
                    <button class="btn sm" data-a="edit" data-e="Submission" data-id="${s.id}">${SVG.edit} Ubah</button>
                    <button class="btn sm dng" data-a="del" data-e="Submission" data-id="${s.id}">${SVG.trash}</button>
                  </td>
                </tr>
              `;}).join('') || '<tr><td colspan="9" class="mu" style="text-align:center;padding:24px">Belum ada submission.</td></tr>'}
            </tbody>
          </table>
        </div>
      `;

    return head('Submission Tracker', 'Pantau perkembangan manuskrip artikel ilmiah dari draft hingga terbit', `
      ${tgl}
      <button class="btn" data-a="pdfBkd">${SVG.print} Laporan BKD &amp; KUM</button>
      <button class="btn" data-a="csv" data-e="Submission">${SVG.download} Ekspor Excel</button>
      <button class="btn pri" data-a="add" data-e="Submission">${SVG.plus} Catat Submission Baru</button>
    `) + `
      <div class="card" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:20px;padding:12px 18px">
        <div class="input-icon-wrap" style="flex:1;min-width:240px">
          ${SVG.search}
          <input class="in" id="q" placeholder="Cari judul artikel atau jurnal sasaran…" value="${esc(S.q)}">
        </div>
        <label style="margin:0;font-weight:600;display:flex;align-items:center;gap:6px;cursor:pointer">
          <input type="checkbox" id="oc" ${S.onlyCheck ? 'checked' : ''}> Hanya yang perlu dicek
        </label>
      </div>
      ${body}
      <p class="mu" style="margin-top:16px;font-size:12.5px">💡 <b>Tips Alur Kerja:</b> Tarik &amp; letakkan (drag-and-drop) kartu naskah antar kolom status di papan Kanban untuk memperbarui progres publikasi secara otomatis.</p>
    `;
  }

  function pCfp() {
    const A = S.D.CFP.filter(c => dayDiff(c.deadline) >= 0).sort((a, b) => a.deadline.localeCompare(b.deadline)), O = S.D.CFP.filter(c => dayDiff(c.deadline) < 0);
    const tr = (c, old) => `
      <tr style="${old ? 'opacity:.6' : ''}">
        <td>
          <b style="color:var(--tx);font-size:14px">${esc(c.nama)}</b>
          ${c.link ? ` <a href="${esc(c.link)}" target="_blank" rel="noopener">${SVG.ext}</a>` : ''}
        </td>
        <td>${esc(c.scope)}</td>
        <td>${fmt(c.deadline)}</td>
        <td>${pill(dayDiff(c.deadline))}</td>
        <td><span class="bd sl">${esc(c.status)}</span></td>
        <td style="white-space:nowrap">
          ${old ? '' : `<button class="btn pri sm" data-a="cfp2sub" data-id="${c.id}">${SVG.plus} Jadikan Submission</button> `}
          <button class="btn sm" data-a="edit" data-e="CFP" data-id="${c.id}">${SVG.edit} Ubah</button>
          <button class="btn sm dng" data-a="del" data-e="CFP" data-id="${c.id}">${SVG.trash}</button>
        </td>
      </tr>
    `;
    const th = '<thead><tr><th>Nama CFP / Konferensi</th><th>Scope Topik</th><th>Batas Submit</th><th>Sisa Waktu</th><th>Status</th><th>Aksi</th></tr></thead>';
    return head('Call for Papers &amp; Deadline', 'Pantau batas pengiriman naskah konvensi/jurnal dengan pengingat WA harian', `
      <button class="btn pri" data-a="add" data-e="CFP">${SVG.plus} Tambah CFP Baru</button>
    `) + `
      <div class="table-wrap">
        <div style="padding:16px 20px;border-bottom:1px solid var(--bd)"><h3 style="font-size:15px">CFP Aktif (${A.length})</h3></div>
        <table>${th}<tbody>${A.map(c => tr(c)).join('') || '<tr><td colspan="6" class="mu" style="text-align:center;padding:24px">Belum ada CFP aktif.</td></tr>'}</tbody></table>
      </div>
      <div class="table-wrap" style="margin-top:24px">
        <div class="bar" style="padding:16px 20px;margin:0;border-bottom:1px solid var(--bd)">
          <h3 style="font-size:15px">CFP Telah Melewati Deadline (${O.length})</h3>
          ${O.length ? `<button class="btn sm dng" data-a="delOld">${SVG.trash} Hapus Semua yang Lewat</button>` : ''}
        </div>
        ${O.length ? `<table>${th}<tbody>${O.map(c => tr(c, 1)).join('')}</tbody></table>` : '<p class="mu" style="padding:24px;text-align:center">Tidak ada CFP yang telah lewat.</p>'}
      </div>
    `;
  }

  function pSet() {
    const c = cfg(), D = S.D;
    return head('Pengaturan Aplikasi', 'Profil akademisi, nomor WhatsApp (Fonnte), dan jadwal notifikasi', '') + `
      <div class="grid2">
        <div class="card">
          <h3 style="margin-bottom:16px">Pengingat Otomatis &amp; Profil</h3>
          <form id="sf">
            <label>Nama Lengkap &amp; Gelar</label>
            <input class="in" name="nama" value="${esc(c.nama)}" placeholder="Dr. Nama Dosen, M.Kom.">
            
            <label>Afiliasi / Universitas</label>
            <input class="in" name="afiliasi" value="${esc(c.afiliasi)}" placeholder="Fakultas / Universitas">

            <h4 style="margin:20px 0 10px;color:#1E40AF;border-bottom:1px solid var(--bd);padding-bottom:6px">Identitas BKD Dosen (Kop &amp; Lembar Pengesahan Laporan)</h4>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px">
              <div>
                <label>NIDN / NIDK</label>
                <input class="in" name="nidn" value="${esc(c.nidn || '')}" placeholder="Contoh: 0012058501">
              </div>
              <div>
                <label>NIP / NPK Pegawai</label>
                <input class="in" name="nip" value="${esc(c.nip || '')}" placeholder="Contoh: 198505122010121001">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px;margin-top:6px">
              <div>
                <label>Jabatan Fungsional</label>
                <select class="in" name="jabatan_fungsional">
                  ${['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Guru Besar', 'Tenaga Pengajar'].map(j => `<option value="${j}" ${(c.jabatan_fungsional || 'Lektor') === j ? 'selected' : ''}>${j}</option>`).join('')}
                </select>
              </div>
              <div>
                <label>Program Studi</label>
                <input class="in" name="prodi" value="${esc(c.prodi || '')}" placeholder="Contoh: Teknik Informatika">
              </div>
            </div>

            <label style="margin-top:8px">Fakultas / Unit Kerja</label>
            <input class="in" name="fakultas" value="${esc(c.fakultas || '')}" placeholder="Contoh: Fakultas Ilmu Komputer">

            <h4 style="margin:20px 0 10px;color:#1E40AF;border-bottom:1px solid var(--bd);padding-bottom:6px">Data Pengesahan &amp; Asesor BKD (Opsional)</h4>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px">
              <div>
                <label>Nama Asesor BKD 1</label>
                <input class="in" name="nama_asesor_1" value="${esc(c.nama_asesor_1 || '')}" placeholder="Prof. Dr. ..., M.Sc.">
              </div>
              <div>
                <label>Nama Asesor BKD 2</label>
                <input class="in" name="nama_asesor_2" value="${esc(c.nama_asesor_2 || '')}" placeholder="Dr. ..., M.Kom.">
              </div>
            </div>
            <label style="margin-top:8px">Pimpinan Fakultas / Dekan / Kaprodi</label>
            <input class="in" name="nama_pimpinan" value="${esc(c.nama_pimpinan || '')}" placeholder="Dr. ..., S.T., M.T. (Dekan)">

            <label>URL Foto Profil Peneliti (Opsional)</label>
            <div style="display:flex;gap:12px;align-items:center;margin-top:4px">
              <div class="hero-avatar" style="width:48px;height:48px;font-size:16px;overflow:hidden;flex-shrink:0;border:2px solid #3B82F6">
                ${c.foto ? `<img src="${esc(c.foto)}" alt="Foto" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block">` : esc((c.nama || 'D').slice(0, 2).toUpperCase())}
              </div>
              <div style="flex:1">
                <input class="in" name="foto" value="${esc(c.foto || '')}" placeholder="https://... URL direct link foto (.jpg, .png, Google Drive, ImgBB)">
              </div>
            </div>
            <small class="mu" style="display:block;margin-top:4px;font-size:11.5px">💡 Masukkan link foto profil direct. Jika dikosongkan, avatar otomatis menampilkan inisial nama.</small>

            <label>Tautan Profil Akademik (Tampil di Header Publik)</label>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px">
              <div>
                <small class="mu" style="font-weight:600">SINTA Kemdikbud</small>
                <input class="in" name="link_sinta" value="${esc(c.link_sinta || 'https://sinta.kemdikbud.go.id')}" placeholder="https://sinta.kemdikbud.go.id/authors/detail?id=...">
              </div>
              <div>
                <small class="mu" style="font-weight:600">Google Scholar</small>
                <input class="in" name="link_scholar" value="${esc(c.link_scholar || 'https://scholar.google.com')}" placeholder="https://scholar.google.com/citations?user=...">
              </div>
              <div>
                <small class="mu" style="font-weight:600">Scopus ID</small>
                <input class="in" name="link_scopus" value="${esc(c.link_scopus || 'https://www.scopus.com')}" placeholder="https://www.scopus.com/authid/detail.uri?authorId=...">
              </div>
            </div>
            
            <label>Nomor WhatsApp Pengelola (Format 628xxx)</label>
            <input class="in" name="wa" value="${esc(c.wa)}" placeholder="628123456789">
            
            <label>Ambang Pengingat CFP (hari sebelum deadline, pisahkan koma)</label>
            <input class="in" name="ambang_cfp" value="${esc(c.ambang_cfp)}" placeholder="7,3,0">
            
            <label>Ambang "Lama Tidak Dicek" (hari)</label>
            <input class="in" type="number" name="ambang_cek" value="${esc(c.ambang_cek)}">
            
            <label>Jam Pengiriman Pengingat Harian (WIB)</label>
            <input class="in" name="jam" value="${esc(c.jam)}" placeholder="08:00">
            
            <p class="mu" style="font-size:12.5px;margin:16px 0">Token Fonnte disimpan aman di Script Properties backend Google Apps Script.</p>
            
            <div style="display:flex;gap:10px;margin-top:20px">
              <button class="btn pri">Simpan Pengaturan</button>
              <button type="button" class="btn" data-a="testwa">Kirim Uji WhatsApp</button>
            </div>
          </form>
        </div>

        <div class="card">
          <h3 style="margin-bottom:16px">Log Notifikasi Terakhir</h3>
          <div style="display:flex;flex-direction:column;gap:10px">
            ${(D.Log || []).slice(0, 10).map(l => `
              <div class="row" style="margin:0">
                <span class="mono" style="font-size:11.5px">${esc(l.waktu)}</span>
                <span style="font-weight:600">${esc(l.jenis)}</span>
                <span class="bd ${/berhasil/i.test(l.hasil) ? 'gr' : 'rs'}">${esc(l.hasil)}</span>
              </div>
            `).join('') || '<p class="mu" style="text-align:center;padding:24px">Belum ada riwayat notifikasi WhatsApp.</p>'}
          </div>
        </div>
      </div>
    `;
  }

  // ============ MODAL FORM ============
  const FIELDS = {
    Penelitian: [
      ['judul', 'Judul Penelitian *', 'text'],
      ['bidang', 'Bidang / Disiplin Ilmu', 'text'],
      ['kolaborator', 'Kolaborator (pisahkan titik koma)', 'textarea'],
      ['tanggal_mulai', 'Tanggal Mulai', 'date'],
      ['status', 'Status', 'select', [['Draft'], ['Berjalan'], ['Selesai']]],
      ['semester_bkd', 'Periode Semester BKD (Opsional)', 'select', SEMESTERS],
      ['sks_bkd', 'Beban SKS BKD (Opsional, default: 2 s.d 3)', 'text'],
      ['link_berkas', 'Tautan Folder Google Drive', 'url'],
      ['link_pdf', 'Tautan Dokumen PDF Naskah', 'url'],
      ['catatan', 'Catatan Internal', 'textarea'],
      ['tampil_publik', 'Tampilkan di Halaman Publik', 'check']
    ],
    Jurnal: [
      ['nama', 'Nama Jurnal *', 'text'],
      ['link', 'Tautan Resmi Jurnal *', 'url'],
      ['thumbnail', 'URL Thumbnail / Cover', 'url'],
      ['penerbit', 'Kampus / Penerbit', 'text'],
      ['jenis_kampus', 'Jenis Kampus', 'select', KAMPUS.map(x => [x])],
      ['rumpun_ilmu', 'Rumpun Ilmu', 'text'],
      ['akreditasi', 'Akreditasi', 'select', AKR.map(x => [x])],
      ['tipe_biaya', 'Tipe Biaya', 'select', [['Gratis'], ['Berbayar (APC)']]],
      ['apc', 'Nominal APC (angka, mis. 500000)', 'text'],
      ['scope', 'Scope & Focus', 'textarea'],
      ['catatan', 'Catatan Internal (tidak tampil publik)', 'textarea'],
      ['tampil_publik', 'Tampilkan di Halaman Publik', 'check']
    ],
    Submission: [
      ['id_penelitian', 'Penelitian Induk / Payung Riset (Opsional)', 'select', 'pen'],
      ['judul', 'Judul Naskah Artikel Ilmiah *', 'text'],
      ['id_jurnal', 'Jurnal Sasaran Tujuan', 'select', 'jur'],
      ['semester_bkd', 'Periode Semester BKD', 'select', SEMESTERS],
      ['peran_penulis', 'Peran / Posisi Penulis (KUM BKD)', 'select', PERAN_PENULIS],
      ['total_penulis', 'Jumlah Total Penulis Naskah', 'number'],
      ['sks_bkd', 'Beban SKS BKD (Opsional, otomatis bila kosong)', 'text'],
      ['akun_ojs', 'Akun / Username OJS Jurnal (Opsional)', 'text'],
      ['password_ojs', 'Password Akun OJS Jurnal (Opsional)', 'text'],
      ['status', 'Status Manuskrip', 'select', STAT.map(x => [x])],
      ['tgl_submit', 'Tanggal Submit', 'date'],
      ['tgl_cek', 'Tanggal Cek Terakhir', 'date'],
      ['deadline_respon', 'Deadline Respon / Revisi', 'date'],
      ['link_feedback', 'Tautan Feedback Reviewer (internal)', 'url'],
      ['link_final', 'Tautan Artikel Final (Published)', 'url'],
      ['doi', 'Nomor DOI', 'text'],
      ['tahun_terbit', 'Tahun Terbit', 'text'],
      ['catatan', 'Catatan Internal Tim', 'textarea'],
      ['tampil_publik', 'Tampilkan di Halaman Publik', 'check']
    ],
    CFP: [
      ['nama', 'Nama CFP / Acara Konferensi *', 'text'],
      ['link', 'Tautan Informasi CFP', 'url'],
      ['id_jurnal', 'Jurnal Terkait (Opsional)', 'select', 'jur'],
      ['scope', 'Scope & Bidang', 'textarea'],
      ['deadline', 'Batas Akhir Submit *', 'date'],
      ['status', 'Status', 'select', [['Tertarik'], ['Disiapkan'], ['Sudah Submit'], ['Ditutup']]],
      ['catatan', 'Catatan Tambahan', 'textarea']
    ]
  };

  const opts = (f, v) => {
    let o = f[3];
    if (o === 'pen') o = [['', '— Tanpa Penelitian Induk (Artikel Mandiri) —'], ...S.D.Penelitian.map(p => [p.id, p.judul])];
    else if (o === 'jur') o = [['', '— Pilih Jurnal Sasaran —'], ...S.D.Jurnal.map(j => [j.id, j.nama])];
    else if (Array.isArray(o)) {
      o = o.slice();
      if (v && !o.some(([a]) => a === v)) o.unshift([v, v]);
    }
    return (o || []).map(([a, b]) => `<option value="${esc(a)}" ${a === v ? 'selected' : ''}>${esc(b || a)}</option>`).join('');
  };

  function updateSubmissionKumInForm() {
    const f = $('#mf');
    if (!f || f.dataset.e !== 'Submission') return;
    const box = $('#sub-kum-preview');
    if (!box) return;
    const jurId = f.querySelector('[name=id_jurnal]')?.value;
    const peran = f.querySelector('[name=peran_penulis]')?.value || 'Penulis Pertama & Korespondensi';
    const total = parseInt(f.querySelector('[name=total_penulis]')?.value || 1, 10);
    const j = (S.D?.Jurnal || []).find(x => x.id === jurId);
    const k = hitungKumBkd({ peran_penulis: peran, total_penulis: total }, j);
    box.innerHTML = `
      <div style="font-weight:700;margin-bottom:4px;color:#1E40AF">📊 Estimasi Perhitungan Angka Kredit (KUM) BKD:</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;font-size:12px">
        <span>Kategori: <b>${esc(k.labelKat)}</b> (KUM Maks: ${k.kumMaks})</span>
        <span>Porsi: <b>${esc(k.porsiTxt)}</b></span>
        <span>Perolehan KUM: <b style="color:#1E3A8A;font-size:14px">${k.kumDidapat.toFixed(2)} KUM</b></span>
        <span>Estimasi SKS BKD: <b style="color:#047857">${k.sks} SKS</b></span>
      </div>
    `;
  }

  function openForm(ent, rec) {
    rec = rec || {};
    if (ent === 'Jurnal') rec = { jenis_kampus: 'PTN', ...rec, akreditasi: akr(rec) };
    if (ent === 'Submission' && !rec.peran_penulis) rec = { peran_penulis: 'Penulis Pertama & Korespondensi', total_penulis: 1, ...rec };
    openModal(`
      <div class="ov">
        <div class="mod">
          <h2>${rec.id ? 'Ubah Data' : 'Tambah Baru'} ${ent}</h2>
          <p class="mu" style="font-size:13px;margin-bottom:16px">Isi rincian informasi di bawah ini untuk pembaruan data sistem.</p>
          <form id="mf" data-e="${ent}" data-id="${esc(rec.id || '')}">
            ${FIELDS[ent].map(f => {
              const v = rec[f[0]] ?? '', n = `name="${f[0]}"`;
              if (f[2] === 'check') return `<label style="font-weight:600;display:flex;align-items:center;gap:8px;margin-top:16px;cursor:pointer"><input type="checkbox" ${n} ${rec[f[0]] ? 'checked' : ''}> ${f[1]}</label>`;
              let ctl = f[2] === 'textarea' ? `<textarea ${n}>${esc(v)}</textarea>` : f[2] === 'select' ? `<select ${n}>${opts(f, v)}</select>` : `<input class="in" ${n} type="${f[2]}" value="${esc(v)}">`;
              if (ent === 'Jurnal' && f[0] === 'nama') {
                ctl += `<div id="jurnal-dup-notice" style="display:none;margin-top:6px;padding:8px 12px;border-radius:6px;font-size:12px;line-height:1.4"></div>`;
              }
              if (ent === 'Jurnal' && f[0] === 'thumbnail') {
                ctl += `
                  <div style="display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap">
                    <button type="button" class="btn sm" data-a="thumb">🔍 Ambil Thumbnail Otomatis</button>
                    <span class="mu" style="font-size:11.5px">atau tempel direct link cover (.jpg / .png / Google Drive)</span>
                  </div>
                  <div class="mu" style="font-size:11.5px;margin-top:6px;line-height:1.4">
                    💡 <b>Rekomendasi Cover Buku:</b> Gunakan gambar cover edisi/isu (rasio potret A4/buku). Bisa salin direct URL dari web jurnal, upload ke <b>Postimages.org</b>, <b>ImgBB.com</b>, atau Google Drive (akses: 'Anyone with link').
                  </div>
                `;
              }
              return `<label>${f[1]}</label>${ctl}`;
            }).join('')}
            ${ent === 'Submission' ? `
              <div id="sub-kum-preview" class="card" style="margin-top:14px;padding:12px 14px;background:#F0FDF4;border:1px solid #BBF7D0;font-size:12px;color:#166534"></div>
            ` : ''}
            <div class="act">
              <button type="button" class="btn" data-a="mclose">Batal</button>
              <button class="btn pri">Simpan Perubahan</button>
            </div>
          </form>
        </div>
      </div>
    `);
    if (ent === 'Submission') {
      setTimeout(updateSubmissionKumInForm, 30);
    }
  }

  // ============ DATA OPS (Optimistic UI) ============
  async function upsert(ent, rec) {
    const L = S.D[ent] = S.D[ent] || [], i = L.findIndex(x => x.id === rec.id), old = i < 0 ? null : L[i];
    i < 0 ? L.push(rec) : (L[i] = rec);
    if (ent === 'Submission' && old && old.status !== rec.status) {
      (S.D.StatusLog = S.D.StatusLog || []).unshift({ id_submission: rec.id, status_lama: old.status, status_baru: rec.status, waktu: new Date().toLocaleString('id-ID') });
    }
    draw();
    const r = await API.post('upsert', { entity: ent, record: rec });
    if (!r.success) { toast(r.message || 'Gagal menyimpan; memuat ulang…', true); await loadAdmin(); }
  }

  async function remove(ent, id) {
    S.D[ent] = S.D[ent].filter(x => x.id !== id); draw();
    const r = await API.post('delete', { entity: ent, id });
    if (!r.success) { toast(r.message || 'Gagal menghapus data', true); await loadAdmin(); } else toast('Data berhasil dihapus');
  }

  function csv(ent) {
    const L = S.D[ent] || []; if (!L.length) return toast('Tidak ada data untuk diekspor', true);
    const k = Object.keys(L[0]).filter(x => !/catatan|link_feedback/.test(x));
    const t = [k.join(','), ...L.map(r => k.map(x => '"' + String(r[x] ?? '').replace(/"/g, '""') + '"').join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + t], { type: 'text/csv' })); a.download = `SIMPEN-${ent}-${today()}.csv`; a.click();
  }

  // ============ SISTEM LAPORAN BKD & REKAP KUM ============
  function updateBkdModalPreview() {
    const D = S.D; if (!D) return;
    const sem = $('#bkd_sem')?.value || '';
    const stOpt = $('#bkd_status')?.value || 'Published';
    const incPen = $('#bkd_inc_pen')?.checked ?? true;
    const J = Object.fromEntries((D.Jurnal || []).map(j => [j.id, j]));

    let subs = D.Submission || [];
    if (sem) subs = subs.filter(s => (s.semester_bkd || '').toLowerCase() === sem.toLowerCase());
    if (stOpt === 'Published') subs = subs.filter(s => s.status === 'Published');
    else if (stOpt === 'Accepted+Published') subs = subs.filter(s => ['Published', 'Accepted'].includes(s.status));

    let pens = D.Penelitian || [];
    if (sem) pens = pens.filter(p => (p.semester_bkd || '').toLowerCase() === sem.toLowerCase());

    let totKum = 0, totSksPub = 0;
    subs.forEach(s => {
      const k = hitungKumBkd(s, J[s.id_jurnal]);
      totKum += k.kumDidapat;
      totSksPub += k.sks;
    });

    let totSksPen = 0;
    if (incPen) {
      pens.forEach(p => {
        const sks = p.sks_bkd ? parseFloat(p.sks_bkd) : (p.status === 'Selesai' ? 3 : 2);
        if (!isNaN(sks)) totSksPen += sks;
      });
    }

    const grandTotalSks = totSksPub + totSksPen;
    const box = $('#bkd-preview-stats');
    if (box) {
      box.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-weight:700;color:#1E40AF">Estimasi Capaian Periode ${sem ? esc(sem) : 'Semua Semester'}:</span>
          <span class="bd gr">${subs.length} Naskah · ${incPen ? pens.length : 0} Riset</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px">
          <div style="background:#fff;padding:8px 12px;border-radius:6px;border:1px solid #DBEAFE">
            <div class="mu" style="font-size:11px">TOTAL ESTIMASI KUM</div>
            <b style="font-size:17px;color:#1E3A8A">${totKum.toFixed(2)} <span style="font-size:12px;font-weight:normal">KUM</span></b>
          </div>
          <div style="background:#fff;padding:8px 12px;border-radius:6px;border:1px solid #DBEAFE">
            <div class="mu" style="font-size:11px">TOTAL SKS BKD PENELITIAN</div>
            <b style="font-size:17px;color:#047857">${grandTotalSks.toFixed(2)} <span style="font-size:12px;font-weight:normal">SKS</span></b>
          </div>
        </div>
        <div style="margin-top:8px;font-size:12px;line-height:1.4;color:${grandTotalSks >= 2 ? '#065F46' : '#92400E'}">
          ${grandTotalSks >= 2 ? '✅ <b>Memenuhi Rubrik BKD:</b> Beban kerja penelitian memenuhi batas minimal (standar: 2 s.d 4 SKS per semester).' : '⚠️ <b>Perhatian:</b> Total SKS penelitian di bawah 2 SKS. Pastikan naskah/laporan riset pada semester ini sudah dicatat.'}
        </div>
      `;
    }
  }

  function openBkdModal() {
    const D = S.D; if (!D) return;
    const c = cfg();
    const subs = D.Submission || [], pens = D.Penelitian || [];
    const allSemesters = [...new Set([
      ...subs.map(s => s.semester_bkd),
      ...pens.map(p => p.semester_bkd),
      '2025/2026 Genap', '2025/2026 Ganjil', '2024/2025 Genap', '2024/2025 Ganjil'
    ].filter(Boolean))].sort().reverse();

    openModal(`
      <div class="ov">
        <div class="mod" style="max-width:580px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
            <div>
              <h2 style="font-size:18px;color:#1E3A8A">Laporan BKD &amp; Rekapitulasi KUM</h2>
              <p class="mu" style="font-size:12.5px;margin:2px 0 0">Cetak dokumen resmi pelaporan Beban Kerja Dosen untuk disetorkan ke institusi &amp; Asesor BKD.</p>
            </div>
            <button type="button" class="btn sm" data-a="mclose" style="border:none;background:transparent;font-size:18px">✕</button>
          </div>

          <div style="background:#F8FAFC;border:1px solid #E2E8F0;padding:12px 14px;border-radius:8px;margin:14px 0;font-size:12.5px">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
              <div><b>Nama Dosen:</b> ${esc(c.nama || 'Belum diisi')}</div>
              <span class="bd bl">${esc(c.jabatan_fungsional || 'Lektor')}</span>
            </div>
            <div class="mu" style="margin-top:6px;display:flex;gap:12px;flex-wrap:wrap;font-size:12px">
              <span>NIDN: <b>${esc(c.nidn || '—')}</b></span>
              <span>NIP: <b>${esc(c.nip || '—')}</b></span>
              <span>Prodi: <b>${esc(c.prodi || '—')}</b></span>
              <span>Unit: <b>${esc(c.fakultas || c.afiliasi || '—')}</b></span>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr;gap:10px">
            <div>
              <label for="bkd_sem" style="font-weight:700">Periode Semester BKD</label>
              <select id="bkd_sem" class="in" style="font-weight:600">
                <option value="">— Semua Periode Semester —</option>
                ${allSemesters.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label for="bkd_status" style="font-weight:700">Filter Status Publikasi</label>
              <select id="bkd_status" class="in">
                <option value="Published">Hanya Artikel Terbit Resmi (Published)</option>
                <option value="Accepted+Published">Artikel Terbit &amp; Diterima (Published / LoA Accepted)</option>
                <option value="All">Semua Naskah (Termasuk Draft / Under Review)</option>
              </select>
            </div>
            <div>
              <label style="font-weight:600;display:flex;align-items:center;gap:8px;margin-top:4px;cursor:pointer">
                <input type="checkbox" id="bkd_inc_pen" checked> Sertakan Laporan Kegiatan Penelitian Berjalan / Selesai
              </label>
            </div>
          </div>

          <div id="bkd-preview-stats" style="margin-top:14px;padding:12px 14px;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px"></div>

          <div class="act" style="margin-top:20px;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">
            <button type="button" class="btn" data-a="mclose">Tutup</button>
            <button type="button" class="btn" data-a="doBkdCsv" style="background:#059669;color:#fff;border-color:#059669;font-weight:600">
              📊 Unduh Excel / CSV
            </button>
            <button type="button" class="btn pri" data-a="doBkdPrint" style="font-weight:600">
              🖨️ Cetak / PDF Resmi
            </button>
          </div>
        </div>
      </div>
    `);

    setTimeout(updateBkdModalPreview, 50);
  }

  function printBkdReport(sem, stOpt, incPen) {
    const D = S.D; if (!D) return;
    const c = cfg();
    const J = Object.fromEntries((D.Jurnal || []).map(j => [j.id, j]));

    let subs = D.Submission || [];
    if (sem) subs = subs.filter(s => (s.semester_bkd || '').toLowerCase() === sem.toLowerCase());
    if (stOpt === 'Published') subs = subs.filter(s => s.status === 'Published');
    else if (stOpt === 'Accepted+Published') subs = subs.filter(s => ['Published', 'Accepted'].includes(s.status));

    let pens = D.Penelitian || [];
    if (sem) pens = pens.filter(p => (p.semester_bkd || '').toLowerCase() === sem.toLowerCase());

    const win = window.open('', '_blank');
    if (!win) return toast('Pop-up cetak terblokir di browser Anda', true);

    let totKum = 0, totSksPub = 0;
    const pubRows = subs.map((s, i) => {
      const j = J[s.id_jurnal] || {};
      const k = hitungKumBkd(s, j);
      totKum += k.kumDidapat;
      totSksPub += k.sks;
      const bukti = s.link_final || (s.doi ? 'https://doi.org/' + s.doi : '');
      return `
        <tr>
          <td style="text-align:center">${i + 1}</td>
          <td><b>${esc(s.judul)}</b></td>
          <td>${esc(j.nama || '—')}<br><small style="color:#2563EB;font-weight:600">${esc(k.labelKat)}</small></td>
          <td style="text-align:center">${esc(s.peran_penulis || 'Penulis Pertama')}</td>
          <td style="text-align:center">${esc(s.total_penulis || 1)}</td>
          <td style="text-align:center">${k.kumMaks}</td>
          <td style="text-align:center">${esc(k.porsiTxt)}</td>
          <td style="text-align:center;font-weight:bold;color:#1E3A8A">${k.kumDidapat.toFixed(2)}</td>
          <td style="text-align:center;font-weight:bold;color:#047857">${k.sks.toFixed(2)}</td>
          <td style="word-break:break-all;font-size:11px">
            ${bukti ? `<a href="${esc(bukti)}" target="_blank" rel="noopener" style="color:#1D4ED8;text-decoration:none">${esc(s.doi || 'Lihat Artikel Terbit')}</a>` : '<span style="color:#94A3B8">—</span>'}
          </td>
        </tr>
      `;
    }).join('');

    let totSksPen = 0;
    const penRows = (incPen ? pens : []).map((p, i) => {
      const sks = p.sks_bkd ? parseFloat(p.sks_bkd) : (p.status === 'Selesai' ? 3 : 2);
      if (!isNaN(sks)) totSksPen += sks;
      const bukti = p.link_pdf || p.link_berkas || '';
      return `
        <tr>
          <td style="text-align:center">${i + 1}</td>
          <td><b>${esc(p.judul)}</b></td>
          <td>${esc(p.bidang || '—')}</td>
          <td>${esc(p.kolaborator || 'Mandiri')}</td>
          <td style="text-align:center">${fmt(p.tanggal_mulai)}</td>
          <td style="text-align:center"><span style="padding:2px 8px;border-radius:4px;background:#F1F5F9;font-weight:bold;font-size:11px">${esc(p.status)}</span></td>
          <td style="text-align:center;font-weight:bold;color:#047857">${sks.toFixed(2)}</td>
          <td style="word-break:break-all;font-size:11px">
            ${bukti ? `<a href="${esc(bukti)}" target="_blank" rel="noopener" style="color:#1D4ED8;text-decoration:none">Tautan Bukti Berkas</a>` : '<span style="color:#94A3B8">—</span>'}
          </td>
        </tr>
      `;
    }).join('');

    const grandTotalSks = totSksPub + (incPen ? totSksPen : 0);
    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Laporan BKD — ${esc(c.nama || 'Dosen')} (${esc(sem || 'Semua Periode')})</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 15mm 20mm 15mm; }
    body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #0F172A; margin: 0; padding: 24px; font-size: 12px; line-height: 1.5; background: #fff; }
    .kop { text-align: center; border-bottom: 3px double #1E3A8A; padding-bottom: 12px; margin-bottom: 18px; }
    .kop h1 { font-size: 15px; margin: 0; text-transform: uppercase; color: #1E3A8A; letter-spacing: 0.5px; }
    .kop h2 { font-size: 13px; margin: 4px 0 0; font-weight: 600; color: #334155; }
    .kop p { font-size: 11px; margin: 2px 0 0; color: #64748B; }
    
    .meta-box { border: 1px solid #CBD5E1; background: #F8FAFC; border-radius: 6px; padding: 12px 16px; margin-bottom: 18px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; }
    .meta-box div { line-height: 1.4; }
    
    .sec-head { font-size: 13px; font-weight: bold; color: #1E3A8A; border-bottom: 1.5px solid #1E3A8A; padding-bottom: 4px; margin: 18px 0 8px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11px; page-break-inside: auto; }
    tr { page-break-inside: avoid; page-break-after: auto; }
    th, td { border: 1px solid #94A3B8; padding: 6px 8px; text-align: left; vertical-align: middle; }
    th { background: #F1F5F9; font-weight: bold; color: #1E293B; text-align: center; font-size: 10.5px; }
    .tfoot-total td { background: #F8FAFC; font-weight: bold; }
    
    .rekap-card { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 6px; padding: 10px 14px; margin: 16px 0; display: flex; justify-content: space-around; font-size: 12px; }
    .rekap-card div { text-align: center; }
    .rekap-card b { display: block; font-size: 16px; color: #1E3A8A; margin-top: 2px; }
    
    .sign-wrap { margin-top: 32px; page-break-inside: avoid; }
    .sign-date { text-align: right; margin-bottom: 14px; font-size: 12px; }
    .sign-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; text-align: center; font-size: 11.5px; }
    .sign-box { display: flex; flex-direction: column; justify-content: space-between; height: 110px; }
    .sign-name { font-weight: bold; text-decoration: underline; }
    .sign-pimpinan { margin-top: 24px; text-align: center; font-size: 11.5px; }
    
    .no-print-bar { background: #1E3A8A; color: #fff; padding: 12px 18px; border-radius: 6px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .btn-print { background: #F59E0B; color: #000; border: none; padding: 8px 18px; font-weight: bold; font-size: 13px; border-radius: 4px; cursor: pointer; }
    @media print { .no-print-bar { display: none !important; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <span><b>Dokumen Siap Cetak / Simpan PDF:</b> Format resmi Laporan Kinerja Dosen (BKD) Bidang Riset &amp; Publikasi.</span>
    <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
  </div>

  <div class="kop">
    <h1>${esc(c.afiliasi || 'PERGURUAN TINGGI')}</h1>
    <h2>LAPORAN KINERJA DOSEN (BKD) — BIDANG PENELITIAN &amp; PUBLIKASI KARYA ILMIAH</h2>
    <p>Periode Evaluasi: <b>${esc(sem ? sem.toUpperCase() : 'SEMUA PERIODE SEMESTER')}</b> · Rubrik Standar PO PAK &amp; BKD Dikti</p>
  </div>

  <div class="meta-box">
    <div><b>Nama Dosen:</b> ${esc(c.nama || '—')}</div>
    <div><b>Jabatan Fungsional:</b> ${esc(c.jabatan_fungsional || 'Lektor')}</div>
    <div><b>NIDN / NIDK:</b> ${esc(c.nidn || '—')}</div>
    <div><b>Program Studi:</b> ${esc(c.prodi || '—')}</div>
    <div><b>NIP / NPK:</b> ${esc(c.nip || '—')}</div>
    <div><b>Fakultas / Unit:</b> ${esc(c.fakultas || c.afiliasi || '—')}</div>
  </div>

  <div class="sec-head">A. Pelaksanaan Publikasi Karya Ilmiah (Jurnal &amp; Prosiding)</div>
  <table>
    <thead>
      <tr>
        <th style="width:25px">No</th>
        <th>Judul Karya Ilmiah</th>
        <th>Jurnal Sasaran &amp; Kategori</th>
        <th style="width:90px">Peran Penulis</th>
        <th style="width:40px">Jml Pen</th>
        <th style="width:40px">KUM Maks</th>
        <th style="width:50px">Porsi (%)</th>
        <th style="width:50px">KUM Perolehan</th>
        <th style="width:45px">SKS BKD</th>
        <th>Bukti Fisik / Tautan Terbit</th>
      </tr>
    </thead>
    <tbody>
      ${pubRows || '<tr><td colspan="10" style="text-align:center;padding:16px;color:#64748B">Tidak ada data publikasi untuk periode ini</td></tr>'}
    </tbody>
    <tfoot>
      <tr class="tfoot-total">
        <td colspan="7" style="text-align:right">SUBTOTAL PUBLIKASI KARYA ILMIAH:</td>
        <td style="text-align:center;color:#1E3A8A">${totKum.toFixed(2)}</td>
        <td style="text-align:center;color:#047857">${totSksPub.toFixed(2)}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>

  ${incPen ? `
    <div class="sec-head">B. Kegiatan Penelitian Mandiri / Didanai (Laporan Riset)</div>
    <table>
      <thead>
        <tr>
          <th style="width:25px">No</th>
          <th>Judul Penelitian</th>
          <th>Bidang Ilmu</th>
          <th>Kolaborator / Tim</th>
          <th style="width:75px">Mulai</th>
          <th style="width:70px">Status</th>
          <th style="width:55px">SKS BKD</th>
          <th>Bukti Dokumen / Berkas</th>
        </tr>
      </thead>
      <tbody>
        ${penRows || '<tr><td colspan="8" style="text-align:center;padding:14px;color:#64748B">Tidak ada data penelitian untuk periode ini</td></tr>'}
      </tbody>
      <tfoot>
        <tr class="tfoot-total">
          <td colspan="6" style="text-align:right">SUBTOTAL KEGIATAN PENELITIAN:</td>
          <td style="text-align:center;color:#047857">${totSksPen.toFixed(2)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  ` : ''}

  <div class="rekap-card">
    <div>
      <span>TOTAL ANGKA KREDIT (KUM)</span>
      <b>${totKum.toFixed(2)} KUM</b>
    </div>
    <div>
      <span>TOTAL BEBAN KERJA SKS</span>
      <b style="color:#047857">${grandTotalSks.toFixed(2)} SKS</b>
    </div>
    <div>
      <span>KESIMPULAN EVALUASI BKD</span>
      <b style="color:${grandTotalSks >= 2 ? '#047857' : '#D97706'};font-size:13px">${grandTotalSks >= 2 ? 'MEMENUHI SYARAT MINIMAL' : 'PERLU TAMBAHAN BEBAN'}</b>
    </div>
  </div>

  <div class="sign-wrap">
    <div class="sign-date">Dicetak pada: ${todayStr}</div>
    <div class="sign-grid">
      <div class="sign-box">
        <div>Asesor I BKD,</div>
        <div style="height:50px"></div>
        <div>
          <div class="sign-name">${esc(c.nama_asesor_1 || '...................................................')}</div>
          <div>NIP/NIDN: .......................................</div>
        </div>
      </div>
      <div class="sign-box">
        <div>Asesor II BKD,</div>
        <div style="height:50px"></div>
        <div>
          <div class="sign-name">${esc(c.nama_asesor_2 || '...................................................')}</div>
          <div>NIP/NIDN: .......................................</div>
        </div>
      </div>
      <div class="sign-box">
        <div>Dosen yang Dinilai,</div>
        <div style="height:50px"></div>
        <div>
          <div class="sign-name">${esc(c.nama || '...................................................')}</div>
          <div>NIDN: ${esc(c.nidn || '.......................................')}</div>
        </div>
      </div>
    </div>

    <div class="sign-pimpinan">
      <div>Mengetahui,</div>
      <div>Dekan / Ketua Program Studi</div>
      <div style="height:50px"></div>
      <div class="sign-name">${esc(c.nama_pimpinan || '...........................................................................')}</div>
      <div>NIP: ..............................................................</div>
    </div>
  </div>
</body>
</html>`;

    win.document.write(html);
    win.document.close();
  }

  function exportBkdCsv(sem, stOpt, incPen) {
    const D = S.D; if (!D) return;
    const J = Object.fromEntries((D.Jurnal || []).map(j => [j.id, j]));

    let subs = D.Submission || [];
    if (sem) subs = subs.filter(s => (s.semester_bkd || '').toLowerCase() === sem.toLowerCase());
    if (stOpt === 'Published') subs = subs.filter(s => s.status === 'Published');
    else if (stOpt === 'Accepted+Published') subs = subs.filter(s => ['Published', 'Accepted'].includes(s.status));

    let pens = D.Penelitian || [];
    if (sem) pens = pens.filter(p => (p.semester_bkd || '').toLowerCase() === sem.toLowerCase());

    const headers = [
      'No', 'Semester BKD', 'Kategori', 'Judul Karya / Penelitian', 'Jurnal / Media',
      'Akreditasi', 'Peran Penulis', 'Total Penulis', 'KUM Maksimal', 'Porsi (%)',
      'KUM Diperoleh', 'SKS BKD', 'Status', 'Tahun', 'Tautan Bukti / DOI'
    ];

    const rows = [];
    subs.forEach((s, idx) => {
      const j = J[s.id_jurnal] || {};
      const k = hitungKumBkd(s, j);
      rows.push([
        idx + 1,
        s.semester_bkd || sem || '—',
        'Publikasi Ilmiah',
        s.judul || '',
        j.nama || '',
        k.labelKat,
        s.peran_penulis || 'Penulis Pertama',
        s.total_penulis || 1,
        k.kumMaks,
        k.porsiTxt,
        k.kumDidapat.toFixed(2),
        k.sks.toFixed(2),
        s.status || '',
        s.tahun_terbit || '',
        s.doi ? 'https://doi.org/' + s.doi : (s.link_final || '')
      ]);
    });

    if (incPen) {
      pens.forEach((p, idx) => {
        const sks = p.sks_bkd ? parseFloat(p.sks_bkd) : (p.status === 'Selesai' ? 3 : 2);
        rows.push([
          subs.length + idx + 1,
          p.semester_bkd || sem || '—',
          'Penelitian / Riset',
          p.judul || '',
          p.bidang || '',
          'Laporan Penelitian',
          p.kolaborator || 'Mandiri',
          1,
          '—',
          '—',
          '—',
          sks.toFixed(2),
          p.status || '',
          (p.tanggal_mulai || '').slice(0, 4),
          p.link_pdf || p.link_berkas || ''
        ]);
      });
    }

    if (!rows.length) return toast('Tidak ada data BKD yang sesuai filter untuk diekspor', true);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' }));
    a.download = `BKD-SIMPEN-${(sem || 'SEMUA').replace(/[\s\/]+/g, '_')}-${today()}.csv`;
    a.click();
    toast('File rekap BKD CSV berhasil diunduh');
  }

  function openMobileMenuModal() {
    const D = S.D;
    const nCfp = (D?.CFP || []).filter(cfpNear).length;
    openModal(`
      <div class="ov" style="align-items:flex-end">
        <div class="mod mobile-sheet" style="border-bottom-left-radius:0;border-bottom-right-radius:0;max-width:100%;width:100%;margin:0;padding:20px 18px 28px;animation:slideUp 0.25s ease-out">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--bd)">
            <b style="font-size:16px;color:#0F172A">Menu Lainnya &amp; Fitur Dosen</b>
            <button type="button" class="btn sm" data-a="mclose" style="border:none;background:transparent;font-size:18px">✕</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button type="button" class="btn" data-a="pdfBkd" style="justify-content:flex-start;padding:12px 14px;font-size:14px;background:#EFF6FF;color:#1E40AF;border-color:#BFDBFE">
              ${SVG.print} <span style="font-weight:700">Laporan BKD &amp; Rekapitulasi KUM</span>
            </button>
            <button type="button" class="btn ${S.page === 'cfp' ? 'pri' : ''}" data-a="navCloseModal" data-id="cfp" style="justify-content:space-between;padding:12px 14px;font-size:14px">
              <span style="display:flex;align-items:center;gap:10px">${SVG.cfp} <span>CFP &amp; Target Deadline</span></span>
              ${nCfp ? `<span class="cnt">${nCfp}</span>` : ''}
            </button>
            <button type="button" class="btn ${S.page === 'set' ? 'pri' : ''}" data-a="navCloseModal" data-id="set" style="justify-content:flex-start;padding:12px 14px;font-size:14px">
              <span style="display:flex;align-items:center;gap:10px">${SVG.set} <span>Pengaturan &amp; Profil Dosen</span></span>
            </button>
            <button type="button" class="btn" data-a="goPubCloseModal" style="justify-content:flex-start;padding:12px 14px;font-size:14px;color:var(--pri-tx)">
              <span style="display:flex;align-items:center;gap:10px">${SVG.ext} <span>Kunjungi Halaman Publik</span></span>
            </button>
            <div style="border-top:1px solid var(--bd);margin:8px 0 0;padding-top:8px">
              <button type="button" class="btn dng" data-a="logout" style="width:100%;justify-content:flex-start;padding:12px 14px;font-size:14px">
                <span style="display:flex;align-items:center;gap:10px">${SVG.logout} <span>Keluar dari Panel Admin</span></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `);
  }

  // ============ RENDER & EVENTS ============
  function draw() {
    const v = S.view === 'pub' ? viewPub() : S.view === 'login' ? viewLogin() : viewAdmin();
    const f = document.activeElement && document.activeElement.id, pos = document.activeElement && document.activeElement.selectionStart;
    $('#app').innerHTML = v;
    if (f && ['q', 'jq'].includes(f)) { const e = $('#' + f); if (e) { e.focus(); try { e.setSelectionRange(pos, pos); } catch (_) { } } }
  }

  async function loadPub() { const r = await API.get('getPublic'); if (r.success) S.P = r.data; else toast(r.message || 'Gagal memuat', true); draw(); }
  async function loadAdmin() { const r = await API.post('bootstrap'); if (!r.success) { API.setTok(null); S.view = 'login'; toast(r.message || 'Sesi berakhir', true); } else S.D = r.data; draw(); }

  document.addEventListener('click', async e => {
    const t = e.target.closest('[data-a]'); if (!t || t.tagName === 'SELECT') return;
    const a = t.dataset.a, id = t.dataset.id, ent = t.dataset.e;
    if (a === 'goLogin') { S.view = 'login'; draw(); }
    else if (a === 'goPub') { e.preventDefault(); S.view = 'pub'; draw(); }
    else if (a === 'tab') { S.tab = id; S.q = ''; S.f = { kampus: '', akr: '', biaya: '', rumpun: '' }; S.pubJurPage = 1; draw(); }
    else if (a === 'nav') { e.preventDefault(); S.page = id; sessionStorage.setItem('sp_admin_page', id); S.q = ''; S.adminJurPage = 1; draw(); }
    else if (a === 'subv') { S.subv = id; draw(); }
    else if (a === 'jview') { S.jview = id; draw(); }
    else if (a === 'resetf') { S.f = { kampus: '', akr: '', biaya: '', rumpun: '' }; S.q = ''; S.pubJurPage = 1; draw(); }
    else if (a === 'pubPage') {
      const p = Number(t.dataset.page);
      if (p && p !== S.pubJurPage) {
        S.pubJurPage = p;
        draw();
        const el = document.getElementById('katalog-top') || document.querySelector('.jgrid, .jlist');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    else if (a === 'adminPage') {
      const p = Number(t.dataset.page);
      if (p && p !== S.adminJurPage) {
        S.adminJurPage = p;
        draw();
        const el = document.getElementById('admin-jur-top');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    else if (a === 'logout') { API.post('logout'); API.setTok(null); sessionStorage.removeItem('sp_admin_page'); S.view = 'pub'; S.D = null; loadPub(); }
    else if (a === 'mclose') closeModal();
    else if (a === 'jdetail') {
      const j = (S.P?.jurnal || S.D?.Jurnal || []).find(x => String(x.id) === String(id) || x.nama === id);
      if (j) openJournalDetail(j);
    }
    else if (a === 'add') openForm(ent, ent === 'Submission' ? { status: 'Draft', tgl_cek: today(), tampil_publik: true } : { tampil_publik: true });
    else if (a === 'edit') openForm(ent, S.D[ent].find(x => x.id === id));
    else if (a === 'del') { if (confirm('Hapus data ini? Tindakan tidak dapat dibatalkan.')) remove(ent, id); }
    else if (a === 'delOld') { const o = S.D.CFP.filter(c => dayDiff(c.deadline) < 0); if (confirm(`Hapus ${o.length} CFP yang sudah lewat?`)) for (const c of o) await remove('CFP', c.id); }
    else if (a === 'cek') { const s = S.D.Submission.find(x => x.id === id); upsert('Submission', { ...s, tgl_cek: today() }); toast('Ditandai sudah dicek'); }
    else if (a === 'cfp2sub') { const c = S.D.CFP.find(x => x.id === id); S.page = 'sub'; sessionStorage.setItem('sp_admin_page', 'sub'); openForm('Submission', { status: 'Draft', id_jurnal: c.id_jurnal, tgl_cek: today() }); }
    else if (a === 'csv') csv(ent);
    else if (a === 'pdfBkd') openBkdModal();
    else if (a === 'doBkdPrint') {
      const sem = $('#bkd_sem')?.value || '';
      const st = $('#bkd_status')?.value || 'Published';
      const inc = $('#bkd_inc_pen')?.checked ?? true;
      printBkdReport(sem, st, inc);
    }
    else if (a === 'doBkdCsv') {
      const sem = $('#bkd_sem')?.value || '';
      const st = $('#bkd_status')?.value || 'Published';
      const inc = $('#bkd_inc_pen')?.checked ?? true;
      exportBkdCsv(sem, st, inc);
    }
    else if (a === 'mobileMenu') openMobileMenuModal();
    else if (a === 'navCloseModal') {
      closeModal();
      S.page = id;
      sessionStorage.setItem('sp_admin_page', id);
      draw();
    }
    else if (a === 'goPubCloseModal') {
      closeModal();
      S.view = 'pub';
      draw();
    }
    else if (a === 'hist') {
      const h = (S.D.StatusLog || []).filter(x => x.id_submission === id);
      openModal(`
        <div class="ov">
          <div class="mod">
            <h2>Riwayat Perubahan Status</h2>
            <p class="mu" style="font-size:13px;margin-bottom:16px">Jejak audit alur proses naskah artikel ilmiah.</p>
            ${h.map(x => `
              <div class="row">
                <span>${badge(x.status_lama)} → ${badge(x.status_baru)}</span>
                <span class="mono">${esc(x.waktu)}</span>
              </div>
            `).join('') || '<p class="mu" style="text-align:center;padding:24px">Belum ada riwayat perubahan status.</p>'}
            <div class="act">
              <button class="btn" data-a="mclose">Tutup</button>
            </div>
          </div>
        </div>
      `);
    }
    else if (a === 'thumb') {
      const u = $('#mf [name=link]').value; if (!u) return toast('Isi tautan jurnal dulu', true);
      t.textContent = 'Mengambil…';
      const r = await API.post('thumb', { url: u });
      t.textContent = '🔍 Ambil Thumbnail Otomatis';
      if (r.success) { $('#mf [name=thumbnail]').value = r.thumbnail; toast('Thumbnail berhasil diambil'); } else toast(r.message || 'Thumbnail tidak ditemukan', true);
    }
    else if (a === 'testwa') {
      const r = await API.post('testwa');
      toast(r.message || (r.success ? 'Pesan uji terkirim' : 'Gagal mengirim pesan uji'), !r.success);
      if (r.success) await loadAdmin();
    }
    else if (a === 'togglePwd') {
      const cell = t.closest('.pwd-cell');
      if (cell) {
        const txt = cell.querySelector('.pwd-text');
        const val = txt.dataset.val || '';
        const isMasked = txt.textContent.includes('•');
        if (isMasked) {
          txt.textContent = val;
          txt.style.letterSpacing = 'normal';
          t.innerHTML = SVG.eyeOff;
          t.title = 'Sembunyikan Password';
        } else {
          txt.textContent = '••••••';
          txt.style.letterSpacing = '1px';
          t.innerHTML = SVG.eye;
          t.title = 'Lihat Password';
        }
      }
    }
    else if (a === 'copyPwd') {
      const pwd = t.dataset.pwd || '';
      if (pwd) {
        navigator.clipboard.writeText(pwd).then(() => {
          toast('Password berhasil disalin');
        }).catch(() => {
          toast('Gagal menyalin', true);
        });
      }
    }
  });

  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset && t.dataset.a === 'chg') {
      const s = S.D.Submission.find(x => x.id === t.dataset.id);
      upsert('Submission', { ...s, status: t.value, tgl_cek: today() });
      toast('Status naskah diubah: ' + t.value);
    }
    else if (t.id && t.id.startsWith('f_')) { S.f[t.id.slice(2)] = t.value; S.pubJurPage = 1; draw(); }
    else if (t.id === 'yr') { S.yr = t.value; draw(); }
    else if (t.id === 'jb') { S.jbiaya = t.value; S.adminJurPage = 1; draw(); }
    else if (t.id === 'oc') { S.onlyCheck = t.checked; draw(); }
    else if (t.id === 'pub_perpage') { S.pubJurPerPage = Number(t.value) || 12; S.pubJurPage = 1; draw(); }
    else if (t.id === 'admin_perpage') { S.adminJurPerPage = Number(t.value) || 10; S.adminJurPage = 1; draw(); }
    else if (t.id && ['bkd_sem', 'bkd_status', 'bkd_inc_pen'].includes(t.id)) {
      updateBkdModalPreview();
    }
    else if (t.name === 'nama' && t.form && t.form.id === 'mf' && t.form.dataset.e === 'Jurnal') {
      checkJournalDuplicateLive(t);
    }
    else if (t.form && t.form.id === 'mf' && t.form.dataset.e === 'Submission' && ['id_jurnal', 'peran_penulis', 'total_penulis'].includes(t.name)) {
      updateSubmissionKumInForm();
    }
  });

  let tm;
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'q' || t.id === 'jq') {
      clearTimeout(tm);
      tm = setTimeout(() => {
        if (t.id === 'q') {
          S.q = t.value;
          S.pubJurPage = 1;
        } else {
          S.jq = t.value;
          S.adminJurPage = 1;
        }
        draw();
      }, 200);
    } else if (t.name === 'nama' && t.form && t.form.id === 'mf' && t.form.dataset.e === 'Jurnal') {
      checkJournalDuplicateLive(t);
    } else if (t.form && t.form.id === 'mf' && t.form.dataset.e === 'Submission' && ['id_jurnal', 'peran_penulis', 'total_penulis'].includes(t.name)) {
      updateSubmissionKumInForm();
    }
  });

  // Drag and Drop Kanban Board
  let draggedSubId = null;
  document.addEventListener('dragstart', e => {
    const card = e.target.closest('[data-drag-id]');
    if (!card) return;
    draggedSubId = card.dataset.dragId;
    card.classList.add('dragging');
    e.dataTransfer.setData('text/plain', draggedSubId);
    e.dataTransfer.effectAllowed = 'move';
  });

  document.addEventListener('dragend', e => {
    const card = e.target.closest('[data-drag-id]');
    if (card) card.classList.remove('dragging');
    document.querySelectorAll('.kanban-col.drag-over').forEach(c => c.classList.remove('drag-over'));
    draggedSubId = null;
  });

  document.addEventListener('dragover', e => {
    const col = e.target.closest('[data-drop-status]');
    if (!col || !draggedSubId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    col.classList.add('drag-over');
  });

  document.addEventListener('dragleave', e => {
    const col = e.target.closest('[data-drop-status]');
    if (col && !col.contains(e.relatedTarget)) col.classList.remove('drag-over');
  });

  document.addEventListener('drop', e => {
    const col = e.target.closest('[data-drop-status]');
    if (!col || !draggedSubId) return;
    e.preventDefault();
    col.classList.remove('drag-over');
    const newStatus = col.dataset.dropStatus;
    const sub = (S.D?.Submission || []).find(x => x.id === draggedSubId);
    if (sub && sub.status !== newStatus) {
      upsert('Submission', { ...sub, status: newStatus, tgl_cek: today() });
      toast('Status naskah diperbarui ke: ' + newStatus);
    }
    draggedSubId = null;
  });

  document.addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target;
    if (f.id === 'lf') {
      const b = f.querySelector('button'); b.disabled = true; b.textContent = 'Memeriksa kredensial…';
      const r = await API.post('login', { password: $('#pw').value });
      if (r.success) {
        API.setTok(r.token); S.view = 'admin'; S.page = initialAdminPage; S.D = null; draw(); loadAdmin();
      } else {
        b.disabled = false; b.textContent = 'Masuk ke Panel Pengelola';
        const le = $('#le'); le.style.display = 'block'; le.textContent = r.message || 'Gagal masuk.';
      }
    }
    else if (f.id === 'mf') {
      const ent = f.dataset.e, old = f.dataset.id ? S.D[ent].find(x => x.id === f.dataset.id) : {}, rec = { ...old, id: f.dataset.id || uid() };
      FIELDS[ent].forEach(fl => { const el = f.elements[fl[0]]; rec[fl[0]] = fl[2] === 'check' ? el.checked : el.value.trim(); });
      if (ent === 'Jurnal') {
        if (!rec.nama) {
          toast('Nama jurnal wajib diisi', true);
          const nameInput = f.querySelector('[name=nama]');
          if (nameInput) nameInput.focus();
          return;
        }
        const dup = findDuplicateJournal(rec.nama, f.dataset.id);
        if (dup) {
          toast(`Ditolak: Jurnal "${dup.nama}" sudah ada di database!`, true);
          const nameInput = f.querySelector('[name=nama]');
          if (nameInput) {
            nameInput.focus();
            nameInput.style.borderColor = '#EF4444';
          }
          const notice = $('#jurnal-dup-notice');
          if (notice) {
            notice.style.display = 'block';
            notice.style.background = '#FEF2F2';
            notice.style.border = '1px solid #FCA5A5';
            notice.style.color = '#991B1B';
            notice.innerHTML = `⛔ <b>Data Duplikat Ditolak:</b> Jurnal "<b>${esc(dup.nama)}</b>" (${esc(akr(dup))}, ${esc(dup.penerbit || 'Penerbit')}) sudah ada di database. Sistem menolak penambahan data duplikat ini.`;
          }
          return;
        }
        if (rec.tipe_biaya === 'Gratis') rec.apc = '';
      }
      closeModal(); await upsert(ent, rec); toast('Data berhasil disimpan');
    }
    else if (f.id === 'sf') {
      const o = Object.fromEntries(new FormData(f)); const cur = (S.D.Pengaturan || [])[0] || { id: 'cfg' };
      await upsert('Pengaturan', { ...cur, ...o, id: 'cfg' }); toast('Pengaturan berhasil diperbarui');
    }
  });

  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.dataset && e.target.dataset.a === 'jdetail') {
      e.preventDefault();
      const j = (S.P?.jurnal || S.D?.Jurnal || []).find(x => String(x.id) === String(e.target.dataset.id) || x.nama === e.target.dataset.id);
      if (j) openJournalDetail(j);
    }
  });

  // ============ INIT ============
  (async () => {
    if (API.tok()) { S.view = 'admin'; S.page = initialAdminPage; draw(); loadAdmin(); }
    else { draw(); }
    loadPub();
  })();
})();
