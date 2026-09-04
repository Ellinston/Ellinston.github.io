# Ellinston.github.io

冯晨曦的长期公开成长档案。网站不保存每日流水账，而是在项目形成阶段成果后，展示项目简介、时间节点、验证边界与证据链接。

## 一套事实源，两个发布视图

```text
各项目仓库
  └─ commit / push：真实开发历史与代码证据

私有 Agent Kit
  ├─ PROJECT/：完整项目上下文、内部进度、问题和下一步
  └─ PUBLIC/portfolio.json：人工确认可公开的阶段摘要（唯一公开事实源）
             ↓
Ellinston.github.io
  └─ data/portfolio.json：自动生成的公开镜像
```

以后无需同时手工编辑 Agent Kit 和本站：

1. 平时只在项目仓库持续提交，并在 Agent Kit 的 `PROJECT/<name>/progress.md` 维护完整进度。
2. 阶段成果形成后，在 Agent Kit 的 `PUBLIC/portfolio.json` 增加或更新一条公开摘要。
3. 私有 Agent Kit 仓库中的 GitHub Action 在该文件推送到 `main` 时，主动把它同步到本仓库。
4. 数据变化时，机器人只提交 `data/portfolio.json`，因此两个仓库都有可审计历史，但内容不需要复制维护。

## 隐私边界

同步脚本只读取 `Agent Kit/PUBLIC/portfolio.json`，不会扫描 `PROJECT/`、个人资料或 Obsidian Vault。写入网站前还会拒绝常见的 Windows 绝对路径、IP 地址、邮箱和疑似凭据字段。Agent Kit 保持私有，公开网站不保存读取私有仓库的 Token。

## 首次配置跨仓库发布

1. 创建 fine-grained personal access token，仅选择 `Ellinston/Ellinston.github.io` 仓库。
2. Repository permissions 只开启 `Contents: Read and write`。
3. 在私有 `Ellinston/agent_kit` 仓库的 `Settings → Secrets and variables → Actions` 新增 secret：`PUBLIC_SITE_TOKEN`。
4. 推送两个仓库后，在 Agent Kit 的 Actions 页面手动运行一次 `Publish public portfolio`。

这份规则的含义是：Agent Kit 中“存在”不等于允许公开；只有进入 `PUBLIC/portfolio.json` 的内容才会出现在网站。

## 本地预览与检查

```powershell
npm run check
python -m http.server 8000
```

然后访问 `http://127.0.0.1:8000`。直接双击 `index.html` 时，浏览器可能因本地文件安全策略阻止读取 JSON。

手动从 Agent Kit 同步：

```powershell
npm run sync
```

本地同步前设置 `AGENT_KIT_PORTFOLIO_SOURCE` 指向 Agent Kit 的 `PUBLIC/portfolio.json`；也可以直接用 `--source` 指定该文件。脚本不在公开仓库中写死本机绝对路径。
