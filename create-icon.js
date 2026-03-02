// 这个脚本用于创建托盘图标
// 由于需要图像处理库，我们先创建一个 SVG 文件，然后手动转换为 PNG

const fs = require('fs');
const path = require('path');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- 白色背景 -->
  <rect width="100" height="100" fill="white" rx="12"/>
  
  <!-- 外圆 -->
  <circle cx="47" cy="50" r="30" fill="none" stroke="#4C12A1" stroke-width="4"/>
  
  <!-- 中圆 -->
  <circle cx="47" cy="50" r="20" fill="none" stroke="#4C12A1" stroke-width="3"/>
  
  <!-- 内圆 -->
  <circle cx="47" cy="50" r="10" fill="none" stroke="#4C12A1" stroke-width="2"/>
  
  <!-- 箭头 -->
  <path d="M 62 45 L 77 45 L 77 40 L 87 50 L 77 60 L 77 55 L 62 55 Z" fill="#2DCCD3"/>
</svg>`;

// 保存 SVG 文件
fs.writeFileSync(path.join(__dirname, 'assets', 'icon.svg'), svg);

console.log('SVG 图标已创建: assets/icon.svg');
console.log('请使用以下命令将 SVG 转换为 PNG:');
console.log('  方法1: 使用在线工具 https://cloudconvert.com/svg-to-png');
console.log('  方法2: 使用 macOS 预览应用打开 SVG，然后导出为 PNG');
console.log('  方法3: 安装 sharp 库后运行转换脚本');
