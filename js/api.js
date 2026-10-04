// Lapisan API: fetch ke Google Apps Script (POST wajib text/plain).
(() => {
  const C = window.SIMPEN_CONFIG;

  try {
    localStorage.removeItem('sp_demo');
  } catch (_) {}

  window.API = {
    demo: false,
    tok: () => localStorage.getItem('sp_tok'),
    setTok: t => t ? localStorage.setItem('sp_tok', t) : localStorage.removeItem('sp_tok'),
    async get(action) {
      try {
        const res = await fetch(C.GAS_URL + '?action=' + encodeURIComponent(action));
        return await res.json();
      } catch (e) {
        return { success: false, message: 'Gagal terhubung ke server backend.' };
      }
    },
    async post(action, data) {
      try {
        const res = await fetch(C.GAS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action, token: API.tok(), data })
        });
        return await res.json();
      } catch (e) {
        return { success: false, message: 'Gagal terhubung ke server backend.' };
      }
    }
  };
})();
