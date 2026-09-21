# 教研室事务管理系统（微信小程序）

面向高校教研室的移动端事务协同应用：教师可查看任务、提交材料、跟踪审核结果，形成
「任务下发 → 材料提交 → 审核 → 驳回修改 → 重新提交 → 归档」的完整闭环。

- **小程序名称**：教研室事务助手
- **技术栈**：uni-app + Vue 3 + TypeScript + Vite + Pinia + SCSS + dayjs
- **目标端**：微信小程序（`mp-weixin`）为主，H5 用于调试与自动化验收
- **当前阶段**：前端 MVP（Mock Data + Mock Service），**所有数据均通过 `src/services` 与 `src/api` 访问**，页面内不含散落数据，可在不改动页面的前提下切换真实后端。

---

## 一、快速开始

```bash
npm install

# H5 调试（浏览器）
npm run dev:h5            # http://localhost:5173

# 微信小程序
npm run build:mp-weixin   # 产物：dist/build/mp-weixin
npm run dev:mp-weixin     # 开发模式（watch）

# 类型检查
npm run type-check        # vue-tsc --noEmit，当前零错误
```

### 在微信开发者工具中打开

1. 打开「微信开发者工具」→ 导入项目，目录选择本仓库根目录（`project.config.json` 已将
   `miniprogramRoot` 指向 `dist/build/mp-weixin/`）。
2. AppID 处选择 **测试号**（或填入你自己的小程序 AppID）；本仓库不内置任何真实 AppID。
3. 导入后即可编译运行。

> 说明：微信开发者工具 CLI（`cli.bat open --project ...`）在新版本中要求有效 AppID，
> 因此首次打开请在 GUI 中选择「测试号」。

---

## 二、目录结构

```
jys-miniprogram/
├─ design/stitch/          # Stitch 设计稿（实现参考，不参与构建）
├─ src/
│  ├─ api/                 # 类型化接口层（task / submission / message / user）
│  ├─ services/            # 数据入口：request(mock↔real 切换)、domain(状态派生)、
│  │                       #   format(格式化)、navigation(跳转规则)、picker(跨端文件选择)、nav(胶囊适配)
│  ├─ mock/                # 唯一数据源：tasks / submissions / messages / users / handlers(状态流转) / db(时间基准)
│  ├─ stores/              # Pinia：user / task / submission / message
│  ├─ types/               # 实体与枚举：common(8 态 + 文件格式) / task / submission / message / user / upload
│  ├─ components/          # 18 个公共组件（easycom：组件名/组件名.vue）
│  ├─ pages/               # 11 个页面
│  ├─ styles/              # variables.scss(设计令牌) / mixins.scss / global.scss
│  ├─ pages.json           # 页面与全局样式（自定义导航，无原生 tabBar）
│  └─ manifest.json
└─ project.config.json     # 微信开发者工具工程配置
```

---

## 三、设计系统（单一来源）

所有颜色/尺寸来自 `src/styles/variables.scss`（经 `vite.config.ts` 以绝对路径注入每个组件），
页面与组件**不得自行定义颜色**。

| 用途 | 令牌 | 值 |
| --- | --- | --- |
| 品牌色 | `$primary` / `$primary-pressed` / `$primary-light` | `#1677FF` / `#0958D9` / `#E8F3FF` |
| 页面底色 | `$bg` | `#F5F7FA` |
| 卡片 / 分割线 | `$surface` / `$border` | `#FFFFFF` / `#E5E7EB` |
| 文字三级 | `$text-1` / `$text-2` / `$text-3` | `#1D2129` / `#4E5969` / `#86909C` |
| 语义状态 | `$success` / `$warning` / `$review` / `$danger` | `#52C41A` / `#FA8C16` / `#FAAD14` / `#FF4D4F` |
| 行按压 | `$pressed` | `#F2F3F5` |

- 圆角：卡片/按钮 8px（16rpx）、输入框 6px、标签 4px；主按钮 44px、紧凑按钮 32px。
- 零阴影、零装饰性渐变；`1rpx` 发丝分割线；设计稿 px × 2 = rpx。
- 状态标签由 **`StatusTag` 组件唯一渲染**，颜色映射集中在 `types/common.ts` 的 `STATUS_META`。
- 无外部字体/CDN：图标使用 `@dcloudio/uni-ui` 的 `uni-icons`（本地字体，随包构建）+ 少量 CSS 绘制图形。

---

## 四、业务状态与数据模型

**统一业务状态（8 态）**，定义于 `types/common.ts`：

`NOT_STARTED` 未开始 · `IN_PROGRESS` 进行中 · `DUE_SOON` 即将截止 · `PENDING_REVIEW` 待审核 ·
`APPROVED` 已通过 · `COMPLETED` 已完成 · `OVERDUE` 已逾期 · `REJECTED` 已驳回

- **存储态**（任务实体持久化）：`NOT_STARTED / IN_PROGRESS / PENDING_REVIEW / COMPLETED / REJECTED`
- **派生态**（不落库，由截止时间实时计算）：`DUE_SOON`（≤72 小时截止）、`OVERDUE`（已过期）
- 派生规则集中在 `services/domain.ts`：`deriveBizStatus / statusNoteOf / buildTaskView / primaryActionOf`

