(function () {
  "use strict";

  // 年份
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var percentEl = document.getElementById("percent");
  var barFill = document.getElementById("barFill");
  var statusEl = document.getElementById("status");
  var loader = document.getElementById("loader");

  var DURATION = 2600; // 加载总时长(ms)，可调
  var start = null;
  var value = 0;

  // 缓动：先快后慢，结尾收一下，更像真实加载
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function frame(now) {
    if (start === null) start = now;
    var elapsed = now - start;
    var t = Math.min(elapsed / DURATION, 1);
    value = Math.round(easeOutCubic(t) * 100);

    percentEl.textContent = value;
    barFill.style.width = value + "%";

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      percentEl.textContent = 100;
      barFill.style.width = "100%";
      if (statusEl) statusEl.textContent = "READY";
      // 停在 100%，只保留加载画面（按需求暂不进入主页）
    }
  }

  requestAnimationFrame(frame);
})();
