const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, screen, nativeImage, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');
const fs = require('fs');

// 配置存储
const store = new Store();

let mainWindow = null;
let tray = null;
let sliderWindow = null;

// 应用不显示在 Dock
if (process.platform === 'darwin') {
  app.dock.hide();
}

// 获取默认目录
function getDefaultDirectory(category) {
  const homeDir = app.getPath('documents');
  return path.join(homeDir, 'Goals', category);
}

// 确保目录存在
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// 创建主窗口（滚动显示窗口）
function createMainWindow() {
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: 900,
    height: 80,
    x: Math.floor((screenWidth - 900) / 2), // 居中显示
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.setAlwaysOnTop(true, 'floating');
  
  // 恢复上次的可见状态
  const isVisible = store.get('windowVisible', true);
  if (!isVisible) {
    mainWindow.hide();
  }

  // 开发时打开调试工具
  mainWindow.webContents.openDevTools({ mode: 'detach' });
}

// 创建滑块弹窗
function createSliderWindow(type) {
  if (sliderWindow && !sliderWindow.isDestroyed()) {
    sliderWindow.close();
  }

  const { x, y } = screen.getCursorScreenPoint();
  
  sliderWindow = new BrowserWindow({
    width: 320,
    height: 220,
    x: x - 160,
    y: y + 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  sliderWindow.loadFile('slider.html');
  
  sliderWindow.webContents.on('did-finish-load', () => {
    sliderWindow.webContents.send('slider-type', type);
  });

  sliderWindow.on('blur', () => {
    if (sliderWindow && !sliderWindow.isDestroyed()) {
      sliderWindow.close();
      sliderWindow = null;
    }
  });
  
  sliderWindow.on('closed', () => {
    sliderWindow = null;
  });
}

// 创建托盘图标
function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  tray = new Tray(iconPath);
  
  updateTrayMenu();
  
  tray.setToolTip('目标追踪器');
}

// 更新托盘菜单
function updateTrayMenu() {
  const isVisible = mainWindow && mainWindow.isVisible();
  const isPaused = store.get('scrollPaused', false);
  const displayMode = store.get('displayMode', 'carousel');
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: isVisible ? '隐藏窗口' : '显示窗口',
      click: () => {
        if (mainWindow) {
          if (isVisible) {
            mainWindow.hide();
            store.set('windowVisible', false);
          } else {
            mainWindow.show();
            store.set('windowVisible', true);
          }
          updateTrayMenu();
        }
      }
    },
    {
      label: isPaused ? '播放滚动' : '暂停滚动',
      click: () => {
        const newState = !isPaused;
        store.set('scrollPaused', newState);
        if (mainWindow) {
          mainWindow.webContents.send('toggle-scroll', newState);
        }
        updateTrayMenu();
      }
    },
    { type: 'separator' },
    {
      label: '显示模式',
      submenu: [
        {
          label: '轮播模式',
          type: 'radio',
          checked: displayMode === 'carousel',
          click: () => {
            store.set('displayMode', 'carousel');
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('toggle-display-mode', 'carousel');
            }
            updateTrayMenu();
          }
        },
        {
          label: '并排模式',
          type: 'radio',
          checked: displayMode === 'parallel',
          click: () => {
            store.set('displayMode', 'parallel');
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('toggle-display-mode', 'parallel');
            }
            updateTrayMenu();
          }
        }
      ]
    },
    { type: 'separator' },
    {
      label: '调整透明度',
      click: () => createSliderWindow('opacity')
    },
    {
      label: '滚动速度',
      click: () => createSliderWindow('speed')
    },
    { type: 'separator' },
    {
      label: '设置目录',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('open-directory-settings');
        }
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
}

// IPC 通信处理
ipcMain.on('update-window-height', (event, height) => {
  if (mainWindow) {
    mainWindow.setSize(900, height);
  }
});

