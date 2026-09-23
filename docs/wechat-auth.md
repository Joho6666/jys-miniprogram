# 微信登录与绑定

## 用户流程

登录采用单页分步流程：

1. 调用 `wx.login`/`uni.login` 获取一次性 `code`。
2. 将 `code` 发送到 `/api/v1/auth/wechat`，客户端不接触 AppSecret。
3. 已绑定用户直接获取令牌；未绑定用户进入同页绑定步骤。
4. 用户使用工号和姓名，或账号密码完成 `/api/v1/auth/bind`。
5. 绑定成功后加载 `/api/v1/users/me`，再进入首页。

## Token 生命周期

- Access Token 放在请求头 `Authorization: Bearer <token>`。
- 遇到 401 时，全局只能有一个刷新请求；其他请求排队等待。
- 刷新成功后重放一次原请求；再次 401 或刷新失败则清理会话并回到登录页。
- 退出登录调用 `/auth/logout` 撤销 Refresh Token，并清理本地存储。

## Provider 与配置

后端通过 `WechatAuthProvider` 隔离真实微信和 Mock 实现。无微信凭据时允许 Mock Provider 用于开发，但必须在界面或日志中明确标识 Mock。AppID 可出现在前端环境变量中；AppSecret 只能存在服务端安全配置。

## 异常处理

- 用户拒绝授权：保留账号密码登录入口。
- code 过期或已使用：重新调用 `uni.login`，不得重复提交旧 code。
- 账号已绑定其他微信：展示可理解错误，不在客户端尝试覆盖绑定。
- 禁用账号、组织范围无效：拒绝登录并显示后端 `traceId` 便于排查。

