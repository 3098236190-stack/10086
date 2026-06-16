# 04 · AI 制作流水线与 Prompt（STEP 4+5）

> 目标：把"选题 + 剧本"变成成片。这一章给你**完整工具链**、**一键生成剧本+分镜+图片Prompt 的大模型提示词**，和**可复制的分镜 Prompt 流水线**。

---

## 一、制作流水线总图

```
大模型(豆包/Kimi/DeepSeek/GPT)
        │  ← 一键生成：剧本 + 分镜 + 每镜图片Prompt
        ▼
文生图(即梦 / Flux / Midjourney)  ──→  固定主角形象（角色一致性）
        ▼
图生视频(可灵Kling / 即梦 / Runway / Veo)  ──→  让画面动起来
        ▼
配音(剪映朗读 / TTS)  +  字幕(剪映自动字幕)
        ▼
剪映合成：套 UI 包装(STEP6) + BGM + 音效 + 卡点
        ▼
封面(醒图/Canva) → 发布
```

### 两档预算配置

| 环节 | 经济档（够用，国内直连） | 高质档（更电影感） |
|------|----------------------|------------------|
| 剧本 | 豆包 / Kimi / DeepSeek | GPT-4 类 / Claude |
| 文生图 | 即梦 / Flux | Midjourney |
| 图生视频 | 可灵 Kling / 即梦 | Runway / Veo |
| 配音 | 剪映自带朗读 | 魔音工坊 / 专业 TTS |
| 剪辑 | 剪映专业版 | 剪映 / 达芬奇 |

> 新手强烈建议先用**经济档全国内工具**跑通整条流水线，再按需升级单点。

---

## 二、核心提示词：一键生成"剧本 + 分镜 + 图片 Prompt"

这是工业化的关键——**让大模型一次产出能直接用的全套素材**。复制下面整段，把【】里替换掉：

```
你是「人生副本」短视频的资深编导。请按以下要求，为我生成一条 60 秒短视频的完整制作包。

【副本主题】：______（如：AI 创业者 / 外卖员 / 科举考生）
【人群/基调】：______（如：打工人共鸣向 / 逆袭爽向 / 警示向）
【账号人设】：______（如：冷静的轮回管理局 AI）

请严格按"九段式公式"输出，分三部分：

# 一、口播文案（第一人称"你"，总时长约 60 秒，口语化、有节奏、每段一句话）
①Hook ②身份 ③出生 ④成长 ⑤第一次选择 ⑥转折/第二次选择 ⑦重大随机事件 ⑧结局+评分面板 ⑨金句+互动钩子

# 二、分镜表（每段对应 1 个镜头，列出：镜号 | 画面内容 | 景别 | 时长(秒) | 字幕关键词）

# 三、每个镜头的文生图 Prompt（英文，统一风格，便于直接粘贴到即梦/Flux/MJ）
风格统一为：【cinematic, first-person POV, 电影感打光, 高细节, 8K】
主角形象保持一致：______（如：25 岁亚洲男性，短发，灰色卫衣）

要求：情绪强、有反差、结尾留互动钩子；规避任何违法/敏感内容；金句要能当标题。
```

> 产出后人工再润色（尤其 Hook 和金句），不要直接全盘用。

---

## 三、分镜 Prompt 流水线（STEP 5）

### 图片 Prompt 通用公式
```
[主体/角色] + [场景/环境] + [动作/情绪] + [光线/氛围] + [镜头/视角] + [画质风格词]
```

### 固定画质风格词（每个 Prompt 都带，保证统一感）
```
cinematic, ultra detailed, 8K, dramatic lighting, film grain,
first-person POV（需要代入时）, depth of field
```
> 选一套**专属风格词**长期固定（如全部加 `cyberpunk, blue holographic HUD`），这就是你的视觉签名。

### 分镜 Prompt 范例（扩展你给的三镜，并补全一整条）

**镜头 1 · 副本载入界面（Hook）**
```
futuristic game UI loading screen, first-person POV, cyberpunk style,
blue holographic HUD, "LIFE INSTANCE LOADING" text, glowing progress bar,
dark background, cinematic, ultra detailed, 8K
```

**镜头 2 · 出生/出身（昏暗出租屋）**
```
small shabby rented room, a young Asian man, dim warm light, old computer,
late night, lonely atmosphere, first-person POV, cinematic, ultra detailed, 8K
```

**镜头 3 · 职场压迫（会议室）**
```
modern corporate meeting room, a stern boss across the table, oppressive mood,
cold blue lighting, low angle, cinematic lighting, ultra detailed, 8K
```

**镜头 4 · 第一次选择（岔路）**
```
a symbolic fork in the road at dusk, two glowing paths labeled A and B,
hesitant figure standing at the junction, cinematic, dramatic sky, 8K
```

**镜头 5 · 重大事件/高潮（爆发）**
```
explosive turning point, screens lighting up with notifications, server room glowing,
intense dramatic lighting, sense of breakthrough, cinematic, ultra detailed, 8K
```

**镜头 6 · 结局评分面板**
```
game result screen, holographic score panel showing stars for
WEALTH HEALTH FAMILY HAPPINESS, "ENDING" title, blue UI glow,
clean futuristic interface, cinematic, 8K
```

---

## 四、一致性技巧（让"同一个主角"贯穿全片）

AI 最大的坑是每张图人脸/风格都不一样。三招解决：

1. **角色锚定**：在每个镜头 Prompt 里写死主角特征（"25 yo Asian man, short black hair, grey hoodie"），或用工具的"角色参考/垫图"功能固定同一张脸。
2. **风格锁定**：所有图共用同一组风格词 + 同一色调（见 STEP 6）。可在即梦/MJ 用同一个风格参考图。
3. **少切画面**：能用"图生视频"让一张图动起来，就别频繁换图——**少切换 = 强沉浸**（这也是算法偏爱的，见 [`00`](00-为什么能爆.md)）。

---

## 五、图生视频与配音要点

- **图生视频**：给静态图加"轻微运镜"（推/拉/摇）和元素动效（HUD 闪烁、进度条走动、人物微动），单镜 2–4 秒即可。不追求大动作，**稳、有氛围**比炫技重要。
- **配音**：选一个**固定音色**（如沉稳男声/电子机械音）长期用，它是你的听觉签名。语速适中、关键句留停顿。剪映"朗读"可一键生成，免费够用。
- **字幕**：剪映自动识别字幕 → 统一字体/描边/位置，**关键词高亮变色**（见 STEP 6）。

---

## 六、批量化技巧（一次做一周）

把流程拆成"同类工序集中干"，效率翻几倍：

1. **集中写**：一次让大模型出 7 条剧本（同一人设、不同副本）。
2. **集中画**：把 7 条的所有图片 Prompt 排成一批，一次性出图。
3. **集中配**：同一音色，一次配完 7 条旁白。
4. **集中剪**：第一条剪好存成**剪映草稿模板**，后面 6 条**替换素材**即可，UI 包装一次复用。
5. **错峰发**：7 条排进一周的发布计划（见 [`09`](09-7天上手SOP与批量排期.md)）。

> 关键心法：**把"做一条"变成"做一套"**。模板做一次，复用一辈子。

---

下一步 👉 [`05-固定包装与视听规范.md`](05-固定包装与视听规范.md)：让每条视频"一眼是你"（STEP 6）。
