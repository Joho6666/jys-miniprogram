# 发布检查清单

## 代码与配置

- [ ] 分支为 `feature/full-system`，工作区仅包含预期改动。
- [ ] 用户保留的 3 个 UI 文件和 `preserved-local-ui.patch` 未被覆盖或误提交。
- [ ] `VITE_USE_MOCK=false`、`VITE_DEMO_MODE=false`。
- [ ] 仓库和构建产物不包含 AppSecret、JWT Secret、密码或真实 Token。
- [ ] API 地址、微信 AppID、合法域名和隐私协议已按目标环境配置。

## 自动验证

- [ ] `npm run type-check`
- [ ] `npm run test`
- [ ] `npm run build:h5`
- [ ] `npm run build:mp-weixin`
- [ ] Mock H5 Golden Path
- [ ] 真实后端 Golden Path
- [ ] 越权、过期令牌、非法文件、重复操作等负向用例

## 微信验证

- [ ] 微信开发者工具无编译错误。
- [ ] 真机登录、上传、下载、图片预览和文档打开正常。
- [ ] iOS/Android 与常见宽度布局无溢出。
- [ ] 分享入口不泄露提交或审核敏感标识。
- [ ] 订阅消息已真实验证，或明确标记 `UNAVAILABLE`。

## 交付

- [ ] OpenAPI 和联调文档与实现一致。
- [ ] 发布版本、提交 SHA、构建时间和验证证据已记录。
- [ ] 已知限制和人工配置项已写入交付报告。

