# 小程序工程审计

> 审计对象：`feature/full-system`，HEAD `84e6dfdf7dcee6749d865bc8c684c5ea9621eed4`（2026-09-22）
> 范围：通过 GitHub 仓库内容与目录树进行只读审查。当前执行环境未挂载源码，因此未运行 npm、TypeScript 或 H5/微信构建；涉及运行时行为的结论均标记为待本地验证。

## 已完成能力

- 项目采用 uni-app、Vue 3、TypeScript、Vite、Pinia、SCSS；脚本包含 `type-check`、`build:h5`、`build:mp-weixin`。
- 页面路由配置列出 11 个页面：首页、任务列表、消息、我的、任务详情、提交、提交成功、提交详情、审核结果、重新提交、提交记录。
- 已有任务、提交、消息、用户 API 模块及对应 Pinia Store、Mock 数据和流程处理器。
- 已有请求辅助、HTTP 请求、导航/格式化/领域规则服务；存在 Loading、Empty、Error 等通用状态组件以及任务卡、状态标签、文件行、时间线等组件。
- `.env.example` 已存在；当前文档描述 Mock 模式为默认数据源。
- README 声称公共组件共 18 个、类型检查当前为零错误；本轮无法独立复核这些声明。

## 主要差距与风险

### P0：真实后端基础能力

1. **领域模型尚未兼容分配关系。** `Task` 使用教师视角的 `ownerId/ownerName` 和单一 `status`，没有 `TaskAssignment`、`assignmentId`、任务生命周期与教师执行状态的独立表达。任务适配器将响应转换成简化结构，并以固定映射生成状态。
2. **状态筛选与目标不一致。** 当前 `TaskFilterKey` 包含 `URGENT`，缺少目标要求的 `IN_PROGRESS`、`OVERDUE`；Store 中“即将截止”根据紧急度计算，并把可操作任务集合纳入，而不是严格按派生状态筛选。
3. **HTTP 层不满足正式请求要求。** 当前 HTTP helper 只注入 access token 并检查基本状态码；缺少统一超时、规范化错误、refresh token 并发锁与请求重放、403/404/422/500 处理、上传/下载能力。401 仅移除 access token，没有完整清理用户态和登录跳转。
4. **API 层与 Mock 耦合。** `src/api/task.ts`、`submission.ts` 直接导入 `mock/handlers` 或 Mock DB，未形成独立 Mock/HTTP adapter；页面和 Store 将难以稳定切换数据源。
5. **认证与真实身份未完成。** 已审阅路由无登录页；用户模型缺少工号、部门、角色、联系方式等后端资料；未见 Auth Store 和微信登录/绑定/刷新闭环。
6. **任务、提交接口不完整。** 任务查询无分页参数契约；首页 dashboard 聚合、真实提交文件 ID、提交分页和状态筛选未在已审阅 API 中体现。提交接口适配未见上传文件 ID 进入 payload。
7. **环境默认值需要修正。** `.env.example` 当前将 `VITE_DEMO_MODE=true`，API BASE 示例为 localhost；应使用空 API 地址、`VITE_USE_MOCK=true`、`VITE_DEMO_MODE=false`，并补充 `VITE_WECHAT_APPID`。

### P1：业务与平台适配

- 上传状态与真实文件对象需要核实：正式材料提交应只传 `fileId`，限制单文件 20 MB，并支持进度、失败重试和删除。
- 附件下载/预览需要核实是否使用 `uni.downloadFile`、`uni.openDocument`、`uni.previewImage` 并经过后端权限校验。
- 消息 API 需补未读数、单条已读、全部已读及订阅消息能力。
- “我的”页用户信息及文件记录、消息设置、帮助反馈、关于系统仍需逐项核实和落地。
- 分享参数需检查敏感提交与审核页面，避免通过 URL 参数绕过身份与资源授权。
- 微信胶囊、安全区、键盘弹起、长文本与不同视口适配需真机/开发者工具验证。

### 测试与发布

- 仓库脚本包含类型检查和两个构建目标，但本次未能运行。
- 尚需为领域派生状态、筛选、Token refresh、Adapter 和提交版本链补自动化测试；Golden Path 及真机 iOS/Android 尚需执行。
- README 目前有快速开始和构建命令；目标清单要求的 API Contract、认证、Demo、测试、发布文档尚未在本轮完整核实。

## 施工建议

1. 本地检出目标分支并运行 `npm ci`、`npm run type-check`、`npm run build:h5`、`npm run build:mp-weixin`，记录现有基线。
2. 补齐 canonical Task / TaskAssignment / Submission / Review / Notification 模型与状态派生、严格筛选。
3. 实现统一 request/refresh/upload/download；为 Auth、User、Task、Dashboard、Submission、File、Message 拆分 Mock 和 HTTP adapter。
4. 补微信登录/绑定及用户态，再接入分页、真实上传下载、消息和 Dashboard。
5. 增加有针对性的单元测试及 Golden Path，再完成文档和发布检查。
6. 每个阶段运行类型检查及相关测试和双端构建；确认通过后再提交。

## 当前限制

GitHub 连接器可读取和写入仓库，但当前工作区没有挂载 Git 工作树，命令行克隆未得到有效 HEAD。因此无法在该环境安装依赖或执行构建。本报告依据可读取的仓库文件编写；运行时、CI 状态及未读取模块均未推断为通过。
