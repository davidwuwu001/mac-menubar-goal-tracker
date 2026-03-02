const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// 常量配置
const AUTO_REFRESH_INTERVAL = 30000; // 自动刷新间隔：30 秒

// DOM 元素
const goalWindow = document.getElementById('goalWindow');
const controlBtn = document.getElementById('controlBtn');
const controlBtnParallel = document.getElementById('controlBtnParallel');
const arrowIcon = controlBtn.querySelector('.arrow-icon');
const arrowIconParallel = controlBtnParallel ? controlBtnParallel.querySelector('.arrow-icon') : null;
const menuArea = document.getElementById('menuArea');
const scrollContent = document.getElementById('scrollContent');
const carouselMode = document.getElementById('carouselMode');
const parallelMode = document.getElementById('parallelMode');
const scrollYear = document.getElementById('scrollYear');
const scrollMonth = document.getElementById('scrollMonth');
const scrollWeek = document.getElementById('scrollWeek');
const scrollDay = document.getElementById('scrollDay');
const tabs = document.querySelectorAll('.tab');
const fileList = document.getElementById('fileList');
const settingsBtn = document.getElementById('settingsBtn');
const newGoalBtn = document.getElementById('newGoalBtn');
const clearBtn = document.getElementById('clearBtn');
const modeBtns = document.querySelectorAll('.mode-btn');

// 状态
let isExpanded = false;
let currentCategory = '年目标';
let selectedFiles = {};
let directories = {}; // 存储目录路径（字符串）
let filesByCategory = {}; // 存储每个分类的文件列表（数组）
let config = {};
let displayMode = 'carousel'; // 'carousel' 或 'parallel'
let carouselTimer = null;
let currentCarouselIndex = 0;
let autoRefreshTimer = null; // 自动刷新定时器
let carouselAnimationHandler = null; // 轮播动画监听器

// 初始化
init();

async function init() {
  // 加载配置
  ipcRenderer.send('get-config');
  
  // 监听配置加载
  ipcRenderer.on('config-loaded', (_event, loadedConfig) => {
    config = loadedConfig;
    selectedFiles = config.selectedFiles || {};
    directories = config.directories || {};
    displayMode = config.displayMode || 'carousel';
    
    // 应用透明度
    applyOpacity(config.opacity);
    
    // 应用滚动速度
    applyScrollSpeed(config.scrollSpeed);
    
    // 应用暂停状态
    if (config.scrollPaused) {
      scrollContent.classList.add('paused');
    }
    
    // 更新模式按钮状态
    updateModeButtons(displayMode);
    
    // 切换到对应的显示模式
    switchDisplayMode(displayMode);
    
    // 加载所有分类的文件
    loadAllCategories();
    
    // 启动自动刷新（每 30 秒刷新一次）
    startAutoRefresh();
  });
  
  // 监听透明度变化
  ipcRenderer.on('opacity-changed', (_event, opacity) => {
    applyOpacity(opacity);
  });
  
  // 监听速度变化
  ipcRenderer.on('speed-changed', (_event, speed) => {
    applyScrollSpeed(speed);
  });
  
  // 监听滚动切换
  ipcRenderer.on('toggle-scroll', (_event, isPaused) => {
    if (isPaused) {
      scrollContent.classList.add('paused');
      stopCarousel();
    } else {
      scrollContent.classList.remove('paused');
      if (displayMode === 'carousel') {
        startCarousel();
      }
    }
  });
  
  // 监听显示模式切换
  ipcRenderer.on('toggle-display-mode', (_event, mode) => {
    displayMode = mode;
    switchDisplayMode(mode);
  });
  
  // 监听目录设置
  ipcRenderer.on('open-directory-settings', () => {
    if (!isExpanded) {
      toggleMenu();
    }
  });
  
  // 监听目录选择结果
  ipcRenderer.on('directory-selected', (_event, { category, files }) => {
    // 更新文件列表
    filesByCategory[category] = files;
    
    // 如果当前正在查看这个分类，刷新文件列表
    if (currentCategory === category) {
      renderFileList(files);
    }
  });
  
  // 监听文件加载
  ipcRenderer.on('goal-file-loaded', () => {
    // 文件加载成功，刷新显示
    refreshGoalDisplay();
  });
}

