// mark
console.log("Startup");
! function () {
  const e = document.querySelectorAll(`script[src="chrome-extension://${chrome.runtime.id}/page.js"]`);
  for (const t of e) t.remove();
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = chrome.runtime.getURL('style.css');
  (document.head || document.documentElement).appendChild(link);
}(),
  function (e, t) {
    try {
      const o = document.querySelector(t),
        i = document.createElement("script");
      i.setAttribute("type", "text/javascript"), i.setAttribute("src", e), null == o || o.appendChild(i);
    } catch (e) {
      throw e;
    }
  }(chrome.runtime.getURL("page.js"), "body");