const fs = require('fs');
const { createCanvas } = require('canvas');

const size = 512;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#1e1e1e';
ctx.fillRect(0, 0, size, size);

// Draw layers (simplified version of the SVG)
const centerX = size / 2;
const centerY = size / 2;

// Top layer (blue)
ctx.strokeStyle = '#007ACC';
ctx.fillStyle = 'rgba(0, 122, 204, 0.2)';
ctx.lineWidth = 12;
ctx.beginPath();
ctx.moveTo(centerX, centerY - 160);
ctx.lineTo(centerX - 192, centerY - 80);
ctx.lineTo(centerX, centerY);
ctx.lineTo(centerX + 192, centerY - 80);
ctx.closePath();
ctx.fill();
ctx.stroke();

// Middle layer (orange)
ctx.strokeStyle = '#ff8c00';
ctx.fillStyle = 'rgba(255, 140, 0, 0.2)';
ctx.beginPath();
ctx.moveTo(centerX - 192, centerY);
ctx.lineTo(centerX, centerY + 80);
ctx.lineTo(centerX + 192, centerY);
ctx.stroke();

// Bottom layer (blue)
ctx.strokeStyle = '#007ACC';
ctx.fillStyle = 'rgba(0, 122, 204, 0.2)';
ctx.beginPath();
ctx.moveTo(centerX - 192, centerY + 80);
ctx.lineTo(centerX, centerY + 160);
ctx.lineTo(centerX + 192, centerY + 80);
ctx.stroke();

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('icon.png', buffer);
console.log('Icon created successfully!');