// 加载所有分类的文件
function loadAllCategories() {
  const categories = ['年目标', '月目标', '周目标', '行事历'];
  
  console.log('开始加载分类，当前 directories:', directories); // 调试日志
  
  categories.forEach(category => {
    const dirPath = directories[category];
    console.log(`处理分类 ${category}，目录路径:`, dirPath); // 调试日志
    
    if (dirPath && typeof dirPath === 'string' && fs.existsSync(dirPath)) {
      try {
        const files = fs.readdirSync(dirPath)
          .filter(file => file.endsWith('.md'))
          .map(file => ({
            name: file,
            path: path.join(dirPath, file)
          }));
        
        // 存储文件列表到 filesByCategory
        filesByCategory[category] = files;
        
        console.log(`${category} 找到 ${files.length} 个文件:`, files); // 调试日志
        
        // 首次启动，自动选中第一个文件
        if (!selectedFiles[category] && files.length > 0) {
          selectedFiles[category] = [files[0].path];
          saveConfig();
        }
      } catch (error) {
        console.error(`加载 ${category} 目录失败:`, error);
      }
    } else {
      console.log(`${category} 目录不存在或无效`); // 调试日志
    }
  });
  
  // 渲染当前分类的文件列表
  if (filesByCategory[currentCategory]) {
    renderFileList(filesByCategory[currentCategory]);
  } else {
    fileList.innerHTML = '<div style="text-align: center; color: #6B5B8A; padding: 20px;">暂无文件，请先设置目录</div>';
  }
  
  // 刷新目标显示
  refreshGoalDisplay();
}

// 切换菜单
function toggleMenu() {
  isExpanded = !isExpanded;
  
  if (isExpanded) {
    goalWindow.classList.add('expanded');
    menuArea.classList.add('show');
    arrowIcon.classList.add('rotated');
    if (arrowIconParallel) {
      arrowIconParallel.classList.add('rotated');
    }
    ipcRenderer.send('update-window-height', 500);
  } else {
    goalWindow.classList.remove('expanded');
    menuArea.classList.remove('show');
    arrowIcon.classList.remove('rotated');
    if (arrowIconParallel) {
      arrowIconParallel.classList.remove('rotated');
    }
    
    // 根据当前显示模式设置窗口高度
    if (displayMode === 'parallel') {
      ipcRenderer.send('update-window-height', 160);
    } else {
      ipcRenderer.send('update-window-height', 80);
    }
  }
}

// 控制按钮点击
controlBtn.addEventListener('click', toggleMenu);

// 并排模式控制按钮点击
if (controlBtnParallel) {
  controlBtnParallel.addEventListener('click', toggleMenu);
}

// 标签页切换
tabs.forEach(tab => {
  tab.addEventListener('click', (e) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    // 移除所有 active 类
    tabs.forEach(t => t.classList.remove('active'));
    // 添加当前 active 类
    tab.classList.add('active');
    
    // 更新当前分类
    currentCategory = tab.dataset.category;
    
    console.log('切换到分类:', currentCategory); // 调试日志
    
    // 渲染文件列表
    if (filesByCategory[currentCategory] && filesByCategory[currentCategory].length > 0) {
      renderFileList(filesByCategory[currentCategory]);
    } else {
      fileList.innerHTML = '<div style="text-align: center; color: #6B5B8A; padding: 20px;">暂无文件，请先设置目录</div>';
    }
  });
});

// 渲染文件列表
function renderFileList(files) {
  if (!files || files.length === 0) {
    fileList.innerHTML = '<div style="text-align: center; color: #6B5B8A; padding: 20px;">暂无文件</div>';
    return;
  }
  
  const categorySelectedFiles = selectedFiles[currentCategory] || [];
  
  fileList.innerHTML = files.map(file => {
    const isChecked = categorySelectedFiles.includes(file.path);
    return `
      <div class="file-item" data-path="${file.path}">
        <div class="file-checkbox ${isChecked ? 'checked' : ''}"></div>
        <div class="file-name">${file.name}</div>
      </div>
    `;
  }).join('');
  
  // 添加点击事件
  fileList.querySelectorAll('.file-item').forEach(item => {
    // 左键点击：选中/取消选中
    item.addEventListener('click', () => {
      const filePath = item.dataset.path;
      const checkbox = item.querySelector('.file-checkbox');
      const isChecked = checkbox.classList.contains('checked');
      
      if (!selectedFiles[currentCategory]) {
        selectedFiles[currentCategory] = [];
      }
      
      if (isChecked) {
        // 取消选中
        checkbox.classList.remove('checked');
        selectedFiles[currentCategory] = selectedFiles[currentCategory].filter(p => p !== filePath);
      } else {
        // 选中
        checkbox.classList.add('checked');
        selectedFiles[currentCategory].push(filePath);
      }
      
      // 保存配置
      saveConfig();
      
      // 刷新目标显示
      refreshGoalDisplay();
    });
    
    // 右键点击：显示菜单（预览文件）
    item.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const filePath = item.dataset.path;
      ipcRenderer.send('open-file-preview', filePath);
    });
  });
}

