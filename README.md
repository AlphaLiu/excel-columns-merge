# Excel 列提取合并器 (Excel Column Extractor & Merger)

> 跨平台桌面工具 —— 从多个 Excel / CSV 文件中批量提取指定列，合并输出为一个文件。

---

## 功能一览

| # | 功能 | 说明 |
|---|------|------|
| 1 | 📂 **添加文件** | 支持 `.xlsx` / `.xls` / `.csv` 格式，可一次选择多个文件 |
| 2 | 🏷️ **指定提取列** | 通过标签输入框输入目标列标题，支持回车添加、逗号批量粘贴、点击删除 |
| 3 | 🔀 **自动合并** | 遍历每个文件的第一个工作表，按列标题（不区分大小写）提取匹配列，纵向拼接所有行 |
| 4 | 💾 **多种导出格式** | 支持 Excel `.xlsx`、Excel 97-2003 `.xls`、CSV `.csv`、ODS `.ods` |
| 5 | 🖥️ **原生窗口控制** | Windows / macOS / Linux 各自的原生标题栏按钮 + 拖拽区域 |
| 6 | 💫 **窗口状态记忆** | 关闭时自动保存窗口位置、大小，下次启动自动恢复 |

---

## 截图

![主界面](./screenshots/fig1.png) 

---

## 使用方法

1. **添加文件** —— 点击左侧「添加文件」按钮，选择一个或多个 Excel / CSV 文件。
2. **输入列标题** —— 在「要提取的列标题」输入框中键入目标列名，按 `Enter` 添加为标签。
3. **选择导出格式** —— 在底部下拉菜单中选择输出格式（`.xlsx` / `.xls` / `.csv` / `.ods`）。
4. **开始提取** —— 点击「开始提取」按钮，选择保存路径，程序自动提取并合并。

### 操作提示

- 列标题匹配**不区分大小写**，`姓名` 和 `姓名`、`NAME` 和 `name` 均可匹配。
- 在标签输入框中粘贴逗号分隔的文本（如 `姓名,年龄,部门`），会自动拆分为多个标签。
- 点击文件旁的 🗑️ 图标可移出文件列表。

---

## 技术栈

| 层 | 技术 |
|----|------|
| 桌面框架 | **Tauri v2**（Rust 后端） |
| 前端 | **React 19** + **TypeScript** |
| 构建工具 | **Vite 8** + **Bun** |
| UI 组件 | **Tailwind CSS v4** + **shadcn/ui** + **Radix UI** |
| 图标 | **Lucide React** |
| Excel 解析 | **SheetJS (xlsx)** |
| IPC 类型绑定 | **tauri-specta** |
| 窗口状态 | 自定义 Rust 模块（`window_state.rs`） |

---

## 开发环境设置

### 前置条件

- [Bun](https://bun.sh) ≥ 1.0
- [Rust](https://rustup.rs) 工具链（nightly 推荐）
- Tauri v2 系统依赖（参见 [Tauri 官方文档](https://v2.tauri.app/start/prerequisites/)）

### 启动开发服务器

```bash
# 安装前端依赖
bun install

# 启动 Tauri + Vite 开发模式
bun tauri dev

# 仅启动前端 Vite 开发服务器（不启动 Tauri 窗口）
bun run dev
```

### 构建生产版本

```bash
bun tauri build
```

---

## 项目结构

```
├── src/                          # React 前端
│   ├── App.tsx                   # 主布局
│   ├── components/
│   │   ├── ExtractPanel.tsx      # 列标题输入面板
│   │   ├── FileListSidebar.tsx   # 文件列表侧边栏
│   │   ├── FooterBar.tsx         # 底部操作栏（格式选择 + 提取按钮）
│   │   ├── TagInput.tsx          # 标签输入组件
│   │   └── ui/                   # shadcn UI 原子组件
│   ├── hooks/
│   │   └── useExcelExtract.ts    # 核心逻辑 Hook
│   ├── types.ts                  # 类型定义
│   └── tauri-controls/           # 自定义原生标题栏
├── src-tauri/                    # Rust Tauri 后端
│   ├── src/
│   │   ├── lib.rs                # Tauri 应用初始化
│   │   ├── main.rs               # 入口点
│   │   ├── db_manager.rs         # JSON 配置持久化
│   │   └── window_state.rs       # 窗口状态记忆
│   └── tauri.conf.json           # Tauri 应用配置
├── screenshots/                  # 截图
└── scripts/                      # 构建脚本
```

---

## License

MIT
