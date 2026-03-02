# 需求文档

## 简介

Mac 菜单栏目标管理应用是一个轻量级的桌面工具，用于在屏幕顶部以滚动字幕的形式持续展示用户的目标清单。应用从 Markdown 文件中读取目标内容，支持多文件选择和分类管理，提供优雅的中文书法风格视觉效果。

## 术语表

- **Goal_Tracker**：目标追踪应用主系统
- **Scroll_Window**：滚动显示窗口，900x80px 的椭圆形半透明窗口
- **Dropdown_Menu**：下拉菜单组件，用于选择目标文件
- **Tray_Icon**：菜单栏图标，25x25px 的彩色图标
- **Context_Menu**：右键上下文菜单
- **Goal_File**：目标文件，包含复选框项目的 Markdown 文件
- **Category_Tab**：分类标签，包括年目标、月目标、周目标、行事历
- **Checkbox_Item**：复选框项目，格式为 `- [ ]` 或 `- [x]` 的 Markdown 列表项
- **Configuration_Store**：配置存储，保存用户设置和选择状态
- **Scroll_Speed**：滚动速度，单位为秒（5-60秒完成一次完整滚动）
- **Opacity_Level**：透明度级别，范围 0.97-0.99

## 需求

### 需求 1：菜单栏应用基础架构

**用户故事**：作为用户，我希望应用以菜单栏形式运行，这样可以节省 Dock 空间并保持桌面整洁。

#### 验收标准

1. THE Goal_Tracker SHALL run as a macOS menu bar application
2. THE Goal_Tracker SHALL display the Tray_Icon in the system menu bar
3. THE Goal_Tracker SHALL NOT appear in the Dock
4. WHEN the application starts, THE Goal_Tracker SHALL initialize the Tray_Icon within 2 seconds

### 需求 2：滚动窗口显示

**用户故事**：作为用户，我希望看到一个半透明的滚动窗口显示我的目标，这样可以在不干扰其他工作的情况下持续提醒我。

#### 验收标准

1. THE Scroll_Window SHALL have dimensions of 900 pixels width and 80 pixels height
2. THE Scroll_Window SHALL be positioned at the top of the screen
3. THE Scroll_Window SHALL remain on top of all other windows
4. THE Scroll_Window SHALL have an elliptical shape with rounded corners
5. THE Scroll_Window SHALL apply a backdrop blur effect of 25 pixels
6. THE Scroll_Window SHALL have an Opacity_Level between 0.97 and 0.99
7. THE Scroll_Window SHALL display edge gradient fade-out effects on left and right sides
8. WHEN the Dropdown_Menu is closed, THE Scroll_Window SHALL set pointer-events to none for transparent areas

### 需求 3：目标文本滚动动画

**用户故事**：作为用户，我希望目标文本能够平滑地从右向左滚动，这样可以看到所有目标内容。

#### 验收标准

1. THE Scroll_Window SHALL scroll goal text from right to left continuously
2. THE Scroll_Window SHALL create a seamless loop when text reaches the left edge
3. THE Scroll_Window SHALL complete one full scroll cycle within the configured Scroll_Speed
4. THE Scroll_Window SHALL use Noto Serif SC font for Chinese serif text
5. THE Scroll_Window SHALL use Ma Shan Zheng font for Chinese calligraphy style text
6. WHEN scrolling is paused, THE Scroll_Window SHALL stop text movement immediately
7. WHEN scrolling is resumed, THE Scroll_Window SHALL continue from the current position

### 需求 4：Markdown 文件解析

**用户故事**：作为用户，我希望应用能够读取我的 Markdown 目标文件，这样我可以用熟悉的格式管理目标。

#### 验收标准

