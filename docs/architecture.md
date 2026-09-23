# 小程序架构

## 分层

```text
pages / components
        │
      stores
        │
 API interfaces / adapters
    ┌───┴────┐
 mock     HTTP client
              │
      Spring Boot /api/v1
```

- 页面和 Store 只消费 API 接口，不直接判断运行模式。
- Mock Adapter 与 HTTP Adapter 返回同一前端 DTO。
- 后端 OpenAPI 是传输契约；页面展示模型由适配层组装。
- `services/domain.ts` 负责纯领域派生，`services/format.ts` 负责纯展示格式化。

## 核心模型

- `Task`：任务定义，生命周期与教师执行状态分离。
- `TaskAssignment`：某位教师的执行状态，是教师端列表的主要状态来源。
- `Submission`：每次提交都是不可覆盖的版本。
- `Review`：审核决定、意见、审核人和时间。
- `Notification`：站内消息及安全跳转目标。
- `FileMetadata`：统一使用字节表示文件大小。

`DUE_SOON`、`OVERDUE` 只由截止时间、是否允许逾期提交和 Assignment 状态派生，不写入数据库。

## 状态与数据流

1. 页面请求 Store。
2. Store 调用当前 Adapter。
3. HTTP Adapter 将 OpenAPI DTO 转换为页面所需 View；Mock Adapter 模拟相同结果。
4. Store 保存服务端实体与分页状态。
5. 页面使用领域函数派生标签、剩余时间和主操作。

## 安全边界

- 客户端路由参数不是授权依据，服务端必须重新验证用户、组织和资源范围。
- Access Token 短期有效；Refresh Token 轮换，客户端只持有服务端签发值。
- AppSecret、JWT Secret、数据库密码不得进入小程序仓库。
- 文件下载只能通过受保护 API，不能暴露物理存储路径。