**Mock 数据（`src/mock/`）**

- 时间基准：以模块加载时刻生成相对时间轴（`at(-3,'18:00')` = 3 天前 18:00），保证任意时间打开演示，
  「即将截止 / 已逾期 / 剩余天数」都成立。
- 任务 31 条：15 条具名真实高校事务（省级一流课程申报、教学大纲、听课记录、教学质量检查、经费汇报…）
  + 16 条历史归档任务；提交单 24 条；消息 8 条；教师 7 名。
- 任务 ↔ 提交单 ↔ 消息通过 `taskId` / `submissionId` / `version` 强关联，首页统计与列表数据同源计算。

**上传状态机**：`PENDING → UPLOADING(进度%) → SUCCESS / FAILED(重新上传)`；
支持 PDF / Word / Excel / PPT / JPG / PNG，单文件 ≤ 20MB；文件选择跨端封装（`services/picker.ts`）。

---

## 五、页面与组件

**11 个页面**：首页 · 我的任务 · 任务详情 · 提交材料 · 提交成功 · 提交详情 · 审核结果 ·
重新提交 · 消息 · 我的 · 我的提交

**18 个公共组件**：`AppNavBar`（状态栏 + 微信胶囊避让）· `AppTabBar`（自定义四项导航 + 未读角标）·
`StatusTag` · `TaskCard` · `FileRow` · `UploadFileRow` · `FilterChip` · `SearchBar` · `SectionHeader` ·
`MessageRow` · `StatCard` · `GroupListCell` · `ResultState` · `EmptyState` · `ErrorState` ·
`LoadingState` · `ConfirmModal` · `Timeline`

**已跑通的业务闭环**（H5 端自动化验收已验证）：

1. 任务列表筛选"待审核" → 任务详情 → 查看提交详情
2. 提交详情「模拟审核」面板填写意见 → 驳回
3. 审核结果页（驳回态）→ 修改并重新提交
4. 重新提交页（原文件预填、可替换/删除、生成 V2）→ 确认弹窗 → 提交成功
5. 提交详情版本时间线：V1 已驳回（含审核人/意见）→ V2 待审核
6. 模拟审核「通过」→ 审核结果页（通过态）→ 任务状态联动为"已完成"
7. 消息页新增 3 条消息（提交/驳回/通过）、未读角标 5；首页统计联动（待审核 1→0、已完成 21→22）

> 「模拟审核」是演示功能：正式环境由教研室内审人在管理端操作，前端只需调用同一接口。

---

## 六、对接 Spring Boot 后端

### 6.1 切换方式

```bash
# .env.local（不要提交到仓库）
VITE_API_BASE=https://api.example.edu.cn
```

`src/services/request.ts` 通过 `API_BASE` 判定：为空 = 本地 Mock；非空 = 真实请求。
接入时把 `api/*.ts` 内的实现由 Mock 函数替换为 `uni.request`（统一封装在 `request.ts` 内），
页面与 store 无需改动。

> 安全约定：接口地址与凭据只从环境变量读取，仓库内不写入任何真实地址或密钥；
> 服务端若需代理外部 URL，仅允许 http/https，并拒绝 localhost、环回、私有与保留地址。

### 6.2 建议 REST 接口清单

| 方法 | 路径 | 说明 | 对应前端类型 |
| --- | --- | --- | --- |
| GET | `/api/v1/tasks?filter=&keyword=` | 任务列表（按状态筛选/关键词） | `TaskView[]` |
| GET | `/api/v1/tasks/{id}` | 任务详情（含派生态与最近提交） | `TaskView` |
| GET | `/api/v1/tasks/{id}/submission` | 某任务最新提交 | `SubmissionView` |
| GET | `/api/v1/submissions` | 我的提交记录 | `SubmissionView[]` |
| GET | `/api/v1/submissions/{id}` | 提交详情（含版本链） | `SubmissionView` |
| POST | `/api/v1/tasks/{id}/submissions` | 提交材料 / 重新提交（服务端自动递增 version） | `Submission` |
| POST | `/api/v1/submissions/{id}/review` | 审核（通过/驳回，管理端） | `Submission` |
| GET | `/api/v1/messages?type=` | 消息列表 | `Message[]` |
| POST | `/api/v1/messages/{id}/read` · `/api/v1/messages/read-all` | 已读 | `void` |
| GET | `/api/v1/users/me` | 当前教师档案 | `User` |
| POST | `/api/v1/files` | 文件上传（multipart，返回 objectKey） | `{ objectKey }` |

请求/响应字段与 `src/types/*` 一一对应；时间统一为 `YYYY-MM-DD HH:mm`，文件体积字段为 `sizeKB`。

---

## 七、已知限制与后续计划

- **未实现**：登录/授权页（按需求从"登录后教师端"开始，身份走 mock）、文件记录 / 消息设置 /
  帮助与反馈（当前为克制的占位提示）、真实文件上传与预览（H5 端为进度模拟）。
- **小程序端**：产物已通过静态校验（11 页 + 18 组件注册完整）；因环境无有效 AppID，
  未在微信开发者工具中做交互验收，首次打开请在 GUI 中选择「测试号」。
- 后续可扩展：任务列表分页与下拉刷新、消息推送（订阅消息）、审核人角色与工作台、
  多教研室隔离。
