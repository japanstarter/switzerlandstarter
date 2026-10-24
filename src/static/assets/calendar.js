(() => {
  const btns = document.querySelectorAll(".month-btn"), panels = document.querySelectorAll(".month-panel");
  function show(i) {
    btns.forEach((b) => { const on = b.dataset.month == i; b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on); });
    panels.forEach((p) => (p.hidden = p.dataset.month != i));
  }
  btns.forEach((b) => b.addEventListener("click", () => { show(b.dataset.month); history.replaceState(null, "", "#m" + (+b.dataset.month + 1)); }));
  const m = location.hash.match(/^#m(\d{1,2})$/);
  show(m && m[1] >= 1 && m[1] <= 12 ? m[1] - 1 : new Date().getMonth());
})();
