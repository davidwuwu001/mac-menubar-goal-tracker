// 创建一个简单的 PNG 图标
// 这里我们使用 Electron 的 nativeImage 来创建图标

const { nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

// 创建一个简单的图标数据（使用 SVG）
const svgIcon = `
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="white" rx="12"/>
  <circle cx="47" cy="50" r="30" fill="none" stroke="#4C12A1" stroke-width="4"/>
  <circle cx="47" cy="50" r="20" fill="none" stroke="#4C12A1" stroke-width="3"/>
  <circle cx="47" cy="50" r="10" fill="none" stroke="#4C12A1" stroke-width="2"/>
  <path d="M 62 45 L 77 45 L 77 40 L 87 50 L 77 60 L 77 55 L 62 55 Z" fill="#2DCCD3"/>
</svg>
`;

// 创建 nativeImage
const image = nativeImage.createFromBuffer(Buffer.from(svgIcon));

// 保存为 PNG
const pngBuffer = image.toPNG();
fs.writeFileSync(path.join(__dirname, 'assets', 'icon.png'), pngBuffer);

console.log('✓ 图标已生成: assets/icon.png');