1. THE Goal_Tracker SHALL parse Goal_File in Markdown format
2. THE Goal_Tracker SHALL identify Checkbox_Item with syntax `- [ ]` as incomplete goals
3. THE Goal_Tracker SHALL identify Checkbox_Item with syntax `- [x]` as completed goals
4. THE Goal_Tracker SHALL ignore non-checkbox list items in Goal_File
5. THE Goal_Tracker SHALL ignore headings, paragraphs, and other Markdown elements
6. WHEN a Goal_File contains invalid Markdown syntax, THE Goal_Tracker SHALL skip the malformed items and continue parsing

### 需求 5：目标显示状态

**用户故事**：作为用户，我希望已完成的目标以不同样式显示，这样可以直观地看到进度。

#### 验收标准

1. THE Scroll_Window SHALL display incomplete goals in normal text style
2. THE Scroll_Window SHALL display completed goals with strikethrough decoration
3. THE Scroll_Window SHALL display completed goals with 50% opacity
4. THE Scroll_Window SHALL maintain text readability for both completed and incomplete goals

### 需求 6：下拉菜单界面

**用户故事**：作为用户，我希望通过下拉菜单选择要显示的目标文件，这样可以灵活控制显示内容。

#### 验收标准

1. THE Dropdown_Menu SHALL display a downward arrow button (▼) on the right side of Scroll_Window
2. WHEN the arrow button is clicked, THE Scroll_Window SHALL expand height from 80 pixels to 500 pixels
3. WHEN the arrow button is clicked, THE Dropdown_Menu SHALL display below the scroll area
4. WHEN the Dropdown_Menu is open, THE arrow button SHALL rotate 180 degrees to upward arrow (▲)
5. WHEN the Dropdown_Menu is open, THE Dropdown_Menu SHALL set pointer-events to auto
6. WHEN the user clicks outside the Dropdown_Menu, THE Dropdown_Menu SHALL close automatically
7. WHEN the Dropdown_Menu loses focus, THE Dropdown_Menu SHALL close automatically
8. WHEN the Dropdown_Menu closes, THE Scroll_Window SHALL restore height to 80 pixels

### 需求 7：分类标签系统

**用户故事**：作为用户，我希望按照时间维度分类管理目标文件，这样可以更好地组织不同类型的目标。

#### 验收标准

1. THE Dropdown_Menu SHALL display four Category_Tab: 年目标、月目标、周目标、行事历
2. THE Dropdown_Menu SHALL arrange Category_Tab horizontally
3. WHEN a Category_Tab is clicked, THE Dropdown_Menu SHALL display the file list for that category
4. WHEN a Category_Tab is active, THE Dropdown_Menu SHALL highlight the active tab
5. THE Dropdown_Menu SHALL maintain the last selected Category_Tab when reopened

### 需求 8：文件选择功能

**用户故事**：作为用户，我希望能够选择多个目标文件同时显示，这样可以综合查看不同来源的目标。

#### 验收标准

1. THE Dropdown_Menu SHALL display a checkbox before each Goal_File name
2. THE Dropdown_Menu SHALL allow multiple Goal_File to be selected simultaneously
3. WHEN a Goal_File checkbox is checked, THE Goal_Tracker SHALL load and display its content
4. WHEN a Goal_File checkbox is unchecked, THE Goal_Tracker SHALL remove its content from display
5. THE Scroll_Window SHALL merge and display content from all selected Goal_File
6. WHEN multiple Goal_File are selected, THE Scroll_Window SHALL concatenate their Checkbox_Item in order

### 需求 9：配置持久化

**用户故事**：作为用户，我希望应用记住我的选择和设置，这样每次启动时不需要重新配置。

#### 验收标准

1. THE Configuration_Store SHALL save selected Goal_File for each Category_Tab
2. THE Configuration_Store SHALL save Scroll_Speed setting
3. THE Configuration_Store SHALL save Opacity_Level setting
4. THE Configuration_Store SHALL save window visibility state
5. THE Configuration_Store SHALL save scroll pause state
6. WHEN the application starts, THE Goal_Tracker SHALL load settings from Configuration_Store
7. WHEN the application starts for the first time, THE Goal_Tracker SHALL select the first Goal_File in each Category_Tab automatically
8. WHEN the user manually selects Goal_File, THE Configuration_Store SHALL save the selection immediately

