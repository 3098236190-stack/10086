let timer;
export default function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.style.cssText =
      "position:fixed;left:50%;bottom:40px;transform:translateX(-50%) translateY(20px);" +
      "background:rgba(26,35,50,.94);color:#fff;padding:11px 22px;border-radius:24px;font-size:13px;" +
      "z-index:200;opacity:0;transition:.25s;pointer-events:none;box-shadow:0 6px 24px rgba(0,0,0,.2)";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => { el.style.opacity = "1"; el.style.transform = "translateX(-50%) translateY(0)"; });
  clearTimeout(timer);
  timer = setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateX(-50%) translateY(20px)"; }, 1900);
}