ipcMain.on('select-directory', async (event, category) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const dirPath = result.filePaths[0];
    store.set(`directory.${category}`, dirPath);
    
    // 扫描目录中的 .md 文件
    const files = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.md'))
      .map(file => ({
        name: file,
        path: path.join(dirPath, file)
      }));
    
    event.reply('directory-selected', { category, files });
  }
});

ipcMain.on('load-goal-file', (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    event.reply('goal-file-loaded', { filePath, content });
  } catch (error) {
    console.error('读取文件失败:', error);
    event.reply('goal-file-error', { filePath, error: error.message });
  }
});

ipcMain.on('save-config', (event, config) => {
  Object.keys(config).forEach(key => {
    store.set(key, config[key]);
  });
});

ipcMain.on('get-config', (event) => {
  const config = {
    opacity: store.get('opacity', 0.95),
    scrollSpeed: store.get('scrollSpeed', 60),
    scrollPaused: store.get('scrollPaused', false),
    displayMode: store.get('displayMode', 'carousel'),
    selectedFiles: store.get('selectedFiles', {}),
    directories: {
      年目标: store.get('directory.年目标', ''),
      月目标: store.get('directory.月目标', ''),
      周目标: store.get('directory.周目标', ''),
      行事历: store.get('directory.行事历', '')
    }
  };
  event.reply('config-loaded', config);
});

ipcMain.on('update-opacity', (event, opacity) => {
  store.set('opacity', opacity);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('opacity-changed', opacity);
  }
});

ipcMain.on('update-speed', (event, speed) => {
  store.set('scrollSpeed', speed);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('speed-changed', speed);
  }
});

// 打开文件预览
ipcMain.on('open-file-preview', (event, filePath) => {
  shell.openPath(filePath);
});

// 创建新目标文件
ipcMain.on('create-new-goal', async (event, category) => {
  const dirPath = store.get(`directory.${category}`);
  
  if (!dirPath) {
    dialog.showMessageBox(mainWindow, {
      type: 'warning',
      title: '提示',
      message: '请先设置目录',
      buttons: ['确定']
    });
    return;
  }
  
  // 生成文件名（使用当前日期）
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const fileName = `${category}-${dateStr}.md`;
  const filePath = path.join(dirPath, fileName);
  
  // 创建模板内容
  const template = `# ${category} - ${dateStr}

- [ ] 示例目标 1 [${dateStr}] [0%]
- [ ] 示例目标 2 [${dateStr}] [0%]
- [ ] 示例目标 3 [${dateStr}] [0%]

## 说明
- 格式：\`- [ ] 目标文本 [截止日期] [完成百分比]\`
- 日期格式：YYYY-MM-DD
- 百分比：0-100
`;
  
  try {
    // 检查文件是否已存在
    if (fs.existsSync(filePath)) {
      const result = await dialog.showMessageBox(mainWindow, {
        type: 'question',
        title: '文件已存在',
        message: `文件 ${fileName} 已存在，是否打开？`,
        buttons: ['打开', '取消']
      });
      
      if (result.response === 0) {
        shell.openPath(filePath);
      }
    } else {
      // 创建新文件
      fs.writeFileSync(filePath, template, 'utf-8');
      
      // 打开文件
      shell.openPath(filePath);
      
      // 刷新文件列表
      setTimeout(() => {
        const files = fs.readdirSync(dirPath)
          .filter(file => file.endsWith('.md'))
          .map(file => ({
            name: file,
            path: path.join(dirPath, file)
          }));
        
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('directory-selected', { category, files });
        }
      }, 500);
    }
  } catch (error) {
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      title: '错误',
      message: `创建文件失败: ${error.message}`,
      buttons: ['确定']
    });
  }
});

// 应用启动
app.whenReady().then(() => {
  createMainWindow();
  createTray();
});

// 所有窗口关闭时不退出应用（菜单栏应用特性）
app.on('window-all-closed', (e) => {
  e.preventDefault();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
