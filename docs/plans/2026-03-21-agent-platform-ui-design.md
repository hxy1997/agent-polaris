# 多场景 Agent 平台页面设计稿

日期: 2026-03-21
状态: Draft v1
范围: B 端内部系统, 两个核心页面

- 页面 1: 对话页
- 页面 2: 管理台

## 1. 设计目标

这是一个偏研发驱动的多场景 Agent 平台, 但终端用户只接触一个统一对话入口。设计上要同时满足两件事:

1. 前台像一个可信、克制、易上手的内部助手
2. 后台像一个清晰、可控、可发布的场景控制台

本版设计不追求复杂运营能力, 只围绕以下核心对象展开:

- 场景 Scene
- 基础场景 Base Scene
- Skills
- 工作空间 Workspace
- 发布版本 Release

## 2. 视觉方向

整体视觉定调为 `浅色企业感`:

- 风格关键词: 克制、清楚、可信、轻量、面向效率
- 避免方向: 传统 OA 感、重表格感、过强营销感、过度炫技 AI 风
- 参考体验: Gemini 的简约输入体验 + 企业工具的稳定信息结构

### 2.1 色彩

```text
Background / App:      #F7F8FA
Surface / Card:        #FFFFFF
Surface / Soft:        #F2F4F7
Border / Default:      #E7EBF0
Border / Strong:       #D8DEE6
Text / Primary:        #18202A
Text / Secondary:      #5C6675
Text / Tertiary:       #8A94A6
Primary / Brand:       #3B82F6
Primary / Hover:       #2563EB
Success:               #16A34A
Warning:               #D97706
Danger:                #DC2626
Info / Accent Blue:    #0EA5E9
```

### 2.2 字体

- 中文首选: `PingFang SC`
- 中文备选: `MiSans`, `HarmonyOS Sans SC`
- 英文与数字: `IBM Plex Sans`

推荐层级:

```text
Display 40/48 Semibold
H1      30/38 Semibold
H2      24/32 Semibold
H3      20/28 Semibold
Body L  16/24 Regular
Body M  14/22 Regular
Body S  13/20 Regular
Label   12/18 Medium
```

### 2.3 空间与圆角

```text
Grid:        8px
Radius XS:   8px
Radius S:    12px
Radius M:    16px
Radius L:    20px
Radius XL:   24px
```

### 2.4 阴影

```text
Card:
0 1px 2px rgba(16,24,40,0.04),
0 8px 24px rgba(16,24,40,0.04)

Floating:
0 12px 36px rgba(16,24,40,0.10)
```

## 3. 页面结构总览

整个平台只有两个主页面:

1. 对话页
2. 管理台

信息层级规则:

- 用户侧只看见 `场景能力`
- 研发侧管理 `场景配置`
- 复杂信息默认折叠
- 高频操作优先出现在首屏

## 4. 页面 1: 对话页

### 4.1 目标

对话页是平台唯一的用户入口。它不应该看起来像一个复杂系统, 而应该像一个统一的内部智能助手。

页面采用双态设计:

- `首页态`: 第一次进入或新建对话时
- `会话态`: 进入实际问答之后

### 4.2 桌面端布局

设计宽度建议:

- Desktop frame: `1440 x 1024`
- Main content max width: `880`
- Sidebar width: `72`

布局分区:

```text
+--------------------------------------------------------------------------------+
| Top Bar                                                                        |
+-----+--------------------------------------------------------------------------+
| Nav | Main                                                                     |
| 72  |                                                                          |
| px  |                                                                          |
|     |                                                                          |
+-----+--------------------------------------------------------------------------+
```

#### Top Bar

- 高度: `64`
- 左侧: 产品名 `Polaris`
- 中间: 当前场景选择器
- 右侧: 用户头像 / 设置

顶部不要塞入太多状态。版本号、workspace、skills 信息默认隐藏在抽屉里。

#### Left Nav

- 宽度: `72`
- 内容:
  - Logo / 首页
  - 新会话
  - 历史会话
  - 收藏场景
  - 个人设置

