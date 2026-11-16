// SIMPEN: Lapisan API & Client Latency Monitor (gas-instant-ux-pro)
(() => {
  const C = window.SIMPEN_CONFIG;

  try {
    localStorage.removeItem('sp_demo');
  } catch (_) {}

  // Monitor latensi klien vs server
  window.Perf = {
    rows: [],
    add(action, totalMs, serverMs) {
      this.rows.push({
        action,
        total: Math.round(totalMs) + 'ms',
        server: serverMs ? Math.round(serverMs) + 'ms' : '-',
        network: serverMs ? Math.round(Math.max(0, totalMs - serverMs)) + 'ms' : '-',
        time: new Date().toLocaleTimeString('id-ID')
      });
      if (this.rows.length > 50) this.rows.shift();
    },
    table() { console.table(this.rows); }
  };

  window.API = {
    demo: false,
    tok: () => localStorage.getItem('sp_tok'),
    setTok: t => t ? localStorage.setItem('sp_tok', t) : localStorage.removeItem('sp_tok'),
    async get(action, params = {}) {
      const t0 = performance.now();
      try {
        const p = new URLSearchParams({ action, ...params }).toString();
        const url = C.GAS_URL + (C.GAS_URL.indexOf('?') >= 0 ? '&' : '?') + p;
        const res = await fetch(url);
        const json = await res.json();
        Perf.add('GET ' + action, performance.now() - t0, json.ms);
        return json;
      } catch (e) {
        Perf.add('GET ' + action + ' (ERR)', performance.now() - t0, null);
        return { success: false, message: 'Gagal terhubung ke server backend.' };
      }
    },
    async post(action, data) {
      const t0 = performance.now();
      try {
        const res = await fetch(C.GAS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action, token: API.tok(), data })
        });
        const json = await res.json();
        Perf.add('POST ' + action, performance.now() - t0, json.ms);
        return json;
      } catch (e) {
        Perf.add('POST ' + action + ' (ERR)', performance.now() - t0, null);
        return { success: false, message: 'Gagal terhubung ke server backend.' };
      }
    }
  };
})();
