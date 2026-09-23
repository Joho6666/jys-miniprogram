# Real API Readiness

以仓库 API Contract 为前端实现依据；真实 Spring Boot 服务未在当前环境运行，状态 `VERIFIED` 只用于已由本地测试或构建验证的前端 Adapter 行为，不表示后端联调通过。

| Domain | Status | Evidence / remaining work |
| --- | --- | --- |
| Auth | PARTIAL | Login, binding, refresh lock, startup `/users/me`, logout adapters exist. Backend login/refresh/logout and disabled-account responses need Contract Smoke Test. |
| Dashboard | PARTIAL | `GET /dashboard/me` mapper/store and dynamic Mock adapter exist. Production aggregation values are not verified. |
| Task | PARTIAL | DTO mapper, server status/keyword pagination, reset, pull refresh and load-more are implemented. Backend `size` and derived status filtering need live contract verification. |
| Submission | PARTIAL | List/detail/submit adapters and V1/V2 mapper exist. Resubmit uses `GET /tasks/{id}` `latestSubmissionId` followed by `GET /submissions/{id}`; backend must include the summary ID and full version chain. |
| File | PARTIAL | Multipart upload progress, metadata, delete, download, image/document preview adapters exist. No file server is available to verify permissions, MIME validation, or storage behavior. |
| Message | PARTIAL | Server pagination, unread-count endpoint and optimistic read adapters exist. Live response shape and update consistency are unverified. |
| User | PARTIAL | `/users/me` maps required profile fields; live roles, department, avatar and disabled state are unverified. |

## Environment Results

- Frontend deterministic verification: recorded in `miniprogram-delivery-report.md`.
- Real backend Golden Path: `BLOCKED_BY_BACKEND` (localhost:8080 is not listening).
- WeChat device and subscription template verification: `UNAVAILABLE` until an AppID, template IDs, allowed domains and device/devtools session are configured.
