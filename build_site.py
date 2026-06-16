#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把「人生副本短视频工作流」目录下的所有 Markdown 预渲染成一个
完全自包含的单页 HTML（index.html）。
特点：内联 CSS + 内联内容 + 纯原生 JS 切换，零外网依赖、零构建。
用法：python3 build_site.py   （改完 .md 后重新跑一次即可更新网站）
"""
import os
import re
import html
import markdown

ROOT = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(ROOT, "人生副本短视频工作流")
OUT = os.path.join(ROOT, "index.html")

# 侧边栏结构：(分组名, [(文件名, 章节id, 显示标题), ...])
NAV = [
    ("开始", [
        ("README.md", "overview", "📖 总览 / 如何使用"),
    ]),
    ("策略 · 为什么能爆", [
        ("00-为什么能爆.md", "ch00", "00 为什么能爆"),
        ("01-赛道分析与账号定位.md", "ch01", "01 赛道分析与账号定位"),
    ]),
    ("生产 · 怎么做", [
        ("02-选题库-副本数据库.md", "ch02", "02 选题库 · 副本数据库"),
        ("03-视频公式与五幕剧本.md", "ch03", "03 视频公式与五幕剧本"),
        ("04-AI制作流水线与Prompt.md", "ch04", "04 AI 制作流水线与 Prompt"),
        ("05-固定包装与视听规范.md", "ch05", "05 固定包装与视听规范"),
    ]),
    ("运营 · 怎么放大", [
        ("06-发布运营与SEO.md", "ch06", "06 发布运营与 SEO"),
        ("07-账号矩阵与变现.md", "ch07", "07 账号矩阵与变现"),
        ("08-人生副本Universe.md", "ch08", "08 人生副本 Universe"),
        ("09-7天上手SOP与批量排期.md", "ch09", "09 7 天上手 SOP 与批量排期"),
    ]),
    ("实战样例 · 打工人号", [
        ("实战样例-打工人职业副本.md", "case-main", "🎬 打工人职业副本"),
        ("系列脚本-打工人35岁被优化.md", "case-series", "📺 系列追更《35岁被优化》"),
        ("互动多结局-考公vs大厂.md", "case-vote", "🗳️ 投票多结局《考公vs大厂》"),
    ]),
    ("模板 · 拿来即填", [
        ("模板/选题卡.md", "tpl-topic", "选题卡"),
        ("模板/五幕剧本模板.md", "tpl-script", "五幕剧本模板"),
        ("模板/分镜脚本与Prompt模板.md", "tpl-shot", "分镜脚本与 Prompt 模板"),
        ("模板/发布检查清单.md", "tpl-checklist", "发布检查清单"),
    ]),
]

# 文件名(basename) -> 章节id，用于把文档间的 .md 链接改写成页内跳转
basename_to_id = {}
for _, items in NAV:
    for fname, sid, _title in items:
        basename_to_id[os.path.basename(fname)] = sid


def rewrite_links(html_text):
    """把指向其它 .md 的链接改写为 #章节id 的页内跳转。"""
    def repl(m):
        path = m.group(1)
        base = path.split("/")[-1]
        sid = basename_to_id.get(base)
        if sid:
            return 'href="#%s"' % sid
        return m.group(0)
    # 匹配 href="....md" 或 href="....md#anchor"
    return re.sub(r'href="([^"]+?\.md)(?:#[^"]*)?"', repl, html_text)


def render():
    sections = []
    for _, items in NAV:
        for fname, sid, _title in items:
            fpath = os.path.join(DOCS_DIR, fname)
            with open(fpath, "r", encoding="utf-8") as f:
                md_text = f.read()
            body = markdown.markdown(
                md_text,
                extensions=["extra", "sane_lists", "admonition"],
            )
            body = rewrite_links(body)
            sections.append(
                '<section class="doc" id="%s">%s</section>' % (sid, body)
            )
    nav_html = []
    for group, items in NAV:
        nav_html.append('<div class="nav-group">%s</div>' % html.escape(group))
        for fname, sid, title in items:
            nav_html.append(
                '<a href="#%s" data-id="%s">%s</a>' % (sid, sid, html.escape(title))
            )
    return "\n".join(sections), "\n".join(nav_html)


