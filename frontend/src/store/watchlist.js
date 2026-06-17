// 自选（成员 + 分组 + 备注），保存在本地浏览器
const KEY = "jzh_watchlist";
const META = "jzh_wl_meta";

function readList() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }
function readMeta() {
  try { const m = JSON.parse(localStorage.getItem(META) || "{}"); m.groups = m.groups || []; m.items = m.items || {}; return m; }
  catch { return { groups: [], items: {} }; }
}
function writeMeta(m) { localStorage.setItem(META, JSON.stringify(m)); }

export default {
  list: readList,
  has(code) { return readList().includes(code); },
  add(code) { const l = readList(); if (!l.includes(code)) { l.push(code); localStorage.setItem(KEY, JSON.stringify(l)); } },
  remove(code) {
    localStorage.setItem(KEY, JSON.stringify(readList().filter((c) => c !== code)));
    const m = readMeta(); delete m.items[code]; writeMeta(m);
  },
  toggle(code) { if (this.has(code)) { this.remove(code); return false; } this.add(code); return true; },
  groups() { return ["默认", ...readMeta().groups]; },
  addGroup(name) {
    name = (name || "").trim(); if (!name || name === "默认") return false;
    const m = readMeta(); if (m.groups.includes(name)) return false;
    m.groups.push(name); writeMeta(m); return true;
  },
  removeGroup(name) {
    if (name === "默认") return;
    const m = readMeta();
    m.groups = m.groups.filter((g) => g !== name);
    Object.keys(m.items).forEach((c) => { if (m.items[c]?.group === name) m.items[c].group = "默认"; });
    writeMeta(m);
  },
  groupOf(code) { return readMeta().items[code]?.group || "默认"; },
  setGroup(code, name) { const m = readMeta(); m.items[code] = m.items[code] || {}; m.items[code].group = name; writeMeta(m); },
  noteOf(code) { return readMeta().items[code]?.note || ""; },
  setNote(code, note) { const m = readMeta(); m.items[code] = m.items[code] || {}; m.items[code].note = note; writeMeta(m); },
};