全部采用 icon + tooltip 模式, 不常驻文案。

### 4.3 首页态设计

首页态参考 Gemini 的克制结构, 但更偏企业工具:

- 中央标题: 当前场景名
- 次级说明: 该场景能做什么
- 一个主输入框
- 输入框下方 3 到 5 个推荐问题

首页态线框:

```text
+--------------------------------------------------------------------------------+
| Polaris                       [场景: 售前助手 v]                    [用户头像]  |
+-----+--------------------------------------------------------------------------+
|  o  |                                                                          |
|  +  |                         售前助手                                         |
|  H  |                  帮你读取资料、整理需求、生成话术                        |
|  *  |                                                                          |
|  S  |         +--------------------------------------------------------+       |
|     |         | 输入你的问题, 或粘贴客户需求 / 产品资料 / 会议摘要      |       |
|     |         |                                                        |       |
|     |         | [上传] [工具]                             [发送]       |       |
|     |         +--------------------------------------------------------+       |
|     |                                                                          |
|     |         [总结产品卖点] [生成客户回复] [竞品对比] [整理会议纪要]          |
|     |                                                                          |
+-----+--------------------------------------------------------------------------+
```

#### 首页态组件规格

- 主标题:
  - 30/38 Semibold
  - 文本色 `#18202A`
- 描述文案:
  - 16/24 Regular
  - 文本色 `#5C6675`
- 输入容器:
  - 宽 `720`
  - 高 `104`
  - 背景 `#FFFFFF`
  - 边框 `#E7EBF0`
  - 圆角 `24`
- 推荐问题:
  - 高 `36`
  - 左右 padding `14 / 10`
  - 背景 `#FFFFFF`
  - Hover `#F2F4F7`

### 4.4 会话态设计

发送第一条消息后, 首页态过渡为会话态。

会话态布局:

- 消息流居中
- 左侧仍保留窄导航
- 顶部保留场景切换
- 底部固定输入区
- 场景说明和 workspace 信息移入右侧抽屉

会话态线框:

```text
+--------------------------------------------------------------------------------+
| Polaris                      [场景: 售前助手 v]                  [信息] [头像] |
+-----+--------------------------------------------------------------------------+
|  o  |  今天                                                                    |
|  +  |                                                                          |
|  H  |  用户: 帮我整理这个客户的核心诉求                                         |
|  *  |                                                                          |
|  S  |  助手: 已根据销售资料和会议记录整理出以下 3 点...                         |
|     |                                                                          |
|     |  [已读取: 销售资料库] [调用技能 2 个] [查看过程]                          |
|     |                                                                          |
|     |  用户: 再把它改成适合微信发送的口语化版本                                 |
|     |                                                                          |
|     |                                                                          |
|     |         +--------------------------------------------------------+       |
|     |         | 继续追问 / 上传文件 / 追加要求                             发送 | 
|     |         +--------------------------------------------------------+       |
+-----+--------------------------------------------------------------------------+
```

#### 消息样式

- 用户消息:
  - 右对齐
  - 浅蓝背景 `#EEF5FF`
  - 圆角 `18`
- 助手消息:
  - 左对齐
  - 白底
  - 无重边框, 用轻阴影和段落间距区分
- 系统状态条:
  - 高 `28`
  - 文本 12/18
  - 背景 `#F2F4F7`
  - 可点击展开

#### 右侧信息抽屉

默认隐藏, 点击顶部 `信息` 按钮展开。

抽屉内容:

- 场景简介
- 当前可访问工作空间
- 当前版本号
- 近一次技能执行摘要

注意: 这里展示的是说明信息, 不是调试界面。

### 4.5 交互状态

#### 空状态

- 展示首页态
- 推荐问题基于当前场景变化

#### 输入中

- 输入框高度自动增长, 上限 `220`
- 支持拖拽上传

#### 技能执行中

- 输入框上方显示一行轻量状态
- 不弹复杂 loading 遮罩

