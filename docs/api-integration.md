# API 联调指南

## 契约原则

正式联调以 Spring Boot 生成的 OpenAPI 为唯一真相。过渡期字段差异由 Adapter 消化，页面不得直接依赖后端临时字段。API 前缀统一为 `/api/v1`，时间使用 ISO-8601，文件大小使用字节。

统一成功响应可直接返回 `data`，或由请求层解包约定的 envelope；错误至少包含：

```json
{
  "code": "VALIDATION_ERROR",
  "message": "请求参数不合法",
  "fieldErrors": [{ "field": "note", "message": "不能超过 500 字" }],
  "traceId": "..."
}
```

分页统一为：

```json
{ "items": [], "page": 1, "pageSize": 20, "total": 0, "hasMore": false }
```

## 运行配置

复制 `.env.example` 为不提交的 `.env.local`：

```dotenv
VITE_API_BASE=http://localhost:8080
VITE_USE_MOCK=false
VITE_DEMO_MODE=false
VITE_WECHAT_APPID=
```

- `VITE_USE_MOCK=true`：全部业务走 Mock Adapter。
- `VITE_USE_MOCK=false`：走 Spring Boot API，`VITE_API_BASE` 必须有效。
- `VITE_DEMO_MODE=true`：仅开放隔离的演示控制，不能用于生产构建。

## 关键接口

- 认证：`/auth/login`、`/auth/wechat`、`/auth/bind`、`/auth/refresh`、`/auth/logout`
- 当前用户：`/users/me`
- Dashboard：`/dashboard/me`
- 任务：`/tasks`、`/tasks/{id}`；详情的 `latestSubmissionId` 用于加载有权限校验的提交详情
- 提交：`/submissions`、`/submissions/{id}`
- 文件：`POST /files`、`GET /files/{id}`、`DELETE /files/{id}`、`GET /files/{id}/download`
- 消息：`/messages`、`/messages/unread-count`、`/messages/{id}/read`、`/messages/read-all`
- 反馈：`/feedback`

任务列表发送 `page`、`pageSize`、`keyword`、`status`；消息列表发送 `page` 与 `size`。后端 OpenAPI 尚未提供独立的“按任务取最新提交”路由时，客户端先从任务详情读取 `latestSubmissionId`，再请求提交详情。若详情没有该字段，Real Mode 重新提交需要后端补充契约。

上传与下载使用 access token；上传使用 `uploadTask.onProgressUpdate`。下载 403/404 转为无权/不存在提示。订阅模板从 `VITE_WECHAT_SUBSCRIBE_TEMPLATE_IDS` 读取，拒绝授权不影响业务。

## 联调检查

1. 确认后端健康检查和数据库迁移完成。
2. 使用账号登录并验证刷新令牌轮换。
3. 分页查询只返回当前教师可见 Assignment。
4. 上传文件后仅提交 `fileIds` 和 `note`，版本由后端生成。
5. 驳回、重交、通过后分别核对任务、提交历史、消息和 Dashboard。
6. 使用另一教师账号验证任务、提交和下载均返回 403。

