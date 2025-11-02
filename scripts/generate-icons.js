const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const sizes = [192, 512]
const svgPath = path.join(__dirname, '../public/icon.svg')

async function generateIcons() {
  console.log('🎨 Gerando ícones PWA...')

  for (const size of sizes) {
    const outputPath = path.join(__dirname, `../public/icon-${size}x${size}.png`)

    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath)

    console.log(`✅ Gerado: icon-${size}x${size}.png`)
  }

  // Criar apple-touch-icon
  const applePath = path.join(__dirname, '../public/apple-touch-icon.png')
  await sharp(svgPath)
    .resize(180, 180)
    .png()
    .toFile(applePath)

  console.log('✅ Gerado: apple-touch-icon.png')
  console.log('🎉 Todos os ícones foram gerados com sucesso!')
}

generateIcons().catch(console.error)
