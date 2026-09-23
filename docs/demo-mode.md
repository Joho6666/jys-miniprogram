# Demo 与 Mock 模式

## 两个开关

- Mock 模式决定数据来源，可用于离线开发和自动化测试。
- Demo 模式决定是否显示演示控制，两者相互独立。

| `VITE_USE_MOCK` | `VITE_DEMO_MODE` | 行为 |
| --- | --- | --- |
| `true` | `false` | 普通离线 Mock，无演示控制 |
| `true` | `true` | 完整演示，可切换教师、模拟审核和重置数据 |
| `false` | `false` | 正式后端联调/生产候选 |
| `false` | `true` | 仅限受控演示环境，后端仍需授权 |

## 隔离规则

- 演示代码集中在 `src/demo/` 或独立 Demo Adapter。
- 页面通过单一能力开关渲染演示入口，正式路径不导入 Mock handlers。
- `VITE_DEMO_MODE=false` 时，UI 和 API 都不能执行模拟审核、数据重置或身份切换。
- 演示账号和样例数据不得包含真实个人信息或凭据。

## 发布门禁

生产候选必须设置 `VITE_USE_MOCK=false`、`VITE_DEMO_MODE=false`，并通过构建产物搜索确认没有演示文案或真实密钥。

