# 小程序交付报告

更新时间：2026-09-23

## 交付目标

在保留现有视觉和 Mock 演示能力的前提下，完成与 Spring Boot 的真实认证、任务、文件、提交、审核、消息和 Dashboard 闭环。

## 当前进度

| 项目 | 状态 | 说明 |
| --- | --- | --- |
| 现有 UI 与 Mock 闭环 | 已存在 | 13 个页面，保留当前视觉设计 |
| 环境变量与 HTTP 入口 | 已完成基础 | API envelope、401 refresh lock、真实 multipart upload、download 已接入 |
| 领域 DTO Mapper | 已完成基础 | Task、Submission、Message、User、File 均有 mapper |
| 登录与 Token 轮换 | 已完成基础 | 密码/微信登录、绑定、启动 `/users/me`、refresh/logout、全 Store 清理 |
| Task 与 Dashboard | 已完成基础 | 服务端状态/keyword 分页、Mock 分页、Dashboard API 与动态 Mock Adapter |
| 文件与 Submission | 已完成基础 | 上传进度、服务端 fileId、下载/预览、最新 submission summary 到详情链 |
| 消息 | 已完成基础 | 20 条分页、触底续载、pull refresh、独立 unread-count 与乐观已读 |
| “我的”页面 | 已完成基础 | FAQ、反馈 API、订阅入口、关于信息、退出登录；收藏入口已移除 |
| 自动化测试 | 已完成基础 | Vitest 9 个文件、20 个用例通过；页面 UI E2E 未运行 |

## 验证结果

此表必须在最终交付时用当次新鲜结果更新：

| 验证 | 结果 |
| --- | --- |
| TypeScript 类型检查 | PASS（本轮最新运行） |
| Vitest | PASS（9 个文件，20 个用例） |
| Mock Adapter Golden Path | PASS（登录、V1 驳回、V2 通过、Dashboard 更新） |
| Mock UI Golden Path | NOT_TESTED（uni-automator 未配置可运行的 DevTools 自动化会话） |
| H5 生产构建 | PASS（无 AppID；Sass legacy API / @import 弃用警告） |
| mp-weixin 生产构建 | PASS（无 AppID；Sass legacy API / @import 弃用警告） |
| 真实后端 Contract Smoke / Golden Path | BLOCKED_BY_BACKEND（localhost:8080 未监听） |
| 微信模拟器/真机 | UNAVAILABLE（待 AppID 与人工环境） |
| 真实订阅消息 | UNAVAILABLE（待真实模板和凭据） |

## 就绪结论

| Flag | Result | Evidence |
| --- | --- | --- |
| `READY_TO_MERGE_MAIN` | NO | 前端类型检查、单元测试和双端构建通过；真实后端 Contract Smoke 尚未执行，需后端联调后再决定合并。 |
| `READY_FOR_DEMO` | YES | Mock Adapter Golden Path 通过，H5 与微信小程序构建通过；页面 UI Golden Path 未测试。 |
| `READY_FOR_REAL_BACKEND_TEST` | BLOCKED_BY_BACKEND | 前端适配器已接入，但当前 localhost:8080 无服务，且任务详情的 `latestSubmissionId` 需服务端确认。 |
| `READY_FOR_WECHAT_RELEASE` | NO | 未配置微信 AppID、订阅模板和真机/开发者工具验证环境。 |

## 已知边界

- Mock 结果不代表后端 RBAC、事务、存储和幂等已验证。
- OpenAPI 未定义独立“任务最新提交”读取路由；前端依赖任务详情提供 `latestSubmissionId`，再读取 submission detail。该字段若未由真实服务返回，Real Mode 重提仍不可用。
- 无真实微信凭据时只能验证 Adapter 和拒绝授权等前端分支。
- 发布前必须完成 `release-checklist.md`，并记录后端版本和 OpenAPI 版本。

