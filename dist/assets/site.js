(() => {
  const t = document.querySelector(".nav-toggle"), nav = document.getElementById("site-nav");
  if (t && nav) t.addEventListener("click", () => { const o = t.getAttribute("aria-expanded") === "true"; t.setAttribute("aria-expanded", !o); nav.classList.toggle("open", !o); });
  const c = document.getElementById("cookie-notice");
  try { if (c && !localStorage.getItem("jtc-cookie-ok")) c.hidden = false; } catch (e) {}
  const ok = document.getElementById("cookie-ok");
  if (ok) ok.addEventListener("click", () => { c.hidden = true; try { localStorage.setItem("jtc-cookie-ok", "1"); } catch (e) {} });
  // Generic list filters: [data-filter-text] input + [data-filter-tag] chips filter sibling .grid cards by data-tags / text
  document.querySelectorAll(".filters").forEach((f) => {
    const scope = document.querySelector(f.dataset.filterTarget || ".grid");
    if (!scope) return;
    const input = f.querySelector("[data-filter-text]"), chips = f.querySelectorAll("[data-filter-tag]"), empty = scope.parentNode.querySelector(".empty");
    let tag = "";
    const apply = () => {
      const q = (input ? input.value : "").trim().toLowerCase(); let n = 0;
      scope.querySelectorAll(".card").forEach((c) => {
        const okTag = !tag || (" " + c.dataset.tags + " ").includes(" " + tag + " ");
        const okText = !q || c.textContent.toLowerCase().includes(q) || (c.dataset.tags || "").includes(q);
        c.hidden = !(okTag && okText); if (!c.hidden) n++;
      });
      if (empty) empty.hidden = n > 0;
    };
    if (input) input.addEventListener("input", apply);
    chips.forEach((ch) => ch.addEventListener("click", () => { tag = ch.dataset.filterTag; chips.forEach((x) => { x.classList.toggle("is-on", x === ch); x.setAttribute("aria-pressed", x === ch); }); apply(); }));
  });
})();
