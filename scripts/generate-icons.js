const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVGアイコンを生成
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#ffffff"/>
  <rect x="56" y="56" width="400" height="400" rx="20" fill="#000000"/>
  <text x="256" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="#ffffff">3125</text>
  <text x="256" y="360" font-family="system-ui, -apple-system, sans-serif" font-size="60" text-anchor="middle" fill="#ffffff">Lab</text>
</svg>
`;

const publicDir = path.join(__dirname, '..', 'public');

// SVGをバッファに変換
const svgBuffer = Buffer.from(svgIcon);

// アイコンサイズの配列
const sizes = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' }
];

// 各サイズのアイコンを生成
async function generateIcons() {
  for (const { size, name } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, name));
    console.log(`✓ Generated ${name}`);
  }
  
  // favicon.icoも生成
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✓ Generated favicon.ico');
}

generateIcons().catch(console.error);