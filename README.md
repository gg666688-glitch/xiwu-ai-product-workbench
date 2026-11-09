# 析物 · AI 产品拆解工作台

当前站点版本 1 的完整应用源码导出，可独立在本地使用。

- 导出日期：2026-11-10（Asia/Shanghai）。
- 原站点：析物 · AI 产品拆解工作台。
- 对应源码提交：`68e691ecd3944a2033bc7e170292e7b50f812cf1`。
- 原始页面、样式、模块和验证脚本均按字节保留。导出时新增本地启动工具和说明，重写本文件；原 README 原文保存在 `docs/ORIGINAL_README.md`，其中访问权限描述是历史说明，以本文件为准。
- 本次操作仅下载源码并在导出副本中整理文件，未修改、删除、重新发布原站点，未推送 GitHub 或原站点的源码仓库。

## 技术栈

原生 HTML5、CSS3、JavaScript ES Modules，使用浏览器 localStorage、File API、Blob、原生 dialog 和内联 SVG。没有 React、Vue、第三方组件库、打包器、第三方字体或运行依赖。组件以 `dist/app.mjs` 中的渲染函数实现。

`dist/` 虽然名字通常表示构建目录，但本项目在这里保存直接编写、可阅读和编辑的应用源码，不是缺少原始文件的编译产物。

导出包新增的本地服务使用 Node.js 内置模块，只负责提供静态文件，不增加业务后端。

## 安装与启动

1. 安装 Node.js 22 或更高版本，确认 `node --version` 可以运行。
2. 解压 ZIP，在 `xiwu-ai-product-workbench` 文件夹中打开终端。
3. 直接启动，无需安装任何 npm 依赖：

~~~sh
node scripts/serve.mjs
~~~

也可以使用 npm 命令：

~~~sh
npm start
~~~

浏览器打开 **http://127.0.0.1:5173/**。按 Ctrl+C 停止。

如果端口被占用：

~~~sh
node scripts/serve.mjs --port 5174
# 或
npm start -- --port 5174
~~~

地址随之改为 http://127.0.0.1:5174/ 。服务仅监听本机地址。

没有构建步骤，无需 `npm install`，不需要 API Key 或 `.env` 文件。不要直接双击 index.html：ES Modules 应通过 HTTP 加载。

已有 Python 时，也可以在项目根目录运行：

~~~sh
python -m http.server 5173 --bind 127.0.0.1 --directory dist
~~~

## 已实现的功能

- 创建、编辑、删除和切换多个产品 / 功能拆解。
- 六步记录：用户目标、前端交互、后端调用、第三方接口、数据流、验证与复盘。
- 逐步解锁、自由浏览、进度统计、流程图和记录总览。
- 待验证问题与步骤关联，标记解决状态。
- localStorage 自动保存、JSON 备份导出 / 追加导入、Markdown 复盘导出。
- 可编辑的 Photoroom 抠图练习示例。

本项目是帮助人工记录和理解产品的工作台。示例中的 Bria 和 `POST /api/remove-background` 只是待核实的练习内容；没有接入 ChatGPT / OpenAI、真实抠图或第三方 AI 服务，也没有自动拆解接口。

## 记录迁移

ZIP 包含源码和自带练习示例，不包含你在在线站点浏览器中输入的私人记录。

浏览器保存键为 `lanbai-ai-workbench-v1`。localStorage 按协议、域名和端口隔离：在线站点、127.0.0.1、localhost、不同端口和不同浏览器之间均不会自动共享记录。

要迁移：在原站点点击“导出备份”取得 JSON，在本地工作台点击“导入”。现有导入逻辑会追加项目，重复导入可能产生重复记录。删除原站点记录不是迁移所需步骤。

## ChatGPT Sites 平台依赖

全部已实现的业务功能均使用浏览器 API，可本地运行。只有以下托管能力属于 Sites：

| 能力 | 本地情况 |
| --- | --- |
| chatgpt.site 域名、HTTPS、线上托管 | 本地工具提供回环地址的 HTTP；生产域名和 HTTPS 需自行配置。 |
| Sites 层的访问控制 / ChatGPT 登录门禁 | 导出的前端没有登录、账号或鉴权代码；若以后需要私人线上访问，要另行配置。读取时原站点实际为 public（公开），原 README 的 owner-private 描述已经过时；界面“私有工作台”徽标本身不执行访问控制。 |
| Sites 发布、版本历史、源码仓库及截图 | 属于平台管理能力，ZIP 中没有平台服务或 Git 历史；保留源码版本标识用于核对。 |
| `.openai/hosting.json` | 原有平台部署描述，仅含站点标识和静态目录；本地启动不读取它，也不会触发发布。 |

当前应用没有使用 Sites D1、R2、平台 AI 代理、插件连接器、后台任务或服务端 secrets，因此不存在需要从这些服务同步的数据或运行凭据。

详细说明见 `docs/PLATFORM_DEPENDENCIES.md`。当前公开状态只记录在文档中，未对原站点权限做任何变更。

## 目录

~~~text
xiwu-ai-product-workbench/
  dist/
    index.html          HTML 入口及原生对话框
    style.css           页面样式、响应式与减少动态效果规则
    app.mjs             组件渲染、事件、持久化和文件导入导出
    core.mjs            六步定义、项目模型、进度和备份校验
  .openai/hosting.json   原站点的非敏感托管配置
  .gitignore            忽略本地凭据、依赖和私人备份；保留 dist 源码
  package.json          本地 start / test 命令，无外部依赖
  scripts/serve.mjs      只监听本机的静态服务
  verify.mjs            原站点的 15 项模拟 DOM / 核心功能检查
  EXPORT_MANIFEST.json   原始文件与导出文件的 SHA-256 清单
  docs/
    ORIGINAL_README.md   原始 README 存档
    PLATFORM_DEPENDENCIES.md
    SECURITY.md
~~~

## 验证

~~~sh
node verify.mjs
# 或
npm test
~~~

15 项现有检查涵盖步骤门控、字段校验、进度、项目创建、输入转义、JSON 导入和刷新恢复。它们使用模拟 DOM，不能替代真实浏览器的视觉和交互验收。

本次导出另检查了本地 HTTP 返回、CSS / 模块加载路径、源码完整性和 ZIP 文件清单。检查结果与安全扫描范围见 `docs/SECURITY.md`。

## 敏感信息

导出清单采用源码文件白名单，不包含 `.git`、下载凭据、临时令牌、环境变量文件、私人 JSON 备份、缓存或依赖目录。源代码扫描未发现硬编码 API Key、密码、私钥或访问令牌。`.openai/hosting.json` 中的项目 ID 是平台标识，不是认证凭据。

该检查针对本次导出文件；你之后导入或录入的内容需要自行避免包含秘密。`.gitignore` 只影响 Git 跟踪，不能替代发布前的敏感信息检查。