// 设置目录按钮
settingsBtn.addEventListener('click', () => {
  ipcRenderer.send('select-directory', currentCategory);
});

// 新增目标按钮
newGoalBtn.addEventListener('click', () => {
  ipcRenderer.send('create-new-goal', currentCategory);
});

// 清空按钮
clearBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // 阻止事件冒泡
  
  // 清空当前分类的已选文件
  if (selectedFiles[currentCategory] && selectedFiles[currentCategory].length > 0) {
    // 确认对话框
    const confirmed = confirm(`确定要清空"${currentCategory}"的所有已选文件吗？`);
    if (confirmed) {
      selectedFiles[currentCategory] = [];
      saveConfig();
      
      // 刷新文件列表显示（取消所有勾选）
      if (filesByCategory[currentCategory]) {
        renderFileList(filesByCategory[currentCategory]);
      }
      
      // 刷新目标显示
      refreshGoalDisplay();
    }
  } else {
    alert(`"${currentCategory}"当前没有已选文件`);
  }
});

// 模式切换按钮
modeBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    
    const mode = btn.dataset.mode;
    
    // 更新按钮状态
    modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // 切换显示模式
    switchDisplayMode(mode);
  });
});

// 刷新目标显示
function refreshGoalDisplay() {
  const categories = ['年目标', '月目标', '周目标', '行事历'];
  
  if (displayMode === 'carousel') {
    // 轮播模式：重新启动轮播
    startCarousel();
  } else if (displayMode === 'parallel') {
    // 并排模式：刷新四个区域
    refreshParallelDisplay();
  } else if (categories.includes(displayMode)) {
    // 单独分类模式：刷新该分类
    showSingleCategory(displayMode);
  }
}

// 启动自动刷新
function startAutoRefresh() {
  // 清除旧的定时器
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
  }
  
  // 每 30 秒自动刷新一次目标显示
  autoRefreshTimer = setInterval(() => {
    refreshGoalDisplay();
  }, AUTO_REFRESH_INTERVAL);
}

// 停止自动刷新
function stopAutoRefresh() {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }
}

// 解析 Markdown 目标
function parseMarkdownGoals(content) {
  const goals = [];
  const lines = content.split('\n');
  
  lines.forEach(line => {
    // 匹配未完成的目标: - [ ] 目标文本 [日期] [百分比]
    const incompleteMatch = line.match(/^[\s-]*\[\s\]\s*(.+?)(?:\s*\[([^\]]+)\])?\s*(?:\[(\d+)%\])?$/);
    if (incompleteMatch) {
      const text = incompleteMatch[1].trim();
      const dueDate = incompleteMatch[2] || null;
      const progress = incompleteMatch[3] ? parseInt(incompleteMatch[3]) : null;
      
      goals.push({
        text: text,
        completed: false,
        dueDate: dueDate,
        progress: progress
      });
    }
    
    // 匹配已完成的目标: - [x] 目标文本 [日期] [百分比]
    const completedMatch = line.match(/^[\s-]*\[x\]\s*(.+?)(?:\s*\[([^\]]+)\])?\s*(?:\[(\d+)%\])?$/i);
    if (completedMatch) {
      const text = completedMatch[1].trim();
      const dueDate = completedMatch[2] || null;
      const progress = completedMatch[3] ? parseInt(completedMatch[3]) : null;
      
      goals.push({
        text: text,
        completed: true,
        dueDate: dueDate,
        progress: progress
      });
    }
  });
  
  return goals;
}

