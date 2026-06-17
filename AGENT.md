# 基智汇 · 全栈版项目说明（AGENT.md）

面向「理财小白 + 进阶基民」双受众的**基金资讯门户 + 投资者教育平台**全栈实现。
本文档说明技术栈、目录结构、启动方式、接口、后台账号与测试。

> ⚠️ 站内所有基金、净值、收益、排名、资讯均为**虚构演示数据**，不代表任何真实产品，不构成投资建议。

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | Vue 3 + Vue Router + Vite（SPA），原生 SVG 图表，响应式 + 深色模式 |
| 后端 | Django 5.1 + Django REST Framework |
| 数据库 | SQLite（迁移 + 种子真实数据） |
| 后台 | django-simpleui（中文，一级/二级菜单） |
| 跨域 | django-cors-headers |
| 测试 | Playwright（桌面 + 移动；静态版与全栈版两套） |

## 目录结构

```
10086/
├── backend/                 # Django 后端
│   ├── config/              # 项目（settings / urls / wsgi）
│   ├── funds/               # 基金、经理、指数、板块 + seed 命令
│   ├── content/             # 投教文章、策略、资讯
│   ├── inquiry/             # 用户咨询（联系表单落库）
│   ├── manage.py
│   └── requirements.txt
├── frontend/                # Vue 3 + Vite 前端
│   └── src/{views,components,utils,store,api.js,router.js}
├── tests/
│   ├── e2e/                 # 早期静态站 E2E
│   └── e2e-fullstack/       # 全栈 E2E（前端 ← API ← DB）
├── playwright.config.js              # 静态站测试配置
├── playwright.fullstack.config.js    # 全栈测试配置
└── (根目录早期纯静态站：index.html / css / js —— 可独立部署的轻量演示)
```

## 启动方式

### 后端
```bash
cd backend
python3 -m venv ../.venv && ../.venv/bin/pip install -r requirements.txt
../.venv/bin/python manage.py migrate
../.venv/bin/python manage.py seed         # 写入真实演示数据 + 创建后台账号
../.venv/bin/python manage.py runserver 8000
```

### 前端
```bash
cd frontend
npm install
npm run dev          # 开发：http://localhost:5173
# 或 npm run build && npm run preview   # 预览构建产物：4173
```
前端通过 `VITE_API_BASE`（默认 `http://127.0.0.1:8000/api`）连接后端。

## 后台账号

- 地址：`http://localhost:8000/admin/`
- 账号：`admin` / `admin12345`（由 `seed` 命令创建，**仅演示用**）
- 菜单：内容管理（投教/策略/资讯）、基金数据（基金/经理/指数/板块）、用户咨询；
  支持列表、筛选、搜索、详情；用户咨询仅由前台表单产生，后台可改处理状态与备注。

## 主要接口（`/api/`）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/home/` | 首页聚合（指数/板块/涨幅TOP10/投教精选/资讯） |
| GET | `/funds/` | 基金列表，支持 `?search=`、`?ordering=`、`?risk=`、`?ftype=` |
| GET | `/funds/{code}/` | 基金详情（含净值曲线、持仓、经理、费率） |
| GET | `/education/` `/education/{slug}/` | 投教文章列表/详情，支持 `?level=`、`?search=` |
| GET | `/strategies/` `/strategies/{slug}/` | 投资策略 |
| GET | `/news/` | 市场资讯，支持 `?category=` |
| POST | `/inquiries/` | 提交联系/咨询表单（落库），含联系方式与内容校验 |

## 测试

```bash
# 全栈端到端（自动拉起 Django + Vue 预览，验证前端←API←DB 整链路）
CHROME_BIN=<chromium 可执行文件> npx playwright test -c playwright.fullstack.config.js
```
覆盖：首页数据来自 API、SPA 导航、向导选基、进阶筛选、基金详情图表、定投计算器、
联系表单正常提交（写库）与异常拦截、搜索兜底；桌面 + 移动双设备；并自动拦截控制台错误与 NaN/undefined。

---
演示项目 · 仅供学习交流。市场有风险，投资需谨慎。