#### 错误状态

- 消息下方显示:
  - `本次响应失败`
  - `重试`
  - `查看原因`

#### 无权限工作空间

- 不直接报技术错误
- 文案建议: `当前场景没有访问该资料的权限, 请联系管理员`

## 5. 页面 2: 管理台

### 5.1 目标

管理台是研发配置场景的唯一页面。它不是传统多级后台, 而是一个 `单页控制台`: 左侧场景树, 右侧详情工作区。

设计原则:

- 高频操作集中
- 继承关系可视
- 发布动作明确
- 尽量避免跳页

### 5.2 桌面端布局

设计宽度建议:

- Desktop frame: `1440 x 1024`
- Left rail: `280`
- Right workspace: adaptive
- Top action bar: `64`

线框:

```text
+-----------------------------------------------------------------------------------+
| Polaris Admin      [搜索场景]                     [新建场景] [发布] [用户头像]   |
+----------------------------+------------------------------------------------------+
| 场景列表 / 树              | 详情工作区                                           |
|                            |                                                      |
| 基础场景                   | [概览][模型][提示词][Skills][工作空间][发布]         |
| - corp-default             |                                                      |
|                            | 选中场景的表单 / 预览 / 版本信息                     |
| 业务场景                   |                                                      |
| - 售前助手                  |                                                      |
| - 客服助手                  |                                                      |
| - 数据分析助手              |                                                      |
|                            |                                                      |
+----------------------------+------------------------------------------------------+
```

### 5.3 左侧场景树

左侧不是简单表格, 而是资源导航。

分组:

- 基础场景
- 业务场景

每条项展示:

- 名称
- 状态点 `Draft / Published / Archived`
- 最近更新时间

Hover 时出现快捷操作:

- 重命名
- 复制
- 归档

### 5.4 右侧详情区

详情区采用 Tab 结构, 仅保留 6 个一级 Tab:

1. 概览
2. 模型
3. 提示词
4. Skills
5. 工作空间
6. 发布

#### 5.4.1 概览 Tab

内容:

- 场景名称
- 场景说明
- 可见范围
- 关联基础场景
- 当前状态
- 当前线上版本

页面顶部展示一个 `场景摘要卡片`:

```text
Scene: 售前助手
Base: corp-default
Status: Draft
Online: v2026.03.21.1
```

#### 5.4.2 模型 Tab

卡片化布局, 不做复杂参数墙。

字段:

- Provider
- Model
- Temperature
- Max Tokens
- 响应风格开关

布局建议:

- 左侧表单
- 右侧说明卡

#### 5.4.3 提示词 Tab

这是管理台最关键的一页。

结构分成三段:

1. 继承设置
2. 场景系统提示词编辑器
3. 最终 Prompt 预览

线框:

```text
+------------------------------------------------------------------------+
| 继承设置                                                               |
| [x] 继承基础场景系统提示词   基础场景: corp-default                    |
+------------------------------------------------------------------------+
| 场景系统提示词                                                         |
| ---------------------------------------------------------------------- |
| 你是一个面向企业售前团队的专业助手...                                  |
|                                                                        |
+------------------------------------------------------------------------+
| 最终 Prompt 预览                                                       |
| ---------------------------------------------------------------------- |
| [Base Prompt] + [Scene Prompt]                                         |
+------------------------------------------------------------------------+
```

编辑器风格要偏清爽文档, 不要做成深色代码编辑器。

#### 5.4.4 Skills Tab

结构分三块:

1. 继承技能
2. 本场景新增技能
3. 最终生效技能列表

每个 skill 卡片展示:

- 名称
- 描述
- 来源: `基础继承` / `本场景新增`
- 状态: `启用` / `停用`

顶部提供 `添加 Skill` 按钮, 打开资源选择弹窗。

#### 5.4.5 工作空间 Tab

V1 只做绑定, 不做文件编辑。

展示样式建议为 workspace 卡片列表, 而不是表格。