### 需求 10：菜单栏图标设计

**用户故事**：作为用户，我希望菜单栏图标美观且易于识别，这样可以快速找到应用。

#### 验收标准

1. THE Tray_Icon SHALL have dimensions of 25 pixels width and 25 pixels height
2. THE Tray_Icon SHALL display blue concentric circles as the base design
3. THE Tray_Icon SHALL display a red arrow pointing to the target
4. THE Tray_Icon SHALL use color rendering (not monochrome)
5. THE Tray_Icon file name SHALL NOT contain the word "Template"

### 需求 11：右键上下文菜单

**用户故事**：作为用户，我希望通过右键菜单快速访问常用功能，这样可以方便地控制应用。

#### 验收标准

1. WHEN the Tray_Icon is right-clicked, THE Context_Menu SHALL display within 100 milliseconds
2. THE Context_Menu SHALL include a "显示/隐藏窗口" menu item
3. THE Context_Menu SHALL include a "暂停/播放滚动" menu item
4. THE Context_Menu SHALL include a "调整透明度" menu item
5. THE Context_Menu SHALL include a "滚动速度" menu item
6. THE Context_Menu SHALL include a "设置目录" menu item
7. THE Context_Menu SHALL include a "退出" menu item
8. WHEN "显示/隐藏窗口" is clicked, THE Goal_Tracker SHALL toggle Scroll_Window visibility
9. WHEN "暂停/播放滚动" is clicked, THE Goal_Tracker SHALL toggle scroll animation state
10. WHEN "退出" is clicked, THE Goal_Tracker SHALL terminate the application

### 需求 12：透明度调节

**用户故事**：作为用户，我希望能够调节窗口透明度，这样可以根据不同背景优化可读性。

#### 验收标准

1. WHEN "调整透明度" is clicked, THE Goal_Tracker SHALL display a slider popup window
2. THE slider SHALL allow Opacity_Level adjustment between 0.97 and 0.99
3. WHEN the slider value changes, THE Scroll_Window SHALL update opacity in real-time
4. WHEN the slider popup loses focus, THE Goal_Tracker SHALL close the slider popup
5. THE Configuration_Store SHALL save the adjusted Opacity_Level

### 需求 13：滚动速度调节

**用户故事**：作为用户，我希望能够调节滚动速度，这样可以根据阅读习惯优化体验。

#### 验收标准

1. WHEN "滚动速度" is clicked, THE Goal_Tracker SHALL display a slider popup window
2. THE slider SHALL allow Scroll_Speed adjustment between 5 and 60 seconds
3. WHEN the slider value changes, THE Scroll_Window SHALL update scroll speed in real-time
4. WHEN the slider popup loses focus, THE Goal_Tracker SHALL close the slider popup
5. THE Configuration_Store SHALL save the adjusted Scroll_Speed

### 需求 14：目录设置

**用户故事**：作为用户，我希望能够设置目标文件的存储目录，这样可以灵活管理文件位置。

#### 验收标准

1. WHEN "设置目录" is clicked, THE Goal_Tracker SHALL open a directory selection dialog
2. THE Goal_Tracker SHALL allow the user to select separate directories for each Category_Tab
3. WHEN a directory is selected, THE Configuration_Store SHALL save the directory path
4. WHEN a directory is selected, THE Goal_Tracker SHALL scan for Goal_File in that directory
5. THE Goal_Tracker SHALL only list files with .md extension in the Dropdown_Menu
6. WHEN no directory is configured, THE Goal_Tracker SHALL use the user's Documents folder as default

### 需求 15：视觉一体化设计

**用户故事**：作为用户，我希望滚动窗口和下拉菜单看起来是一个整体，这样界面更加美观和专业。

#### 验收标准

