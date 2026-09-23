# 小程序交付报告

更新时间：2026-09-23

## 交付目标

在保留现有视觉和 Mock 演示能力的前提下，完成与 Spring Boot 的真实认证、任务、文件、提交、审核、消息和 Dashboard 闭环。

## 当前进度

| 项目 | 状态 | 说明 |
| --- | --- | --- |
| 现有 UI 与 Mock 闭环 | 已存在 | 11 个页面，保留当前视觉设计 |
| 环境变量与 HTTP 入口 | 已完成基础 | API envelope、401 refresh lock、上传/下载入口已接入 |
| 领域契约 | 已完成基础 | Assignment、版本化 Submission、Review 字段已统一 |
| 登录与 Token 轮换 | 已完成基础 | 密码/微信 Mock/绑定/refresh/logout 路由已接入 |
| 真实文件与消息 | 已完成基础 | 文件接口、消息分页/已读/未读数和审核通知已接入 |
| 自动化测试 | 已完成基础 | Vitest 10 用例、后端 JUnit 1 用例通过，E2E 待补齐 |

## 验证结果

此表必须在最终交付时用当次新鲜结果更新：

| 验证 | 结果 |
| --- | --- |
| TypeScript 类型检查 | PASS |
| Vitest | PASS（2 个文件，10 个用例） |
| H5 生产构建 | PASS（AppID 未配置/Sass 弃用警告） |
| mp-weixin 生产构建 | PASS（AppID 未配置/Sass 弃用警告） |
| Mock Golden Path | NOT_TESTED |
| 真实后端 Golden Path | NOT_TESTED |
| 微信模拟器/真机 | UNAVAILABLE（待 AppID 与人工环境） |
| 真实订阅消息 | UNAVAILABLE（待真实模板和凭据） |

## 已知边界

- Mock 结果不代表后端 RBAC、事务、存储和幂等已验证。
- 无真实微信凭据时只能验证 Adapter 和拒绝授权等前端分支。
- 发布前必须完成 `release-checklist.md`，并记录后端版本和 OpenAPI 版本。

