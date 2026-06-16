export function fmtPct(v, withSign = true) {
  if (v === null || v === undefined || isNaN(v)) return "--";
  return (v > 0 && withSign ? "+" : "") + Number(v).toFixed(2) + "%";
}
export function cls(v) {
  return v > 0 ? "up" : v < 0 ? "down" : "flat";
}