每张卡展示:

- 工作空间名称
- 根目录或逻辑挂载点
- 权限: `read` / `read-write`
- 说明

底部展示 `当前场景可访问范围预览`。

#### 5.4.6 发布 Tab

发布页必须清楚区分:

- 编辑态
- 当前线上版本
- 历史版本

布局:

- 左侧: 发布摘要
- 右侧: 版本时间线

提供 3 个主要操作:

- `保存草稿`
- `发布新版本`
- `回滚到该版本`

### 5.5 基础场景编辑

基础场景的结构和普通场景相似, 但只保留:

- 概览
- 提示词
- Skills
- 发布

明确禁止在基础场景里配置:

- 模型
- 工作空间

UI 上要用禁用说明文案写清楚:

`基础场景只负责公共约束和公共技能, 不定义模型与工作空间`

## 6. 核心组件清单

### 6.1 通用组件

- App Shell
- Top Bar
- Left Rail
- Page Tabs
- Primary Button
- Secondary Button
- Ghost Button
- Select / Search Select
- Drawer
- Modal
- Empty State
- Toast
- Status Badge

### 6.2 对话页专属

- Scene Switcher
- Prompt Composer
- Suggestion Chips
- Message Bubble
- Tool Status Row
- Session History Item
- Info Drawer

### 6.3 管理台专属

- Scene Tree Item
- Scene Summary Card
- Prompt Editor Panel
- Compiled Prompt Preview
- Skill Card
- Workspace Card
- Release Timeline
- Publish Confirmation Dialog

## 7. 组件状态规范

### 7.1 按钮

- Default
- Hover
- Pressed
- Disabled
- Loading

### 7.2 输入框

- Default
- Focused
- Error
- Disabled

### 7.3 卡片

- Default
- Hover elevation
- Selected
- Disabled

### 7.4 Badge

```text
Draft      = gray
Published  = green
Inherited  = blue
Archived   = neutral
Error      = red
```

## 8. 空状态与异常状态

### 8.1 对话页空状态

- 标题: `需要我帮你做什么?`
- 文案: `你可以提问、粘贴资料, 或从下方选择一个常用任务开始`

### 8.2 无场景可用

- 标题: `当前没有可用场景`
- 文案: `请联系管理员为你分配可访问场景`

### 8.3 管理台空状态

- 标题: `先创建第一个场景`
- 文案: `你可以从空白场景开始, 或继承一个基础场景`

### 8.4 发布校验失败

在发布按钮上方显示校验摘要:

- 未配置模型
- Prompt 为空
- 无有效技能

## 9. 动效建议

整体动效要轻:

- 页面切换: 160ms fade + translateY 4px
- Drawer: 220ms ease-out
- Suggestion chip hover: 背景色过渡 120ms
- Message append: 180ms fade-in

禁止做复杂粒子或大面积光效。

## 10. Figma 产出结构

建议 Figma 页面结构如下:

```text
01 Cover
02 Design Tokens
03 Components
04 Chat Page
05 Admin Console
06 States
07 Prototype
```

### 10.1 需要绘制的核心 Frame

#### 04 Chat Page

1. `Chat / Home / Default / 1440`
2. `Chat / Home / Hover chips / 1440`
3. `Chat / Conversation / Default / 1440`
4. `Chat / Conversation / Info drawer open / 1440`
5. `Chat / Error state / 1440`

#### 05 Admin Console

1. `Admin / Scene list + Overview / 1440`
2. `Admin / Prompt tab / 1440`
3. `Admin / Skills tab / 1440`
4. `Admin / Workspace tab / 1440`
5. `Admin / Release tab / 1440`
6. `Admin / Base scene edit / 1440`

#### 06 States

1. `Empty states`
2. `Validation states`
3. `Badges and status`
4. `Dialogs and drawers`

### 10.2 Auto Layout 约定

- 顶级页面全部使用 Auto Layout
- 左侧导航固定宽度
- 中央内容使用 max width 容器
- 表单卡片和详情卡片统一使用 24px padding
- 所有 chips / badges / buttons 建立 variants