// 计算截止日期的颜色
function getColorByDueDate(dueDate) {
  if (!dueDate) return 'default'; // 没有日期，使用默认颜色
  
  try {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'overdue'; // 已过期 - 红色
    } else if (diffDays <= 3) {
      return 'urgent'; // 3天内 - 红色
    } else if (diffDays <= 7) {
      return 'warning'; // 3-7天 - 黄色
    } else {
      return 'safe'; // 7天以上 - 绿色
    }
  } catch (error) {
    return 'default';
  }
}

// 格式化日期显示（去掉年份）
function formatDate(dateStr) {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  } catch (error) {
    return dateStr;
  }
}

// 获取分类符号
function getCategoryIcon(category) {
  const icons = {
    '年目标': '⭐',
    '月目标': '●',
    '周目标': '■',
    '行事历': '▲'
  };
  return icons[category] || '●';
}

// 渲染目标
function renderGoals(goals, container) {
  const targetContainer = container || scrollContent;
  
  if (goals.length === 0) {
    targetContainer.innerHTML = '<div class="goal-item"><span class="goal-text">暂无目标</span></div>';
    return;
  }
  
  const goalsHTML = goals.map(goal => {
    const colorClass = goal.completed ? 'completed' : getColorByDueDate(goal.dueDate);
    const dateText = goal.dueDate ? formatDate(goal.dueDate) : '';
    const progressText = goal.progress !== null ? `${goal.progress}%` : '';
    const metaText = [dateText, progressText].filter(t => t).join(' ');
    const categoryIcon = getCategoryIcon(goal.category);
    
    return `
      <div class="goal-item ${colorClass}">
        <span class="category-icon">${categoryIcon}</span>
        <div class="goal-icon"></div>
        <span class="goal-text">${goal.text}${metaText ? ` (${metaText})` : ''}</span>
      </div>
    `;
  }).join('<span class="goal-separator">•</span>');
  
  // 复制一份用于无缝滚动
  targetContainer.innerHTML = goalsHTML + '<span class="goal-separator">•</span>' + goalsHTML;
}

// 应用透明度
function applyOpacity(opacity) {
  const opacityValue = opacity || 0.95;
  goalWindow.style.background = `rgba(248, 247, 255, ${opacityValue})`;
}

// 应用滚动速度
function applyScrollSpeed(speed) {
  // 保持无限循环动画
  scrollContent.style.animation = `scroll ${speed}s linear infinite`;
}

// 保存配置
function saveConfig() {
  ipcRenderer.send('save-config', {
    selectedFiles: selectedFiles,
    displayMode: displayMode
  });
}

// 切换显示模式
function switchDisplayMode(mode) {
  displayMode = mode;
  
  const categories = ['年目标', '月目标', '周目标', '行事历'];
  
  if (mode === 'carousel') {
    // 切换到轮播模式
    carouselMode.style.display = 'block';
    parallelMode.style.display = 'none';
    goalWindow.classList.remove('parallel');
    ipcRenderer.send('update-window-height', 80);
    startCarousel();
  } else if (mode === 'parallel') {
    // 切换到并排模式
    carouselMode.style.display = 'none';
    parallelMode.style.display = 'flex';
    goalWindow.classList.add('parallel');
    ipcRenderer.send('update-window-height', 160);
    stopCarousel();
    refreshParallelDisplay();
  } else if (categories.includes(mode)) {
    // 切换到单独显示某个分类
    carouselMode.style.display = 'block';
    parallelMode.style.display = 'none';
    goalWindow.classList.remove('parallel');
    ipcRenderer.send('update-window-height', 80);
    stopCarousel();
    showSingleCategory(mode);
  }
  
  saveConfig();
}

// 显示单个分类
function showSingleCategory(category) {
  const goalsByCategory = collectGoalsByCategory();
  const goals = goalsByCategory[category] || [];
  
  // 渲染目标
  renderGoals(goals, scrollContent);
  
  // 移除内联 transform（让 CSS 动画接管）
  scrollContent.style.transform = '';
  
  // 强制重排，确保动画重新开始
  void scrollContent.offsetWidth;
  
  // 重新应用滚动动画
  const speed = config.scrollSpeed || 120;
  scrollContent.style.animation = `scroll ${speed}s linear infinite`;
}