PAGE = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>人生副本 · 短视频工作流</title>
<meta name="description" content="可复制的「人生副本」短视频赛道 AI 工业化生产工作流。" />
<style>
:root{--bg:#0d1117;--bg-soft:#0a0e14;--panel:#111722;--text:#c9d1d9;--dim:#8b949e;--accent:#39d98a;--accent2:#00e5ff;--border:#21262d;}
*{box-sizing:border-box;}
body{margin:0;background:var(--bg);color:var(--text);font-family:-apple-system,"PingFang SC","Microsoft YaHei","Segoe UI",Roboto,sans-serif;line-height:1.7;}
a{color:var(--accent);text-decoration:none;}
a:hover{text-decoration:underline;}
#layout{display:flex;min-height:100vh;}
/* 侧边栏 */
#sidebar{width:300px;flex:0 0 300px;background:var(--bg-soft);border-right:1px solid var(--border);height:100vh;overflow-y:auto;position:sticky;top:0;padding:18px 14px;}
#brand{font-size:18px;font-weight:800;color:var(--accent);letter-spacing:.5px;margin:4px 6px 14px;}
#brand small{display:block;color:var(--dim);font-weight:400;font-size:12px;margin-top:4px;letter-spacing:0;}
#search{width:100%;padding:8px 10px;margin:0 0 12px;background:var(--panel);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:13px;}
.nav-group{color:var(--dim);font-size:12px;font-weight:700;margin:14px 6px 6px;text-transform:none;letter-spacing:.5px;}
#sidebar a{display:block;color:var(--dim);padding:6px 10px;border-radius:6px;font-size:14px;margin:1px 0;}
#sidebar a:hover{color:var(--accent);background:rgba(57,217,138,.06);text-decoration:none;}
#sidebar a.active{color:var(--accent);background:rgba(57,217,138,.10);border-left:2px solid var(--accent);font-weight:600;}
/* 内容区 */
#content{flex:1;min-width:0;padding:32px 48px 96px;max-width:920px;}
.doc{display:none;}
.doc.active{display:block;animation:fade .2s ease;}
@keyframes fade{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:none;}}
h1,h2,h3,h4{color:#f0f6fc;line-height:1.35;}
h1{font-size:28px;border-bottom:1px solid var(--border);padding-bottom:.3em;}
h2{font-size:22px;color:var(--accent);border-bottom:1px solid var(--border);padding-bottom:.3em;margin-top:1.8em;}
h3{font-size:17px;color:var(--accent2);}
strong{color:#fff;}
blockquote{border-left:4px solid var(--accent);background:rgba(57,217,138,.06);color:var(--dim);margin:1em 0;padding:.6em 1em;border-radius:0 6px 6px 0;}
code{color:var(--accent2);background:#161b22;padding:.15em .4em;border-radius:4px;font-size:.9em;font-family:"SFMono-Regular",Consolas,Monaco,monospace;}
pre{background:#0a0e14;border:1px solid var(--border);border-radius:8px;padding:14px 16px;overflow:auto;}
pre code{color:#d7e1ea;background:none;padding:0;font-size:13px;line-height:1.6;}
table{border-collapse:collapse;width:100%;margin:1em 0;font-size:14px;display:block;overflow-x:auto;}
th,td{border:1px solid var(--border);padding:8px 10px;text-align:left;}
th{background:var(--panel);color:var(--accent);}
tr:nth-child(2n){background:rgba(255,255,255,.02);}
hr{border:none;border-top:1px solid var(--border);margin:2em 0;}
ul,ol{padding-left:1.4em;}
li{margin:.25em 0;}
#topbar{display:none;}
::-webkit-scrollbar{width:8px;height:8px;}
::-webkit-scrollbar-thumb{background:#30363d;border-radius:4px;}
/* 移动端 */
@media(max-width:800px){
  #layout{flex-direction:column;}
  #sidebar{width:100%;flex:none;height:auto;position:static;border-right:none;border-bottom:1px solid var(--border);}
  #content{padding:20px 18px 80px;}
}
</style>
</head>
<body>
<div id="layout">
  <nav id="sidebar">
    <div id="brand">人生副本 · 工作流<small>AI 工业化版 · 单页离线文档</small></div>
    <input id="search" type="text" placeholder="搜索章节标题…" autocomplete="off" />
    <div id="navlist">
__NAV__
    </div>
  </nav>
  <main id="content">
__SECTIONS__
  </main>
</div>
<script>
function showDoc(id){
  var docs=document.querySelectorAll('.doc');
  var found=false;
  docs.forEach(function(d){var on=d.id===id;d.classList.toggle('active',on);if(on)found=true;});
  if(!found){var first=document.querySelector('.doc');if(first){first.classList.add('active');id=first.id;}}
  document.querySelectorAll('#navlist a').forEach(function(a){a.classList.toggle('active',a.dataset.id===id);});
  document.getElementById('content').scrollTop=0;window.scrollTo(0,0);
}
function fromHash(){var id=(location.hash||'').replace('#','');showDoc(id||'overview');}
window.addEventListener('hashchange',fromHash);
document.addEventListener('DOMContentLoaded',function(){
  fromHash();
  var s=document.getElementById('search');
  s.addEventListener('input',function(){
    var q=this.value.trim().toLowerCase();
    document.querySelectorAll('#navlist a').forEach(function(a){
      var hit=a.textContent.toLowerCase().indexOf(q)>=0;
      a.style.display=(!q||hit)?'':'none';
    });
    document.querySelectorAll('.nav-group').forEach(function(g){g.style.display=q?'none':'';});
  });
});
</script>
</body>
</html>
"""


def main():
    sections, nav = render()
    page = PAGE.replace("__NAV__", nav).replace("__SECTIONS__", sections)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(page)
    print("生成完成：%s（%d KB）" % (OUT, len(page.encode("utf-8")) // 1024))


if __name__ == "__main__":
    main()