## 11. 页面文案建议

### 11.1 对话页

- 场景名称: `售前助手`
- 场景说明: `帮你读取资料、整理需求、生成客户沟通内容`
- 输入 placeholder:
  - `输入问题, 或粘贴客户需求 / 产品资料 / 会议纪要`

推荐问题:

- `帮我总结这份产品资料`
- `整理客户的核心诉求`
- `生成一版微信回复`
- `对比我们和竞品的差异`

### 11.2 管理台

按钮文案:

- `新建场景`
- `创建基础场景`
- `保存草稿`
- `发布新版本`
- `查看最终 Prompt`

说明文案:

- `继承基础场景后, 最终 Prompt 将由基础提示词与场景提示词拼接生成`
- `当前页面只配置工作空间绑定, 不直接编辑工作空间文件`

## 12. 本版不做

- 多栏复杂聊天工作台
- 前台常驻右侧调试栏
- Workflow 设计器
- 复杂数据图表首页
- 在线编辑工作空间文件
- 多层级继承树可视化

## 13. 下一步建议

建议按以下顺序继续:

1. 先画 Figma 低保真
2. 确认前台首页态与后台 Prompt Tab
3. 再补全组件库和交互状态
4. 最后进入前端实现

## 14. Figma 画板与网格规范

这一节用于直接指导 Figma 搭建, 默认桌面端基准画板为 `1440 x 1024`。

### 14.1 文件结构

建议按以下层级组织:

```text
Polaris Agent Platform
  01 Cover
  02 Tokens
  03 Components
  04 Chat
  05 Admin
  06 States
  07 Prototype
```

### 14.2 命名规范

Frame 命名:

```text
Chat / Home / Default / 1440
Chat / Conversation / Default / 1440
Chat / Conversation / Drawer Open / 1440
Admin / Overview / 1440
Admin / Prompt / 1440
Admin / Skills / 1440
Admin / Workspace / 1440
Admin / Release / 1440
Admin / Base Scene / 1440
```

组件命名:

```text
Button / Primary / M / Default
Button / Secondary / M / Hover
Input / Textarea / Default
Chip / Suggestion / Default
Tab / Default / Active
Card / Skill / Default
Card / Workspace / Default
```

### 14.3 通用布局规则

- 根画板: `1440 x 1024`
- 页面背景: `#F7F8FA`
- 外边距: `16`
- 基础栅格: `8`
- 所有主卡片默认圆角: `20`
- 卡片内边距:
  - 常规卡片: `24`
  - 浮层卡片: `20`
  - 小型组件: `12` 或 `16`

### 14.4 对话页网格

- 左侧侧栏: `72 x 992`
- 主区域: `1320 x 992`
- 顶栏高度: `64`
- 主内容最大宽度:
  - 首页态: `720`
  - 会话态: `840`

### 14.5 管理台网格

- 主容器: `1408 x 992`
- 顶栏高度: `64`
- 左侧场景树: `280`
- 右侧详情区: `1096`
- 左右区间距: `16`
- 详情区内部使用 `12 列栅格`
  - 左右 margin: `24`
  - gutter: `24`

## 15. Chat 页面像素标注

### 15.1 Frame: Chat / Home / Default / 1440

根结构:

- Root Frame: `1440 x 1024`
- Background Fill: `#F7F8FA`
- Left Rail:
  - X `16`
  - Y `16`
  - W `72`
  - H `992`
  - Radius `20`
  - Fill `#FFFFFF`
  - Stroke `1 / #E7EBF0`
- Main Area:
  - X `104`
  - Y `16`
  - W `1320`
  - H `992`

顶栏:

- Header Container:
  - X `104`
  - Y `16`
  - W `1320`
  - H `64`
  - Padding `0 8`
  - Auto Layout: horizontal, center, space-between
- Brand Block:
  - W `120`
  - H `40`
