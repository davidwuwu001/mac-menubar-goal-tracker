const { ipcRenderer } = require('electron');

// DOM 元素
const sliderTitle = document.getElementById('sliderTitle');
const labelText = document.getElementById('labelText');
const valueText = document.getElementById('valueText');
const sliderTrack = document.getElementById('sliderTrack');
const sliderFill = document.getElementById('sliderFill');
const sliderThumb = document.getElementById('sliderThumb');
const closeBtn = document.getElementById('closeBtn');

let sliderType = 'opacity'; // 'opacity' 或 'speed'
let currentValue = 0.98;
let isDragging = false;

// 监听滑块类型
ipcRenderer.on('slider-type', (event, type) => {
  sliderType = type;
  
  if (type === 'opacity') {
    sliderTitle.textContent = '调整透明度';
    labelText.textContent = '不透明度';
    currentValue = 0.95;
    
    valueText.classList.add('opacity');
    sliderFill.classList.add('opacity');
    sliderThumb.classList.add('opacity');
    closeBtn.classList.add('opacity');
    
    // 立即更新显示
    updateSlider(currentValue, 0.0, 1.0);
  } else if (type === 'speed') {
    sliderTitle.textContent = '滚动速度';
    labelText.textContent = '速度';
    currentValue = 60;
    
    valueText.classList.add('speed');
    sliderFill.classList.add('speed');
    sliderThumb.classList.add('speed');
    closeBtn.classList.add('speed');
    
    // 立即更新显示
    updateSlider(currentValue, 10, 120);
  }
});

// 更新滑块显示
function updateSlider(value, min, max) {
  const percentage = ((value - min) / (max - min)) * 100;
  sliderFill.style.width = `${percentage}%`;
  sliderThumb.style.left = `${percentage}%`;
  
  if (sliderType === 'opacity') {
    valueText.textContent = `${Math.round(value * 100)}%`;
  } else if (sliderType === 'speed') {
    // 速度标签：10-30秒=极快，30-50秒=快速，50-70秒=中速，70-90秒=慢速，90-120秒=极慢
    let speedLabel = '中速';
    if (value < 30) {
      speedLabel = '极快';
    } else if (value < 50) {
      speedLabel = '快速';
    } else if (value < 70) {
      speedLabel = '中速';
    } else if (value < 90) {
      speedLabel = '慢速';
    } else {
      speedLabel = '极慢';
    }
    
    valueText.textContent = `${speedLabel} (${Math.round(value)}秒)`;
  }
}

// 计算滑块值
function calculateValue(clientX) {
  const rect = sliderTrack.getBoundingClientRect();
  const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  
  if (sliderType === 'opacity') {
    const min = 0.0;
    const max = 1.0;
    return min + percentage * (max - min);
  } else if (sliderType === 'speed') {
    const min = 10;
    const max = 120;
    return min + percentage * (max - min);
  }
}

// 鼠标按下
sliderTrack.addEventListener('mousedown', (e) => {
  isDragging = true;
  const value = calculateValue(e.clientX);
  currentValue = value;
  
  if (sliderType === 'opacity') {
    updateSlider(value, 0.0, 1.0);
    ipcRenderer.send('update-opacity', value);
  } else if (sliderType === 'speed') {
    updateSlider(value, 10, 120);
    ipcRenderer.send('update-speed', value);
  }
});

// 滑块本身也可以拖动
sliderThumb.addEventListener('mousedown', (e) => {
  isDragging = true;
  e.stopPropagation();
});

// 鼠标移动
document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  
  const value = calculateValue(e.clientX);
  currentValue = value;
  
  if (sliderType === 'opacity') {
    updateSlider(value, 0.0, 1.0);
    ipcRenderer.send('update-opacity', value);
  } else if (sliderType === 'speed') {
    updateSlider(value, 10, 120);
    ipcRenderer.send('update-speed', value);
  }
});

// 鼠标释放
document.addEventListener('mouseup', () => {
  isDragging = false;
});

// 关闭按钮
closeBtn.addEventListener('click', () => {
  window.close();
});
