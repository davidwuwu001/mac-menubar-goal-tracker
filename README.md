# Mac 菜单栏目标管理应用

一个优雅的 macOS 菜单栏应用，帮助你实时追踪和管理目标进度。支持从 Markdown 文件读取目标，自动滚动显示，并根据截止日期智能标色。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey.svg)
![Electron](https://img.shields.io/badge/electron-latest-brightgreen.svg)

## ✨ 特性

### 核心功能
- 🎯 **Markdown 格式支持**：直接读取 Markdown 文件中的目标列表
- 📊 **智能进度显示**：支持日期和百分比显示
- 🎨 **颜色标识**：根据截止日期自动标色（绿/黄/红/灰）
- 🔄 **自动刷新**：每 30 秒自动同步文件更新
- 📱 **多种显示模式**：轮播、并排、单独分类显示

### 显示模式
- **轮播模式**：年→月→周→日自动轮播，动画完成立即切换
- **并排模式**：上下两层同时显示四个分类
- **单独显示**：专注查看某个分类的目标

### 自定义设置
- ⚙️ **透明度调节**：0% - 100% 自由调节
- ⏱️ **速度调节**：10 - 120 秒滚动速度
- 📁 **多文件支持**：每个分类可选择多个 Markdown 文件
- 🎭 **分类符号**：⭐年目标 ●月目标 ■周目标 ▲行事历

## 📸 截图

（待添加截图）

## 🚀 快速开始

### 环境要求
- macOS 10.13 或更高版本
- Node.js 14.0 或更高版本

### 安装依赖

```bash
# 使用国内镜像源（推荐）
npm install --registry=https://registry.npmmirror.com

# 或使用默认源
npm install
```

### 运行应用

```bash
npm start
```

### 打包应用

```bash
npm run build
```

## 📝 Markdown 格式

应用支持以下 Markdown 格式：

### 基础格式
```markdown
- [ ] 未完成的目标
- [x] 已完成的目标
```

### 带日期和进度
```markdown
- [ ] 完成项目文档 [2026-03-15] [60%]
- [ ] 学习 React [2026-04-01] [30%]
- [x] 完成需求分析 [2026-02-28] [100%]
```

### 显示效果
- 日期格式：`[2026-03-15]` → 显示为 `(3月15日)`
- 进度格式：`[60%]` → 显示为 `(60%)`
- 组合显示：`(3月15日 60%)`

### 颜色规则
- 🟢 **绿色**：距离截止日期 7 天以上
- 🟡 **黄色**：距离截止日期 3-7 天
- 🔴 **红色**：距离截止日期 3 天内或已过期
- ⚫ **灰色**：已完成的目标（带删除线）

## 🎮 使用指南

### 1. 设置目标文件

1. 点击菜单栏图标打开下拉菜单
2. 点击"设置目录"按钮
3. 为每个分类（年/月/周/日）选择对应的文件夹
4. 在文件列表中勾选要显示的 Markdown 文件

### 2. 切换显示模式

在下拉菜单顶部有 6 个模式按钮：
- **轮播**：自动轮播所有分类
- **并排**：同时显示四个分类
- **年/月/周/日**：单独显示某个分类

### 3. 调节设置

右键点击托盘图标，选择"调节透明度和速度"：
- 拖动透明度滑块调节窗口透明度
- 拖动速度滑块调节滚动速度

### 4. 清空已选文件

1. 打开下拉菜单
2. 切换到要清空的分类标签
3. 点击"清空"按钮

## 🛠️ 技术栈

- **Electron**：跨平台桌面应用框架
- **Node.js**：JavaScript 运行时
- **electron-store**：配置持久化存储
- **CSS3 动画**：流畅的滚动效果

## 📂 项目结构

```
mac-menubar-goal-tracker/
├── main.js              # Electron 主进程
├── renderer.js          # 渲染进程逻辑
├── index.html           # 主窗口 HTML
├── styles.css           # 主窗口样式
├── slider.html          # 设置窗口 HTML
├── slider.css           # 设置窗口样式
├── slider.js            # 设置窗口逻辑
├── assets/              # 资源文件
│   ├── icon.png         # 托盘图标
│   └── ...
├── package.json         # 项目配置
└── README.md            # 项目文档
```

## ⚙️ 配置文件

配置文件位置：`~/Library/Application Support/goal-tracker/config.json`

```json
{
  "opacity": 0.95,
  "scrollSpeed": 120,
  "displayMode": "carousel",
  "selectedFiles": {
    "年目标": ["/path/to/file1.md"],
    "月目标": ["/path/to/file2.md"],
    "周目标": ["/path/to/file3.md"],
    "行事历": ["/path/to/file4.md"]
  },
  "directory": {
    "年目标": "/path/to/年目标/",
    "月目标": "/path/to/月目标/",
    "周目标": "/path/to/周目标/",
    "行事历": "/path/to/行事历/"
  }
}
```

## 🐛 已知问题

- 需要手动设置目录路径（首次使用）
- 暂不支持嵌套的 Markdown 列表

## 🔮 未来计划

- [ ] 支持自定义分类名称
- [ ] 支持自定义颜色主题
- [ ] 支持快捷键操作
- [ ] 支持目标统计和报表
- [ ] 支持导出目标数据

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

David Wu

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！