- Scene Switcher:
  - W `240`
  - H `40`
  - Radius `12`
- User Area:
  - W `96`
  - H `40`

首页主内容:

- Hero Group:
  - W `720`
  - X `404`
  - Y `238`
  - Auto Layout: vertical
  - Gap `16`
- Scene Title:
  - W `auto`
  - H `38`
  - Font `30/38 Semibold`
- Scene Description:
  - W `560`
  - H `24`
  - Font `16/24`
  - Color `#5C6675`

输入框卡片:

- Composer Card:
  - W `720`
  - H `112`
  - Radius `24`
  - Fill `#FFFFFF`
  - Stroke `1 / #E7EBF0`
  - Shadow `Card`
  - Padding `20 20 16 20`
  - Gap `12`
- Textarea Region:
  - W `680`
  - Min H `44`
  - Font `16/24`
- Toolbar Row:
  - W `680`
  - H `32`
  - Auto Layout: horizontal, center, space-between

推荐问题区:

- Suggestion Row:
  - W `720`
  - Auto Layout: horizontal wrap
  - Gap `12`
  - Top margin from composer `20`
- Suggestion Chip:
  - H `36`
  - Radius `18`
  - Padding `10 14`
  - Fill `#FFFFFF`
  - Stroke `1 / #E7EBF0`
  - Font `13/20 Medium`

左侧侧栏图标布局:

- 顶部 Logo Icon:
  - 40 x 40
  - Top padding `12`
- 功能图标:
  - 40 x 40
  - Vertical gap `12`
- 底部个人设置:
  - 锚定到底部, bottom `16`

### 15.2 Frame: Chat / Conversation / Default / 1440

根结构沿用首页态, 变化在主内容区域。

消息流区域:

- Message Column:
  - W `840`
  - X `344`
  - Y `112`
  - H `688`
  - Auto Layout: vertical
  - Gap `20`

日期分隔:

- Date Divider:
  - W `840`
  - H `24`
  - Text `13/20`
  - Color `#8A94A6`

用户消息:

- Max Width `560`
- Right aligned
- Padding `14 16`
- Radius `18`
- Fill `#EEF5FF`
- Font `14/22`

助手消息:

- W `840`
- Auto Height
- Padding `0`
- 内容段落间距 `12`
- 文本宽度建议不超过 `720`

技能状态条:

- Tool Status Row:
  - H `28`
  - Radius `14`
  - Fill `#F2F4F7`
  - Padding `0 10`
  - Gap `8`
  - Font `12/18 Medium`

底部输入区:

- Composer Dock:
  - X `344`
  - Y `888`
  - W `840`
  - H `88`
  - Radius `20`
  - Fill `#FFFFFF`
  - Stroke `1 / #E7EBF0`
  - Shadow `Floating`
  - Padding `16`
- Input Inner:
  - W `808`
  - H `56`
  - Auto Layout: horizontal, center, space-between

### 15.3 Frame: Chat / Conversation / Drawer Open / 1440

当右侧信息抽屉打开时, 主消息列略收缩。

- Info Drawer:
  - X `1088`
  - Y `96`
  - W `320`
  - H `896`
  - Radius `20`
  - Fill `#FFFFFF`
  - Stroke `1 / #E7EBF0`
  - Padding `20`
  - Gap `16`
- Message Column:
  - W `760`
  - X `312`
- Composer Dock:
  - W `760`
  - X `312`

抽屉内部模块:

- Scene Summary Card: `280 x 112`
- Workspace List Card: auto height, min `160`
- Version / Meta Card: `280 x 88`

### 15.4 Frame: Chat / Error State / 1440

在会话态基础上增加错误提示块:

- Error Inline Card:
  - W `420`
  - Min H `72`
  - Radius `16`
  - Fill `#FFF7F7`
  - Stroke `1 / #F3D0D0`
  - Padding `16`
  - Gap `8`

按钮:

- Retry Button: `32` 高, Secondary
- Detail Link: `13/20 Medium`