// 更新模式按钮状态
function updateModeButtons(mode) {
  modeBtns.forEach(btn => {
    if (btn.dataset.mode === mode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// 开始轮播
function startCarousel() {
  stopCarousel();
  
  const categories = ['年目标', '月目标', '周目标', '行事历'];
  const allGoals = collectGoalsByCategory();
  
  // 检查是否有任何目标
  const hasAnyGoals = Object.values(allGoals).some(goals => goals && goals.length > 0);
  if (!hasAnyGoals) {
    // 没有任何目标，显示提示信息
    scrollContent.innerHTML = '<div class="goal-item"><span class="goal-text">暂无目标</span></div>';
    return;
  }
  
  // 找到第一个有目标的分类
  let startIndex = 0;
  for (let i = 0; i < categories.length; i++) {
    if (allGoals[categories[i]] && allGoals[categories[i]].length > 0) {
      startIndex = i;
      break;
    }
  }
  
  currentCarouselIndex = startIndex;
  
  // 显示第一个分类
  showCarouselCategory(categories[currentCarouselIndex], allGoals);
  
  // 创建动画迭代监听器（每次滚动动画完成一轮时触发）
  carouselAnimationHandler = () => {
    // 找到下一个有目标的分类
    let attempts = 0;
    const maxAttempts = categories.length;
    
    do {
      currentCarouselIndex = (currentCarouselIndex + 1) % categories.length;
      attempts++;
      
      // 如果尝试了所有分类都没有目标，停止轮播
      if (attempts >= maxAttempts) {
        stopCarousel();
        return;
      }
    } while (!allGoals[categories[currentCarouselIndex]] || allGoals[categories[currentCarouselIndex]].length === 0);
    
    const category = categories[currentCarouselIndex];
    showCarouselCategory(category, allGoals);
  };
  
  // 添加监听器（监听动画每完成一次迭代）
  scrollContent.addEventListener('animationiteration', carouselAnimationHandler);
}

// 停止轮播
function stopCarousel() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
  
  // 移除动画监听器
  if (carouselAnimationHandler) {
    scrollContent.removeEventListener('animationiteration', carouselAnimationHandler);
    carouselAnimationHandler = null;
  }
}

// 显示轮播分类
function showCarouselCategory(category, allGoals) {
  const goals = allGoals[category] || [];
  
  // 渲染目标
  renderGoals(goals, scrollContent);
  
  // 移除内联 transform（让 CSS 动画接管）
  scrollContent.style.transform = '';
  
  // 强制重排，确保动画重新开始
  void scrollContent.offsetWidth;
  
  // 重新应用滚动动画
  const speed = config.scrollSpeed || 120;
  scrollContent.style.animation = `scroll ${speed}s linear infinite`;
}

// 按分类收集目标
function collectGoalsByCategory() {
  const goalsByCategory = {
    '年目标': [],
    '月目标': [],
    '周目标': [],
    '行事历': []
  };
  
  Object.keys(selectedFiles).forEach(category => {
    const files = selectedFiles[category] || [];
    files.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const goals = parseMarkdownGoals(content);
          goals.forEach(goal => {
            goal.category = category;
          });
          goalsByCategory[category].push(...goals);
        } catch (error) {
          console.error('读取文件失败:', error);
        }
      }
    });
  });
  
  return goalsByCategory;
}

// 刷新并排显示
function refreshParallelDisplay() {
  const goalsByCategory = collectGoalsByCategory();
  
  // 为每个滚动区域应用动画修复
  const scrollContainers = [
    { container: scrollYear, goals: goalsByCategory['年目标'] || [] },
    { container: scrollMonth, goals: goalsByCategory['月目标'] || [] },
    { container: scrollWeek, goals: goalsByCategory['周目标'] || [] },
    { container: scrollDay, goals: goalsByCategory['行事历'] || [] }
  ];
  
  scrollContainers.forEach(({ container, goals }) => {
    // 渲染目标
    renderGoals(goals, container);
    
    // 移除内联 transform（让 CSS 动画接管）
    container.style.transform = '';
    
    // 强制重排，确保动画重新开始
    void container.offsetWidth;
    
    // 重新应用滚动动画
    const speed = config.scrollSpeed || 120;
    container.style.animation = `scroll ${speed}s linear infinite`;
  });
}

// 点击窗口外部关闭菜单
document.addEventListener('click', (e) => {
  if (isExpanded && !goalWindow.contains(e.target)) {
    toggleMenu();
  }
});