1. THE Dropdown_Menu SHALL use the same backdrop blur effect as Scroll_Window
2. THE Dropdown_Menu SHALL use the same Opacity_Level as Scroll_Window
3. THE Dropdown_Menu SHALL use consistent border radius with Scroll_Window
4. THE Dropdown_Menu SHALL use consistent shadow effects with Scroll_Window
5. THE Dropdown_Menu SHALL align seamlessly with Scroll_Window without visual gaps

### 需求 16：交互反馈

**用户故事**：作为用户，我希望界面元素提供清晰的交互反馈，这样可以确认操作是否成功。

#### 验收标准

1. WHEN the mouse hovers over the arrow button, THE arrow button SHALL change color to red
2. WHEN the mouse hovers over a Category_Tab, THE Category_Tab SHALL change color to red
3. WHEN the mouse hovers over a Goal_File checkbox, THE checkbox SHALL display a hover effect
4. WHEN a Category_Tab is clicked, THE Category_Tab SHALL provide visual feedback within 50 milliseconds
5. WHEN a Goal_File checkbox is toggled, THE checkbox SHALL update state within 100 milliseconds

### 需求 17：字体加载

**用户故事**：作为用户，我希望应用使用优雅的中文字体，这样目标显示更具美感和可读性。

#### 验收标准

1. THE Goal_Tracker SHALL load Noto Serif SC font from Google Fonts
2. THE Goal_Tracker SHALL load Ma Shan Zheng font from Google Fonts
3. WHEN fonts are loading, THE Scroll_Window SHALL display text using system fallback fonts
4. WHEN fonts fail to load, THE Goal_Tracker SHALL log an error and continue using fallback fonts
5. THE Goal_Tracker SHALL cache loaded fonts for offline use

### 需求 18：应用启动行为

**用户故事**：作为用户，我希望应用启动快速且状态恢复准确，这样可以立即开始使用。

#### 验收标准

1. WHEN the application starts, THE Goal_Tracker SHALL display the Tray_Icon within 2 seconds
2. WHEN the application starts, THE Goal_Tracker SHALL load Configuration_Store within 1 second
3. WHEN the application starts, THE Goal_Tracker SHALL restore the last window visibility state
4. WHEN the application starts, THE Goal_Tracker SHALL restore the last scroll pause state
5. WHEN the application starts for the first time, THE Scroll_Window SHALL be visible by default
6. WHEN the application starts for the first time, THE scroll animation SHALL be playing by default

### 需求 19：错误处理

**用户故事**：作为用户，我希望应用能够优雅地处理错误情况，这样不会因为单个文件问题导致整个应用崩溃。

#### 验收标准

1. WHEN a Goal_File cannot be read, THE Goal_Tracker SHALL log the error and skip that file
2. WHEN a Goal_File is deleted while selected, THE Goal_Tracker SHALL remove it from the selection
3. WHEN a directory cannot be accessed, THE Goal_Tracker SHALL display an error message to the user
4. WHEN Configuration_Store is corrupted, THE Goal_Tracker SHALL reset to default settings
5. WHEN font loading fails, THE Goal_Tracker SHALL continue operation with fallback fonts
6. IF an unexpected error occurs, THEN THE Goal_Tracker SHALL log the error details and continue running

### 需求 20：性能要求

**用户故事**：作为用户，我希望应用运行流畅且资源占用低，这样不会影响其他工作。

#### 验收标准

1. THE Scroll_Window SHALL maintain 60 frames per second during scroll animation
2. THE Goal_Tracker SHALL consume less than 100 MB of memory during normal operation
3. THE Goal_Tracker SHALL consume less than 5% CPU during scroll animation
4. WHEN the Scroll_Window is hidden, THE Goal_Tracker SHALL pause rendering to reduce resource usage
5. WHEN scrolling is paused, THE Goal_Tracker SHALL reduce CPU usage to less than 1%
6. THE Goal_Tracker SHALL load and parse a Goal_File within 500 milliseconds