## 16. Admin 页面像素标注

### 16.1 Frame: Admin / Overview / 1440

根结构:

- Root Frame: `1440 x 1024`
- Background: `#F7F8FA`
- App Shell:
  - X `16`
  - Y `16`
  - W `1408`
  - H `992`
  - Radius `24`
  - Fill `#FFFFFF`
  - Stroke `1 / #E7EBF0`

顶栏:

- Header:
  - W `1408`
  - H `64`
  - Padding `0 24`
  - Bottom stroke `1 / #EEF2F6`

顶栏内容:

- Title Block: `180 x 32`
- Search: `320 x 40`
- Action Group: auto width, gap `12`
- 主按钮默认高 `40`

内容区:

- Content Region:
  - X `32`
  - Y `96`
  - W `1376`
  - H `896`
  - Auto Layout: horizontal
  - Gap `16`

左侧场景树:

- Scene Tree Panel:
  - W `280`
  - H `896`
  - Radius `20`
  - Fill `#F9FAFB`
  - Stroke `1 / #EEF2F6`
  - Padding `16`
- Tree Section Title:
  - H `20`
  - Font `12/18 Medium`
  - Color `#8A94A6`
- Tree Item:
  - W `248`
  - H `56`
  - Radius `14`
  - Padding `12`
  - Gap `8`

右侧详情区:

- Detail Panel:
  - W `1080`
  - H `896`
  - Radius `20`
  - Fill `#FFFFFF`
  - Padding `24`
  - Gap `24`

Tab 区:

- Tab Row:
  - H `40`
  - Gap `8`
- Tab Item:
  - H `40`
  - Padding `0 14`
  - Radius `12`

概览内容:

- Scene Summary Card:
  - W `1032`
  - H `112`
  - Radius `18`
  - Fill `#F7F9FC`
  - Padding `20`
- Stats Row:
  - 4 items
  - Each item width `232`
  - Gap `16`
- Two Column Cards:
  - Each `508 x 240`
  - Gap `16`

### 16.2 Frame: Admin / Prompt / 1440

Prompt Tab 使用 `左编辑 + 右预览` 两栏。

- Tab Content Region:
  - W `1032`
  - Auto Layout: horizontal
  - Gap `24`

左栏:

- Left Column:
  - W `520`
  - Auto Layout: vertical
  - Gap `16`
- Inherit Card:
  - W `520`
  - H `88`
  - Radius `16`
  - Padding `20`
- Prompt Editor Card:
  - W `520`
  - H `520`
  - Radius `16`
  - Padding `20`
  - 编辑器内文本区域高度 `448`

右栏:

- Right Column:
  - W `488`
- Compiled Preview Card:
  - W `488`
  - H `624`
  - Radius `16`
  - Padding `20`
  - 预览正文文本宽度 `448`

底部按钮组:

- Sticky Action Bar:
  - W `1032`
  - H `64`
  - Padding `12 16`
  - Top stroke `1 / #EEF2F6`

### 16.3 Frame: Admin / Skills / 1440

Skills 页采用三列对比结构。

- Column Group:
  - W `1032`
  - Auto Layout: horizontal
  - Gap `24`

三列宽度:

- Inherited Skills Column: `320`
- Scene Skills Column: `320`
- Effective Skills Column: `344`

列卡片:

- Column Card:
  - Radius `16`
  - Padding `16`
  - Gap `12`
  - Min H `640`

Skill Card:

- W `288`
- Min H `88`
- Radius `14`
- Fill `#FFFFFF`
- Stroke `1 / #E7EBF0`
- Padding `14`
- Gap `8`

Skill Card 内容:

- 标题区 `20` 高
- 描述区最多 `2` 行
- 底部状态与来源 badge 同行排列

### 16.4 Frame: Admin / Workspace / 1440

Workspace 页采用 `左卡片列表 + 右访问摘要`。

- Left Column:
  - W `648`
  - Gap `16`
- Right Column:
  - W `360`
  - Gap `16`

