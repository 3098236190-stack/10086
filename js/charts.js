/* ============================================================
   基智汇 · 轻量 SVG 图表 (charts.js)
   纯原生，无第三方依赖：折线图(可多序列+悬停)、环形图、柱状图
   ============================================================ */
(function (global) {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  /* ---------------- 折线图 ----------------
     opts: {
       series: [{name, color, values:[..], fill:bool}],
       labels: [..](可选), height
     }
  */
  function line(container, opts) {
    container.innerHTML = "";
    var W = container.clientWidth || 640;
    var H = opts.height || 280;
    var padL = 44, padR = 14, padT = 14, padB = 26;
    var series = opts.series;
    var n = series[0].values.length;

    // y 范围
    var all = [];
    series.forEach(function (s) { all = all.concat(s.values); });
    var min = Math.min.apply(null, all), max = Math.max.apply(null, all);
    var span = max - min || 1; min -= span * 0.08; max += span * 0.08;

    var x = function (i) { return padL + (W - padL - padR) * (i / (n - 1)); };
    var y = function (v) { return padT + (H - padT - padB) * (1 - (v - min) / (max - min)); };

    var svg = el("svg", { width: "100%", height: H, viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none" });
    svg.style.display = "block";

    // 网格 + y 轴标签
    var gridN = 4;
    for (var g = 0; g <= gridN; g++) {
      var gv = min + (max - min) * g / gridN;
      var gy = y(gv);
      svg.appendChild(el("line", { x1: padL, y1: gy, x2: W - padR, y2: gy, stroke: "#eef2f7", "stroke-width": 1 }));
      var tx = el("text", { x: padL - 6, y: gy + 3, "text-anchor": "end", "font-size": 10, fill: "#9aa4b2" });
      tx.textContent = gv.toFixed(3);
      svg.appendChild(tx);
    }

    function path(vals) {
      var d = "";
      for (var i = 0; i < vals.length; i++) d += (i ? "L" : "M") + x(i).toFixed(1) + " " + y(vals[i]).toFixed(1) + " ";
      return d;
    }

    // 序列
    series.forEach(function (s, si) {
      if (s.fill) {
        var area = path(s.values) + "L" + x(n - 1) + " " + y(min) + " L" + x(0) + " " + y(min) + " Z";
        var gid = "grad" + si + "_" + Math.random().toString(36).slice(2, 6);
        var defs = el("defs", {});
        var lg = el("linearGradient", { id: gid, x1: 0, y1: 0, x2: 0, y2: 1 });
        lg.appendChild(el("stop", { offset: "0%", "stop-color": s.color, "stop-opacity": .22 }));
        lg.appendChild(el("stop", { offset: "100%", "stop-color": s.color, "stop-opacity": 0 }));
        defs.appendChild(lg); svg.appendChild(defs);
        svg.appendChild(el("path", { d: area, fill: "url(#" + gid + ")" }));
      }
      svg.appendChild(el("path", { d: path(s.values), fill: "none", stroke: s.color, "stroke-width": s.width || 2, "stroke-linejoin": "round" }));
    });

    // 悬停层
    var hoverLine = el("line", { x1: 0, y1: padT, x2: 0, y2: H - padB, stroke: "#c2cbd6", "stroke-width": 1, "stroke-dasharray": "3 3", opacity: 0 });
    svg.appendChild(hoverLine);
    var dots = series.map(function (s) {
      var c = el("circle", { r: 4, fill: "#fff", stroke: s.color, "stroke-width": 2, opacity: 0 });
      svg.appendChild(c); return c;
    });

    container.style.position = "relative";
    container.appendChild(svg);

    var tip = document.createElement("div");
    tip.style.cssText = "position:absolute;pointer-events:none;background:#1a2332;color:#fff;font-size:11px;" +
      "padding:7px 10px;border-radius:7px;opacity:0;transition:opacity .1s;white-space:nowrap;z-index:5;box-shadow:0 4px 14px rgba(0,0,0,.18)";
    container.appendChild(tip);

    var overlay = el("rect", { x: 0, y: 0, width: W, height: H, fill: "transparent" });
    svg.appendChild(overlay);

    function toLocal(evt) {
      var r = svg.getBoundingClientRect();
      var cx = (evt.touches ? evt.touches[0].clientX : evt.clientX) - r.left;
      return cx * (W / r.width);
    }
    function move(evt) {
      var lx = toLocal(evt);
      var i = Math.round((lx - padL) / ((W - padL - padR) / (n - 1)));
      i = Math.max(0, Math.min(n - 1, i));
      hoverLine.setAttribute("x1", x(i)); hoverLine.setAttribute("x2", x(i)); hoverLine.setAttribute("opacity", 1);
      var rows = "";
      series.forEach(function (s, si) {
        dots[si].setAttribute("cx", x(i)); dots[si].setAttribute("cy", y(s.values[i])); dots[si].setAttribute("opacity", 1);
        rows += '<div style="display:flex;align-items:center;gap:6px;margin-top:2px">' +
          '<span style="width:8px;height:8px;border-radius:50%;background:' + s.color + '"></span>' +
          s.name + "：<b>" + s.values[i].toFixed(4) + "</b></div>";
      });
      var lab = opts.labels && opts.labels[i] ? opts.labels[i] : ("第 " + (i + 1) + " 个交易日");
      tip.innerHTML = '<div style="opacity:.8;margin-bottom:2px">' + lab + "</div>" + rows;
      tip.style.opacity = 1;
      var r = svg.getBoundingClientRect();
      var px = x(i) * (r.width / W);
      var tw = tip.offsetWidth;
      tip.style.left = Math.max(4, Math.min(r.width - tw - 4, px - tw / 2)) + "px";
      tip.style.top = "8px";
    }
    function leave() {
      hoverLine.setAttribute("opacity", 0); tip.style.opacity = 0;
      dots.forEach(function (d) { d.setAttribute("opacity", 0); });
    }
    overlay.addEventListener("mousemove", move);
    overlay.addEventListener("mouseleave", leave);
    overlay.addEventListener("touchmove", function (e) { move(e); });
    overlay.addEventListener("touchend", leave);

    return svg;
  }

  /* ---------------- 环形图 ----------------
     data: [{name, value, color}]
  */
  function donut(container, data, opts) {
    opts = opts || {};
    container.innerHTML = "";
    var size = opts.size || 180, r = size / 2, ir = r * 0.62, cx = r, cy = r;
    var total = data.reduce(function (a, b) { return a + b.value; }, 0) || 1;
    var svg = el("svg", { width: size, height: size, viewBox: "0 0 " + size + " " + size });
    var ang = -Math.PI / 2;
    data.forEach(function (d) {
      var a2 = ang + (d.value / total) * Math.PI * 2;
      var large = (a2 - ang) > Math.PI ? 1 : 0;
      var x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang);
      var x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      var xi1 = cx + ir * Math.cos(a2), yi1 = cy + ir * Math.sin(a2);
      var xi2 = cx + ir * Math.cos(ang), yi2 = cy + ir * Math.sin(ang);
      var path = "M" + x1 + " " + y1 + " A" + r + " " + r + " 0 " + large + " 1 " + x2 + " " + y2 +
        " L" + xi1 + " " + yi1 + " A" + ir + " " + ir + " 0 " + large + " 0 " + xi2 + " " + yi2 + " Z";
      svg.appendChild(el("path", { d: path, fill: d.color }));
      ang = a2;
    });
    container.appendChild(svg);
    return svg;
  }

  /* ---------------- 横向柱状 ----------------
     data: [{name, value}], opts.color
  */
  function hbars(container, data, opts) {
    opts = opts || {};
    container.innerHTML = "";
    var max = Math.max.apply(null, data.map(function (d) { return Math.abs(d.value); })) || 1;
    data.forEach(function (d) {
      var row = document.createElement("div");
      row.className = "sector-bar";
      var color = opts.color || "var(--blue-500)";
      row.innerHTML = '<span class="nm">' + d.name + '</span>' +
        '<span class="track"><span class="fill" style="width:' + (Math.abs(d.value) / max * 100).toFixed(1) + '%;background:' + color + '"></span></span>' +
        '<span class="pc">' + d.value + (opts.unit || "%") + "</span>";
      container.appendChild(row);
    });
  }

  global.Charts = { line: line, donut: donut, hbars: hbars };
})(window);
