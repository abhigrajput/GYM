const sharp = require("sharp")
const fs = require("fs")
const path = require("path")

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const outDir = path.join(process.cwd(), "public", "icons")
const svgPath = path.join(outDir, "base.svg")

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
if (!fs.existsSync(svgPath)) {
  console.error("Missing public/icons/base.svg")
  process.exit(1)
}
const baseSvg = fs.readFileSync(svgPath, "utf-8")

Promise.all(
  sizes.map((size) =>
    sharp(Buffer.from(baseSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `icon-${size}.png`))
  )
)
  .then(() => {
    console.log("Generated icons:", sizes.map((s) => `icon-${s}.png`).join(", "))
  })
  .catch((err) => {
    console.error("Icon generation failed:", err.message)
    process.exit(1)
  })