Workspace Card:

- W `648`
- Min H `104`
- Radius `16`
- Padding `18`
- Gap `10`

卡片内部:

- Header Row: 标题 + 权限 badge
- Meta Row: root id / relative path
- Footer Row: 描述或说明文案

右侧摘要卡:

- Access Summary Card:
  - W `360`
  - H `180`
- Empty Card:
  - W `360`
  - H `120`

### 16.5 Frame: Admin / Release / 1440

发布页采用 `左摘要 + 右时间线`。

- Left Summary Column:
  - W `344`
  - Gap `16`
- Right Timeline Column:
  - W `664`
  - Gap `12`

Publish Summary Card:

- W `344`
- H `220`
- Radius `16`
- Padding `20`

Version Timeline Card:

- W `664`
- Min H `640`
- Radius `16`
- Padding `20`
- Gap `12`

Timeline Item:

- W `624`
- Min H `72`
- Radius `14`
- Padding `14`
- Gap `8`

主操作按钮顺序:

1. 发布新版本
2. 保存草稿
3. 回滚到所选版本

### 16.6 Frame: Admin / Base Scene / 1440

基础场景编辑页沿用 Prompt / Skills 结构, 但顶部增加说明条。

- Info Banner:
  - W `1032`
  - H `56`
  - Radius `14`
  - Fill `#F4F8FF`
  - Stroke `1 / #D7E6FF`
  - Padding `0 16`
  - 文案: `基础场景只负责公共提示词和公共 Skills, 不定义模型与工作空间`

## 17. 组件尺寸与 Variant 规范

### 17.1 Button

Button 尺寸:

- S: `32` 高, Radius `10`, Padding `0 12`
- M: `40` 高, Radius `12`, Padding `0 14`
- L: `44` 高, Radius `14`, Padding `0 16`

Button 类型:

- Primary
- Secondary
- Ghost
- Danger

状态:

- Default
- Hover
- Pressed
- Disabled
- Loading

### 17.2 Input / Textarea

- Input M:
  - H `40`
  - Radius `12`
  - Padding `0 12`
- Textarea Chat:
  - Min H `44`
  - Max H `180`
  - Radius `16`
  - Padding `0`
- Textarea Editor:
  - Min H `320`
  - Radius `12`
  - Padding `14`

### 17.3 Badge

- Height `24`
- Radius `12`
- Padding `0 10`
- Font `12/18 Medium`

Variant:

- Draft
- Published
- Inherited
- Read Only
- Read Write
- Error

### 17.4 Tabs

- Height `40`
- Radius `12`
- Padding `0 14`
- Active Fill `#EEF5FF`
- Active Text `#2563EB`
- Default Text `#5C6675`

### 17.5 Scene Tree Item

- Height `56`
- Radius `14`
- Padding `12`
- Gap `8`

状态:

- Default
- Hover
- Selected
- Draft
- Published

## 18. Prototype 连接建议

建议至少连通以下原型路径:

1. `Chat / Home / Default / 1440`
2. 点击发送 -> `Chat / Conversation / Default / 1440`
3. 点击信息 -> `Chat / Conversation / Drawer Open / 1440`
4. 点击错误重试 -> 返回 `Chat / Conversation / Default / 1440`
5. `Admin / Overview / 1440`
6. Tab 切换到 `Admin / Prompt / 1440`
7. Tab 切换到 `Admin / Skills / 1440`
8. Tab 切换到 `Admin / Workspace / 1440`
9. Tab 切换到 `Admin / Release / 1440`

## 19. 设计师执行顺序

如果直接开始画 Figma, 建议顺序如下:

1. 先搭 `02 Tokens`
2. 再搭 `03 Components`
3. 先画 `Chat / Home / Default / 1440`
4. 再画 `Chat / Conversation / Default / 1440`
5. 再画 `Admin / Overview / 1440`
6. 完成后复制扩展成 Prompt / Skills / Workspace / Release

这样可以最快形成统一骨架, 避免后面返工。
