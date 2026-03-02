const fs = require('fs');
const path = require('path');

// 创建一个最小的 25x25 PNG 图标（紫色圆点）
// PNG 文件头 + 紫色像素数据
const pngData = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG 签名
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
  0x00, 0x00, 0x00, 0x19, 0x00, 0x00, 0x00, 0x19, // 25x25
  0x08, 0x02, 0x00, 0x00, 0x00, 0x4B, 0x8D, 0x02, 0x3D,
  // ... 这里应该是完整的 PNG 数据，但手动创建太复杂
]);

// 更简单的方法：创建一个 SVG，让 Electron 自动处理
const svgIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12.5" cy="12.5" r="10" fill="none" stroke="#4C12A1" stroke-width="2"/>
  <circle cx="12.5" cy="12.5" r="6" fill="none" stroke="#4C12A1" stroke-width="1.5"/>
  <circle cx="12.5" cy="12.5" r="3" fill="none" stroke="#4C12A1" stroke-width="1"/>
  <path d="M 16 11 L 20 11 L 20 9 L 23 12.5 L 20 16 L 20 14 L 16 14 Z" fill="#2DCCD3"/>
</svg>`;

fs.writeFileSync(path.join(__dirname, 'assets', 'icon.svg'), svgIcon);
console.log('✓ SVG 图标已创建: assets/icon.svg');
console.log('  Electron 会自动使用 SVG 图标');
