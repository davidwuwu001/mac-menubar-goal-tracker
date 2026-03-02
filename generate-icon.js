// 使用 Canvas 生成托盘图标
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// 创建 100x100 的画布
const canvas = createCanvas(100, 100);
const ctx = canvas.getContext('2d');

// 白色背景
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(0, 0, 100, 100);

// 绘制同心圆（蓝紫色）
ctx.strokeStyle = '#4C12A1';
ctx.lineWidth = 4;
ctx.beginPath();
ctx.arc(47, 50, 30, 0, Math.PI * 2);
ctx.stroke();

ctx.lineWidth = 3;
ctx.beginPath();
ctx.arc(47, 50, 20, 0, Math.PI * 2);
ctx.stroke();

ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(47, 50, 10, 0, Math.PI * 2);
ctx.stroke();

// 绘制箭头（青色）
ctx.fillStyle = '#2DCCD3';
ctx.beginPath();
ctx.moveTo(62, 45);
ctx.lineTo(77, 45);
ctx.lineTo(77, 40);
ctx.lineTo(87, 50);
ctx.lineTo(77, 60);
ctx.lineTo(77, 55);
ctx.lineTo(62, 55);
ctx.closePath();
ctx.fill();

// 保存为 PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, 'assets', 'icon.png'), buffer);

console.log('✓ 图标已生成: assets/icon.png');
