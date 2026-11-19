// SIMPEN: Logika UI & Interaksi (Vanilla JS, SPA Modern).
// Navigasi instan, Optimistic UI, Pencarian lokal, & Design System Akademik Profesional.
(() => {
  const $ = s => document.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const today = () => new Date().toISOString().slice(0, 10);
  const dayDiff = d => d ? Math.ceil((new Date(d + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 864e5) : null;
  const fmt = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
  const nowLogWaktu = () => {
    const d = new Date(), pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const fmtLogWaktu = (raw, list) => {
    const s = String(raw || '').trim();
    if (!s) return '-';
    const pad = v => String(v).padStart(2, '0');
    let fallbackTime = '';
    if (Array.isArray(list)) {
      for (let i = 0; i < list.length; i++) {
        const tm = String(list[i]?.waktu || '').match(/(?:[,\sT]+)(\d{1,2})[:.](\d{2})/);
        if (tm) { fallbackTime = `${pad(tm[1])}:${tm[2]}`; break; }
      }
    }
    if (!fallbackTime) fallbackTime = (S.D?.Pengaturan?.[0]?.jam) || '08:00';

    const mSlash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[,\sT]+(\d{1,2})[:.](\d{2})(?:[:.]\d{2})?)?$/);
    if (mSlash) {
      const dd = pad(mSlash[1]), mm = pad(mSlash[2]), yyyy = mSlash[3];
      const hm = (mSlash[4] !== undefined && mSlash[5] !== undefined) ? `${pad(mSlash[4])}:${mSlash[5]}` : fallbackTime;
      return `${dd}/${mm}/${yyyy} ${hm}`;
    }

    const mDash = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[,\sT]+(\d{1,2})[:.](\d{2})(?:[:.]\d{2})?)?/);
    if (mDash) {
      const yyyy = mDash[1], a = Number(mDash[2]), b = Number(mDash[3]);
      const hasExplicitTime = mDash[4] !== undefined && mDash[5] !== undefined;
      const hm = hasExplicitTime ? `${pad(mDash[4])}:${mDash[5]}` : fallbackTime;
      let dd, mm;
      if (a > 12) {
        dd = pad(a); mm = pad(b);
      } else if (b > 12) {
        dd = pad(b); mm = pad(a);
      } else if (!hasExplicitTime) {
        dd = pad(a); mm = pad(b);
      } else {
        dd = pad(b); mm = pad(a);
      }
      return `${dd}/${mm}/${yyyy} ${hm}`;
    }

    return s;
  };
  
  const STAT = ['Draft', 'Submitted', 'Under Review', 'Revision Requested', 'Resubmitted', 'Accepted', 'Published', 'Rejected', 'Withdrawn'];
  const STC = { Draft: 'sl', Submitted: 'bl', 'Under Review': 'bl', 'Revision Requested': 'am', Resubmitted: 'am', Accepted: 'gr', Published: 'gr', Rejected: 'rs', Withdrawn: 'rs' };
  const PROSES = ['Submitted', 'Under Review', 'Revision Requested', 'Resubmitted', 'Accepted'];
  const STAGE = { Submitted: 2, 'Under Review': 3, 'Revision Requested': 4, Resubmitted: 4, Accepted: 5 };
  const STEPS = ['Drafting', 'Submitted', 'Under Review', 'Revision', 'Accepted', 'Published'];

  // Ikon SVG Vektor Ringan (semua menyertakan aria-hidden="true" sesuai R-39)
  const SVG = {
    search: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
    plus: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    ext: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>',
    check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    edit: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
    trash: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
    book: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
    file: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
    folder: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
    dash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>',
    pen: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>',
    jur: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
    sub: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>',
    cfp: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    set: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
    print: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>',
    logout: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
    user: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    alert: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    calendar: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    clock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    download: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
    bld: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V5l7-2 7 2v16M9 9h2M13 9h2M9 13h2M13 13h2M10 21v-4h4v4"/></svg>',
    logo: '<svg width="24" height="24" viewBox="0 0 64 64" fill="none" aria-hidden="true"><polygon points="32,14 54,23 32,32 10,23" fill="#FFFFFF"/><path d="M19,27.2 L19,37 C19,41.5 24.5,44.5 32,44.5 C39.5,44.5 45,41.5 45,37 L45,27.2 L32,32.8 Z" fill="#CBD5E1"/><path d="M49,25 L52,36 L50.5,45 L48.5,45 L50,36 Z" fill="#F59E0B"/><circle cx="51.5" cy="26" r="2" fill="#F59E0B"/><path d="M16,48 C24,44 30,46 32,49 C34,46 40,44 48,48 L48,51 C40,47 34,49 32,52 C30,49 24,47 16,51 Z" fill="#93C5FD"/></svg>',
    eye: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    eyeOff: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>',
    copy: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
    key: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>',
    info: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    grid: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
    list: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
    reset: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>',
    chart: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
    upload: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',
    mail: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
    quote: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>'
  };

  // Cache Store & SWR Helpers (gas-instant-ux-pro)
  const LS_PREFIX = 'sp:v3:';
  const Store = {
    get(k, d = null) {
      try { const v = localStorage.getItem(LS_PREFIX + k); return v ? JSON.parse(v) : d; } catch (_) { return d; }
    },
    set(k, v) {
      try { localStorage.setItem(LS_PREFIX + k, JSON.stringify(v)); } catch (_) {}
    },
    del(k) {
      try { localStorage.removeItem(LS_PREFIX + k); } catch (_) {}
    }
  };
  const hashData = d => {
    const s = JSON.stringify(d || '');
    let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h + ':' + s.length;
  };

  const badge = s => `<span class="bd ${STC[s] || 'sl'}">${esc(s)}</span>`;
  const initialAdminPage = (() => {
    const p = sessionStorage.getItem('sp_admin_page');
    return ['dash', 'pen', 'jur', 'sub', 'cfp', 'set'].includes(p) ? p : 'dash';
  })();
  const S = { view: 'pub', tab: 'pub', page: initialAdminPage, P: null, D: null, pubErr: '', q: '', yr: '', jq: '', jbiaya: '', penRumpun: '', subFilter: 'all', onlyCheck: false, f: { kampus: '', akr: '', biaya: '', rumpun: '' }, jview: 'grid', pubJurPage: 1, pubJurPerPage: 12, adminJurPage: 1, adminJurPerPage: 10 };
  const ENT_LABEL = { Penelitian: 'Proyek Riset', Jurnal: 'Jurnal Sasaran', Submission: 'Artikel & Publikasi', CFP: 'Call for Papers (CFP)' };

  function buildSemesterList() {
    const now = new Date();
    const curY = now.getFullYear();
    const list = [];
    for (let y = curY + 1; y >= curY - 4; y--) {
      list.push(`${y - 1}/${y} Genap`);
      list.push(`${y - 1}/${y} Ganjil`);
    }
    const existing = [
      ...(S.D?.Submission || []).map(x => x.semester_bkd),
      ...(S.D?.Penelitian || []).map(x => x.semester_bkd)
    ].filter(Boolean);
    existing.forEach(s => { if (!list.includes(s)) list.push(s); });
    return list;
  }
  const getSemOptions = () => [['', '- Pilih Semester BKD -'], ...buildSemesterList().map(s => [s, s])];
  const currentSemester = () => {
    const now = new Date(), y = now.getFullYear(), m = now.getMonth() + 1;
    if (m >= 2 && m <= 7) return `${y - 1}/${y} Genap`;
    if (m >= 8) return `${y}/${y + 1} Ganjil`;
    return `${y - 1}/${y} Ganjil`;
  };

  const PERAN_PENULIS = [
    ['Penulis Pertama & Korespondensi', 'Penulis Pertama & Korespondensi (Porsi 60%)'],
    ['Penulis Tunggal', 'Penulis Tunggal (Porsi 100%)'],
    ['Penulis Pertama', 'Penulis Pertama (Porsi 50% / 60%)'],
    ['Penulis Korespondensi', 'Penulis Korespondensi (Porsi 40%)'],
    ['Penulis Anggota', 'Penulis Anggota (Porsi 40% dibagi anggota)']
  ];

  const PENELITI_UTAMA = 'Ahmad Fajri Fadhili, S.Hum., M.Pd';
  const RUMPUN_PAKAR = [
    {
      no: 1,
      nama: 'Ilmu Linguistik',
      intiFajri: true,
      materi: 'Ilmu linguistik umum, psikolinguistik dan sosiolinguistik',
      topik: ['Ilmu Linguistik Umum', 'Psikolinguistik', 'Sosiolinguistik'],
      pakarUtama: ['Dr. Abdul Kirom, M.Pd.', 'Bidari, M.Pd.'],
      kolaborator: ['Dr. Abdul Kirom, M.Pd.', 'Bidari, M.Pd.', 'Luthfatul Qibtiyah, S.Hum., M.Pd.I.']
    },
    {
      no: 2,
      nama: "Bahasa Arab 'Ammiyah, Ilmu Dilalah dan Manajemen Pariwisata, Umroh & Haji",
      intiFajri: true,
      materi: "Bahasa Arab 'ammiyah dan muhadatsah pariwisata dan manajemen pariwisata, umroh dan haji. Arabiyah lil Aghradl Al-Khasshah dan Ilmu Al-Dilalah wal Ma'ajim",
      topik: ["Bahasa Arab 'Ammiyah", 'Muhadatsah & Manajemen Pariwisata, Umroh & Haji', 'Arabiyah lil Aghradl Al-Khasshah', "Ilmu Al-Dilalah wal Ma'ajim"],
      pakarUtama: ['H. Saiful Anam, Lc., M.Pd.I.', 'Dr. Yusfar Ramadhan, S.Hum., M.Pd.I.'],
      kolaborator: ['H. Saiful Anam, Lc., M.Pd.I.', 'Dr. Yusfar Ramadhan, S.Hum., M.Pd.I.', 'Dewi Nurhayati, S.S., M.Pd.']
    },
    {
      no: 3,
      nama: 'Manajemen, Metode dan Strategi Pembelajaran Bahasa Arab',
      intiFajri: true,
      materi: 'Perencanaan pembelajaran, evaluasi pembelajaran, pengembangan bahan ajar BA, psikologi belajar BA, metodologi & strategi pembelajaran BA',
      topik: ['Perencanaan Pembelajaran BA', 'Evaluasi Pembelajaran BA', 'Pengembangan Bahan Ajar BA', 'Psikologi Belajar BA', 'Metodologi & Strategi Pembelajaran BA'],
      pakarUtama: ['Ainul Yakin, M.Pd.I.', 'Dr. Izzat Amini, M.Pd.'],
      kolaborator: ['Ainul Yakin, M.Pd.I.', 'Dr. Izzat Amini, M.Pd.', 'Uswatun Hasanah, M.A.', 'Dr. Yusfar Ramadhan, S.Hum., M.Pd.I.']
    },
    {
      no: 4,
      nama: 'Rumpun Sintaksis, Morfologi dan Fonologi dan Semantik',
      intiFajri: false,
      materi: "Muthala'ah, Nahwu, Shorrof, Balaghah, tarjamah",
      topik: ["Muthala'ah", 'Nahwu', 'Shorrof', 'Balaghah', 'Tarjamah'],
      pakarUtama: ['Bastami, M.Pd.', 'Uswatun Hasanah, M.A.'],
      kolaborator: ['Bastami, M.Pd.', 'Uswatun Hasanah, M.A.', 'Dr. Umar Bukhory, M.Ag.', 'Bidari, M.Pd.']
    },
    {
      no: 5,
      nama: 'Keterampilan Bahasa',
      intiFajri: true,
      materi: "Maharah Istima', maharah kalam, maharah qira'ah dan maharah kitabah",
      topik: ["Maharah Istima'", 'Maharah Kalam', "Maharah Qira'ah", 'Maharah Kitabah'],
      pakarUtama: ['Dr. Yusfar Ramadhan, S.Hum., M.Pd.I.', 'Dr. Abdul Kirom, M.Pd.'],
      kolaborator: ['Dr. Yusfar Ramadhan, S.Hum., M.Pd.I.', 'Dr. Abdul Kirom, M.Pd.', 'Dewi Nurhayati, S.S., M.Pd.', 'H. Saiful Anam, Lc., M.Pd.I.']
    }
  ];
  const ALL_KOLAB_PAKAR = [...new Set(RUMPUN_PAKAR.flatMap(r => r.kolaborator))];

  function findRumpunByBidang(val) {
    const s = String(val || '').trim().toLowerCase();
    if (!s) return null;
    return RUMPUN_PAKAR.find(r => {
      const rName = r.nama.toLowerCase();
      if (s === rName || s.startsWith(rName) || rName.includes(s)) return true;
      return r.topik.some(t => s.includes(t.toLowerCase()));
    }) || null;
  }

  function parseKolabList(raw) {
    return String(raw || '')
      .split(/[;\n]+/)
      .map(x => x.trim())
      .filter(x => x && !/^mandiri$/i.test(x));
  }

  const cfg = () => Object.assign({
    nama: '', afiliasi: '', wa: '', foto: '', link_sinta: '', link_scholar: '', link_scopus: '',
    ambang_cek: 14, ambang_cfp: '7,3,0', jam: '08:00',
    nidn: '', nip: '', jabatan_fungsional: 'Lektor', prodi: '', fakultas: '',
    nama_asesor_1: '', nama_asesor_2: '', nama_pimpinan: '',
    wa_master: true, notif_revisi: true, notif_cfp: true, notif_cek: true, notif_accepted: true, notif_status: false,
    notif_mingguan: false, app_url: ''
  }, (S.D && S.D.Pengaturan && S.D.Pengaturan[0]) || {});
  const jname = id => ((S.D?.Jurnal || []).find(j => j.id === id) || {}).nama || '-';
  const pname = id => ((S.D?.Penelitian || []).find(p => p.id === id) || {}).judul || '';
  const perluCek = s => PROSES.includes(s.status) && s.tgl_cek && -dayDiff(s.tgl_cek) > Number(cfg().ambang_cek);
  const cfpNear = c => c.status !== 'Sudah Submit' && c.status !== 'Ditutup' && dayDiff(c.deadline) >= 0 && dayDiff(c.deadline) <= 7;

  // Modal hidup di wadah #modal sendiri
  const openModal = html => { $('#modal').innerHTML = html; const f = $('#modal input,#modal textarea,#modal select,#modal button'); if (f) f.focus(); };
  const closeModal = () => { $('#modal').innerHTML = ''; };

  // ---- Katalog jurnal: akreditasi, kampus, biaya ----
  const AKR = ['Scopus / WoS', 'Sinta 1', 'Sinta 2', 'Sinta 3', 'Sinta 4', 'Sinta 5', 'Sinta 6', 'Non-Sinta'];
  const KAMPUS = ['PTN', 'PTS', 'Lainnya'];
  const akr = j => {
    const raw = String((j && (j.akreditasi || j.indeks)) || '');
    if (/\b(scopus|wos|web of science|internasional bereputasi)\b/i.test(raw)) return 'Scopus / WoS';
    const m = raw.match(/sinta\s*([1-6])\b/i);
    return m ? 'Sinta ' + m[1] : 'Non-Sinta';
  };
  const AKC = { 'Scopus / WoS': 'scopus', 'Sinta 1': 'am', 'Sinta 2': 'bl', 'Sinta 3': 'ix', 'Sinta 4': 'gr', 'Sinta 5': 'sl', 'Sinta 6': 'sl', 'Non-Sinta': 'sl' };
  const akrBadge = j => {
    const a = akr(j);
    if (a === 'Scopus / WoS') return `<span class="bd scopus">SCOPUS / WOS</span>`;
    if (a === 'Sinta 1') return `<span class="bd sinta1">SINTA 1</span>`;
    return `<span class="bd ${AKC[a] || 'sl'}" style="text-transform:uppercase;font-size:11px">${a}</span>`;
  };

  // Kalkulasi Angka Kredit (KUM) & Beban SKS BKD (berdasarkan field akreditasi resmi, bukan catatan bebas)
  const hitungKumBkd = (s, j) => {
    const akreditasi = akr(j);
    let kumMaks = 10;
    let labelKat = 'Jurnal Nasional';

    if (akreditasi === 'Scopus / WoS') {
      kumMaks = 40; labelKat = 'Jurnal Internasional Bereputasi';
    } else if (/sinta\s*1\b/i.test(akreditasi)) { kumMaks = 25; labelKat = 'Jurnal Nasional Terakreditasi SINTA 1'; }
    else if (/sinta\s*2\b/i.test(akreditasi)) { kumMaks = 25; labelKat = 'Jurnal Nasional Terakreditasi SINTA 2'; }
    else if (/sinta\s*3\b/i.test(akreditasi)) { kumMaks = 20; labelKat = 'Jurnal Nasional Terakreditasi SINTA 3'; }
    else if (/sinta\s*4\b/i.test(akreditasi)) { kumMaks = 20; labelKat = 'Jurnal Nasional Terakreditasi SINTA 4'; }
    else if (/sinta\s*5\b/i.test(akreditasi)) { kumMaks = 15; labelKat = 'Jurnal Nasional Terakreditasi SINTA 5'; }
    else if (/sinta\s*6\b/i.test(akreditasi)) { kumMaks = 15; labelKat = 'Jurnal Nasional Terakreditasi SINTA 6'; }
    else if (/internasional/i.test((j?.nama || ''))) {
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
      notice.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;vertical-align:middle">${SVG.alert} <b>Data Sudah Ada di Database:</b></span> Jurnal "<b>${esc(dup.nama)}</b>" (${esc(akr(dup))}, ${esc(dup.penerbit || 'Penerbit')}) sudah pernah diinput. Sistem akan menolak penambahan data duplikat ini.`;
      return;
    }
    
    const sim = findSimilarJournal(val, curId);
    if (sim) {
      inputEl.style.borderColor = '#F59E0B';
      notice.style.display = 'block';
      notice.style.background = '#FFFBEB';
      notice.style.border = '1px solid #FCD34D';
      notice.style.color = '#92400E';
      notice.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;vertical-align:middle">${SVG.info} <b>Peringatan Kemiripan:</b></span> Ditemukan jurnal dengan nama serupa di database: "<b>${esc(sim.nama)}</b>" (${esc(akr(sim))}, ${esc(sim.penerbit || 'Penerbit')}). Mohon pastikan bukan jurnal yang sama.`;
      return;
    }
    
    notice.style.display = 'none';
    inputEl.style.borderColor = '';
  }

  function findSimilarSubmission(judul, curId) {
    const targetClean = normCleanJournalName(judul);
    if (targetClean.length < 8) return null;
    const list = S.D?.Submission || [];
    return list.find(s => {
      if (curId && String(s.id) === String(curId)) return false;
      const sClean = normCleanJournalName(s.judul);
      if (!sClean) return false;
      return sClean === targetClean || (sClean.length >= 10 && (sClean.includes(targetClean) || targetClean.includes(sClean)));
    }) || null;
  }

  function checkSubmissionDuplicateLive(inputEl) {
    const f = inputEl.form;
    if (!f || f.dataset.e !== 'Submission') return;
    const curId = f.dataset.id || '';
    const val = inputEl.value.trim();
    const notice = $('#sub-dup-notice');
    if (!notice) return;
    if (!val) {
      notice.style.display = 'none';
      inputEl.style.borderColor = '';
      return;
    }
    const sim = findSimilarSubmission(val, curId);
    if (sim) {
      inputEl.style.borderColor = '#F59E0B';
      notice.style.display = 'block';
      notice.style.background = '#FFFBEB';
      notice.style.border = '1px solid #FCD34D';
      notice.style.color = '#92400E';
      notice.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;vertical-align:middle">${SVG.info} <b>Catatan Kemiripan Judul:</b></span> Naskah serupa sudah tercatat di <b>${esc(jname(sim.id_jurnal))}</b> (Status: <b>${esc(sim.status)}</b>). Pastikan ini bukan duplikasi entri yang tidak disengaja.`;
      return;
    }
    notice.style.display = 'none';
    inputEl.style.borderColor = '';
  }

  function applyStatusAutoFields(rec, oldStatus) {
    const next = { ...rec };
    if (next.status === 'Submitted' && !next.tgl_submit) {
      next.tgl_submit = today();
    }
    if (next.status === 'Published' && !next.tahun_terbit) {
      next.tahun_terbit = String(new Date().getFullYear());
    }
    if (oldStatus !== next.status && !next.tgl_cek) {
      next.tgl_cek = today();
    }
    return next;
  }

  function parseBibtex(raw) {
    const text = String(raw || '');
    const entries = [];
    let idx = 0;
    while (idx < text.length) {
      const at = text.indexOf('@', idx);
      if (at < 0) break;
      const braceStart = text.indexOf('{', at);
      if (braceStart < 0) break;
      const type = text.slice(at + 1, braceStart).trim().toLowerCase();
      let depth = 0, end = braceStart;
      for (let i = braceStart; i < text.length; i++) {
        if (text[i] === '{') depth++;
        else if (text[i] === '}') {
          depth--;
          if (depth === 0) { end = i; break; }
        }
      }
      if (depth !== 0) break;
      idx = end + 1;
      if (type === 'comment' || type === 'preamble' || type === 'string') continue;

      const body = text.slice(braceStart + 1, end);
      const comma = body.indexOf(',');
      if (comma < 0) continue;
      const fieldsStr = body.slice(comma + 1);
      const fields = {};
      let p = 0;
      while (p < fieldsStr.length) {
        while (p < fieldsStr.length && /[\s,]/.test(fieldsStr[p])) p++;
        if (p >= fieldsStr.length) break;
        const eq = fieldsStr.indexOf('=', p);
        if (eq < 0) break;
        const key = fieldsStr.slice(p, eq).trim().toLowerCase();
        p = eq + 1;
        while (p < fieldsStr.length && /\s/.test(fieldsStr[p])) p++;
        if (p >= fieldsStr.length) break;

        let val = '';
        if (fieldsStr[p] === '{') {
          let d = 0, s = p + 1;
          while (p < fieldsStr.length) {
            if (fieldsStr[p] === '{') d++;
            else if (fieldsStr[p] === '}') {
              d--;
              if (d === 0) { val = fieldsStr.slice(s, p); p++; break; }
            }
            p++;
          }
        } else if (fieldsStr[p] === '"') {
          let s = p + 1; p++;
          while (p < fieldsStr.length && (fieldsStr[p] !== '"' || fieldsStr[p - 1] === '\\')) p++;
          val = fieldsStr.slice(s, p);
          p++;
        } else {
          let s = p;
          while (p < fieldsStr.length && fieldsStr[p] !== ',') p++;
          val = fieldsStr.slice(s, p);
        }
        fields[key] = val.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
      }
      if (fields.title) {
        entries.push({
          title: fields.title,
          journal: fields.journal || fields.booktitle || fields.publisher || '',
          year: (fields.year || '').replace(/[^0-9]/g, '').slice(0, 4),
          doi: fields.doi || '',
          url: fields.url || '',
          author: fields.author || ''
        });
      }
    }
    return entries;
  }

  function formatAuthorApa(name) {
    const cleanName = String(name || 'Dosen').split(',')[0].trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return cleanName;
    const last = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map(w => w[0].toUpperCase() + '.').join(' ');
    return `${last}, ${initials}`;
  }

  function formatAuthorIeee(name) {
    const cleanName = String(name || 'Dosen').split(',')[0].trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return cleanName;
    const last = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map(w => w[0].toUpperCase() + '.').join(' ');
    return `${initials} ${last}`;
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
  const toPreviewEmbedUrl = url => {
    const u = String(url || '').trim();
    if (!u || /\/drive\/(?:u\/\d+\/)?folders\//i.test(u)) return '';
    const m = u.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || u.match(/\/d\/([a-zA-Z0-9_-]+)/) || u.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m && m[1]) return `https://drive.google.com/file/d/${m[1]}/preview`;
    if (/\.pdf(\?.*)?$/i.test(u)) return u;
    return '';
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
          <img src="${esc(imgUrl)}" alt="${esc(j.nama)}" width="78" height="104" class="journal-cover-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
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

  const isGenericPortalHome = u => {
    const clean = String(u || '').trim().replace(/\/+$/, '').toLowerCase();
    return !clean || [
      'https://sinta.kemdikbud.go.id',
      'http://sinta.kemdikbud.go.id',
      'https://scholar.google.com',
      'http://scholar.google.com',
      'https://www.scopus.com',
      'http://www.scopus.com',
      'https://scopus.com'
    ].includes(clean);
  };
  const hasRealProfileLink = u => {
    const s = String(u || '').trim();
    return /^https?:\/\//i.test(s) && !isGenericPortalHome(s);
  };
  const matchFields = (fields, q) => !q || fields.some(v => String(v || '').toLowerCase().includes(q));

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
          <div class="pag-info">Menampilkan <b>${start}-${end}</b> dari <b>${totalItems}</b> jurnal <span class="mu" style="font-size:12px">(Hal. ${curPage}/${totalPages})</span></div>
          <div class="pag-perpage-wrap">
            <label for="${selectId}" style="margin:0;font-size:12.5px;color:var(--mu);cursor:pointer">Tampilkan:</label>
            <select id="${selectId}" class="pag-perpage-select">
              ${optsHtml}
            </select>
          </div>
        </div>
        <div class="pag-nav" role="navigation" aria-label="Navigasi Halaman Katalog">
          <button type="button" class="btn sm pag-btn" data-a="${actionName}" data-page="1" aria-label="Ke halaman pertama" ${curPage === 1 ? 'disabled title="Halaman pertama"' : 'title="Ke halaman pertama"'}>«</button>
          <button type="button" class="btn sm pag-btn" data-a="${actionName}" data-page="${curPage - 1}" aria-label="Ke halaman sebelumnya" ${curPage === 1 ? 'disabled title="Halaman sebelumnya"' : 'title="Ke halaman sebelumnya"'}>‹ Prev</button>
          ${pages.map(p => {
            if (p === '...') return `<span class="pag-ellipsis" aria-hidden="true">…</span>`;
            const isActive = p === curPage;
            return `<button type="button" class="btn sm pag-btn ${isActive ? 'pri' : ''}" data-a="${actionName}" data-page="${p}" aria-label="Halaman ${p}" ${isActive ? 'aria-current="page"' : ''}>${p}</button>`;
          }).join('')}
          <button type="button" class="btn sm pag-btn" data-a="${actionName}" data-page="${curPage + 1}" aria-label="Ke halaman berikutnya" ${curPage === totalPages ? 'disabled title="Halaman berikutnya"' : 'title="Ke halaman berikutnya"'}>Next ›</button>
          <button type="button" class="btn sm pag-btn" data-a="${actionName}" data-page="${totalPages}" aria-label="Ke halaman terakhir" ${curPage === totalPages ? 'disabled title="Halaman terakhir"' : 'title="Ke halaman terakhir"'}>»</button>
        </div>
      </div>
    `;
  }

  // ============ PUBLIK ============
  function pubIdx(i) { return i ? `<span class="bd nv">${esc(i)}</span>` : ''; }
  function viewPub() {
    const P = S.P;
    if (!P) {
      return `
        <header class="top">
          <div class="brand">
            <div class="logo">${SVG.logo}</div>
            <div>
              <div class="brand-name">SIMPEN</div>
              <small>Sistem Informasi Manajemen Penelitian Dosen</small>
            </div>
          </div>
          <button type="button" class="btn pri" data-a="goLogin">${SVG.user} Masuk Admin</button>
        </header>
        <main class="wrap" style="text-align:center;padding:64px 20px">
          ${S.pubErr ? `
            <div class="card" role="alert" style="max-width:500px;margin:0 auto;padding:28px 32px">
              <h1 style="font-size:20px;margin-bottom:8px;color:var(--dng-tx)">Gagal Memuat Portofolio Publik</h1>
              <p class="mu" style="margin:0 0 20px">${esc(S.pubErr)}</p>
              <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
                <button type="button" class="btn pri" data-a="retryPub">Muat Ulang Data</button>
                <button type="button" class="btn" data-a="goLogin">Masuk Panel Admin</button>
              </div>
            </div>
          ` : `
            <h1 style="font-size:20px;margin-bottom:14px">Portofolio Riset &amp; Publikasi Dosen</h1>
            <div class="card" style="display:inline-block;padding:24px 40px">Memuat data riset &amp; publikasi…</div>
          `}
        </main>
      `;
    }
    const q = S.q.toLowerCase().trim();
    const matchPub = x => matchFields([x.judul, x.jurnal, x.indeks, x.doi, x.tahun_terbit, x.bidang, x.kolaborator, x.status, x.nama, x.penerbit, x.rumpun_ilmu, x.akreditasi, x.scope, x.jenis_kampus], q);
    const pubs = P.publikasi.filter(x => matchPub(x) && (!S.yr || x.tahun_terbit === S.yr));
    const years = [...new Set(P.publikasi.map(x => x.tahun_terbit).filter(Boolean))].sort().reverse();
    
    let list = '';
    if (S.tab === 'pub') {
      list = pubs.map(x => `
        <article class="pub-row">
          <div class="pub-row-main">
            <div class="pub-row-meta">
              ${pubIdx(x.indeks)}
              <span class="bd sl">${x.tahun_terbit ? 'Tahun ' + esc(x.tahun_terbit) : 'Terbit'}</span>
              ${x.doi ? `<span class="mono bd bl" style="font-size:11px">DOI: ${esc(x.doi)}</span>` : ''}
            </div>
            <h3>${esc(x.judul)}</h3>
            <div class="pub-row-sub">
              <span>${SVG.book} <b>${esc(x.jurnal)}</b></span>
            </div>
          </div>
          <div class="pub-row-act">
            <button type="button" class="btn sm" data-a="cite" data-id="${esc(x.id)}" title="Salin format sitasi APA atau IEEE">${SVG.quote} Salin Sitasi</button>
            ${(x.link_final || x.doi) ? `<a class="btn pri sm" href="${esc(x.link_final || 'https://doi.org/' + x.doi)}" target="_blank" rel="noopener">${SVG.ext} Buka Artikel</a>` : '<span class="mu" style="font-size:12px">Tautan belum tersedia</span>'}
          </div>
        </article>
      `).join('') || '<div class="card mu" style="text-align:center;padding:32px">Belum ada publikasi yang sesuai pencarian.</div>';
    }
    
    if (S.tab === 'proses') {
      const prosesList = P.proses.filter(matchPub);
      list = (prosesList.map(x => {
        const st = STAGE[x.status] || 2, dl = dayDiff(x.deadline_respon);
        return `
          <article class="card item">
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
              ${x.deadline_respon ? `<span style="display:inline-flex;align-items:center;gap:4px">${SVG.alert} Batas respon: <b>${fmt(x.deadline_respon)}</b> ${dl != null ? pill(dl) : ''}</span>` : ''}
            </div>
            <div class="steps-container">
              <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:600;color:var(--mu);margin-bottom:4px">
                <span style="color:var(--accent)">Tahap Saat Ini: ${STEPS[st - 1]}</span>
                <span>Tahap ${st} dari 6</span>
              </div>
              <div class="steps">${STEPS.map((_, i) => `<i class="${i < st - 1 ? 'd' : i === st - 1 ? 'c' : ''}"></i>`).join('')}</div>
            </div>
          </article>
        `;
      }).join('') || '<div class="card mu" style="text-align:center;padding:32px;margin-bottom:16px">Belum ada naskah yang sedang dalam proses review atau revisi.</div>') + `<div class="card mu" style="background:#EFF6FF;border-color:#BFDBFE;color:#1E40AF;font-size:13px;display:flex;align-items:center;gap:8px;padding:12px 16px">${SVG.info} <span>Catatan internal telaah naskah dan feedback reviewer bersifat rahasia dan tidak ditampilkan ke publik.</span></div>`;
    }

    if (S.tab === 'pen') {
      const penList = (P.penelitian || []).filter(matchPub);
      list = penList.map(x => `
        <article class="pub-row">
          <div class="pub-row-main">
            <div class="pub-row-meta">
              <span class="bd ${x.status === 'Selesai' ? 'gr' : x.status === 'Berjalan' ? 'am' : 'sl'}">${esc(x.status)}</span>
              ${x.bidang ? `<span class="bd bl">${esc(x.bidang)}</span>` : ''}
              <span class="mu" style="font-size:12px;display:inline-flex;align-items:center;gap:4px">${SVG.calendar} Mulai: ${fmt(x.tanggal_mulai)}</span>
            </div>
            <h3>${esc(x.judul)}</h3>
            <div class="pub-row-sub">
              <span>${SVG.user} <b>Kolaborator / Tim:</b> ${esc(x.kolaborator || 'Mandiri')}</span>
            </div>
          </div>
          ${(x.link_pdf || x.link_berkas) ? `
            <div class="pub-row-act">
              ${toPreviewEmbedUrl(x.link_pdf || x.link_berkas) ? `<button type="button" class="btn pri sm" data-a="previewDoc" data-url="${esc(x.link_pdf || x.link_berkas)}" data-folder="${esc(x.link_berkas || '')}" data-title="${esc(x.judul)}">${SVG.eye} Live View</button>` : ''}
              ${x.link_pdf ? `<a class="btn sm" href="${esc(x.link_pdf)}" target="_blank" rel="noopener">${SVG.file} Naskah PDF</a>` : ''}
              ${x.link_berkas ? `<a class="btn sm" href="${esc(x.link_berkas)}" target="_blank" rel="noopener">${SVG.folder} Berkas Drive</a>` : ''}
            </div>
          ` : ''}
        </article>
      `).join('') || '<div class="card mu" style="text-align:center;padding:32px">Belum ada riset/penelitian yang ditampilkan ke publik.</div>';
    }

    if (S.tab === 'jur') list = pubKatalog(P, matchPub);
    const totPen = (P.penelitian || []).length;
    
    const initials = esc((P.profil.nama || 'Dosen').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase());
    const fotoUrl = esc(P.profil.foto || P.profil.foto_profil || '');
    const avatarHtml = fotoUrl ? `<img src="${fotoUrl}" alt="${esc(P.profil.nama)}" width="72" height="72" fetchpriority="high">` : initials;
    const profileLinks = [
      hasRealProfileLink(P.profil.link_sinta) ? `<a href="${esc(P.profil.link_sinta)}" target="_blank" rel="noopener">SINTA Kemdikbud ${SVG.ext}</a>` : '',
      hasRealProfileLink(P.profil.link_scholar) ? `<a href="${esc(P.profil.link_scholar)}" target="_blank" rel="noopener">Google Scholar ${SVG.ext}</a>` : '',
      hasRealProfileLink(P.profil.link_scopus) ? `<a href="${esc(P.profil.link_scopus)}" target="_blank" rel="noopener">Scopus ID ${SVG.ext}</a>` : ''
    ].filter(Boolean).join('');

    const hero = `
      <div class="hero-academic">
        <div class="hero-profile">
          <div class="hero-avatar">${avatarHtml}</div>
          <div>
            <h1 class="hero-title">${esc(P.profil.nama)}</h1>
            <div class="hero-subtitle">
              <span>${esc(P.profil.afiliasi)}</span>
              <span class="hero-tag">Dosen &amp; Peneliti</span>
            </div>
            ${profileLinks ? `<div class="hero-badges">${profileLinks}</div>` : ''}
          </div>
        </div>
        <div class="hero-metrics" aria-label="Ringkasan Portofolio Akademik">
          <div class="hero-metric-item"><b>${P.publikasi.length}</b><span>Publikasi Terbit</span></div>
          <div class="hero-metric-item"><b>${P.proses.length}</b><span>Dalam Proses</span></div>
          <div class="hero-metric-item"><b>${totPen}</b><span>Proyek Riset</span></div>
          <div class="hero-metric-item"><b>${P.jurnal.length}</b><span>Katalog Jurnal</span></div>
        </div>
      </div>
    `;

    const tabTitles = { pub: 'Daftar Publikasi Terbit', proses: 'Naskah Dalam Proses Review & Revisi', pen: 'Daftar Riset & Penelitian', jur: 'Katalog Jurnal Sasaran' };

    return `
      <header class="top">
        <div class="brand">
          <div class="logo">${SVG.logo}</div>
          <div>
            <div class="brand-name">SIMPEN</div>
            <small>Portal Manajemen Penelitian &amp; Publikasi Akademik</small>
          </div>
        </div>
        <button type="button" class="btn pri" data-a="goLogin">${SVG.user} Masuk Admin</button>
      </header>
      <main class="wrap">
        ${hero}
        <div class="toolbar-unified">
          <nav class="tabs" aria-label="Kategori Portofolio Publik">
            ${[['pub', 'Publikasi Terbit'], ['proses', 'Dalam Proses'], ['pen', 'Riset & Penelitian'], ['jur', 'Katalog Jurnal']].map(([k, l]) => `<button type="button" data-a="tab" data-id="${k}" class="${S.tab === k ? 'on' : ''}">${l}</button>`).join('')}
          </nav>
          ${S.tab === 'jur' ? '' : `
            <div class="toolbar-filters">
              <div class="input-icon-wrap">
                ${SVG.search}
                <input class="in" id="q" aria-label="Cari judul artikel, topik riset, atau kolaborator" placeholder="Cari judul artikel, topik riset, atau kolaborator…" value="${esc(S.q)}">
              </div>
              ${S.tab === 'pub' ? `
                <select id="yr" aria-label="Filter tahun terbit" style="width:155px">
                  <option value="">Semua Tahun</option>
                  ${years.map(y => `<option value="${esc(y)}" ${y === S.yr ? 'selected' : ''}>Tahun ${esc(y)}</option>`).join('')}
                </select>
              ` : ''}
            </div>
          `}
        </div>
        <h2 style="font-size:17px;margin:0 0 14px">${tabTitles[S.tab] || 'Portofolio Akademik'}</h2>
        <div id="pub-list-region">${list}</div>
      </main>
      <footer class="wrap" style="padding-top:0;padding-bottom:36px">
        <p class="mu" style="text-align:center;margin:0;font-size:13px">© ${new Date().getFullYear()} SIMPEN · Sistem Manajemen Penelitian &amp; Publikasi Dosen</p>
      </footer>
    `;
  }

  // Kartu katalog publik
  function jPub(j) {
    const v = apcVal(j), rum = esc(j.rumpun_ilmu || '-');

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
            <div class="mu kp" style="font-size:12.5px">${SVG.bld} <span>${esc(j.penerbit || '-')}</span></div>
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
            <div class="mu kp">${SVG.bld} <span>${esc(j.penerbit || '-')}</span></div>
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
    const v = apcVal(j), rum = esc(j.rumpun_ilmu || '-');
    const kampus = esc(j.jenis_kampus || 'PTN');
    const scope = esc(j.scope || 'Belum ada rincian fokus dan ruang lingkup (focus & scope) untuk jurnal ini.');
    const hasLink = j.link && /^https?:\/\//i.test(String(j.link).trim());

    openModal(`
      <div class="ov">
        <div class="mod" role="dialog" aria-modal="true" aria-labelledby="jdetail-title" style="max-width:580px;padding:26px 28px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:20px">
            <div style="display:flex;gap:16px;align-items:flex-start">
              <div class="jc-cover-box" style="width:72px;height:96px;flex-shrink:0">
                ${thumb(j, '100%', '100%')}
              </div>
              <div style="flex:1;min-width:0">
                <h2 id="jdetail-title" style="font-size:18px;line-height:1.35;margin:0 0 6px;color:var(--tx);font-weight:700">${esc(j.nama)}</h2>
                <div style="display:flex;align-items:center;gap:6px;color:var(--pri);font-size:13px;font-weight:600">
                  ${SVG.bld} <span>${esc(j.penerbit || '-')}</span>
                </div>
              </div>
            </div>
            <button type="button" class="btn sm" data-a="mclose" aria-label="Tutup rincian jurnal" title="Tutup" style="padding:4px 8px;font-size:16px;line-height:1;border-radius:50%;width:32px;height:32px;display:grid;place-items:center;color:var(--mu);cursor:pointer">✕</button>
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

          <div class="act" style="margin-top:22px;display:flex;justify-content:flex-end;gap:10px;align-items:center">
            <button type="button" class="btn" data-a="mclose">Tutup</button>
            ${hasLink ? `
              <a href="${esc(j.link)}" target="_blank" rel="noopener" class="btn pri" style="display:inline-flex;align-items:center;gap:6px">
                ${SVG.ext} Kunjungi Web
              </a>
            ` : '<span class="mu" style="font-size:12px">Tautan web belum tersedia</span>'}
          </div>
        </div>
      </div>
    `);
  }

  function pubKatalog(P, match) {
    const f = S.f, J = P.jurnal;
    const rum = [...new Set(J.map(x => x.rumpun_ilmu).filter(Boolean))].sort();
    const L = J.filter(j => (!f.kampus || (j.jenis_kampus || 'PTN') === f.kampus) && (!f.akr || akr(j) === f.akr) && (!f.biaya || (f.biaya === 'g' ? j.tipe_biaya === 'Gratis' : j.tipe_biaya !== 'Gratis')) && (!f.rumpun || j.rumpun_ilmu === f.rumpun) && match(j));
    const sel = (id, lab, opts, cur) => `<div><label for="f_${id}" class="lbl" style="margin:0 0 6px;display:block">${lab}</label><select id="f_${id}">${opts.map(([v, t]) => `<option value="${esc(v)}" ${v === cur ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div>`;
    const kap = x => (x.jenis_kampus || 'PTN');
    const stats = `
      <div class="stats">
        <div class="card stat st-pri"><span>Total Jurnal</span><b>${J.length}</b><small>Terdaftar</small></div>
        <div class="card stat"><span>Jurnal PTN</span><b>${J.filter(x => kap(x) === 'PTN').length}</b><small>Perguruan Tinggi Negeri</small></div>
        <div class="card stat"><span>Jurnal PTS</span><b>${J.filter(x => kap(x) === 'PTS').length}</b><small>Perguruan Tinggi Swasta</small></div>
        <div class="card stat st-suc"><span>Terakreditasi / Bereputasi</span><b>${J.filter(x => akr(x) !== 'Non-Sinta').length}</b><small>SINTA &amp; Internasional</small></div>
      </div>
    `;
    const bar = `
      <div class="card" style="margin-bottom:20px">
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <div class="input-icon-wrap" style="flex:1;min-width:240px">
            ${SVG.search}
            <input class="in" id="q" aria-label="Cari nama jurnal, kampus, atau rumpun ilmu" placeholder="Cari nama jurnal, kampus, rumpun ilmu…" value="${esc(S.q)}">
          </div>
          <div class="seg-group" role="group" aria-label="Mode tampilan katalog">
            <button type="button" class="btn sm ${S.jview === 'grid' ? 'pri' : ''}" data-a="jview" data-id="grid" aria-label="Tampilan kartu">${SVG.grid} Grid</button>
            <button type="button" class="btn sm ${S.jview === 'list' ? 'pri' : ''}" data-a="jview" data-id="list" aria-label="Tampilan daftar">${SVG.list} List</button>
          </div>
          <button type="button" class="btn sm" data-a="resetf">${SVG.reset} Reset Filter</button>
        </div>
        <div class="fgrid">
          ${sel('kampus', 'Jenis Kampus', [['', 'Semua'], ['PTN', 'PTN'], ['PTS', 'PTS'], ['Lainnya', 'Lainnya']], f.kampus)}
          ${sel('akr', 'Akreditasi / Indeks', [['', 'Semua'], ...AKR.map(x => [x, x])], f.akr)}
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
    <main class="wrap">
      <div class="login card">
        <div class="logo" style="margin:0 auto 16px;width:56px;height:56px;padding:8px">${SVG.logo}</div>
        <h1>Masuk Panel Admin</h1>
        <p class="mu" style="margin-bottom:14px">Sistem Manajemen Penelitian Dosen (SIMPEN)</p>
        <span class="bd bl" style="font-size:12px;padding:4px 12px">Akses khusus pengelola data &amp; publikasi</span>
        <form id="lf" style="text-align:left;margin-top:20px">
          <label for="pw">Kata Sandi Admin <span style="color:#DC2626">*</span></label>
          <input class="in" id="pw" type="password" placeholder="Masukkan kata sandi pengelola…" autocomplete="current-password" required>
          <div class="mu" style="margin:8px 0 20px;font-size:12.5px">Sesi admin aktif selama 8 jam setelah berhasil masuk.</div>
          <button class="btn pri" style="width:100%;height:44px;font-size:14px">Masuk ke Panel Pengelola</button>
          <div class="err" id="le" role="alert" style="display:none"></div>
        </form>
        <p style="margin-top:24px"><a href="#" data-a="goPub" style="color:var(--mu);text-decoration:none;font-weight:600;font-size:13px">← Kembali ke Halaman Utama</a></p>
      </div>
    </main>
  `;

  // ============ ADMIN ============
  const NAV = [
    ['dash', 'Dashboard', SVG.dash],
    ['pen', 'Proyek Riset', SVG.pen],
    ['sub', 'Artikel & Publikasi', SVG.sub],
    ['jur', 'Katalog Jurnal', SVG.jur],
    ['cfp', 'CFP & Deadline', SVG.cfp],
    ['set', 'Pengaturan', SVG.set]
  ];

  function viewAdmin() {
    const D = S.D; if (!D) return `<main class="wrap" style="text-align:center;padding:80px 20px"><h1 style="font-size:20px;margin-bottom:14px">Panel Pengelola SIMPEN</h1><div class="card" style="display:inline-block;padding:24px 40px">Memuat data panel pengelola…</div></main>`;
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
            <nav class="side-nav" aria-label="Menu Utama Admin">
              ${NAV.map(([k, l, icon]) => `
                <button type="button" data-a="nav" data-id="${k}" class="${S.page === k ? 'on' : ''}">
                  <span class="nav-left">${icon} <span>${l}</span></span>
                  ${cnt[k] ? `<span class="cnt">${cnt[k]}</span>` : ''}
                </button>
              `).join('')}
            </nav>
          </div>
          <div class="side-footer">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding:0 8px">
              <div style="width:32px;height:32px;border-radius:50%;background:#3B82F6;display:grid;place-items:center;font-weight:700;font-size:12px;color:#fff">${esc((cfg().nama || 'D').slice(0, 1).toUpperCase())}</div>
              <div style="overflow:hidden">
                <div style="color:#F8FAFC;font-weight:600;font-size:12px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden">${esc(cfg().nama || 'Admin Dosen')}</div>
                <div style="color:#64748B;font-size:11px">Pengelola Aktif</div>
              </div>
            </div>
            <button type="button" data-a="logout" style="color:#EF4444;justify-content:flex-start">
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
            <span>Riset</span>
          </button>
          <button type="button" class="mb-btn ${S.page === 'sub' ? 'active' : ''}" data-a="nav" data-id="sub">
            ${SVG.sub}
            <span>Artikel</span>
            ${cnt.sub ? `<span class="mb-badge">${cnt.sub}</span>` : ''}
          </button>
          <button type="button" class="mb-btn ${S.page === 'jur' ? 'active' : ''}" data-a="nav" data-id="jur">
            ${SVG.jur}
            <span>Jurnal</span>
          </button>
          <button type="button" class="mb-btn ${['cfp', 'set'].includes(S.page) ? 'active' : ''}" data-a="mobileMenu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
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
    const revNear = D.Submission.filter(s => PROSES.includes(s.status) && s.deadline_respon && dayDiff(s.deadline_respon) >= 0 && dayDiff(s.deadline_respon) <= 7).sort((a, b) => a.deadline_respon.localeCompare(b.deadline_respon));
    
    const J = Object.fromEntries((D.Jurnal || []).map(j => [j.id, j]));
    let totKumPub = 0;
    pub.forEach(s => {
      const k = hitungKumBkd(s, J[s.id_jurnal] || {});
      totKumPub += k.kumDidapat;
    });
    const totalSelesai = pub.length + D.Submission.filter(s => s.status === 'Accepted').length + tol.length;
    const accRate = totalSelesai > 0 ? Math.round(((pub.length + D.Submission.filter(s => s.status === 'Accepted').length) / totalSelesai) * 100) : 100;

    const yrs = {}; pub.forEach(s => { if (s.tahun_terbit) yrs[s.tahun_terbit] = (yrs[s.tahun_terbit] || 0) + 1; });
    const ys = Object.keys(yrs).sort(), mx = Math.max(1, ...Object.values(yrs));
    const dist = STAT.map(s => [s, D.Submission.filter(x => x.status === s).length]).filter(x => x[1]);
    const COL = { Draft: '#94A3B8', Submitted: '#60A5FA', 'Under Review': '#2563EB', 'Revision Requested': '#F59E0B', Resubmitted: '#FBBF24', Accepted: '#10B981', Published: '#059669', Rejected: '#DC2626', Withdrawn: '#F43F5E' };
    let acc = 0; const tot = D.Submission.length || 1; const cg = dist.map(([s, n]) => { const a = acc / tot * 360; acc += n; return `${COL[s]} ${a}deg ${acc / tot * 360}deg`; }).join(',');
    const jc = {}; D.Submission.forEach(s => { const n = jname(s.id_jurnal); jc[n] = (jc[n] || 0) + 1; }); const jt = Object.entries(jc).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const log = (D.Log || [])[0];
    const c = cfg();
    const waActive = (c.wa_master !== false && String(c.wa_master) !== 'false') && Boolean(c.wa && String(c.wa).trim());
    const waBannerBg = waActive ? '#F0FDF4' : '#FFFBEB';
    const waBannerBd = waActive ? '#BBF7D0' : '#FDE68A';
    const waBannerTx = waActive ? '#166534' : '#92400E';
    const waStatusTxt = !waActive
      ? 'Pengingat WhatsApp belum aktif (nomor tujuan belum diisi atau saklar master dimatikan di Pengaturan).'
      : (log
          ? `Notifikasi WA terakhir (${esc(fmtLogWaktu(log.waktu, D.Log))}): <b>${esc(log.hasil)}</b> · Jadwal harian pukul ${esc(c.jam || '08:00')} WIB.`
          : `Pengingat WhatsApp siap dikirim ke <b>${esc(c.wa)}</b> sesuai jadwal harian (${esc(c.jam || '08:00')} WIB). Belum ada riwayat pengiriman.`);

    return head('Dashboard Ringkasan', 'Kondisi riil proyek riset, progres artikel jurnal, dan target deadline naskah', `
      <button type="button" class="btn" data-a="openRumpun">${SVG.user} Matriks Rumpun &amp; Pakar</button>
      <button type="button" class="btn" data-a="pdfBkd">${SVG.print} Cetak Rekap BKD</button>
      <button type="button" class="btn" data-a="add" data-e="Penelitian">${SVG.plus} Tambah Proyek Riset</button>
      <button type="button" class="btn pri" data-a="add" data-e="Submission">${SVG.plus} Tambah Artikel Jurnal</button>
    `) + `
      <div class="stats" style="grid-template-columns:repeat(auto-fit, minmax(170px, 1fr))">
        <div class="card stat"><span>Proyek Riset</span><b>${D.Penelitian.length}</b><small>Kegiatan Penelitian</small></div>
        <div class="card stat st-pri"><span>Artikel Dalam Proses</span><b>${proses.length}</b><small>Review &amp; Revisi OJS</small></div>
        <div class="card stat st-suc"><span>Artikel Terbit</span><b>${pub.length}</b><small>Published</small></div>
        <div class="card stat st-pri"><span>Akumulasi KUM</span><b>${totKumPub.toFixed(1)}</b><small>Total Angka Kredit</small></div>
        <div class="card stat st-suc"><span>Acceptance Rate</span><b>${accRate}%</b><small>Tingkat Lolos</small></div>
        <div class="card stat st-wrn"><span>CFP Aktif</span><b>${D.CFP.filter(c => dayDiff(c.deadline) >= 0 && c.status !== 'Ditutup').length}</b><small>Peluang Kirim</small></div>
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
                <button type="button" class="btn pri sm" data-a="cfp2sub" data-id="${c.id}">${SVG.plus} Buat Artikel</button>
                ${c.link ? `<a class="btn sm" href="${esc(c.link)}" target="_blank" rel="noopener">${SVG.ext} Buka Tautan</a>` : ''}
              </div>
            </div>
          `).join('') || '<p class="mu" style="padding:16px 0;text-align:center">Tidak ada CFP mendesak saat ini.</p>'}
        </div>

        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h3>Batas Revisi &amp; Cek Naskah</h3>
            <span class="bd ${revNear.length || pc.length ? 'am' : 'sl'}">${revNear.length + pc.length} Item</span>
          </div>
          ${revNear.map(s => `
            <div class="alert-row ${dayDiff(s.deadline_respon) <= 3 ? 'danger' : 'warning'}" style="margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
                <b style="font-size:14px;color:var(--tx)">${esc(s.judul)}</b>
                <span class="bd ${dayDiff(s.deadline_respon) <= 3 ? 'rs deadline-crit' : 'am'}">${SVG.clock} Sisa ${dayDiff(s.deadline_respon)} Hari Revisi</span>
              </div>
              <div class="mu" style="font-size:12.5px;margin:6px 0">${SVG.book} Sasaran: <b>${esc(jname(s.id_jurnal))}</b></div>
              <div style="margin-top:8px;display:flex;gap:6px">
                ${linkOf(s.id_jurnal, 'Portal')}
                <button type="button" class="btn pri sm" data-a="edit" data-e="Submission" data-id="${s.id}">${SVG.edit} Edit Progres</button>
              </div>
            </div>
          `).join('')}
          ${pc.map(s => `
            <div class="alert-row warning">
              <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
                <b style="font-size:14px;color:var(--tx)">${esc(s.judul)}</b>
                <span class="bd am">${SVG.clock} Belum cek ${-dayDiff(s.tgl_cek)} hari</span>
              </div>
              <div class="mu" style="font-size:12.5px;margin:6px 0">${SVG.book} Sasaran: <b>${esc(jname(s.id_jurnal))}</b></div>
              <div style="margin-top:8px;display:flex;gap:6px">
                ${linkOf(s.id_jurnal, 'Portal Jurnal')}
                <button type="button" class="btn pri sm" data-a="cek" data-id="${s.id}">${SVG.check} Sudah Saya Cek</button>
              </div>
            </div>
          `).join('')}
          ${!revNear.length && !pc.length ? '<p class="mu" style="padding:16px 0;text-align:center">Semua naskah dalam pantauan aman.</p>' : ''}
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

      <div class="card" style="margin-top:20px;background:${waBannerBg};border-color:${waBannerBd};display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:10px;font-size:13.5px;color:${waBannerTx}">
          ${waActive ? SVG.check : SVG.alert}
          <span>${waStatusTxt}</span>
        </div>
        <button type="button" data-a="nav" data-id="set" class="btn sm" style="background:#FFF">${SVG.set} Konfigurasi Pengingat</button>
      </div>
    `;
  }

  const linkOf = (idj, l) => {
    const j = (S.D?.Jurnal || []).find(x => x.id === idj);
    return j && j.link && /^https?:\/\//i.test(String(j.link).trim()) ? `<a class="btn sm" href="${esc(j.link)}" target="_blank" rel="noopener">${SVG.ext} ${l}</a>` : '';
  };

  function pPen() {
    const q = S.q.toLowerCase().trim();
    const L = S.D.Penelitian.filter(p => {
      const mRumpun = findRumpunByBidang(p.bidang);
      const okRumpun = !S.penRumpun || (mRumpun && mRumpun.nama === S.penRumpun) || p.bidang === S.penRumpun;
      return okRumpun && matchFields([p.judul, p.bidang, p.kolaborator, p.status, p.semester_bkd], q);
    });
    const leadName = cfg().nama || PENELITI_UTAMA;
    return head('Proyek Riset (Hibah / Mandiri)', 'Kelola kegiatan penelitian dengan ' + esc(PENELITI_UTAMA) + ' sebagai Peneliti Utama dan dosen pakar se-rumpun sebagai kolaborator', `
      <button type="button" class="btn" data-a="openRumpun">${SVG.user} Matriks Rumpun &amp; Pakar</button>
      <button type="button" class="btn" data-a="csv" data-e="Penelitian">${SVG.download} Ekspor Excel</button>
      <button type="button" class="btn pri" data-a="add" data-e="Penelitian">${SVG.plus} Tambah Proyek Riset</button>
    `) + `
      <div class="workflow-hint">
        ${SVG.info}
        <div>
          <b>Pemetaan Rumpun Keilmuan Prodi PBA:</b> Peneliti Utama dikhususkan atas nama <b>${esc(leadName)}</b> (pakar inti pada Rumpun #1, #2, #3, dan #5). Pilih Rumpun saat menambah riset agar kolaborator pakar disarankan otomatis, atau klik <b>+ Buat Artikel</b> untuk mengirim luarannya ke jurnal.
        </div>
      </div>
      <div class="toolbar-unified" style="padding:10px 14px">
        <div class="input-icon-wrap" style="flex:1;min-width:220px">
          ${SVG.search}
          <input class="in" id="q" aria-label="Cari judul riset, bidang, atau kolaborator" placeholder="Cari judul riset, rumpun, atau kolaborator…" value="${esc(S.q)}">
        </div>
        <select id="pen_rumpun" aria-label="Filter Rumpun Keilmuan" style="width:auto;max-width:340px">
          <option value="">Semua Rumpun Keilmuan (${RUMPUN_PAKAR.length})</option>
          ${RUMPUN_PAKAR.map(r => `<option value="${esc(r.nama)}" ${S.penRumpun === r.nama ? 'selected' : ''}>${r.no}. ${esc(r.nama)}</option>`).join('')}
        </select>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Judul Proyek Riset</th>
              <th>Rumpun / Bidang &amp; Mulai</th>
              <th>Peneliti Utama &amp; Kolaborator</th>
              <th>Status Riset</th>
              <th>Luaran Artikel</th>
              <th>Publik</th>
              <th>Aksi &amp; Tindak Lanjut</th>
            </tr>
          </thead>
          <tbody>
            ${L.map(p => {
              const nArt = S.D.Submission.filter(s => s.id_penelitian === p.id).length;
              const rm = findRumpunByBidang(p.bidang);
              const kolabs = parseKolabList(p.kolaborator);
              return `
              <tr>
                <td>
                  <b style="color:var(--tx);font-size:14px">${esc(p.judul)}</b>
                  ${p.semester_bkd ? `<div style="margin-top:4px"><span class="bd sl" style="font-size:10.5px">${esc(p.semester_bkd)}</span></div>` : ''}
                </td>
                <td>
                  <div>${esc(p.bidang || '-')}</div>
                  ${rm ? `<div style="margin-top:3px"><span class="bd ${rm.intiFajri ? 'bl' : 'sl'}" style="font-size:10.5px">Rumpun #${rm.no} · ${rm.intiFajri ? 'Inti Peneliti' : 'Lintas Rumpun'}</span></div>` : ''}
                  <small class="mu" style="display:block;margin-top:2px">${fmt(p.tanggal_mulai)}</small>
                </td>
                <td>
                  <div style="font-size:11.5px;color:var(--pri);font-weight:700">Ketua: ${esc(leadName)}</div>
                  ${kolabs.length
                    ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${kolabs.map(k => `<span class="bd sl" style="font-size:10.5px">${esc(k)}</span>`).join('')}</div>`
                    : '<span class="mu" style="font-size:11.5px;display:block;margin-top:2px">Mandiri (Tanpa Kolaborator)</span>'}
                </td>
                <td><span class="bd ${p.status === 'Selesai' ? 'gr' : p.status === 'Berjalan' ? 'am' : 'sl'}">${esc(p.status)}</span></td>
                <td><span class="bd ${nArt ? 'bl' : 'sl'}">${nArt} artikel</span></td>
                <td><span class="bd ${p.tampil_publik ? 'gr' : 'sl'}">${p.tampil_publik ? 'Tampil' : 'Privat'}</span></td>
                <td>
                  <div class="row-actions">
                    <button type="button" class="btn pri sm" data-a="pen2sub" data-id="${p.id}" title="Buat artikel jurnal dari proyek riset ini">${SVG.plus} Buat Artikel</button>
                    ${toPreviewEmbedUrl(p.link_pdf || p.link_berkas) ? `<button type="button" class="btn sm" data-a="previewDoc" data-url="${esc(p.link_pdf || p.link_berkas)}" data-folder="${esc(p.link_berkas || '')}" data-title="${esc(p.judul)}" title="Lihat dokumen laporan langsung (Live View)">${SVG.eye} Live View</button>` : ''}
                    ${p.link_berkas ? `<a class="btn sm" href="${esc(p.link_berkas)}" target="_blank" rel="noopener">${SVG.folder} Drive</a>` : ''}
                    <button type="button" class="btn sm" data-a="edit" data-e="Penelitian" data-id="${p.id}">${SVG.edit} Ubah</button>
                    <button type="button" class="btn sm dng" data-a="del" data-e="Penelitian" data-id="${p.id}" aria-label="Hapus proyek riset ${esc(p.judul)}" title="Hapus proyek riset">${SVG.trash}</button>
                  </div>
                </td>
              </tr>
            `;}).join('') || '<tr><td colspan="7" class="mu" style="text-align:center;padding:28px">Belum ada data proyek riset sesuai filter. Klik "Tambah Proyek Riset" di kanan atas untuk memulai.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  function pJur() {
    const q = S.jq.toLowerCase().trim(), L = S.D.Jurnal.filter(j => matchFields([j.nama, j.penerbit, j.rumpun_ilmu, j.akreditasi, j.jenis_kampus, j.scope], q) && (!S.jbiaya || (S.jbiaya === 'g' ? j.tipe_biaya === 'Gratis' : j.tipe_biaya !== 'Gratis')));
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
      <button type="button" class="btn" data-a="csv" data-e="Jurnal">${SVG.download} Ekspor Excel</button>
      <button type="button" class="btn pri" data-a="add" data-e="Jurnal">${SVG.plus} Tambah Jurnal Baru</button>
    `) + `
      <div class="stats">
        <div class="card stat"><span>Total Jurnal</span><b>${S.D.Jurnal.length}</b><small>Tersimpan</small></div>
        <div class="card stat st-suc"><span>Bebas Biaya</span><b>${S.D.Jurnal.filter(j => j.tipe_biaya === 'Gratis').length}</b><small>Gratis APC</small></div>
        <div class="card stat st-pri"><span>Tampil di Publik</span><b>${S.D.Jurnal.filter(j => j.tampil_publik).length}</b><small>Publik</small></div>
      </div>
      <div class="card" style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;align-items:center">
        <div class="input-icon-wrap" style="flex:1;min-width:240px">
          ${SVG.search}
          <input class="in" id="jq" aria-label="Cari nama jurnal, kampus, atau rumpun ilmu" placeholder="Cari nama jurnal, kampus, atau rumpun ilmu…" value="${esc(S.jq)}">
        </div>
        <select id="jb" aria-label="Filter biaya APC jurnal" style="width:180px">
          <option value="">Semua Biaya APC</option>
          <option value="g" ${S.jbiaya === 'g' ? 'selected' : ''}>Gratis</option>
          <option value="b" ${S.jbiaya === 'b' ? 'selected' : ''}>Berbayar (APC)</option>
        </select>
      </div>
      <div id="admin-jur-top"></div>
      ${pageItems.map(j => {
        const v = apcVal(j);
        const hasLink = j.link && /^https?:\/\//i.test(String(j.link).trim());
        return `
          <div class="card item" style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start">
            <div class="jc-cover-box" style="flex:none">${thumb(j, '100%', '100%')}</div>
            <div style="flex:1;min-width:260px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                <span class="mu" style="font-size:12px;font-weight:600">${esc(j.penerbit || '-')}</span>
                <span class="bd ${j.tampil_publik ? 'gr' : 'sl'}">${j.tampil_publik ? 'Publik' : 'Privat'}</span>
              </div>
              <h2 style="font-size:16.5px;margin:2px 0 8px">${esc(j.nama)}</h2>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
                <span class="bd sl">${esc(j.jenis_kampus || 'PTN')}</span>
                ${akrBadge(j)}
                <span class="bd ${j.tipe_biaya === 'Gratis' ? 'gr' : 'am'}">${j.tipe_biaya === 'Gratis' ? 'Gratis' : 'APC: ' + esc(v.t)}</span>
                ${j.rumpun_ilmu ? `<span class="bd bl">${esc(j.rumpun_ilmu)}</span>` : ''}
              </div>
              <p class="mu" style="font-size:13px;margin:6px 0 12px">${esc(j.scope)}</p>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                ${hasLink ? `<a class="btn sm" href="${esc(j.link)}" target="_blank" rel="noopener">${SVG.ext} Buka Jurnal</a>` : ''}
                <button type="button" class="btn pri sm" data-a="edit" data-e="Jurnal" data-id="${j.id}">${SVG.edit} Ubah Data</button>
                <button type="button" class="btn sm dng" data-a="del" data-e="Jurnal" data-id="${j.id}">${SVG.trash} Hapus</button>
              </div>
            </div>
          </div>
        `;
      }).join('') || '<div class="card mu" style="text-align:center;padding:32px">Belum ada data jurnal yang tersimpan.</div>'}
      ${paginationHtml}
    `;
  }

  function pSub() {
    const allSubs = S.D.Submission || [];
    const q = S.q.toLowerCase().trim();
    const PROSES_REV = ['Submitted', 'Under Review', 'Revision Requested', 'Resubmitted'];
    const ARSIP_ST = ['Rejected', 'Withdrawn'];

    const matchSubFilter = (s, flt) => {
      if (flt === 'draft') return s.status === 'Draft';
      if (flt === 'proses') return PROSES_REV.includes(s.status);
      if (flt === 'accepted') return s.status === 'Accepted';
      if (flt === 'published') return s.status === 'Published';
      if (flt === 'arsip') return ARSIP_ST.includes(s.status);
      return true;
    };

    const counts = {
      all: allSubs.length,
      draft: allSubs.filter(s => s.status === 'Draft').length,
      proses: allSubs.filter(s => PROSES_REV.includes(s.status)).length,
      accepted: allSubs.filter(s => s.status === 'Accepted').length,
      published: allSubs.filter(s => s.status === 'Published').length,
      arsip: allSubs.filter(s => ARSIP_ST.includes(s.status)).length
    };

    const curFilter = S.subFilter || 'all';
    const L = allSubs.filter(s =>
      matchSubFilter(s, curFilter) &&
      (!q || matchFields([s.judul, jname(s.id_jurnal), pname(s.id_penelitian), s.doi, s.semester_bkd, s.status], q)) &&
      (!S.onlyCheck || perluCek(s))
    );

    const J = Object.fromEntries((S.D?.Jurnal || []).map(j => [j.id, j]));
    const filterTabs = [
      ['all', 'Semua Artikel', counts.all],
      ['draft', 'Draft', counts.draft],
      ['proses', 'Proses Review & Revisi', counts.proses],
      ['accepted', 'Accepted (LoA)', counts.accepted],
      ['published', 'Terbit (Published)', counts.published],
      ['arsip', 'Ditolak / Ditarik', counts.arsip]
    ];

    const stageNumOf = st => {
      if (st === 'Draft') return 1;
      if (st === 'Published') return 6;
      return STAGE[st] || 0;
    };

    return head('Artikel & Publikasi Jurnal', 'Kelola naskah artikel ilmiah dari tahap draf, pengiriman OJS, revisi reviewer, hingga terbit ber-DOI & KUM BKD', `
      <button type="button" class="btn" data-a="pdfBkd">${SVG.print} Laporan BKD &amp; KUM</button>
      <button type="button" class="btn" data-a="importBib">${SVG.upload} Impor BibTeX</button>
      <button type="button" class="btn" data-a="csv" data-e="Submission">${SVG.download} Ekspor Excel</button>
      <button type="button" class="btn pri" data-a="add" data-e="Submission">${SVG.plus} Tambah Artikel Baru</button>
    `) + `
      <div class="workflow-hint">
        ${SVG.info}
        <div>
          <b>Kemudahan Pelacakan Naskah:</b> Anda dapat mengubah tahapan naskah secara langsung melalui <b>dropdown pada kolom Status</b> di tabel bawah tanpa perlu membuka form edit. Gunakan filter tahapan untuk menyaring naskah yang sedang berjalan.
        </div>
      </div>

      <div class="toolbar-unified" style="padding:12px 14px">
        <div class="status-pills" role="tablist" aria-label="Filter Tahapan Artikel">
          ${filterTabs.map(([k, lbl, c]) => `
            <button type="button" role="tab" aria-selected="${curFilter === k}" class="status-pill ${curFilter === k ? 'on' : ''}" data-a="subFilter" data-id="${k}">
              <span>${lbl}</span>
              <b>${c}</b>
            </button>
          `).join('')}
        </div>
        <div class="toolbar-filters">
          <div class="input-icon-wrap">
            ${SVG.search}
            <input class="in" id="q" aria-label="Cari judul artikel, jurnal, atau DOI" placeholder="Cari judul artikel, jurnal, atau DOI…" value="${esc(S.q)}">
          </div>
          <label for="oc" style="margin:0;font-weight:600;font-size:12.5px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;white-space:nowrap">
            <input type="checkbox" id="oc" ${S.onlyCheck ? 'checked' : ''}> Perlu dicek
          </label>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="min-width:250px">Judul Artikel &amp; Progres</th>
              <th style="min-width:170px">Jurnal Sasaran</th>
              <th style="min-width:140px">Capaian KUM &amp; BKD</th>
              <th style="min-width:160px">Kredensial OJS</th>
              <th style="min-width:175px">Status (Ubah Langsung)</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${L.map(s => {
              const j = J[s.id_jurnal];
              const k = hitungKumBkd(s, j);
              const pc = perluCek(s);
              const dl = dayDiff(s.deadline_respon);
              const stNum = stageNumOf(s.status);
              const parentPen = pname(s.id_penelitian);
              const buktiUrl = s.link_final || (s.doi ? 'https://doi.org/' + s.doi : '');
              const inProses = PROSES.includes(s.status);
              const waitDays = (inProses && s.tgl_submit) ? -dayDiff(s.tgl_submit) : null;

              let dlBadge = '';
              if (dl != null && PROSES.includes(s.status)) {
                if (dl < 0) dlBadge = `<span class="bd rs deadline-crit">${SVG.alert} Lewat Revisi (${-dl} hr)</span>`;
                else if (dl === 0) dlBadge = `<span class="bd rs deadline-crit">${SVG.alert} Revisi Hari Ini</span>`;
                else if (dl <= 3) dlBadge = `<span class="bd rs deadline-crit">${SVG.clock} Sisa ${dl} hr revisi</span>`;
                else if (dl <= 7) dlBadge = `<span class="bd am">${SVG.calendar} Sisa ${dl} hr revisi</span>`;
              }

              return `
                <tr>
                  <td>
                    <b style="color:var(--tx);font-size:14px;line-height:1.35;display:block">${esc(s.judul)}</b>
                    ${parentPen ? `<div class="mu" style="font-size:11.5px;margin-top:3px;display:flex;align-items:center;gap:4px">${SVG.pen} <span>Payung Riset: <b>${esc(parentPen)}</b></span></div>` : ''}
                    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:5px">
                      ${pc ? `<span class="bd am">${SVG.clock} Belum dicek ${-dayDiff(s.tgl_cek)} hr</span>` : ''}
                      ${dlBadge}
                      ${s.doi ? `<span class="mono bd sl" style="font-size:10.5px">DOI: ${esc(s.doi)}</span>` : ''}
                      ${buktiUrl ? `<a href="${esc(buktiUrl)}" target="_blank" rel="noopener" style="font-size:11.5px;font-weight:600;color:var(--pri-tx);text-decoration:none;display:inline-flex;align-items:center;gap:3px">${SVG.ext} Bukti Terbit</a>` : ''}
                    </div>
                    ${stNum > 0 ? `
                      <div class="mini-steps" title="Progres Tahap ${stNum} dari 6 (${STEPS[stNum - 1]})">
                        ${STEPS.map((_, idx) => `<i class="${idx < stNum - 1 ? 'd' : idx === stNum - 1 ? 'c' : ''}"></i>`).join('')}
                      </div>
                    ` : ''}
                  </td>
                  <td>
                    <div style="font-weight:600;color:var(--tx);margin-bottom:4px">${esc(jname(s.id_jurnal))}</div>
                    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
                      ${akrBadge(j)}
                      ${linkOf(s.id_jurnal, 'Portal')}
                    </div>
                  </td>
                  <td>
                    ${s.semester_bkd ? `<span class="bd bl" style="font-size:10.5px">${esc(s.semester_bkd)}</span>` : '<span class="mu" style="font-size:11px">Semester belum dipilih</span>'}
                    <div style="font-weight:700;color:var(--pri);font-size:12.5px;margin-top:4px">${k.kumDidapat} KUM <span class="mu" style="font-weight:500">· ${k.sks} SKS</span></div>
                    <small class="mu" style="font-size:11px;display:block">Porsi ${esc(k.porsiTxt)}</small>
                  </td>
                  <td>
                    ${s.akun_ojs ? `
                      <div style="display:flex;align-items:center;gap:4px;font-size:12px;font-weight:600;color:var(--tx);margin-bottom:4px" class="mono">
                        ${SVG.key} <span>${esc(s.akun_ojs)}</span>
                      </div>
                    ` : '<span class="mu" style="font-size:12px">-</span>'}
                    ${s.password_ojs ? `
                      <div class="pwd-cell" style="display:inline-flex;align-items:center;gap:4px">
                        <span class="pwd-text mono" data-val="${esc(s.password_ojs)}" style="font-size:11px;letter-spacing:1px;font-weight:600;color:var(--tx)">••••••</span>
                        <button type="button" class="btn sm" data-a="togglePwd" aria-label="Lihat atau sembunyikan password OJS" title="Lihat/Sembunyikan Password" style="padding:2px 5px;min-height:22px;border:none;background:transparent;cursor:pointer;color:#2563EB;display:inline-flex;align-items:center">
                          ${SVG.eye}
                        </button>
                        <button type="button" class="btn sm" data-a="copyPwd" data-pwd="${esc(s.password_ojs)}" aria-label="Salin password OJS" title="Salin Password" style="padding:2px 5px;min-height:22px;border:none;background:transparent;cursor:pointer;color:var(--mu);display:inline-flex;align-items:center">
                          ${SVG.copy}
                        </button>
                      </div>
                    ` : ''}
                  </td>
                  <td>
                    <select class="inline-status-select st-${STC[s.status] || 'sl'}" data-a="chg" data-id="${s.id}" aria-label="Ubah status artikel ${esc(s.judul)}">
                      ${STAT.map(x => `<option value="${esc(x)}" ${x === s.status ? 'selected' : ''}>${esc(x)}</option>`).join('')}
                    </select>
                    <div class="mu" style="font-size:11px;margin-top:5px">
                      Submit: <b>${fmt(s.tgl_submit)}</b><br>
                      Cek: <b>${fmt(s.tgl_cek)}</b>
                      ${waitDays !== null && waitDays >= 0 ? `<br>Menunggu: <b>${waitDays} hari</b>` : ''}
                    </div>
                  </td>
                  <td>
                    <div class="row-actions">
                      <button type="button" class="btn pri sm" data-a="cek" data-id="${s.id}" title="Tandai sudah dicek hari ini">${SVG.check} Dicek</button>
                      ${inProses ? `<button type="button" class="btn sm" data-a="followup" data-id="${s.id}" title="Buat template email follow-up ke editor">${SVG.mail} Follow-up</button>` : ''}
                      <button type="button" class="btn sm" data-a="hist" data-id="${s.id}" title="Riwayat perubahan status">${SVG.clock}</button>
                      <button type="button" class="btn sm" data-a="edit" data-e="Submission" data-id="${s.id}">${SVG.edit} Ubah</button>
                      <button type="button" class="btn sm dng" data-a="del" data-e="Submission" data-id="${s.id}" aria-label="Hapus artikel ${esc(s.judul)}" title="Hapus artikel">${SVG.trash}</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('') || '<tr><td colspan="6" class="mu" style="text-align:center;padding:32px">Belum ada artikel pada kategori tahapan ini.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  function pCfp() {
    const A = S.D.CFP.filter(c => dayDiff(c.deadline) >= 0).sort((a, b) => a.deadline.localeCompare(b.deadline)), O = S.D.CFP.filter(c => dayDiff(c.deadline) < 0);
    const tr = (c, old) => `
      <tr style="${old ? 'opacity:.6' : ''}">
        <td>
          <b style="color:var(--tx);font-size:14px">${esc(c.nama)}</b>
          ${c.link ? ` <a href="${esc(c.link)}" target="_blank" rel="noopener" aria-label="Buka tautan CFP ${esc(c.nama)}">${SVG.ext}</a>` : ''}
        </td>
        <td>${esc(c.scope)}</td>
        <td>${fmt(c.deadline)}</td>
        <td>${pill(dayDiff(c.deadline))}</td>
        <td><span class="bd sl">${esc(c.status)}</span></td>
        <td style="white-space:nowrap">
          <div class="row-actions">
            ${old ? '' : `<button type="button" class="btn pri sm" data-a="cfp2sub" data-id="${c.id}">${SVG.plus} Buat Artikel</button>`}
            <button type="button" class="btn sm" data-a="edit" data-e="CFP" data-id="${c.id}">${SVG.edit} Ubah</button>
            <button type="button" class="btn sm dng" data-a="del" data-e="CFP" data-id="${c.id}" aria-label="Hapus CFP ${esc(c.nama)}" title="Hapus CFP">${SVG.trash}</button>
          </div>
        </td>
      </tr>
    `;
    const th = '<thead><tr><th>Nama CFP / Konferensi</th><th>Scope Topik</th><th>Batas Submit</th><th>Sisa Waktu</th><th>Status</th><th>Aksi</th></tr></thead>';
    return head('Call for Papers &amp; Deadline', 'Pantau batas pengiriman naskah konvensi/jurnal dengan pengingat WA harian', `
      <button type="button" class="btn pri" data-a="add" data-e="CFP">${SVG.plus} Tambah CFP Baru</button>
    `) + `
      <div class="table-wrap">
        <div style="padding:16px 20px;border-bottom:1px solid var(--bd)"><h2 style="font-size:15px">CFP Aktif (${A.length})</h2></div>
        <table>${th}<tbody>${A.map(c => tr(c)).join('') || '<tr><td colspan="6" class="mu" style="text-align:center;padding:24px">Belum ada CFP aktif.</td></tr>'}</tbody></table>
      </div>
      <div class="table-wrap" style="margin-top:24px">
        <div class="bar" style="padding:16px 20px;margin:0;border-bottom:1px solid var(--bd)">
          <h2 style="font-size:15px">CFP Telah Melewati Deadline (${O.length})</h2>
          ${O.length ? `<button type="button" class="btn sm dng" data-a="delOld">${SVG.trash} Hapus Semua yang Lewat</button>` : ''}
        </div>
        ${O.length ? `<table>${th}<tbody>${O.map(c => tr(c, 1)).join('')}</tbody></table>` : '<p class="mu" style="padding:24px;text-align:center">Tidak ada CFP yang telah lewat.</p>'}
      </div>
    `;
  }

  function pSet() {
    const c = cfg(), D = S.D;
    const sintaVal = hasRealProfileLink(c.link_sinta) ? c.link_sinta : '';
    const scholarVal = hasRealProfileLink(c.link_scholar) ? c.link_scholar : '';
    const scopusVal = hasRealProfileLink(c.link_scopus) ? c.link_scopus : '';
    return head('Pengaturan Aplikasi', 'Profil akademisi, nomor WhatsApp (Fonnte), dan jadwal notifikasi', '') + `
      <div class="grid2">
        <div class="card">
          <h2 style="font-size:17px;margin-bottom:16px">Pengingat Otomatis &amp; Profil</h2>
          <form id="sf">
            <label for="sf_nama">Nama Lengkap &amp; Gelar</label>
            <input class="in" id="sf_nama" name="nama" value="${esc(c.nama)}" placeholder="Dr. Nama Dosen, M.Kom.">
            
            <label for="sf_afiliasi">Afiliasi / Universitas</label>
            <input class="in" id="sf_afiliasi" name="afiliasi" value="${esc(c.afiliasi)}" placeholder="Fakultas / Universitas">

            <h3 style="margin:20px 0 10px;font-size:14.5px;color:#1E40AF;border-bottom:1px solid var(--bd);padding-bottom:6px">Identitas BKD Dosen (Kop &amp; Lembar Pengesahan Laporan)</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px">
              <div>
                <label for="sf_nidn">NIDN / NIDK</label>
                <input class="in" id="sf_nidn" name="nidn" value="${esc(c.nidn || '')}" placeholder="Contoh: 0012058501">
              </div>
              <div>
                <label for="sf_nip">NIP / NPK Pegawai</label>
                <input class="in" id="sf_nip" name="nip" value="${esc(c.nip || '')}" placeholder="Contoh: 198505122010121001">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px;margin-top:6px">
              <div>
                <label for="sf_jabatan">Jabatan Fungsional</label>
                <select class="in" id="sf_jabatan" name="jabatan_fungsional">
                  ${['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Guru Besar', 'Tenaga Pengajar'].map(j => `<option value="${j}" ${(c.jabatan_fungsional || 'Lektor') === j ? 'selected' : ''}>${j}</option>`).join('')}
                </select>
              </div>
              <div>
                <label for="sf_prodi">Program Studi</label>
                <input class="in" id="sf_prodi" name="prodi" value="${esc(c.prodi || '')}" placeholder="Contoh: Teknik Informatika">
              </div>
            </div>

            <label for="sf_fakultas" style="margin-top:8px">Fakultas / Unit Kerja</label>
            <input class="in" id="sf_fakultas" name="fakultas" value="${esc(c.fakultas || '')}" placeholder="Contoh: Fakultas Ilmu Komputer">

            <h3 style="margin:20px 0 10px;font-size:14.5px;color:#1E40AF;border-bottom:1px solid var(--bd);padding-bottom:6px">Data Pengesahan &amp; Asesor BKD (Opsional)</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px">
              <div>
                <label for="sf_asesor1">Nama Asesor BKD 1</label>
                <input class="in" id="sf_asesor1" name="nama_asesor_1" value="${esc(c.nama_asesor_1 || '')}" placeholder="Prof. Dr. ..., M.Sc.">
              </div>
              <div>
                <label for="sf_asesor2">Nama Asesor BKD 2</label>
                <input class="in" id="sf_asesor2" name="nama_asesor_2" value="${esc(c.nama_asesor_2 || '')}" placeholder="Dr. ..., M.Kom.">
              </div>
            </div>
            <label for="sf_pimpinan" style="margin-top:8px">Pimpinan Fakultas / Dekan / Kaprodi</label>
            <input class="in" id="sf_pimpinan" name="nama_pimpinan" value="${esc(c.nama_pimpinan || '')}" placeholder="Dr. ..., S.T., M.T. (Dekan)">

            <label for="sf_foto">URL Foto Profil Peneliti (Opsional)</label>
            <div style="display:flex;gap:12px;align-items:center;margin-top:4px">
              <div class="hero-avatar" style="width:48px;height:48px;font-size:16px;overflow:hidden;flex-shrink:0;border:2px solid #3B82F6">
                ${c.foto ? `<img src="${esc(c.foto)}" alt="Foto profil" width="48" height="48" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block">` : esc((c.nama || 'D').slice(0, 2).toUpperCase())}
              </div>
              <div style="flex:1">
                <input class="in" id="sf_foto" name="foto" value="${esc(c.foto || '')}" placeholder="https://... URL direct link foto (.jpg, .png, Google Drive, ImgBB)">
              </div>
            </div>
            <small class="mu" style="display:block;margin-top:4px;font-size:11.5px">Masukkan link foto profil direct. Jika dikosongkan, avatar otomatis menampilkan inisial nama.</small>

            <h3 style="margin:20px 0 8px;font-size:14.5px;color:#1E40AF;border-bottom:1px solid var(--bd);padding-bottom:6px">Tautan Profil Akademik (Tampil di Header Publik Bila Diisi)</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px">
              <div>
                <label for="sf_sinta" style="margin-top:4px;font-size:12px">SINTA Kemdikbud</label>
                <input class="in" id="sf_sinta" name="link_sinta" value="${esc(sintaVal)}" placeholder="https://sinta.kemdikbud.go.id/authors/profile/...">
              </div>
              <div>
                <label for="sf_scholar" style="margin-top:4px;font-size:12px">Google Scholar</label>
                <input class="in" id="sf_scholar" name="link_scholar" value="${esc(scholarVal)}" placeholder="https://scholar.google.com/citations?user=...">
              </div>
              <div>
                <label for="sf_scopus" style="margin-top:4px;font-size:12px">Scopus ID</label>
                <input class="in" id="sf_scopus" name="link_scopus" value="${esc(scopusVal)}" placeholder="https://www.scopus.com/authid/detail.uri?authorId=...">
              </div>
            </div>
            
            <label for="sf_wa">Nomor WhatsApp Pengelola (Format 628xxx atau 08xxx)</label>
            <input class="in" id="sf_wa" name="wa" value="${esc(c.wa)}" placeholder="628123456789">
            <small class="mu" style="display:block;margin-top:2px;font-size:11.5px">Awalan 08... akan dinormalisasi otomatis ke standar internasional 628...</small>

            <h3 style="margin:22px 0 10px;font-size:14.5px;color:#1E40AF;border-bottom:1px solid var(--bd);padding-bottom:6px">Matriks Notifikasi WhatsApp (Fonnte Gateway)</h3>
            
            <div class="toggle-item">
              <div>
                <span class="toggle-item-title">Saklar Master WhatsApp</span>
                <span class="toggle-item-desc">Aktifkan seluruh pengiriman pesan otomatis ke nomor WhatsApp pengelola</span>
              </div>
              <label class="toggle-switch" for="sf_wa_master">
                <input type="checkbox" id="sf_wa_master" name="wa_master" aria-label="Saklar Master WhatsApp" ${c.wa_master !== false && String(c.wa_master) !== 'false' ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="toggle-item">
              <div>
                <span class="toggle-item-title">Pengingat Batas Respon &amp; Revisi Naskah</span>
                <span class="toggle-item-desc">Peringatan otomatis H-7 dan H-3 sebelum deadline revisi jurnal berakhir</span>
              </div>
              <label class="toggle-switch" for="sf_notif_revisi">
                <input type="checkbox" id="sf_notif_revisi" name="notif_revisi" aria-label="Pengingat Batas Respon dan Revisi Naskah" ${c.notif_revisi !== false && String(c.notif_revisi) !== 'false' ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="toggle-item">
              <div>
                <span class="toggle-item-title">Pengingat Call for Papers (CFP)</span>
                <span class="toggle-item-desc">Pengingat otomatis H-7, H-3, dan Hari-H batas waktu submit CFP</span>
              </div>
              <label class="toggle-switch" for="sf_notif_cfp">
                <input type="checkbox" id="sf_notif_cfp" name="notif_cfp" aria-label="Pengingat Call for Papers" ${c.notif_cfp !== false && String(c.notif_cfp) !== 'false' ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="toggle-item">
              <div>
                <span class="toggle-item-title">Peringatan Naskah Lama Tidak Dicek</span>
                <span class="toggle-item-desc">Notifikasi naskah yang melebihi ambang batas hari tanpa pembaruan status</span>
              </div>
              <label class="toggle-switch" for="sf_notif_cek">
                <input type="checkbox" id="sf_notif_cek" name="notif_cek" aria-label="Peringatan Naskah Lama Tidak Dicek" ${c.notif_cek !== false && String(c.notif_cek) !== 'false' ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="toggle-item">
              <div>
                <span class="toggle-item-title">Ucapan Selamat Naskah Diterima (Accepted)</span>
                <span class="toggle-item-desc">Kirim notifikasi seketika saat naskah dipindah ke status Accepted</span>
              </div>
              <label class="toggle-switch" for="sf_notif_accepted">
                <input type="checkbox" id="sf_notif_accepted" name="notif_accepted" aria-label="Ucapan Selamat Naskah Diterima" ${c.notif_accepted !== false && String(c.notif_accepted) !== 'false' ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="toggle-item">
              <div>
                <span class="toggle-item-title">Notifikasi Seluruh Perubahan Status Naskah</span>
                <span class="toggle-item-desc">Kirim notifikasi ringkas setiap kali status naskah diperbarui</span>
              </div>
              <label class="toggle-switch" for="sf_notif_status">
                <input type="checkbox" id="sf_notif_status" name="notif_status" aria-label="Notifikasi Seluruh Perubahan Status Naskah" ${c.notif_status === true || String(c.notif_status) === 'true' ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div class="toggle-item">
              <div>
                <span class="toggle-item-title">Ringkasan Progres Mingguan (Senin Pagi)</span>
                <span class="toggle-item-desc">Rekap jumlah artikel dalam proses review, Accepted, dan Draft setiap hari Senin</span>
              </div>
              <label class="toggle-switch" for="sf_notif_mingguan">
                <input type="checkbox" id="sf_notif_mingguan" name="notif_mingguan" aria-label="Ringkasan Progres Mingguan" ${c.notif_mingguan === true || String(c.notif_mingguan) === 'true' ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <label for="sf_ambang_cfp" style="margin-top:14px">Ambang Pengingat CFP (hari sebelum deadline, pisahkan koma)</label>
            <input class="in" id="sf_ambang_cfp" name="ambang_cfp" value="${esc(c.ambang_cfp)}" placeholder="7,3,0">
            
            <label for="sf_ambang_cek">Ambang "Lama Tidak Dicek" (hari)</label>
            <input class="in" id="sf_ambang_cek" type="number" name="ambang_cek" value="${esc(c.ambang_cek)}">
            
            <label for="sf_jam">Jam Pengiriman Pengingat Harian (WIB)</label>
            <input class="in" id="sf_jam" name="jam" value="${esc(c.jam)}" placeholder="08:00">
            
            <p class="mu" style="font-size:12.5px;margin:16px 0">Token Fonnte disimpan aman di Script Properties backend Google Apps Script. Menyimpan perubahan jam di atas akan otomatis menyelaraskan jadwal trigger harian.</p>
            
            <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">
              <button class="btn pri">Simpan Pengaturan</button>
              <button type="button" class="btn" data-a="testwa">Kirim Uji WhatsApp</button>
            </div>
          </form>
        </div>

        <div class="card">
          <h2 style="font-size:17px;margin-bottom:16px">Log Notifikasi Terakhir</h2>
          <div style="display:flex;flex-direction:column;gap:10px">
            ${(D.Log || []).slice(0, 10).map(l => `
              <div class="row" style="margin:0">
                <span class="mono" style="font-size:11.5px">${esc(fmtLogWaktu(l.waktu, D.Log))}</span>
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
      ['__sec', '1. Identitas Proyek Riset & Kontrak Penelitian'],
      ['judul', 'Judul Proyek Riset / Penelitian *', 'text'],
      ['bidang', 'Bidang / Disiplin Ilmu', 'text'],
      ['tanggal_mulai', 'Tanggal Mulai', 'date'],
      ['status', 'Status Pelaksanaan', 'select', [['Draft'], ['Berjalan'], ['Selesai']]],
      ['semester_bkd', 'Periode Semester BKD (Opsional)', 'select', 'sem'],
      ['sks_bkd', 'Beban SKS BKD (Opsional, default: 2 s.d 3)', 'text'],
      ['kolaborator', 'Anggota Tim / Kolaborator (pisahkan titik koma)', 'textarea'],
      ['__sec', '2. Tautan Berkas Laporan & Visibilitas'],
      ['link_berkas', 'Tautan Folder Google Drive Penelitian', 'url'],
      ['link_pdf', 'Tautan Dokumen PDF Laporan', 'url'],
      ['catatan', 'Catatan Internal Riset', 'textarea'],
      ['tampil_publik', 'Tampilkan di Portofolio Publik', 'check']
    ],
    Jurnal: [
      ['__sec', '1. Identitas & Akreditasi Jurnal'],
      ['nama', 'Nama Jurnal *', 'text'],
      ['link', 'Tautan Resmi Jurnal (OJS) *', 'url'],
      ['penerbit', 'Kampus / Institusi Penerbit', 'text'],
      ['jenis_kampus', 'Jenis Institusi', 'select', KAMPUS.map(x => [x])],
      ['rumpun_ilmu', 'Rumpun Ilmu', 'text'],
      ['akreditasi', 'Peringkat Akreditasi / Indeks', 'select', AKR.map(x => [x])],
      ['tipe_biaya', 'Tipe Biaya Publikasi', 'select', [['Gratis'], ['Berbayar (APC)']]],
      ['apc', 'Nominal APC (angka, mis. 500000)', 'text'],
      ['__sec', '2. Sampul & Ruang Lingkup (Focus & Scope)'],
      ['thumbnail', 'URL Thumbnail / Sampul Jurnal', 'url'],
      ['scope', 'Focus & Scope Jurnal', 'textarea'],
      ['catatan', 'Catatan Internal (tidak tampil publik)', 'textarea'],
      ['tampil_publik', 'Tampilkan di Katalog Publik', 'check']
    ],
    Submission: [
      ['__sec', '1. Data Inti Artikel & Perhitungan KUM BKD'],
      ['judul', 'Judul Naskah Artikel Ilmiah *', 'text'],
      ['id_jurnal', 'Jurnal Sasaran Tujuan', 'select', 'jur'],
      ['status', 'Status Tahapan Saat Ini', 'select', STAT.map(x => [x])],
      ['semester_bkd', 'Periode Semester BKD', 'select', 'sem'],
      ['peran_penulis', 'Peran / Posisi Penulis (KUM BKD)', 'select', PERAN_PENULIS],
      ['total_penulis', 'Jumlah Total Penulis', 'number'],
      ['sks_bkd', 'Beban SKS BKD (Kosongkan agar otomatis)', 'text'],
      ['id_penelitian', 'Proyek Riset Induk (Opsional, bila bagian dari riset)', 'select', 'pen'],
      ['__kum_preview', ''],
      ['__sec', '2. Tanggal Progres & Bukti Publikasi (Opsional)'],
      ['tgl_submit', 'Tanggal Submit ke Jurnal', 'date'],
      ['tgl_cek', 'Tanggal Cek Status Terakhir', 'date'],
      ['deadline_respon', 'Batas Waktu Revisi Reviewer', 'date'],
      ['tahun_terbit', 'Tahun Terbit (Jika sudah terbit)', 'text'],
      ['doi', 'Nomor DOI Artikel', 'text'],
      ['link_final', 'Tautan Artikel Terbit (Published)', 'url'],
      ['link_feedback', 'Tautan Catatan / Feedback Reviewer', 'url'],
      ['__sec', '3. Kredensial Akun OJS & Catatan (Opsional, Rahasia)'],
      ['akun_ojs', 'Username Akun OJS Jurnal', 'text'],
      ['password_ojs', 'Password Akun OJS Jurnal', 'text'],
      ['catatan', 'Catatan Internal Penulis', 'textarea'],
      ['tampil_publik', 'Tampilkan di Portofolio Publik', 'check']
    ],
    CFP: [
      ['nama', 'Nama CFP / Konferensi / Edisi Jurnal *', 'text'],
      ['link', 'Tautan Informasi CFP', 'url'],
      ['id_jurnal', 'Jurnal Terkait (Opsional)', 'select', 'jur'],
      ['deadline', 'Batas Akhir Submit *', 'date'],
      ['status', 'Status Persiapan', 'select', [['Tertarik'], ['Disiapkan'], ['Sudah Submit'], ['Ditutup']]],
      ['scope', 'Scope & Topik Bahasan', 'textarea'],
      ['catatan', 'Catatan Tambahan', 'textarea']
    ]
  };

  const opts = (f, v) => {
    let o = f[3];
    if (o === 'pen') o = [['', '- Artikel Mandiri (Tanpa Proyek Riset Induk) -'], ...S.D.Penelitian.map(p => [p.id, p.judul])];
    else if (o === 'jur') o = [['', '- Pilih Jurnal Sasaran -'], ...S.D.Jurnal.map(j => [j.id, j.nama])];
    else if (o === 'sem') o = getSemOptions();
    else if (Array.isArray(o)) {
      o = o.slice();
    }
    if (v && Array.isArray(o) && !o.some(([a]) => a === v)) {
      o = o.slice();
      o.unshift([v, v]);
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
      <div style="font-weight:700;margin-bottom:4px;color:#1E40AF;display:flex;align-items:center;gap:6px">${SVG.chart} <span>Estimasi Otomatis Angka Kredit (KUM) &amp; SKS BKD:</span></div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;font-size:12px">
        <span>Kategori: <b>${esc(k.labelKat)}</b> (KUM Maks: ${k.kumMaks})</span>
        <span>Porsi: <b>${esc(k.porsiTxt)}</b></span>
        <span>Perolehan KUM: <b style="color:#1E3A8A;font-size:14px">${k.kumDidapat.toFixed(2)} KUM</b></span>
        <span>Estimasi SKS BKD: <b style="color:#047857">${k.sks} SKS</b></span>
      </div>
    `;
  }

  function updatePenelitianRumpunUI() {
    const f = $('#mf');
    if (!f || f.dataset.e !== 'Penelitian') return;
    const bidangEl = f.querySelector('[name=bidang]');
    const kolabEl = f.querySelector('[name=kolaborator]');
    const rumpunBox = $('#pen-rumpun-picker');
    const kolabBox = $('#pen-kolab-picker');
    const curBidang = bidangEl ? bidangEl.value : '';
    const matched = findRumpunByBidang(curBidang);
    const selectedKolabs = parseKolabList(kolabEl ? kolabEl.value : '');
    const leadName = cfg().nama || PENELITI_UTAMA;

    if (rumpunBox) {
      rumpunBox.innerHTML = `
        <div style="font-weight:700;color:var(--pri);font-size:12px">Pilih Rumpun Keilmuan Prodi PBA (Klik 1x untuk mengisi):</div>
        <div class="chip-list">
          ${RUMPUN_PAKAR.map(r => `
            <button type="button" class="pick-chip ${matched && matched.no === r.no ? 'on' : ''}" data-a="pickRumpun" data-val="${esc(r.nama)}">
              <span>${r.no}. ${esc(r.nama)}</span>
              <span class="pakar-tag">${r.intiFajri ? 'Inti' : 'Lintas'}</span>
            </button>
          `).join('')}
        </div>
        ${matched ? `
          <div style="margin-top:10px;padding-top:8px;border-top:1px dashed var(--bd)">
            <div style="font-size:11.5px;color:var(--tx-sec)"><b>Cakupan Materi Rumpun #${matched.no}:</b> ${esc(matched.materi)}</div>
            <div class="chip-list">
              ${matched.topik.map(t => {
                const topicVal = `${matched.nama} (${t})`;
                return `<button type="button" class="pick-chip ${curBidang.toLowerCase().includes(t.toLowerCase()) ? 'on' : ''}" data-a="pickMateriTopic" data-val="${esc(topicVal)}" style="font-size:11px;padding:3px 9px">${esc(t)}</button>`;
              }).join('')}
            </div>
          </div>
        ` : ''}
      `;
    }

    if (kolabBox) {
      const renderChip = name => {
        const isOn = selectedKolabs.some(x => x.toLowerCase() === name.toLowerCase());
        const isPakarUtama = matched && matched.pakarUtama.includes(name);
        return `
          <button type="button" class="pick-chip ${isOn ? 'on' : ''}" data-a="toggleKolab" data-name="${esc(name)}">
            <span>${esc(name)}</span>
            ${isPakarUtama ? '<span class="pakar-tag">Pakar Utama</span>' : ''}
          </button>
        `;
      };
      const otherLecturers = matched ? ALL_KOLAB_PAKAR.filter(n => !matched.kolaborator.includes(n)) : [];
      kolabBox.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
          <div style="font-size:12px"><b style="color:var(--pri)">Peneliti Utama:</b> ${esc(leadName)}</div>
          ${selectedKolabs.length ? `<button type="button" class="btn sm" data-a="clearKolab" style="min-height:26px;padding:2px 8px;font-size:11px">Set Riset Mandiri</button>` : '<span class="bd sl" style="font-size:10.5px">Mode Mandiri</span>'}
        </div>
        <div style="margin-top:8px">
          <div style="font-weight:700;font-size:11.5px;color:var(--tx-sec)">
            ${matched ? `Rekomendasi Kolaborator Pakar Se-Rumpun (${esc(matched.nama)}):` : 'Pilih Dosen Pakar sebagai Kolaborator:'}
          </div>
          <div class="chip-list">
            ${(matched ? matched.kolaborator : ALL_KOLAB_PAKAR).map(renderChip).join('')}
          </div>
        </div>
        ${otherLecturers.length ? `
          <div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--bd)">
            <div style="font-weight:600;font-size:11px;color:var(--mu)">Kolaborator Lintas Rumpun Lainnya:</div>
            <div class="chip-list">${otherLecturers.map(renderChip).join('')}</div>
          </div>
        ` : ''}
      `;
    }
  }

  function updatePenelitianDrivePreview() {
    const f = $('#mf');
    if (!f || f.dataset.e !== 'Penelitian') return;
    const box = $('#pen-inline-preview');
    if (!box) return;
    const pdfUrl = f.querySelector('[name=link_pdf]')?.value || '';
    const folderUrl = f.querySelector('[name=link_berkas]')?.value || '';
    const judul = f.querySelector('[name=judul]')?.value || 'Dokumen Riset';
    const embedUrl = toPreviewEmbedUrl(pdfUrl);
    if (!embedUrl) {
      box.innerHTML = '';
      return;
    }
    box.innerHTML = `
      <div class="live-pdf-wrap">
        <div class="live-pdf-head">
          <span style="font-weight:700;display:inline-flex;align-items:center;gap:6px">${SVG.eye} <span>Live View Dokumen Laporan</span></span>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button type="button" class="btn sm" data-a="previewDoc" data-url="${esc(pdfUrl)}" data-folder="${esc(folderUrl)}" data-title="${esc(judul)}" style="min-height:26px;padding:2px 8px;font-size:11px;background:#FFF">${SVG.ext} Layar Penuh</button>
            <a class="btn sm" href="${esc(pdfUrl)}" target="_blank" rel="noopener" style="min-height:26px;padding:2px 8px;font-size:11px;background:#FFF">${SVG.file} Buka di Drive</a>
          </div>
        </div>
        <iframe class="live-pdf-frame" src="${esc(embedUrl)}" title="Live View ${esc(judul)}" loading="lazy"></iframe>
      </div>
    `;
  }

  function uploadPenelitianFileToDrive(file) {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      return toast('Ukuran berkas maksimal 15 MB untuk unggahan langsung ke Google Drive.', true);
    }
    const btn = $('#btn-drive-upload');
    const st = $('#drive-upload-status');
    const judulEl = $('#mf [name=judul]');
    const folderEl = $('#mf [name=link_berkas]');
    const pdfEl = $('#mf [name=link_pdf]');

    if (btn) { btn.disabled = true; btn.textContent = 'Mengunggah…'; }
    if (st) st.textContent = `Mengunggah "${file.name}" ke Google Drive SIMPEN…`;

    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const dataUrl = String(ev.target?.result || '');
        const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
        if (!base64) throw new Error('Berkas kosong atau gagal dibaca.');
        const r = await API.post('uploadDrive', {
          fileName: file.name,
          mimeType: file.type || 'application/pdf',
          base64,
          judul: judulEl?.value || 'Proyek Riset',
          existingFolderUrl: folderEl?.value || ''
        });
        if (!r || !r.success) {
          const msg = /action tidak dikenal/i.test(r?.message || '')
            ? 'Endpoint uploadDrive belum aktif di backend Google Apps Script. Salin backend/Kode.js terbaru lalu Deploy ulang versi Web App.'
            : (r?.message || 'Gagal mengunggah berkas ke Google Drive.');
          if (st) st.textContent = msg;
          return toast(msg, true);
        }
        if (pdfEl && r.fileUrl) pdfEl.value = r.fileUrl;
        if (folderEl && r.folderUrl && !folderEl.value) folderEl.value = r.folderUrl;
        if (st) st.textContent = `Berhasil disimpan ke Google Drive (${r.fileName}). Klik "Simpan Proyek Riset" untuk menyimpan tautan.`;
        updatePenelitianDrivePreview();
        toast('Berkas berhasil diunggah ke Drive & siap Live View');
      } catch (err) {
        const msg = err?.message || 'Gagal memproses berkas.';
        if (st) st.textContent = msg;
        toast(msg, true);
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = `${SVG.upload} Upload Berkas ke Drive`; }
      }
    };
    reader.onerror = () => {
      if (btn) { btn.disabled = false; btn.innerHTML = `${SVG.upload} Upload Berkas ke Drive`; }
      if (st) st.textContent = 'Gagal membaca berkas lokal.';
      toast('Gagal membaca berkas lokal.', true);
    };
    reader.readAsDataURL(file);
  }

  function openDocPreviewModal(url, title, folderUrl) {
    const embedUrl = toPreviewEmbedUrl(url);
    if (!embedUrl) {
      if (url && /^https?:\/\//i.test(url)) window.open(url, '_blank', 'noopener');
      return;
    }
    openModal(`
      <div class="ov">
        <div class="mod" role="dialog" aria-modal="true" aria-labelledby="doc-preview-title" style="max-width:860px;padding:20px 24px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px">
            <div style="min-width:0">
              <h2 id="doc-preview-title" style="font-size:16.5px">${esc(title || 'Live View Dokumen Riset')}</h2>
              <p class="mu" style="font-size:12px;margin:2px 0 0">Pratinjau langsung berkas yang tersimpan pada Google Drive terintegrasi.</p>
            </div>
            <button type="button" class="btn sm" data-a="mclose" aria-label="Tutup pratinjau dokumen" style="border:none;background:transparent;font-size:18px">✕</button>
          </div>
          <div class="live-pdf-wrap" style="margin-top:0">
            <iframe class="live-pdf-frame lg" src="${esc(embedUrl)}" title="Live View ${esc(title || 'Dokumen')}"></iframe>
          </div>
          <div class="act" style="margin-top:14px">
            ${folderUrl ? `<a class="btn" href="${esc(folderUrl)}" target="_blank" rel="noopener">${SVG.folder} Buka Folder Drive</a>` : ''}
            ${url ? `<a class="btn" href="${esc(url)}" target="_blank" rel="noopener">${SVG.ext} Buka Tab Baru</a>` : ''}
            <button type="button" class="btn pri" data-a="mclose">Tutup</button>
          </div>
        </div>
      </div>
    `);
  }

  const FULL_WIDTH_FIELDS = new Set([
    'judul', 'nama', 'link', 'thumbnail', 'bidang', 'kolaborator', 'scope', 'catatan',
    'id_penelitian', 'id_jurnal', 'link_berkas', 'link_pdf', 'link_feedback', 'link_final', 'tampil_publik'
  ]);

  function openForm(ent, rec) {
    rec = rec || {};
    if (ent === 'Jurnal') rec = { jenis_kampus: 'PTN', ...rec, akreditasi: akr(rec) };
    if (ent === 'Submission' && !rec.peran_penulis) rec = { peran_penulis: 'Penulis Pertama & Korespondensi', total_penulis: 1, ...rec };
    const entLabel = ENT_LABEL[ent] || ent;
    openModal(`
      <div class="ov">
        <div class="mod" role="dialog" aria-modal="true" aria-labelledby="mf-title">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">
            <div>
              <h2 id="mf-title">${rec.id ? 'Ubah' : 'Tambah'} ${entLabel}</h2>
              <p class="mu" style="font-size:13px;margin:2px 0 0">Lengkapi data inti di bawah ini. Kolom bertanda (*) wajib diisi.</p>
            </div>
            <button type="button" class="btn sm" data-a="mclose" aria-label="Tutup form" style="border:none;background:transparent;font-size:18px">✕</button>
          </div>
          <form id="mf" data-e="${ent}" data-id="${esc(rec.id || '')}">
            <div class="form-grid">
              ${FIELDS[ent].map(f => {
                if (f[0] === '__sec') {
                  return `<div class="form-sec-head">${esc(f[1])}</div>`;
                }
                if (f[0] === '__kum_preview') {
                  return `<div id="sub-kum-preview" class="form-full card" style="padding:10px 14px;background:#F0FDF4;border:1px solid #BBF7D0;font-size:12px;color:#166534"></div>`;
                }
                const fid = `mf_${f[0]}`;
                const isFull = FULL_WIDTH_FIELDS.has(f[0]);
                const wrapCls = isFull ? 'form-field form-full' : 'form-field';
                const v = rec[f[0]] ?? '', n = `id="${fid}" name="${f[0]}"`;
                if (f[2] === 'check') {
                  return `<div class="${wrapCls}"><label for="${fid}" style="font-weight:600;display:flex;align-items:center;gap:8px;margin-top:6px;cursor:pointer"><input type="checkbox" ${n} ${rec[f[0]] ? 'checked' : ''}> ${f[1]}</label></div>`;
                }
                let ctl = f[2] === 'textarea' ? `<textarea ${n}>${esc(v)}</textarea>` : f[2] === 'select' ? `<select ${n}>${opts(f, v)}</select>` : `<input class="in" ${n} type="${f[2]}" value="${esc(v)}">`;
                if (ent === 'Penelitian' && f[0] === 'bidang') {
                  ctl += `<div id="pen-rumpun-picker" class="rumpun-box"></div>`;
                }
                if (ent === 'Penelitian' && f[0] === 'kolaborator') {
                  ctl += `<div id="pen-kolab-picker" class="rumpun-box"></div>`;
                }
                if (ent === 'Penelitian' && f[0] === 'link_pdf') {
                  ctl += `
                    <div class="rumpun-box" style="margin-top:8px">
                      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
                        <div>
                          <b style="color:var(--pri);font-size:12px;display:block">Upload Berkas Langsung ke Google Drive SIMPEN</b>
                          <span class="mu" id="drive-upload-status" style="font-size:11.5px">Tersimpan otomatis di folder 📂 Uploads (satu lokasi dengan Database Spreadsheet) &amp; mengisi tautan Folder + PDF.</span>
                        </div>
                        <div>
                          <input type="file" id="pen_drive_file" accept=".pdf,.doc,.docx" style="display:none">
                          <button type="button" class="btn pri sm" id="btn-drive-upload" data-a="pickDriveFile">${SVG.upload} Upload Berkas ke Drive</button>
                        </div>
                      </div>
                      <div id="pen-inline-preview"></div>
                    </div>
                  `;
                }
                if (ent === 'Jurnal' && f[0] === 'rumpun_ilmu') {
                  ctl += `<div class="chip-list" style="margin-top:6px">${RUMPUN_PAKAR.map(r => `<button type="button" class="pick-chip" data-a="pickJurRumpun" data-val="${esc(r.nama)}" style="font-size:11px;padding:3px 9px">${r.no}. ${esc(r.nama)}</button>`).join('')}</div>`;
                }
                if (ent === 'Jurnal' && f[0] === 'nama') {
                  ctl += `<div id="jurnal-dup-notice" class="dup-notice"></div>`;
                }
                if (ent === 'Submission' && f[0] === 'judul') {
                  ctl += `<div id="sub-dup-notice" class="dup-notice"></div>`;
                }
                if (ent === 'Jurnal' && f[0] === 'thumbnail') {
                  ctl += `
                    <div style="display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap">
                      <button type="button" class="btn sm" data-a="thumb">${SVG.search} Ambil Thumbnail Otomatis</button>
                      <span class="mu" style="font-size:11.5px">atau tempel direct link cover (.jpg / .png / Google Drive)</span>
                    </div>
                    <div class="mu" style="font-size:11.5px;margin-top:6px;line-height:1.4">
                      <b>Rekomendasi Cover Buku:</b> Gunakan gambar cover edisi/isu (rasio potret A4/buku). Bisa salin direct URL dari web jurnal, upload ke Postimages.org, ImgBB.com, atau Google Drive (akses: 'Anyone with link').
                    </div>
                  `;
                }
                return `<div class="${wrapCls}"><label for="${fid}">${f[1]}</label>${ctl}</div>`;
              }).join('')}
            </div>
            <div class="act">
              <button type="button" class="btn" data-a="mclose">Batal</button>
              <button class="btn pri">Simpan ${entLabel}</button>
            </div>
          </form>
        </div>
      </div>
    `);
    if (ent === 'Submission') {
      setTimeout(updateSubmissionKumInForm, 30);
    }
    if (ent === 'Penelitian') {
      setTimeout(() => {
        updatePenelitianRumpunUI();
        updatePenelitianDrivePreview();
      }, 20);
    }
  }

  // ============ DATA OPS (Optimistic UI & Cache Persistence) ============
  async function upsert(ent, rec) {
    const L = S.D[ent] = S.D[ent] || [], i = L.findIndex(x => x.id === rec.id), old = i < 0 ? null : L[i];
    i < 0 ? L.push(rec) : (L[i] = rec);
    if (ent === 'Submission' && old && old.status !== rec.status) {
      (S.D.StatusLog = S.D.StatusLog || []).unshift({ id_submission: rec.id, status_lama: old.status, status_baru: rec.status, waktu: nowLogWaktu() });
    }
    // Optimistic persistence ke local cache (gas-instant-ux-pro)
    Store.set('boot', { h: hashData(S.D), t: Date.now(), data: S.D });
    draw();
    const r = await API.post('upsert', { entity: ent, record: rec });
    if (!r.success) {
      toast(r.message || 'Gagal menyimpan ke server; memulihkan data.', true);
      await loadAdmin();
    } else {
      Store.set('boot', { h: hashData(S.D), t: Date.now(), data: S.D });
    }
  }

  async function remove(ent, id) {
    const prev = (S.D[ent] || []).slice();
    S.D[ent] = S.D[ent].filter(x => x.id !== id);
    Store.set('boot', { h: hashData(S.D), t: Date.now(), data: S.D });
    draw();
    const r = await API.post('delete', { entity: ent, id });
    if (!r.success) {
      S.D[ent] = prev;
      Store.set('boot', { h: hashData(S.D), t: Date.now(), data: S.D });
      draw();
      toast(r.message || 'Gagal menghapus data dari server', true);
    } else {
      Store.set('boot', { h: hashData(S.D), t: Date.now(), data: S.D });
      toast('Data berhasil dihapus');
    }
  }

  function csv(ent) {
    const L = S.D[ent] || []; if (!L.length) return toast('Tidak ada data untuk diekspor', true);
    const hidden = new Set(['catatan', 'link_feedback', 'password_ojs', 'akun_ojs']);
    const k = Object.keys(L[0]).filter(x => !hidden.has(x));
    const t = [k.join(','), ...L.map(r => k.map(x => '"' + String(r[x] ?? '').replace(/"/g, '""') + '"').join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + t], { type: 'text/csv;charset=utf-8' }));
    a.download = `SIMPEN-${ent}-${today()}.csv`;
    a.click();
    toast(`Ekspor ${L.length} baris ${ENT_LABEL[ent] || ent} selesai (kolom rahasia dikecualikan)`);
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
    const missingProofs = [];
    subs.forEach(s => {
      if (!s.link_final && !s.doi) {
        missingProofs.push(`Artikel: "${String(s.judul || '').slice(0, 48)}${String(s.judul || '').length > 48 ? '...' : ''}" (belum ada DOI / link terbit)`);
      }
    });
    if (incPen) {
      pens.forEach(p => {
        if (!p.link_pdf && !p.link_berkas) {
          missingProofs.push(`Riset: "${String(p.judul || '').slice(0, 48)}${String(p.judul || '').length > 48 ? '...' : ''}" (belum ada berkas PDF/Drive)`);
        }
      });
    }
    const totalChecked = subs.length + (incPen ? pens.length : 0);
    const proofBoxHtml = totalChecked === 0 ? '' : (
      missingProofs.length === 0
        ? `<div class="bkd-check-ok"><b>Kelengkapan Bukti Fisik:</b> Seluruh ${totalChecked} item pada filter ini sudah dilengkapi tautan bukti/DOI untuk Asesor BKD.</div>`
        : `<div class="bkd-check-warn"><b>Pemeriksa Bukti Fisik (${missingProofs.length} item belum lengkap):</b><ul style="margin:4px 0 0 18px;padding:0">${missingProofs.slice(0, 3).map(m => `<li>${esc(m)}</li>`).join('')}${missingProofs.length > 3 ? `<li>dan ${missingProofs.length - 3} item lainnya…</li>` : ''}</ul></div>`
    );

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
        <div style="margin-top:8px;font-size:12px;line-height:1.4;color:${grandTotalSks >= 2 ? '#065F46' : '#92400E'};display:flex;align-items:center;gap:6px">
          ${grandTotalSks >= 2 ? `${SVG.check} <span><b>Memenuhi Rubrik BKD:</b> Beban kerja penelitian memenuhi batas minimal (standar: 2 s.d 4 SKS per semester).</span>` : `${SVG.alert} <span><b>Perhatian:</b> Total SKS penelitian di bawah 2 SKS. Pastikan naskah/laporan riset pada semester ini sudah dicatat.</span>`}
        </div>
        ${proofBoxHtml}
      `;
    }
  }

  function openBkdModal() {
    const D = S.D; if (!D) return;
    const c = cfg();
    const allSemesters = buildSemesterList();

    openModal(`
      <div class="ov">
        <div class="mod" role="dialog" aria-modal="true" aria-labelledby="bkd-modal-title" style="max-width:580px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
            <div>
              <h2 id="bkd-modal-title" style="font-size:18px;color:#1E3A8A">Laporan BKD &amp; Rekapitulasi KUM</h2>
              <p class="mu" style="font-size:12.5px;margin:2px 0 0">Cetak dokumen resmi pelaporan Beban Kerja Dosen untuk disetorkan ke institusi &amp; Asesor BKD.</p>
            </div>
            <button type="button" class="btn sm" data-a="mclose" aria-label="Tutup modal BKD" style="border:none;background:transparent;font-size:18px">✕</button>
          </div>

          <div style="background:#F8FAFC;border:1px solid #E2E8F0;padding:12px 14px;border-radius:8px;margin:14px 0;font-size:12.5px">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
              <div><b>Nama Dosen:</b> ${esc(c.nama || 'Belum diisi')}</div>
              <span class="bd bl">${esc(c.jabatan_fungsional || 'Lektor')}</span>
            </div>
            <div class="mu" style="margin-top:6px;display:flex;gap:12px;flex-wrap:wrap;font-size:12px">
              <span>NIDN: <b>${esc(c.nidn || '-')}</b></span>
              <span>NIP: <b>${esc(c.nip || '-')}</b></span>
              <span>Prodi: <b>${esc(c.prodi || '-')}</b></span>
              <span>Unit: <b>${esc(c.fakultas || c.afiliasi || '-')}</b></span>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr;gap:10px">
            <div>
              <label for="bkd_sem" style="font-weight:700">Periode Semester BKD</label>
              <select id="bkd_sem" class="in" style="font-weight:600">
                <option value="">- Semua Periode Semester -</option>
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
              <label for="bkd_inc_pen" style="font-weight:600;display:flex;align-items:center;gap:8px;margin-top:4px;cursor:pointer">
                <input type="checkbox" id="bkd_inc_pen" checked> Sertakan tabel Proyek Riset (Laporan Penelitian)
              </label>
              <small class="mu" style="display:block;margin-top:2px;font-size:11.5px">Hilangkan centang jika Anda hanya melaporkan luaran Artikel Jurnal agar beban SKS BKD tidak terhitung ganda.</small>
            </div>
          </div>

          <div id="bkd-preview-stats" style="margin-top:14px;padding:12px 14px;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px"></div>

          <div class="act" style="margin-top:20px;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">
            <button type="button" class="btn" data-a="mclose">Tutup</button>
            <button type="button" class="btn" data-a="doBkdCsv">
              ${SVG.download} Unduh Excel / CSV
            </button>
            <button type="button" class="btn pri" data-a="doBkdPrint">
              ${SVG.print} Cetak / PDF Resmi
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
          <td>${esc(j.nama || '-')}<br><small style="color:#2563EB;font-weight:600">${esc(k.labelKat)}</small></td>
          <td style="text-align:center">${esc(s.peran_penulis || 'Penulis Pertama')}</td>
          <td style="text-align:center">${esc(s.total_penulis || 1)}</td>
          <td style="text-align:center">${k.kumMaks}</td>
          <td style="text-align:center">${esc(k.porsiTxt)}</td>
          <td style="text-align:center;font-weight:bold;color:#1E3A8A">${k.kumDidapat.toFixed(2)}</td>
          <td style="text-align:center;font-weight:bold;color:#047857">${k.sks.toFixed(2)}</td>
          <td style="word-break:break-all;font-size:11px">
            ${bukti ? `<a href="${esc(bukti)}" target="_blank" rel="noopener" style="color:#1D4ED8;text-decoration:none">${esc(s.doi || 'Lihat Artikel Terbit')}</a>` : '<span style="color:#94A3B8">-</span>'}
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
          <td>${esc(p.bidang || '-')}</td>
          <td>${esc(p.kolaborator || 'Mandiri')}</td>
          <td style="text-align:center">${fmt(p.tanggal_mulai)}</td>
          <td style="text-align:center"><span style="padding:2px 8px;border-radius:4px;background:#F1F5F9;font-weight:bold;font-size:11px">${esc(p.status)}</span></td>
          <td style="text-align:center;font-weight:bold;color:#047857">${sks.toFixed(2)}</td>
          <td style="word-break:break-all;font-size:11px">
            ${bukti ? `<a href="${esc(bukti)}" target="_blank" rel="noopener" style="color:#1D4ED8;text-decoration:none">Tautan Bukti Berkas</a>` : '<span style="color:#94A3B8">-</span>'}
          </td>
        </tr>
      `;
    }).join('');

    const grandTotalSks = totSksPub + (incPen ? totSksPen : 0);
    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const semClean = String(sem || 'ALL').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'ALL';
    const preSigned = (D.DocCodes && D.DocCodes[semClean]) || '';
    const docCode = preSigned || ('MENUNGGU-VERIFIKASI-' + semClean);

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Laporan BKD: ${esc(c.nama || 'Dosen')} (${esc(sem || 'Semua Periode')})</title>
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
    <button class="btn-print" onclick="window.print()">Cetak / Simpan PDF</button>
  </div>

  <div class="kop">
    <h1>${esc(c.afiliasi || 'PERGURUAN TINGGI')}</h1>
    <h2>LAPORAN KINERJA DOSEN (BKD): BIDANG PENELITIAN &amp; PUBLIKASI KARYA ILMIAH</h2>
    <p>Periode Evaluasi: <b>${esc(sem ? sem.toUpperCase() : 'SEMUA PERIODE SEMESTER')}</b> · Rubrik Standar PO PAK &amp; BKD Dikti</p>
  </div>

  <div class="meta-box">
    <div><b>Nama Dosen:</b> ${esc(c.nama || '-')}</div>
    <div><b>Jabatan Fungsional:</b> ${esc(c.jabatan_fungsional || 'Lektor')}</div>
    <div><b>NIDN / NIDK:</b> ${esc(c.nidn || '-')}</div>
    <div><b>Program Studi:</b> ${esc(c.prodi || '-')}</div>
    <div><b>NIP / NPK:</b> ${esc(c.nip || '-')}</div>
    <div><b>Fakultas / Unit:</b> ${esc(c.fakultas || c.afiliasi || '-')}</div>
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

    <div style="margin-top:28px;border:1.5px solid #1E3A8A;border-radius:8px;padding:12px 16px;background:#F8FAFC;display:flex;align-items:center;gap:16px;page-break-inside:avoid">
      <img id="doc-qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=95x95&margin=1&data=${encodeURIComponent(location.origin + location.pathname + '#verify=' + docCode)}" alt="QR Code Verifikasi Dokumen SIMPEN" width="85" height="85" style="width:85px;height:85px;border-radius:4px;border:1px solid #CBD5E1">
      <div style="font-size:11px;line-height:1.45;flex:1">
        <b style="color:#1E3A8A;font-size:12px">LEMBAR KENDALI INTERNAL &amp; VERIFIKASI REKAPITULASI (SIMPEN)</b><br>
        Dokumen rekapitulasi kinerja penelitian dan publikasi ini diterbitkan dari pangkalan data <b>SIMPEN</b> untuk keperluan pelaporan dan evaluasi Beban Kerja Dosen (BKD).<br>
        Kode Verifikasi: <code id="doc-code-text" style="background:#E2E8F0;padding:2px 6px;border-radius:3px;font-weight:bold;color:#1E3A8A">${esc(docCode)}</code><br>
        Pindai QR Code di samping menggunakan kamera smartphone untuk memeriksa status pencatatan dokumen pada sistem SIMPEN.
      </div>
    </div>
  </div>
</body>
</html>`;

    win.document.write(html);
    win.document.close();

    if (!preSigned) {
      API.post('signDoc', { semester: sem }).then(r => {
        if (r && r.success && r.code && !win.closed) {
          D.DocCodes = D.DocCodes || {};
          D.DocCodes[semClean] = r.code;
          const codeEl = win.document.getElementById('doc-code-text');
          const qrEl = win.document.getElementById('doc-qr-img');
          if (codeEl) codeEl.textContent = r.code;
          if (qrEl) qrEl.src = 'https://api.qrserver.com/v1/create-qr-code/?size=95x95&margin=1&data=' + encodeURIComponent(location.origin + location.pathname + '#verify=' + r.code);
        }
      }).catch(() => {});
    }
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
        s.semester_bkd || sem || '-',
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
          p.semester_bkd || sem || '-',
          'Penelitian / Riset',
          p.judul || '',
          p.bidang || '',
          'Laporan Penelitian',
          p.kolaborator || 'Mandiri',
          1,
          '-',
          '-',
          '-',
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
        <div class="mod mobile-sheet" role="dialog" aria-modal="true" aria-label="Menu Lainnya dan Fitur Dosen" style="border-bottom-left-radius:0;border-bottom-right-radius:0;max-width:100%;width:100%;margin:0;padding:20px 18px 28px;animation:slideUp 0.25s ease-out">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--bd)">
            <b style="font-size:16px;color:#0F172A">Menu Lainnya &amp; Fitur Dosen</b>
            <button type="button" class="btn sm" data-a="mclose" aria-label="Tutup menu" style="border:none;background:transparent;font-size:18px">✕</button>
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
    const active = document.activeElement;
    const f = active && active.id, posStart = active && active.selectionStart, posEnd = active && active.selectionEnd;
    $('#app').innerHTML = v;
    if (f && ['q', 'jq'].includes(f)) {
      const e = $('#' + f);
      if (e) {
        e.focus();
        try { e.setSelectionRange(posStart, posEnd ?? posStart); } catch (_) {}
      }
    }
  }

  // ============ SWR DATA FETCHING (gas-instant-ux-pro) ============
  async function loadPub() {
    S.pubErr = '';
    const c = Store.get('pub');
    if (c && !S.P) {
      S.P = c.data;
      draw();
    }
    const r = await API.get('getPublic');
    if (r.success) {
      S.pubErr = '';
      const h = hashData(r.data);
      if (!c || c.h !== h) {
        S.P = r.data;
        Store.set('pub', { h, t: Date.now(), data: r.data });
        draw();
      }
    } else if (!c && !S.P) {
      S.pubErr = r.message || 'Gagal memuat data publik dari server.';
      toast(S.pubErr, true);
      draw();
    }
  }

  async function loadAdmin() {
    const c = Store.get('boot');
    if (c && !S.D) {
      S.D = c.data;
      draw();
    }
    const r = await API.post('bootstrap');
    if (!r.success) {
      API.setTok(null);
      Store.del('boot');
      S.view = 'login';
      toast(r.message || 'Sesi berakhir. Silakan masuk kembali.', true);
      draw();
    } else {
      const h = hashData(r.data);
      if (!c || c.h !== h) {
        S.D = r.data;
        Store.set('boot', { h, t: Date.now(), data: r.data });
        draw();
      }
    }
  }

  // Dialog Konfirmasi Hapus Kustom (ui-ux-pro-max)
  function openConfirmDelete(ent, id, title = 'data ini') {
    openModal(`
      <div class="ov">
        <div class="confirm-box" role="dialog" aria-modal="true" aria-labelledby="confirm-del-title">
          <div class="confirm-icon-wrap" style="background:#FEF2F2;color:#EF4444">
            ${SVG.trash}
          </div>
          <h2 id="confirm-del-title" style="font-size:16px;margin-bottom:8px">Hapus Data Permanen?</h2>
          <p class="mu" style="font-size:13px;line-height:1.5;margin-bottom:20px">Apakah Anda yakin ingin menghapus <b>${esc(title)}</b>? Tindakan ini tidak dapat dibatalkan.</p>
          <div style="display:flex;gap:10px;justify-content:center">
            <button type="button" class="btn" data-a="mclose" style="flex:1">Batal</button>
            <button type="button" class="btn dng" data-a="doConfirmDel" data-e="${esc(ent)}" data-id="${esc(id)}" style="flex:1">Ya, Hapus</button>
          </div>
        </div>
      </div>
    `);
  }

  // Modal Verifikasi Keaslian Dokumen Resmi BKD berbasis HMAC Server (gas-doc-engine)
  async function openVerifyModal(docCode) {
    const cleanCode = String(docCode || '').trim().toUpperCase();
    openModal(`
      <div class="ov">
        <div class="confirm-box" role="dialog" aria-modal="true" aria-labelledby="verify-title" style="max-width:480px;text-align:center">
          <h2 id="verify-title" style="font-size:16px;margin-bottom:8px">Memeriksa Kode Dokumen BKD…</h2>
          <div class="verify-code-pill">${esc(cleanCode || '-')}</div>
          <p class="mu" style="font-size:13px;margin:16px 0">Menghubungi server SIMPEN untuk memvalidasi tanda tangan kriptografis dokumen…</p>
          <button type="button" class="btn" style="width:100%" data-a="mclose">Batal</button>
        </div>
      </div>
    `);

    const r = await API.get('verifyDoc', { code: cleanCode });
    if (!$('#modal') || $('#modal').innerHTML === '') return;

    const d = (r && r.success && r.data) ? r.data : null;
    const isValid = Boolean(d && d.valid === true);

    if (!isValid) {
      const reason = (d && d.status) || (r && r.message) || 'Kode dokumen tidak terdaftar atau tanda tangan elektronik tidak cocok.';
      openModal(`
        <div class="ov">
          <div class="confirm-box" role="dialog" aria-modal="true" aria-labelledby="verify-fail-title" style="max-width:480px;text-align:left">
            <div style="text-align:center;margin-bottom:14px">
              <div class="bd rs" style="padding:8px 16px;font-size:13px;font-weight:700">
                ${SVG.alert} DOKUMEN TIDAK TERVERIFIKASI
              </div>
              <h2 id="verify-fail-title" style="margin-top:10px;font-size:16px">Verifikasi Laporan BKD Gagal</h2>
              <div class="verify-code-pill" style="background:#991B1B">${esc(cleanCode || '-')}</div>
            </div>
            <div role="alert" style="background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;padding:12px 16px;font-size:12.5px;line-height:1.6;color:#991B1B">
              <div><b>Status Pemeriksaan:</b> ${esc(reason)}</div>
              <div style="margin-top:6px">Pastikan QR Code berasal dari cetakan resmi <b>SIMPEN</b> yang diterbitkan melalui Panel Pengelola Dosen.</div>
            </div>
            <button type="button" class="btn pri" style="width:100%;margin-top:16px" data-a="mclose">Tutup Lembar Verifikasi</button>
          </div>
        </div>
      `);
      return;
    }

    openModal(`
      <div class="ov">
        <div class="confirm-box" role="dialog" aria-modal="true" aria-labelledby="verify-ok-title" style="max-width:480px;text-align:left">
          <div style="text-align:center;margin-bottom:14px">
            <div class="verify-badge-verified">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              DOKUMEN TERVERIFIKASI SAH
            </div>
            <h2 id="verify-ok-title" style="margin-top:10px;font-size:16px">Verifikasi Laporan Kinerja BKD</h2>
            <div class="verify-code-pill">${esc(d.kode || cleanCode)}</div>
          </div>
          <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:12px 16px;font-size:12.5px;line-height:1.6">
            <div><b>Nama Dosen:</b> ${esc(d.namaDosen || '-')}</div>
            <div><b>NIDN / NIDK:</b> ${esc(d.nidn || '-')}</div>
            <div><b>Jabatan Fungsional:</b> ${esc(d.jabatan || 'Lektor')}</div>
            <div><b>Program Studi / Unit:</b> ${esc(d.prodi || d.fakultas || '-')}</div>
            <div><b>Institusi:</b> ${esc(d.institusi || '-')}</div>
            <div><b>Pengesah / Dekan:</b> ${esc(d.pimpinan || '-')}</div>
            <div><b>Periode / Tanggal Cetak:</b> ${esc(d.periode || '-')} (${esc(d.tglTerbit || '-')})</div>
            <div><b>Status Keabsahan:</b> <span style="color:#059669;font-weight:bold">${esc(d.status)}</span></div>
            <div><b>Waktu Pemeriksaan:</b> ${esc(d.timestamp || '-')}</div>
          </div>
          <p class="mu" style="font-size:11.5px;margin:12px 0;text-align:center">Kode verifikasi cocok dengan tanda tangan HMAC pada pangkalan data SIMPEN.</p>
          <button type="button" class="btn pri" style="width:100%" data-a="mclose">Tutup Lembar Verifikasi</button>
        </div>
      </div>
    `);
  }

  function openCiteModal(pubId) {
    const pub = (S.P?.publikasi || []).find(x => String(x.id) === String(pubId));
    if (!pub) return;
    const profil = S.P?.profil || {};
    const tahun = pub.tahun_terbit || 'n.d.';
    const authorApa = formatAuthorApa(profil.nama);
    const authorIeee = formatAuthorIeee(profil.nama);
    const linkPart = pub.doi ? `https://doi.org/${pub.doi}` : (pub.link_final || '');

    const apa = `${authorApa} (${tahun}). ${pub.judul}. ${pub.jurnal}.${linkPart ? ' ' + linkPart : ''}`;
    const ieee = `${authorIeee}, "${pub.judul}," ${pub.jurnal}, ${tahun}.${pub.doi ? ' doi: ' + pub.doi + '.' : (pub.link_final ? ' [Online]. Available: ' + pub.link_final : '')}`;

    openModal(`
      <div class="ov">
        <div class="mod" role="dialog" aria-modal="true" aria-labelledby="cite-title" style="max-width:560px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
            <div>
              <h2 id="cite-title" style="font-size:17px">Salin Format Sitasi Artikel</h2>
              <p class="mu" style="font-size:12.5px;margin:2px 0 0">Siap tempel ke daftar pustaka Mendeley, Zotero, atau naskah ilmiah.</p>
            </div>
            <button type="button" class="btn sm" data-a="mclose" aria-label="Tutup modal sitasi" style="border:none;background:transparent;font-size:18px">✕</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div>
              <div class="copy-box-head">
                <b style="font-size:12.5px;color:var(--pri)">Format APA (Edisi ke-7)</b>
                <button type="button" class="btn sm" data-a="copyTarget" data-target="cite-apa-txt">${SVG.copy} Salin APA</button>
              </div>
              <div class="copy-box" id="cite-apa-txt">${esc(apa)}</div>
            </div>
            <div>
              <div class="copy-box-head">
                <b style="font-size:12.5px;color:var(--pri)">Format IEEE</b>
                <button type="button" class="btn sm" data-a="copyTarget" data-target="cite-ieee-txt">${SVG.copy} Salin IEEE</button>
              </div>
              <div class="copy-box" id="cite-ieee-txt">${esc(ieee)}</div>
            </div>
          </div>
          <div class="act">
            <button type="button" class="btn pri" data-a="mclose">Selesai</button>
          </div>
        </div>
      </div>
    `);
  }

  function openFollowupModal(subId) {
    const s = (S.D?.Submission || []).find(x => x.id === subId);
    if (!s) return;
    const c = cfg();
    const j = jname(s.id_jurnal);
    const tglSub = s.tgl_submit ? fmt(s.tgl_submit) : '(tanggal submit)';
    const waitDays = s.tgl_submit ? -dayDiff(s.tgl_submit) : null;
    const authorName = c.nama || 'Penulis';
    const affil = c.afiliasi || '';

    const idSubj = `Permohonan Informasi Status Naskah: ${s.judul}`;
    const idBody = `Yth. Dewan Redaksi ${j},\n\nDengan hormat,\nMelalui surat elektronik ini, saya ${authorName}${affil ? ' (' + affil + ')' : ''} bermaksud menanyakan perkembangan proses penelaahan (status saat ini: ${s.status}) untuk naskah artikel kami yang berjudul:\n"${s.judul}"\n\nNaskah tersebut telah kami kirimkan pada ${tglSub}${waitDays !== null && waitDays >= 0 ? ' (' + waitDays + ' hari yang lalu)' : ''}${s.akun_ojs ? ' melalui akun OJS "' + s.akun_ojs + '"' : ''}.\n\nBesar harapan kami memperoleh kabar pembaruan terkait kelanjutan naskah tersebut. Atas perhatian dan kerja sama Bapak/Ibu Editor, kami ucapkan terima kasih.\n\nHormat kami,\n${authorName}${affil ? '\n' + affil : ''}`;

    const enSubj = `Manuscript Status Inquiry: ${s.judul}`;
    const enBody = `Dear Editorial Office of ${j},\n\nI hope this email finds you well.\nI am writing to politely inquire about the current editorial status of our manuscript titled:\n"${s.judul}"\n\nThe manuscript was submitted on ${tglSub}${waitDays !== null && waitDays >= 0 ? ' (' + waitDays + ' days ago)' : ''}${s.akun_ojs ? ' under OJS username "' + s.akun_ojs + '"' : ''}, and is currently listed as "${s.status}".\n\nWe would greatly appreciate any update regarding the review progress. Thank you very much for your time and consideration.\n\nBest regards,\n${authorName}${affil ? '\n' + affil : ''}`;

    openModal(`
      <div class="ov">
        <div class="mod" role="dialog" aria-modal="true" aria-labelledby="fu-title" style="max-width:640px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
            <div>
              <h2 id="fu-title" style="font-size:17px">Template Email Follow-up ke Editor Jurnal</h2>
              <p class="mu" style="font-size:12.5px;margin:2px 0 0">Siap kirim ke editor ${esc(j)}.</p>
            </div>
            <button type="button" class="btn sm" data-a="mclose" aria-label="Tutup template email" style="border:none;background:transparent;font-size:18px">✕</button>
          </div>
          <div style="display:flex;flex-direction:column;gap:14px">
            <div>
              <div class="copy-box-head">
                <b style="font-size:12.5px;color:var(--pri)">Bahasa Indonesia</b>
                <div style="display:flex;gap:6px">
                  <button type="button" class="btn sm" data-a="copyText" data-text="${esc(idSubj)}">${SVG.copy} Salin Subjek</button>
                  <button type="button" class="btn pri sm" data-a="copyTarget" data-target="fu-id-body">${SVG.copy} Salin Isi Email</button>
                </div>
              </div>
              <div class="copy-box" id="fu-id-body">${esc(idBody)}</div>
            </div>
            <div>
              <div class="copy-box-head">
                <b style="font-size:12.5px;color:var(--pri)">English (International Journal)</b>
                <div style="display:flex;gap:6px">
                  <button type="button" class="btn sm" data-a="copyText" data-text="${esc(enSubj)}">${SVG.copy} Copy Subject</button>
                  <button type="button" class="btn pri sm" data-a="copyTarget" data-target="fu-en-body">${SVG.copy} Copy Body</button>
                </div>
              </div>
              <div class="copy-box" id="fu-en-body">${esc(enBody)}</div>
            </div>
          </div>
          <div class="act">
            <button type="button" class="btn" data-a="mclose">Tutup</button>
          </div>
        </div>
      </div>
    `);
  }

  let _bibParsed = [];
  function renderBibPreview() {
    const wrap = $('#bib-preview-wrap');
    const btn = $('#btn-bib-import');
    if (!wrap) return;
    if (!_bibParsed.length) {
      wrap.innerHTML = '<div class="mu" style="padding:16px;text-align:center;font-size:12.5px">Unggah file <code>.bib</code> atau tempel isi BibTeX di atas untuk melihat pratinjau.</div>';
      if (btn) btn.disabled = true;
      return;
    }
    const existingJurs = S.D?.Jurnal || [];
    wrap.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12.5px">
        <b>Ditemukan ${_bibParsed.length} entri BibTeX:</b>
        <span class="mu">Centang entri yang ingin diimpor</span>
      </div>
      <div class="bib-list">
        ${_bibParsed.map((e, idx) => {
          const dup = findSimilarSubmission(e.title, '');
          const jMatch = existingJurs.find(j => isSameJournalName(j.nama, e.journal));
          return `
            <label class="bib-item" style="margin:0;cursor:pointer;font-weight:400">
              <input type="checkbox" class="bib-chk" data-idx="${idx}" ${dup ? '' : 'checked'} style="margin-top:2px">
              <div style="flex:1;min-width:0">
                <div style="font-weight:600;color:var(--tx)">${esc(e.title)}</div>
                <div class="mu" style="font-size:11.5px;margin-top:2px">
                  ${e.journal ? `<span>${esc(e.journal)}</span>` : '<span>Tanpa nama jurnal</span>'}
                  ${e.year ? ` · <span>${esc(e.year)}</span>` : ''}
                  ${e.doi ? ` · <span class="mono">DOI: ${esc(e.doi)}</span>` : ''}
                </div>
                <div style="margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">
                  ${dup ? '<span class="bd am">Judul serupa sudah ada</span>' : '<span class="bd gr">Siap diimpor</span>'}
                  ${jMatch ? `<span class="bd bl">Cocok jurnal: ${esc(jMatch.nama)}</span>` : (e.journal ? '<span class="bd sl">Jurnal baru akan dicatat</span>' : '')}
                </div>
              </div>
            </label>
          `;
        }).join('')}
      </div>
    `;
    if (btn) btn.disabled = false;
  }

  function openBibtexModal() {
    _bibParsed = [];
    const semOpts = getSemOptions().map(([a, b]) => `<option value="${esc(a)}">${esc(b)}</option>`).join('');
    openModal(`
      <div class="ov">
        <div class="mod" role="dialog" aria-modal="true" aria-labelledby="bib-title" style="max-width:660px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
            <div>
              <h2 id="bib-title" style="font-size:17px">Impor Massal Artikel dari BibTeX (.bib)</h2>
              <p class="mu" style="font-size:12.5px;margin:2px 0 0">Ekspor file <code>.bib</code> dari Google Scholar, Mendeley, atau Zotero lalu unggah atau tempel di sini.</p>
            </div>
            <button type="button" class="btn sm" data-a="mclose" aria-label="Tutup modal impor BibTeX" style="border:none;background:transparent;font-size:18px">✕</button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
            <div>
              <label for="bib_status" style="margin-top:0">Status Awal Artikel Impor</label>
              <select id="bib_status" class="in">
                <option value="Published">Published (Sudah Terbit)</option>
                <option value="Draft">Draft (Rencana/Arsip)</option>
              </select>
            </div>
            <div>
              <label for="bib_sem" style="margin-top:0">Semester BKD (Opsional)</label>
              <select id="bib_sem" class="in">${semOpts}</select>
            </div>
          </div>
          <label for="bib_file" style="margin-top:4px">Pilih File .bib (Opsional)</label>
          <input type="file" id="bib_file" accept=".bib,.txt" class="in" style="padding:7px 10px">
          <label for="bib_raw">Atau Tempel Teks BibTeX</label>
          <textarea id="bib_raw" placeholder="@article{key2025,\n  title={Judul Artikel Ilmiah},\n  journal={Nama Jurnal},\n  year={2025},\n  doi={10.xxxx/xxxxx}\n}" style="min-height:110px;font-family:'JetBrains Mono',monospace;font-size:12px"></textarea>
          <div id="bib-preview-wrap" style="margin-top:12px"></div>
          <div class="act">
            <button type="button" class="btn" data-a="mclose">Batal</button>
            <button type="button" class="btn pri" id="btn-bib-import" data-a="doBibImport" disabled>${SVG.upload} Impor Artikel Terpilih</button>
          </div>
        </div>
      </div>
    `);
    renderBibPreview();
  }

  async function runBibtexImport() {
    const chks = [...document.querySelectorAll('.bib-chk:checked')];
    if (!chks.length) return toast('Pilih minimal satu entri BibTeX untuk diimpor', true);
    const defaultStatus = $('#bib_status')?.value || 'Published';
    const defaultSem = $('#bib_sem')?.value || '';
    const selected = chks.map(c => _bibParsed[Number(c.dataset.idx)]).filter(Boolean);

    const btn = $('#btn-bib-import');
    if (btn) { btn.disabled = true; btn.textContent = 'Mengimpor…'; }

    const existingJurs = S.D.Jurnal = S.D.Jurnal || [];
    const newJurs = [];
    const resolveJournalId = jTitle => {
      if (!jTitle) return '';
      const found = [...existingJurs, ...newJurs].find(j => isSameJournalName(j.nama, jTitle));
      if (found) return found.id;
      const nj = {
        id: uid(),
        nama: jTitle,
        link: '',
        thumbnail: '',
        penerbit: '',
        jenis_kampus: 'PTN',
        rumpun_ilmu: '',
        akreditasi: 'Non-Sinta',
        tipe_biaya: 'Gratis',
        apc: '',
        scope: '',
        catatan: 'Ditambahkan otomatis dari impor BibTeX',
        tampil_publik: false
      };
      newJurs.push(nj);
      return nj.id;
    };

    const newSubs = selected.map(e => ({
      id: uid(),
      id_penelitian: '',
      judul: e.title,
      id_jurnal: resolveJournalId(e.journal),
      status: defaultStatus,
      tgl_submit: '',
      tgl_cek: today(),
      deadline_respon: '',
      link_feedback: '',
      link_final: e.url || '',
      doi: e.doi || '',
      tahun_terbit: e.year || (defaultStatus === 'Published' ? String(new Date().getFullYear()) : ''),
      catatan: 'Diimpor dari BibTeX',
      tampil_publik: true,
      akun_ojs: '',
      password_ojs: '',
      semester_bkd: defaultSem,
      peran_penulis: 'Penulis Pertama & Korespondensi',
      total_penulis: 1,
      sks_bkd: ''
    }));

    if (newJurs.length) existingJurs.push(...newJurs);
    S.D.Submission = (S.D.Submission || []).concat(newSubs);
    Store.set('boot', { h: hashData(S.D), t: Date.now(), data: S.D });
    closeModal();
    draw();

    // Sinkronkan ke server: gunakan batchUpsert jika tersedia, fallback ke upsert berurutan
    if (newJurs.length) {
      const rj = await API.post('batchUpsert', { entity: 'Jurnal', records: newJurs });
      if (!rj.success && /tidak dikenal/i.test(rj.message || '')) {
        for (const nj of newJurs) await API.post('upsert', { entity: 'Jurnal', record: nj });
      }
    }
    const rs = await API.post('batchUpsert', { entity: 'Submission', records: newSubs });
    if (!rs.success && /tidak dikenal/i.test(rs.message || '')) {
      for (const ns of newSubs) await API.post('upsert', { entity: 'Submission', record: ns });
    }
    Store.set('boot', { h: hashData(S.D), t: Date.now(), data: S.D });
    toast(`Berhasil mengimpor ${newSubs.length} artikel dari BibTeX`);
  }

  function openRumpunModal() {
    const pens = S.D?.Penelitian || [];
    const leadName = cfg().nama || PENELITI_UTAMA;
    openModal(`
      <div class="ov">
        <div class="mod" role="dialog" aria-modal="true" aria-labelledby="rumpun-title" style="max-width:740px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
            <div>
              <h2 id="rumpun-title" style="font-size:18px">Matriks Rumpun Keilmuan &amp; Pakar Kolaborator (Prodi PBA)</h2>
              <p class="mu" style="font-size:12.5px;margin:2px 0 0">Pemetaan bidang keahlian riset dengan <b>${esc(leadName)}</b> sebagai Peneliti Utama.</p>
            </div>
            <button type="button" class="btn sm" data-a="mclose" aria-label="Tutup matriks rumpun" style="border:none;background:transparent;font-size:18px">✕</button>
          </div>
          <div class="workflow-hint" style="margin-bottom:14px">
            ${SVG.user}
            <div>
              <b>Peneliti Utama:</b> ${esc(leadName)} · <b>4 Rumpun Inti</b> (#1, #2, #3, #5) &amp; <b>1 Rumpun Lintas Kolaborasi</b> (#4). Klik tombol buat riset pada salah satu rumpun untuk memulai proyek riset terstruktur.
            </div>
          </div>
          <div style="max-height:56vh;overflow-y:auto;padding-right:4px">
            ${RUMPUN_PAKAR.map(r => {
              const count = pens.filter(p => findRumpunByBidang(p.bidang)?.no === r.no).length;
              return `
                <div class="rumpun-card ${r.intiFajri ? 'inti' : ''}">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap">
                    <b style="font-size:14px;color:var(--tx)">${r.no}. ${esc(r.nama)}</b>
                    <div style="display:flex;gap:6px;flex-wrap:wrap">
                      <span class="bd ${r.intiFajri ? 'gr' : 'sl'}">${r.intiFajri ? 'Rumpun Inti Peneliti Utama' : 'Lintas Rumpun'}</span>
                      <span class="bd bl">${count} Riset</span>
                    </div>
                  </div>
                  <div class="mu" style="font-size:12.5px;margin:6px 0 10px"><b>Cakupan Materi:</b> ${esc(r.materi)}</div>
                  <div style="font-size:12px;margin-bottom:10px">
                    <b style="display:block;margin-bottom:4px;color:var(--tx-sec)">Tim Kolaborator Pakar Se-Rumpun:</b>
                    <div style="display:flex;gap:6px;flex-wrap:wrap">
                      ${r.intiFajri ? `<span class="bd gr">${esc(leadName)} (Peneliti Utama)</span>` : `<span class="bd am">${esc(leadName)} (Peneliti Utama / Lintas Rumpun)</span>`}
                      ${r.kolaborator.map(k => {
                        const isPakar = r.pakarUtama.includes(k);
                        return `<span class="bd ${isPakar ? 'bl' : 'sl'}">${esc(k)}${isPakar ? ' (Pakar Utama)' : ''}</span>`;
                      }).join('')}
                    </div>
                  </div>
                  <button type="button" class="btn pri sm" data-a="addPenRumpun" data-id="${r.no}">${SVG.plus} Buat Proyek Riset di Rumpun Ini</button>
                </div>
              `;
            }).join('')}
          </div>
          <div class="act">
            <button type="button" class="btn" data-a="mclose">Tutup</button>
          </div>
        </div>
      </div>
    `);
  }

  document.addEventListener('click', async e => {
    if (e.target && e.target.classList && e.target.classList.contains('ov')) {
      // Jangan tutup modal form input jika pengguna tidak sengaja mengklik area luar
      if (!e.target.querySelector('form, #bib_raw')) closeModal();
      return;
    }
    const t = e.target.closest('[data-a]'); if (!t || t.tagName === 'SELECT') return;
    const a = t.dataset.a, id = t.dataset.id, ent = t.dataset.e;
    if (a === 'goLogin') { S.view = 'login'; draw(); }
    else if (a === 'goPub') { e.preventDefault(); S.view = 'pub'; draw(); }
    else if (a === 'retryPub') { S.pubErr = ''; draw(); loadPub(); }
    else if (a === 'tab') { S.tab = id; S.q = ''; S.f = { kampus: '', akr: '', biaya: '', rumpun: '' }; S.pubJurPage = 1; draw(); }
    else if (a === 'nav') { e.preventDefault(); S.page = id; sessionStorage.setItem('sp_admin_page', id); S.q = ''; S.adminJurPage = 1; draw(); }
    else if (a === 'subFilter') { S.subFilter = id; draw(); }
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
    else if (a === 'add') openForm(ent, ent === 'Submission' ? { status: 'Draft', semester_bkd: currentSemester(), tgl_cek: today(), tampil_publik: true } : { tampil_publik: true });
    else if (a === 'openRumpun') openRumpunModal();
    else if (a === 'addPenRumpun') {
      const r = RUMPUN_PAKAR.find(x => String(x.no) === String(id));
      if (r) {
        closeModal();
        S.page = 'pen';
        sessionStorage.setItem('sp_admin_page', 'pen');
        draw();
        openForm('Penelitian', {
          bidang: r.nama,
          status: 'Draft',
          semester_bkd: currentSemester(),
          tanggal_mulai: today(),
          tampil_publik: true
        });
      }
    }
    else if (a === 'pickRumpun' || a === 'pickMateriTopic') {
      const bEl = $('#mf [name=bidang]');
      if (bEl && t.dataset.val) {
        bEl.value = t.dataset.val;
        updatePenelitianRumpunUI();
      }
    }
    else if (a === 'toggleKolab') {
      const kEl = $('#mf [name=kolaborator]');
      const name = t.dataset.name || '';
      if (kEl && name) {
        const list = parseKolabList(kEl.value);
        const idx = list.findIndex(x => x.toLowerCase() === name.toLowerCase());
        if (idx >= 0) list.splice(idx, 1);
        else list.push(name);
        kEl.value = list.join('; ');
        updatePenelitianRumpunUI();
      }
    }
    else if (a === 'clearKolab') {
      const kEl = $('#mf [name=kolaborator]');
      if (kEl) {
        kEl.value = '';
        updatePenelitianRumpunUI();
      }
    }
    else if (a === 'pickJurRumpun') {
      const rEl = $('#mf [name=rumpun_ilmu]');
      if (rEl && t.dataset.val) rEl.value = t.dataset.val;
    }
    else if (a === 'pickDriveFile') {
      const inp = $('#pen_drive_file');
      if (inp) inp.click();
    }
    else if (a === 'previewDoc') {
      openDocPreviewModal(t.dataset.url || '', t.dataset.title || '', t.dataset.folder || '');
    }
    else if (a === 'edit') openForm(ent, S.D[ent].find(x => x.id === id));
    else if (a === 'cite') openCiteModal(id);
    else if (a === 'followup') openFollowupModal(id);
    else if (a === 'importBib') openBibtexModal();
    else if (a === 'doBibImport') runBibtexImport();
    else if (a === 'copyTarget') {
      const el = $('#' + t.dataset.target);
      if (el) navigator.clipboard.writeText(el.textContent || '').then(() => toast('Teks berhasil disalin')).catch(() => toast('Gagal menyalin', true));
    }
    else if (a === 'copyText') {
      const txt = t.dataset.text || '';
      if (txt) navigator.clipboard.writeText(txt).then(() => toast('Teks berhasil disalin')).catch(() => toast('Gagal menyalin', true));
    }
    else if (a === 'del') {
      const list = S.D?.[ent] || [];
      const item = list.find(x => x.id === id);
      const title = item?.judul || item?.nama || 'item ini';
      openConfirmDelete(ent, id, title);
    }
    else if (a === 'doConfirmDel') {
      closeModal();
      remove(ent, id);
    }
    else if (a === 'delOld') {
      const o = S.D.CFP.filter(c => dayDiff(c.deadline) < 0);
      if (!o.length) return toast('Tidak ada CFP yang sudah lewat', true);
      openModal(`
        <div class="ov">
          <div class="confirm-box" role="dialog" aria-modal="true" aria-labelledby="del-old-title">
            <div class="confirm-icon-wrap" style="background:#FEF2F2;color:#EF4444">${SVG.trash}</div>
            <h2 id="del-old-title" style="font-size:16px;margin-bottom:8px">Hapus ${o.length} CFP Kedaluwarsa?</h2>
            <p class="mu" style="font-size:13px;line-height:1.5;margin-bottom:20px">Seluruh CFP yang telah melewati batas deadline akan dibersihkan dari database.</p>
            <div style="display:flex;gap:10px;justify-content:center">
              <button type="button" class="btn" data-a="mclose" style="flex:1">Batal</button>
              <button type="button" class="btn dng" data-a="doConfirmDelOld" style="flex:1">Ya, Bersihkan</button>
            </div>
          </div>
        </div>
      `);
    }
    else if (a === 'doConfirmDelOld') {
      closeModal();
      const o = S.D.CFP.filter(c => dayDiff(c.deadline) < 0);
      const ids = o.map(c => c.id);
      if (!ids.length) return;
      const prev = S.D.CFP.slice();
      S.D.CFP = S.D.CFP.filter(c => !ids.includes(c.id));
      Store.set('boot', { h: hashData(S.D), t: Date.now(), data: S.D });
      draw();
      const r = await API.post('batchDelete', { entity: 'CFP', ids });
      if (!r.success && /tidak dikenal/i.test(r.message || '')) {
        for (const cid of ids) await API.post('delete', { entity: 'CFP', id: cid });
      } else if (!r.success) {
        S.D.CFP = prev;
        Store.set('boot', { h: hashData(S.D), t: Date.now(), data: S.D });
        draw();
        return toast(r.message || 'Gagal membersihkan CFP', true);
      }
      toast(`${ids.length} CFP kedaluwarsa berhasil dibersihkan`);
    }
    else if (a === 'cek') { const s = S.D.Submission.find(x => x.id === id); upsert('Submission', { ...s, tgl_cek: today() }); toast('Ditandai sudah dicek'); }
    else if (a === 'pen2sub') {
      const p = S.D.Penelitian.find(x => x.id === id);
      if (p) {
        const kolabs = parseKolabList(p.kolaborator);
        const totalPenulis = 1 + kolabs.length;
        const peran = kolabs.length > 0 ? 'Penulis Pertama & Korespondensi' : 'Penulis Tunggal';
        S.page = 'sub';
        S.subFilter = 'all';
        sessionStorage.setItem('sp_admin_page', 'sub');
        draw();
        openForm('Submission', {
          id_penelitian: p.id,
          judul: p.judul,
          semester_bkd: p.semester_bkd || currentSemester(),
          peran_penulis: peran,
          total_penulis: totalPenulis,
          catatan: kolabs.length ? `Peneliti Utama: ${cfg().nama || PENELITI_UTAMA} | Kolaborator: ${kolabs.join('; ')}` : '',
          status: 'Draft',
          tgl_cek: today(),
          tampil_publik: true
        });
      }
    }
    else if (a === 'cfp2sub') { const c = S.D.CFP.find(x => x.id === id); S.page = 'sub'; S.subFilter = 'all'; sessionStorage.setItem('sp_admin_page', 'sub'); draw(); openForm('Submission', { status: 'Draft', id_jurnal: c.id_jurnal, tgl_cek: today(), tampil_publik: true }); }
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
          <div class="mod" role="dialog" aria-modal="true" aria-labelledby="hist-title">
            <h2 id="hist-title">Riwayat Perubahan Status</h2>
            <p class="mu" style="font-size:13px;margin-bottom:16px">Jejak audit alur proses naskah artikel ilmiah.</p>
            ${h.map(x => `
              <div class="row">
                <span>${badge(x.status_lama)} → ${badge(x.status_baru)}</span>
                <span class="mono">${esc(fmtLogWaktu(x.waktu, S.D.StatusLog))}</span>
              </div>
            `).join('') || '<p class="mu" style="text-align:center;padding:24px">Belum ada riwayat perubahan status.</p>'}
            <div class="act">
              <button type="button" class="btn" data-a="mclose">Tutup</button>
            </div>
          </div>
        </div>
      `);
    }
    else if (a === 'thumb') {
      const u = $('#mf [name=link]').value; if (!u) return toast('Isi tautan jurnal dulu', true);
      t.innerHTML = 'Mengambil…';
      const r = await API.post('thumb', { url: u });
      t.innerHTML = `${SVG.search} Ambil Thumbnail Otomatis`;
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
      const updated = applyStatusAutoFields({ ...s, status: t.value, tgl_cek: today() }, s.status);
      upsert('Submission', updated);
      toast('Status naskah diubah: ' + t.value);
    }
    else if (t.id === 'bib_file' && t.files && t.files[0]) {
      const reader = new FileReader();
      reader.onload = ev => {
        const rawEl = $('#bib_raw');
        if (rawEl) rawEl.value = String(ev.target.result || '');
        _bibParsed = parseBibtex(ev.target.result || '');
        renderBibPreview();
      };
      reader.readAsText(t.files[0]);
    }
    else if (t.id === 'pen_drive_file' && t.files && t.files[0]) {
      uploadPenelitianFileToDrive(t.files[0]);
      t.value = '';
    }
    else if (t.id && t.id.startsWith('f_')) { S.f[t.id.slice(2)] = t.value; S.pubJurPage = 1; draw(); }
    else if (t.id === 'yr') { S.yr = t.value; draw(); }
    else if (t.id === 'jb') { S.jbiaya = t.value; S.adminJurPage = 1; draw(); }
    else if (t.id === 'pen_rumpun') { S.penRumpun = t.value; draw(); }
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
    } else if (t.id === 'bib_raw') {
      _bibParsed = parseBibtex(t.value);
      renderBibPreview();
    } else if (t.name === 'nama' && t.form && t.form.id === 'mf' && t.form.dataset.e === 'Jurnal') {
      checkJournalDuplicateLive(t);
    } else if (t.name === 'judul' && t.form && t.form.id === 'mf' && t.form.dataset.e === 'Submission') {
      checkSubmissionDuplicateLive(t);
    } else if (t.form && t.form.id === 'mf' && t.form.dataset.e === 'Penelitian' && ['bidang', 'kolaborator'].includes(t.name)) {
      updatePenelitianRumpunUI();
    } else if (t.name === 'link_pdf' && t.form && t.form.id === 'mf' && t.form.dataset.e === 'Penelitian') {
      updatePenelitianDrivePreview();
    } else if (t.form && t.form.id === 'mf' && t.form.dataset.e === 'Submission' && ['id_jurnal', 'peran_penulis', 'total_penulis'].includes(t.name)) {
      updateSubmissionKumInForm();
    }
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
      FIELDS[ent].forEach(fl => {
        if (fl[0].startsWith('__')) return;
        const el = f.elements[fl[0]];
        if (el) rec[fl[0]] = fl[2] === 'check' ? el.checked : el.value.trim();
      });
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
            notice.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;vertical-align:middle">${SVG.alert} <b>Data Duplikat Ditolak:</b></span> Jurnal "<b>${esc(dup.nama)}</b>" (${esc(akr(dup))}, ${esc(dup.penerbit || 'Penerbit')}) sudah ada di database. Sistem menolak penambahan data duplikat ini.`;
          }
          return;
        }
        if (rec.tipe_biaya === 'Gratis') rec.apc = '';
      }
      if (ent === 'Submission') {
        Object.assign(rec, applyStatusAutoFields(rec, old?.status));
      }
      closeModal(); await upsert(ent, rec); toast('Data berhasil disimpan');
    }
    else if (f.id === 'sf') {
      const cur = (S.D.Pengaturan || [])[0] || { id: 'cfg' };
      const fd = new FormData(f);
      const o = Object.fromEntries(fd);
      // Baca status saklar matriks notifikasi WhatsApp (gas-notifikasi-wa-crm)
      o.wa_master = f.elements.wa_master ? f.elements.wa_master.checked : false;
      o.notif_revisi = f.elements.notif_revisi ? f.elements.notif_revisi.checked : false;
      o.notif_cfp = f.elements.notif_cfp ? f.elements.notif_cfp.checked : false;
      o.notif_cek = f.elements.notif_cek ? f.elements.notif_cek.checked : false;
      o.notif_accepted = f.elements.notif_accepted ? f.elements.notif_accepted.checked : false;
      o.notif_status = f.elements.notif_status ? f.elements.notif_status.checked : false;
      o.notif_mingguan = f.elements.notif_mingguan ? f.elements.notif_mingguan.checked : false;
      o.app_url = location.href.split('#')[0];

      // Normalisasi nomor telepon ke standar 628...
      if (o.wa) {
        let clean = String(o.wa).replace(/[^0-9]/g, '');
        if (clean.indexOf('0') === 0) clean = '62' + clean.slice(1);
        else if (clean.indexOf('8') === 0) clean = '62' + clean;
        o.wa = clean;
      }
      await upsert('Pengaturan', { ...cur, ...o, id: 'cfg' });
      toast('Pengaturan & matriks notifikasi berhasil diperbarui');
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('#modal') && $('#modal').innerHTML !== '') {
      e.preventDefault();
      closeModal();
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.dataset && e.target.dataset.a === 'jdetail') {
      e.preventDefault();
      const j = (S.P?.jurnal || S.D?.Jurnal || []).find(x => String(x.id) === String(e.target.dataset.id) || x.nama === e.target.dataset.id);
      if (j) openJournalDetail(j);
    }
  });

  // ============ INIT & ROUTE CHECK (gas-doc-engine) ============
  function checkHashRoute() {
    const h = location.hash || '';
    if (h.indexOf('#verify=') === 0 || h.indexOf('#verify/') === 0) {
      const code = decodeURIComponent(h.replace(/^#verify[=\/]/, ''));
      if (code) openVerifyModal(code);
    }
  }
  window.addEventListener('hashchange', checkHashRoute);

  (async () => {
    // Periksa rute hash verifikasi eTTD jika ada
    checkHashRoute();

    // SWR Instant Rendering: jika token ada, langsung muat view admin
    if (API.tok()) {
      S.view = 'admin';
      S.page = initialAdminPage;
      draw();
      loadAdmin();
    } else {
      draw();
    }
    loadPub();
  })();
})();
