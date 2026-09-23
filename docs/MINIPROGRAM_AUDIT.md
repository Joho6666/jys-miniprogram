# 小程序现状审计

更新时间：2026-09-23

## 结论

当前仓库有 13 个页面（含登录和反馈）、Pinia 状态层、Mock 数据和提交审核演示闭环。已补真实认证启动校验、任务/消息分页、DTO Mapper、Dashboard 和文件 API Adapter；后端接口、存储权限及完整真实闭环仍待运行环境联调。

## 已具备

- uni-app + Vue 3 + TypeScript + Pinia，面向 `mp-weixin`，H5 用于调试。
- 任务、提交、消息、用户的类型和 Mock 数据源。
- 任务截止状态派生、紧急度、格式化、跨端文件选择等服务。
- `VITE_API_BASE`、`VITE_USE_MOCK`、`VITE_DEMO_MODE` 等环境变量入口。
- 页面使用公共组件和统一设计令牌，现有视觉规范应继续保留。

## 主要缺口

| 能力 | 当前状态 | 目标 |
| --- | --- | --- |
| 认证 | 前端流程与启动用户校验已实现 | 真实后端 refresh/logout 与停用账号联调 |
| DTO Mapper | Task、Submission、Message、User、File 已拆分 | 使用后端 OpenAPI fixtures 覆盖字段差异 |
| 任务列表 | 服务端筛选分页、300ms 搜索、刷新和触底 | 服务端部署环境 Contract Test |
| Dashboard | `/dashboard/me` 与动态 Mock Adapter | 验证生产统计数据口径 |
| 文件 | 上传进度回调、下载、预览、metadata/delete Adapter | 文件存储、服务端 MIME 校验、真机体验 |
| 消息 | 分页、独立未读数、乐观已读与同步 | 推送订阅模板和服务端偏好持久化 |
| 测试 | 9 个文件 / 20 个 Vitest 用例；Mock Adapter Golden Path PASS | H5 页面级 E2E 与真实后端 Golden Path |

## 保护边界

以下本地改动属于用户资产，集成工作不得覆盖、丢弃或误提交：

- 页面插画、Design Token 与已有页面布局在实现中保留；此次仅调整必要数据绑定与事件。

## 当前验证边界

- TypeScript、H5 和微信小程序构建以本次最新运行结果为准。
- 后端端口 8080 当前未监听，真实 API Contract Test 标记 `BLOCKED_BY_BACKEND`。
- 页面级自动化 Golden Path 未运行；Mock Adapter 测试通过不等于 UI E2E。
- 微信 AppID、订阅模板和真机验证标记 `UNAVAILABLE`。
- Mock 验收只能证明前端状态流转，不能替代真实后端权限、存储和通知验证。

