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
    bld: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V5l7-2 7 2v16M9 9h2M13 9h2M9 13h2M13 13h2M10 21v-4h4v4"/></svg>'
  };

  const badge = s => `<span class="bd ${STC[s] || 'sl'}">${esc(s)}</span>`;
  const S = { view: 'pub', tab: 'pub', page: 'dash', P: null, D: null, q: '', yr: '', jq: '', jbiaya: '', subv: 'kanban', onlyCheck: false, f: { kampus: '', akr: '', biaya: '', rumpun: '' }, jview: 'grid' };

  const cfg = () => Object.assign({ nama: '', afiliasi: '', wa: '', ambang_cek: 14, ambang_cfp: '7,3,0', jam: '08:00' }, (S.D && S.D.Pengaturan && S.D.Pengaturan[0]) || {});
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
  const apcVal = j => {
    if (j.tipe_biaya === 'Gratis') return { t: 'Gratis', c: '#047857' };
    const n = String(j.apc || '').replace(/[.\s]/g, '');
    return { t: /^\d+$/.test(n) ? 'Rp ' + Number(n).toLocaleString('id-ID') : (j.apc || 'Berbayar'), c: '#1E3A8A' };
  };
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
    const hero = `
      <div class="hero-academic">
        <div class="hero-profile">
          <div class="hero-avatar">${initials}</div>
          <div>
            <div class="hero-title">${esc(P.profil.nama)}</div>
            <div class="hero-subtitle">
              <span>${esc(P.profil.afiliasi)}</span>
              <span class="hero-tag">Dosen &amp; Peneliti</span>
            </div>
            <div class="hero-badges">
              <a href="https://sinta.kemdikbud.go.id" target="_blank" rel="noopener">🏛️ SINTA Kemdikbud ↗</a>
              <a href="https://scholar.google.com" target="_blank" rel="noopener">🎓 Google Scholar ↗</a>
              <a href="https://www.scopus.com" target="_blank" rel="noopener">🔬 Scopus ID ↗</a>
            </div>
          </div>
        </div>
      </div>
    `;

    return `
      <header class="top">
        <div class="brand">
          <div class="logo">SP</div>
          <div>
            <div class="brand-name">SIMPEN <span class="bd bl" style="font-size:10px;padding:1px 7px">SHOWCASE</span></div>
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
    return stats + bar + (L.length ? `<div class="${S.jview === 'list' ? 'jlist' : 'jgrid'}">${L.map(jPub).join('')}</div>` : '<div class="card mu" style="text-align:center;padding:32px">Tidak ada jurnal yang sesuai filter.</div>') + `<p class="mu" style="margin-top:14px;font-size:13px">Menampilkan ${L.length} dari total ${J.length} jurnal rekomendasi.</p>`;
  }

  // ============ LOGIN ============
  const viewLogin = () => `
    <div class="login card">
      <div class="logo" style="margin:0 auto 16px;width:56px;height:56px;font-size:20px">SP</div>
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
      <p style="margin-top:24px"><a href="#" data-a="goPub" style="color:var(--mu);text-decoration:none;font-weight:600;font-size:13px">← Kembali ke Showcase Publik</a></p>
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
              <div class="logo">SP</div>
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
              <div style="width:82px;height:82px;border-radius:50%;background:#FFF;display:grid;place-items:center;text-align:center">
                <span class="mu" style="font-size:10px;text-transform:uppercase">Total</span>
                <b style="font-size:20px;line-height:1;margin-top:-2px">${D.Submission.length}</b>
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
    return head('Katalog Jurnal Target', 'Basis data jurnal: akreditasi SINTA, biaya APC, dan visibilitas publik', `
      <button class="btn" data-a="csv" data-e="Jurnal">${SVG.download} Ekspor Excel</button>
      <button class="btn pri" data-a="add" data-e="Jurnal">${SVG.plus} Tambah Jurnal Baru</button>
    `) + `
      <div class="stats">
        <div class="card stat"><span>Total Jurnal</span><b>${S.D.Jurnal.length}</b><small>Tersimpan</small></div>
        <div class="card stat"><span>Bebas Biaya</span><b style="color:#059669">${S.D.Jurnal.filter(j => j.tipe_biaya === 'Gratis').length}</b><small>Gratis APC</small></div>
        <div class="card stat"><span>Tampil di Showcase</span><b style="color:#2563EB">${S.D.Jurnal.filter(j => j.tampil_publik).length}</b><small>Publik</small></div>
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
      ${L.map(j => {
        const v = apcVal(j);
        return `
          <div class="card item" style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start">
            <div class="jc-cover-box" style="flex:none">${thumb(j, '100%', '100%')}</div>
            <div style="flex:1;min-width:260px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
                <span class="mu" style="font-size:12px;font-weight:600">${esc(j.penerbit || '—')}</span>
                <span class="bd ${j.tampil_publik ? 'gr' : 'sl'}">${j.tampil_publik ? 'Showcase Publik' : 'Privat'}</span>
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
    `;
  }

  function subCard(s) {
    const pc = perluCek(s), dl = dayDiff(s.deadline_respon);
    return `
      <div class="card kanban-card" draggable="true" data-drag-id="${s.id}">
        ${pc ? `<div style="margin-bottom:6px"><span class="bd am">⏱ Perlu dicek · ${-dayDiff(s.tgl_cek)} hr</span></div>` : ''}
        <h3 style="font-size:14px;margin:4px 0 6px;line-height:1.3">${esc(s.judul)}</h3>
        <div class="mu" style="font-size:12.5px;margin-bottom:4px;display:flex;align-items:center;gap:4px">${SVG.book} ${esc(jname(s.id_jurnal))}</div>
        <div class="mu" style="font-size:11.5px">Submit: ${fmt(s.tgl_submit)} · Cek: ${fmt(s.tgl_cek)}</div>
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
                <th>Status</th>
                <th>Submit</th>
                <th>Cek Terakhir</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${L.map(s => `
                <tr>
                  <td>
                    <b style="color:var(--tx);font-size:14px">${esc(s.judul)}</b>
                    ${perluCek(s) ? '<div><span class="bd am" style="margin-top:4px">Perlu dicek</span></div>' : ''}
                  </td>
                  <td>${esc(jname(s.id_jurnal))}</td>
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
              `).join('') || '<tr><td colspan="6" class="mu" style="text-align:center;padding:24px">Belum ada submission.</td></tr>'}
            </tbody>
          </table>
        </div>
      `;

    return head('Submission Tracker', 'Pantau perkembangan manuskrip artikel ilmiah dari draft hingga terbit', `
      ${tgl}
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
            <label>Nama Lengkap &amp; Gelar (tampil di showcase publik)</label>
            <input class="in" name="nama" value="${esc(c.nama)}" placeholder="Dr. Nama Dosen, M.Kom.">
            
            <label>Afiliasi / Universitas</label>
            <input class="in" name="afiliasi" value="${esc(c.afiliasi)}" placeholder="Fakultas / Universitas">
            
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
      ['link_berkas', 'Tautan Folder Google Drive', 'url'],
      ['link_pdf', 'Tautan Dokumen PDF Naskah', 'url'],
      ['catatan', 'Catatan Internal', 'textarea'],
      ['tampil_publik', 'Tampilkan di showcase publik', 'check']
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
      ['tampil_publik', 'Tampilkan di showcase publik', 'check']
    ],
    Submission: [
      ['id_penelitian', 'Penelitian Induk', 'select', 'pen'],
      ['judul', 'Judul Naskah Artikel *', 'text'],
      ['id_jurnal', 'Jurnal Sasaran Tujuan', 'select', 'jur'],
      ['status', 'Status Manuskrip', 'select', STAT.map(x => [x])],
      ['tgl_submit', 'Tanggal Submit', 'date'],
      ['tgl_cek', 'Tanggal Cek Terakhir', 'date'],
      ['deadline_respon', 'Deadline Respon / Revisi', 'date'],
      ['link_feedback', 'Tautan Feedback Reviewer (internal)', 'url'],
      ['link_final', 'Tautan Artikel Final (Published)', 'url'],
      ['doi', 'Nomor DOI', 'text'],
      ['tahun_terbit', 'Tahun Terbit', 'text'],
      ['catatan', 'Catatan Internal Tim', 'textarea'],
      ['tampil_publik', 'Tampilkan di showcase publik', 'check']
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
    if (o === 'pen') o = [['', '— Pilih Penelitian Induk —'], ...S.D.Penelitian.map(p => [p.id, p.judul])];
    if (o === 'jur') o = [['', '— Pilih Jurnal Tujuan —'], ...S.D.Jurnal.map(j => [j.id, j.nama])];
    return o.map(([a, b]) => `<option value="${esc(a)}" ${a === v ? 'selected' : ''}>${esc(b || a)}</option>`).join('');
  };

  function openForm(ent, rec) {
    rec = rec || {};
    if (ent === 'Jurnal') rec = { jenis_kampus: 'PTN', ...rec, akreditasi: akr(rec) };
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
            <div class="act">
              <button type="button" class="btn" data-a="mclose">Batal</button>
              <button class="btn pri">Simpan Perubahan</button>
            </div>
          </form>
        </div>
      </div>
    `);
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

  function exportBKD() {
    const D = S.D; if (!D) return;
    const c = (D.Pengaturan || [])[0] || {};
    const win = window.open('', '_blank');
    if (!win) return toast('Pop-up cetak terblokir di browser Anda', true);
    const pens = D.Penelitian || [], subs = D.Submission || [], J = Object.fromEntries((D.Jurnal || []).map(j => [j.id, j]));
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rekapitulasi BKD - ${esc(c.nama || 'Dosen')}</title>
    <style>
      body{font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#0F172A;padding:36px;line-height:1.6;max-width:960px;margin:auto}
      h1{font-size:20px;margin:0 0 4px;text-align:center;text-transform:uppercase;color:#1E3A8A}
      h2{font-size:13.5px;margin:0 0 20px;text-align:center;color:#64748B;font-weight:normal}
      .meta{border:1px solid #E2E8F0;background:#F8FAFC;padding:16px;border-radius:8px;margin-bottom:24px;font-size:13px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
      table{width:100%;border-collapse:collapse;margin-bottom:24px;font-size:12px}
      th,td{border:1px solid #CBD5E1;padding:9px 12px;text-align:left;vertical-align:top}
      th{background:#F1F5F9;font-weight:bold;color:#1E293B}
      .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;background:#E2E8F0}
      .sec-title{font-size:14.5px;font-weight:bold;margin:20px 0 10px;border-bottom:2px solid #1E3A8A;padding-bottom:5px;color:#1E3A8A}
      @media print{button{display:none}body{padding:0}}
    </style></head><body>
    <div style="text-align:right;margin-bottom:16px"><button onclick="window.print()" style="padding:9px 18px;cursor:pointer;background:#1E3A8A;color:#fff;border:none;border-radius:6px;font-weight:bold;font-size:13px">🖨️ Cetak / Simpan PDF</button></div>
    <h1>Rekapitulasi Penelitian &amp; Publikasi Ilmiah</h1>
    <h2>Laporan Kinerja Dosen / BKD · Dicetak pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
    <div class="meta">
      <div><b>Nama Dosen:</b> ${esc(c.nama || '—')}</div>
      <div><b>Afiliasi:</b> ${esc(c.afiliasi || '—')}</div>
      <div><b>Total Penelitian:</b> ${pens.length} Judul</div>
      <div><b>Total Publikasi/Artikel:</b> ${subs.length} Naskah</div>
    </div>
    <div class="sec-title">A. Data Riset &amp; Penelitian</div>
    <table>
      <thead><tr><th style="width:30px">No</th><th>Judul Penelitian</th><th>Bidang Ilmu</th><th>Kolaborator</th><th>Mulai</th><th>Status</th></tr></thead>
      <tbody>${pens.map((p, i) => `<tr><td style="text-align:center">${i + 1}</td><td><b>${esc(p.judul)}</b></td><td>${esc(p.bidang || '—')}</td><td>${esc(p.kolaborator || 'Mandiri')}</td><td>${fmt(p.tanggal_mulai)}</td><td>${esc(p.status)}</td></tr>`).join('') || '<tr><td colspan="6" style="text-align:center">Belum ada data penelitian</td></tr>'}</tbody>
    </table>
    <div class="sec-title">B. Data Submission &amp; Publikasi Artikel Ilmiah</div>
    <table>
      <thead><tr><th style="width:30px">No</th><th>Judul Artikel</th><th>Jurnal Sasaran / Akreditasi</th><th>Status</th><th>Tahun</th><th>DOI / Tautan</th></tr></thead>
      <tbody>${subs.map((s, i) => { const j = J[s.id_jurnal] || {}; return `<tr><td style="text-align:center">${i + 1}</td><td><b>${esc(s.judul)}</b></td><td>${esc(j.nama || '—')}<br><small>${esc(akr(j))}</small></td><td><span class="badge">${esc(s.status)}</span></td><td>${esc(s.tahun_terbit || '—')}</td><td style="word-break:break-all">${esc(s.doi || s.link_final || '—')}</td></tr>`; }).join('') || '<tr><td colspan="6" style="text-align:center">Belum ada data publikasi</td></tr>'}</tbody>
    </table>
    </body></html>`;
    win.document.write(html);
    win.document.close();
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
    else if (a === 'tab') { S.tab = id; S.q = ''; S.f = { kampus: '', akr: '', biaya: '', rumpun: '' }; draw(); }
    else if (a === 'nav') { e.preventDefault(); S.page = id; S.q = ''; draw(); }
    else if (a === 'subv') { S.subv = id; draw(); }
    else if (a === 'jview') { S.jview = id; draw(); }
    else if (a === 'resetf') { S.f = { kampus: '', akr: '', biaya: '', rumpun: '' }; S.q = ''; draw(); }
    else if (a === 'logout') { API.post('logout'); API.setTok(null); S.view = 'pub'; S.D = null; loadPub(); }
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
    else if (a === 'cfp2sub') { const c = S.D.CFP.find(x => x.id === id); S.page = 'sub'; openForm('Submission', { status: 'Draft', id_jurnal: c.id_jurnal, tgl_cek: today() }); }
    else if (a === 'csv') csv(ent);
    else if (a === 'pdfBkd') exportBKD();
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
    }
  });

  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset && t.dataset.a === 'chg') {
      const s = S.D.Submission.find(x => x.id === t.dataset.id);
      upsert('Submission', { ...s, status: t.value, tgl_cek: today() });
      toast('Status naskah diubah: ' + t.value);
    }
    else if (t.id && t.id.startsWith('f_')) { S.f[t.id.slice(2)] = t.value; draw(); }
    else if (t.id === 'yr') { S.yr = t.value; draw(); }
    else if (t.id === 'jb') { S.jbiaya = t.value; draw(); }
    else if (t.id === 'oc') { S.onlyCheck = t.checked; draw(); }
  });

  let tm;
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'q' || t.id === 'jq') {
      clearTimeout(tm);
      tm = setTimeout(() => { t.id === 'q' ? S.q = t.value : S.jq = t.value; draw(); }, 200);
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
        API.setTok(r.token); S.view = 'admin'; S.page = 'dash'; S.D = null; draw(); loadAdmin();
      } else {
        b.disabled = false; b.textContent = 'Masuk ke Panel Pengelola';
        const le = $('#le'); le.style.display = 'block'; le.textContent = r.message || 'Gagal masuk.';
      }
    }
    else if (f.id === 'mf') {
      const ent = f.dataset.e, old = f.dataset.id ? S.D[ent].find(x => x.id === f.dataset.id) : {}, rec = { ...old, id: f.dataset.id || uid() };
      FIELDS[ent].forEach(fl => { const el = f.elements[fl[0]]; rec[fl[0]] = fl[2] === 'check' ? el.checked : el.value.trim(); });
      if (ent === 'Jurnal' && rec.tipe_biaya === 'Gratis') rec.apc = '';
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
    if (API.tok()) { S.view = 'admin'; draw(); loadAdmin(); }
    else { draw(); }
    loadPub();
  })();
})();
