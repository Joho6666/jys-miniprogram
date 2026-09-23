# 小程序后端 API Contract（联调基线）

> 状态：前端联调契约草案。后端 OpenAPI 是最终权威；字段名或响应包装不一致时，应更新本文件和前端类型，不要在页面组件中做散乱转换。
>
> Base URL：环境变量 `VITE_API_BASE`。除微信登录和 refresh 的约定外，接口均使用 JSON。除非后端 OpenAPI 明确规定，所有 ID 均视为不透明字符串。

## 通用约定

- 请求头：`Authorization: Bearer <accessToken>`；`Content-Type: application/json`。
- 成功响应统一为 `{ "data": ..., "traceId": "...", "timestamp": "..." }`；若后端采用别的 envelope，适配只放在 HTTP adapter。
- 错误响应建议为 `{ "code": "...", "message": "...", "details": ... }`。HTTP 状态码仍是授权与传输结果的权威来源。
- 401 表示凭据失效，客户端单次刷新后重放原请求；并发 401 共用一个 refresh 请求。刷新失败清理会话并要求重新登录。
- 403 显示无权访问；404 显示资源不存在；422 显示可操作的字段/业务校验信息；5xx 和网络失败提供重试入口。
- 所有教师资源访问都由 Token 身份授权。不得信任 query 中的 userId，也不得将文件物理路径暴露给客户端。

## AUTH

### `POST /api/v1/auth/wechat`

请求：`{ "code": "<wx.login code>" }`

成功数据：`{ "accessToken": "...", "refreshToken": "...", "expiresIn": 3600, "user": User }`。未绑定时由后端返回可区分的绑定状态（建议 409 + `WECHAT_NOT_BOUND`），不得返回其他教师数据。

### `POST /api/v1/auth/bind`

请求字段以学校账号策略为准，建议工号/账号与密码或一次性验证码；绑定必须由后端校验微信身份和教师身份。成功返回 Token 与当前 User。

### `POST /api/v1/auth/refresh`

请求：`{ "refreshToken": "..." }`。成功返回新的 access/refresh token；refresh token 轮换策略由后端明确。

### `POST /api/v1/auth/logout`

撤销当前会话/refresh token。客户端即使网络失败也清除本地会话。

## USER

### `GET /api/v1/users/me`

返回当前教师资料：`id, name, employeeNo, title, college, department, roles, avatar, phone, email`。省略的可选资料不得由前端虚构。

## DASHBOARD

### `GET /api/v1/dashboard/me`

返回当前用户聚合视图：`todoCount, dueSoonCount, pendingReviewCount, completedCount, rejectedCount, overdueCount, urgentTasks, recentActivities`。首页不得为计算这些计数而下载全量任务。

## TASK

### `GET /api/v1/tasks?page=1&size=20&keyword=&status=&sort=`

返回分页结构：`{ items, page, size, total, hasMore }`。items 是当前教师的 TaskView，应包含 `taskId, assignmentId, title, category, description, priority, deadline, allowLateSubmission, requireReview, publisher, department, assignmentStatus, submissionStatus, latestSubmissionId, latestVersion, attachments, createdAt, updatedAt`。

状态筛选：`ALL | DUE_SOON | IN_PROGRESS | PENDING_REVIEW | REJECTED | OVERDUE | COMPLETED`。DUE_SOON 和 OVERDUE 根据截止时间与 assignment 状态派生，不作为持久化状态。

### `GET /api/v1/tasks/{taskId}`

返回任务与当前用户 assignment 的详情，包括附件模板、当前提交/审核摘要（至少包含 `latestSubmissionId`、版本、审核意见和审核人）和任务历史。前端使用 `latestSubmissionId` 再请求提交详情读取原文件和完整版本链。后端必须确认当前 Token 对该任务具有访问权限。

## SUBMISSION

### `GET /api/v1/submissions?page=1&size=20&status=ALL`

返回当前用户提交分页及审核摘要。status：`ALL | PENDING_REVIEW | APPROVED | REJECTED`。

### `GET /api/v1/submissions/{submissionId}`

返回当前用户有权访问的提交、文件、说明、审核人/意见/时间及同任务版本时间线。未经授权返回 403。

### `POST /api/v1/tasks/{taskId}/submissions`

请求：`{ "assignmentId": "...", "fileIds": ["..."], "note": "..." }`。服务端生成 submissionId、version、submittedAt 和状态；前端不得自行生成正式记录 ID。成功后 assignment 进入待审核（需要审核时），并刷新任务、提交、Dashboard、消息数据。

## FILE

### `POST /api/v1/files`

使用 multipart/form-data 上传字段 `file`，返回 `fileId, objectKey, fileName, sizeKB, mimeType, url, previewUrl`。服务端校验权限、类型、大小和内容；前端预检单文件不超过 20 MB，并展示上传进度。

### `GET /api/v1/files/{fileId}/download`

服务端先校验用户对文件所属任务/提交的权限，再返回下载流或短时授权地址。不得返回服务器磁盘路径。

## MESSAGE

- `GET /api/v1/messages?page=1&size=20`：当前用户消息分页。
- `GET /api/v1/messages/unread-count`：返回 `{ count }`。
- `POST /api/v1/messages/{messageId}/read`：标记单条已读。
- `POST /api/v1/messages/read-all`：标记全部已读。

## FEEDBACK

### `POST /api/v1/feedback`

请求：`{ "content": "...", "contact": "..." }`。用户身份从 Token 获取，不能接受客户端 userId 作为身份依据。

## 联调验收

1. 未登录访问受保护 API 得到 401；无权访问他人任务、提交、文件得到 403。
2. 任务列表仅返回当前教师的 assignment，分页和状态筛选有效。
3. 上传返回 fileId；提交仅传 fileIds；后端返回版本与时间。
4. 驳回后重新提交生成新版本；审核通过后任务、Dashboard、提交记录与消息保持一致。
5. 弱网/5xx 失败不被 UI 显示为成功；文件重试不丢失用户选中的本地文件。
