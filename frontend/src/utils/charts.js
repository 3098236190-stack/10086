// 轻量 SVG 图表（折线含悬停 / 环形 / 横向柱），无第三方依赖。
const NS = "http://www.w3.org/2000/svg";
function el(name, attrs) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}

export function line(container, opts) {
  container.innerHTML = "";
  const W = container.clientWidth || 640;
  const H = opts.height || 280;
  const padL = 44, padR = 14, padT = 14, padB = 26;
  const series = opts.series;
  const n = series[0].values.length;

  let all = [];
  series.forEach((s) => (all = all.concat(s.values)));
  let min = Math.min(...all), max = Math.max(...all);
  const span = max - min || 1;
  min -= span * 0.08; max += span * 0.08;

  const x = (i) => padL + (W - padL - padR) * (i / (n - 1));
  const y = (v) => padT + (H - padT - padB) * (1 - (v - min) / (max - min));

  const svg = el("svg", { width: "100%", height: H, viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "none" });
  svg.style.display = "block";

  const gridN = 4;
  for (let g = 0; g <= gridN; g++) {
    const gv = min + ((max - min) * g) / gridN;
    const gy = y(gv);
    svg.appendChild(el("line", { x1: padL, y1: gy, x2: W - padR, y2: gy, stroke: "rgba(125,138,158,.22)", "stroke-width": 1 }));
    const tx = el("text", { x: padL - 6, y: gy + 3, "text-anchor": "end", "font-size": 10, fill: "#8a93a0" });
    tx.textContent = (opts.fmtAxis || ((v) => v.toFixed(3)))(gv);
    svg.appendChild(tx);
  }

  const path = (vals) => {
    let d = "";
    for (let i = 0; i < vals.length; i++) d += (i ? "L" : "M") + x(i).toFixed(1) + " " + y(vals[i]).toFixed(1) + " ";
    return d;
  };

  series.forEach((s, si) => {
    if (s.fill) {
      const area = path(s.values) + `L${x(n - 1)} ${y(min)} L${x(0)} ${y(min)} Z`;
      const gid = "g" + si + "_" + Math.random().toString(36).slice(2, 6);
      const defs = el("defs", {});
      const lg = el("linearGradient", { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 });
      lg.appendChild(el("stop", { offset: "0%", "stop-color": s.color, "stop-opacity": 0.22 }));
      lg.appendChild(el("stop", { offset: "100%", "stop-color": s.color, "stop-opacity": 0 }));
      defs.appendChild(lg); svg.appendChild(defs);
      svg.appendChild(el("path", { d: area, fill: `url(#${gid})` }));
    }
    svg.appendChild(el("path", { d: path(s.values), fill: "none", stroke: s.color, "stroke-width": s.width || 2, "stroke-linejoin": "round" }));
  });

  const hoverLine = el("line", { x1: 0, y1: padT, x2: 0, y2: H - padB, stroke: "#c2cbd6", "stroke-width": 1, "stroke-dasharray": "3 3", opacity: 0 });
  svg.appendChild(hoverLine);
  const dots = series.map((s) => {
    const c = el("circle", { r: 4, fill: "#fff", stroke: s.color, "stroke-width": 2, opacity: 0 });
    svg.appendChild(c); return c;
  });

  container.style.position = "relative";
  container.appendChild(svg);

  const tip = document.createElement("div");
  tip.style.cssText = "position:absolute;pointer-events:none;background:#1a2332;color:#fff;font-size:11px;padding:7px 10px;border-radius:7px;opacity:0;transition:opacity .1s;white-space:nowrap;z-index:5;box-shadow:0 4px 14px rgba(0,0,0,.18)";
  container.appendChild(tip);

  const overlay = el("rect", { x: 0, y: 0, width: W, height: H, fill: "transparent" });
  svg.appendChild(overlay);

  const fmtVal = opts.fmtVal || ((v) => v.toFixed(4));
  function toLocal(evt) {
    const r = svg.getBoundingClientRect();
    const cx = (evt.touches ? evt.touches[0].clientX : evt.clientX) - r.left;
    return cx * (W / r.width);
  }
  function move(evt) {
    const lx = toLocal(evt);
    let i = Math.round((lx - padL) / ((W - padL - padR) / (n - 1)));
    i = Math.max(0, Math.min(n - 1, i));
    hoverLine.setAttribute("x1", x(i)); hoverLine.setAttribute("x2", x(i)); hoverLine.setAttribute("opacity", 1);
    let rows = "";
    series.forEach((s, si) => {
      dots[si].setAttribute("cx", x(i)); dots[si].setAttribute("cy", y(s.values[i])); dots[si].setAttribute("opacity", 1);
      rows += `<div style="display:flex;align-items:center;gap:6px;margin-top:2px"><span style="width:8px;height:8px;border-radius:50%;background:${s.color}"></span>${s.name}：<b>${fmtVal(s.values[i])}</b></div>`;
    });
    const lab = opts.labels && opts.labels[i] ? opts.labels[i] : `第 ${i + 1} 个交易日`;
    tip.innerHTML = `<div style="opacity:.8;margin-bottom:2px">${lab}</div>${rows}`;
    tip.style.opacity = 1;
    const r = svg.getBoundingClientRect();
    const px = x(i) * (r.width / W);
    const tw = tip.offsetWidth;
    tip.style.left = Math.max(4, Math.min(r.width - tw - 4, px - tw / 2)) + "px";
    tip.style.top = "8px";
  }
  function leave() {
    hoverLine.setAttribute("opacity", 0); tip.style.opacity = 0;
    dots.forEach((d) => d.setAttribute("opacity", 0));
  }
  overlay.addEventListener("mousemove", move);
  overlay.addEventListener("mouseleave", leave);
  overlay.addEventListener("touchmove", move);
  overlay.addEventListener("touchend", leave);
}

export function donut(container, data, opts = {}) {
  container.innerHTML = "";
  const size = opts.size || 180, r = size / 2, ir = r * 0.62, cx = r, cy = r;
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const svg = el("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}` });
  let ang = -Math.PI / 2;
  data.forEach((d) => {
    const a2 = ang + (d.value / total) * Math.PI * 2;
    const large = a2 - ang > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const xi1 = cx + ir * Math.cos(a2), yi1 = cy + ir * Math.sin(a2);
    const xi2 = cx + ir * Math.cos(ang), yi2 = cy + ir * Math.sin(ang);
    svg.appendChild(el("path", { d: `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} L${xi1} ${yi1} A${ir} ${ir} 0 ${large} 0 ${xi2} ${yi2} Z`, fill: d.color }));
    ang = a2;
  });
  container.appendChild(svg);
}

export function hbars(container, data, opts = {}) {
  container.innerHTML = "";
  const max = Math.max(...data.map((d) => Math.abs(d.value))) || 1;
  data.forEach((d) => {
    const row = document.createElement("div");
    row.className = "sector-bar";
    row.innerHTML = `<span class="nm">${d.name}</span><span class="track"><span class="fill" style="width:${(Math.abs(d.value) / max * 100).toFixed(1)}%;background:${opts.color || "var(--blue-500)"}"></span></span><span class="pc">${d.value}${opts.unit || "%"}</span>`;
    container.appendChild(row);
  });
}
