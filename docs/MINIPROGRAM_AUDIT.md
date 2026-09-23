# 小程序现状审计

更新时间：2026-09-23

## 结论

当前仓库已具备 11 个页面、Pinia 状态层、Mock 数据和“提交—驳回—重交—通过”的演示闭环，也已存在可配置 HTTP 请求入口。它仍属于可演示 MVP：认证、分页、真实文件传输、消息订阅和完整后端契约尚未全部落地。

## 已具备

- uni-app + Vue 3 + TypeScript + Pinia，面向 `mp-weixin`，H5 用于调试。
- 任务、提交、消息、用户的类型和 Mock 数据源。
- 任务截止状态派生、紧急度、格式化、跨端文件选择等服务。
- `VITE_API_BASE`、`VITE_USE_MOCK`、`VITE_DEMO_MODE` 等环境变量入口。
- 页面使用公共组件和统一设计令牌，现有视觉规范应继续保留。

## 主要缺口

| 能力 | 当前状态 | 目标 |
| --- | --- | --- |
| 认证 | 无完整登录与绑定流程 | 微信授权、绑定、密码登录、刷新令牌轮换 |
| 领域模型 | 正在从旧 `Task.status` 迁移 | `Task + TaskAssignment + Submission + Review` |
| 请求层 | 初步 HTTP 适配 | 统一 envelope、错误、401 并发刷新、上传下载 |
| 任务列表 | Mock 全量筛选 | 服务端分页、搜索、下拉刷新、严格状态筛选 |
| 文件 | H5 模拟为主 | 真实上传、下载、预览、20 MB 和 MIME 校验 |
| 消息 | Mock 消息 | 未读数、已读、事件跳转、订阅偏好 |
| 测试 | 缺少自动化测试 | Vitest、H5 E2E、真实后端 Golden Path |

## 保护边界

以下本地改动属于用户资产，集成工作不得覆盖、丢弃或误提交：

- `src/components/campus-art/campus-art.vue`
- `src/pages/home/index.vue`
- `src/pages/profile/index.vue`
- `preserved-local-ui.patch`

## 当前验证边界

- TypeScript、H5 和微信小程序构建应在每阶段重新执行，不能沿用历史结果。
- 微信 AppID、订阅模板和真实服务域名未配置时，真实微信验证标记为 `UNAVAILABLE`。
- Mock 验收只能证明前端状态流转，不能替代真实后端权限、存储和通知验证。

