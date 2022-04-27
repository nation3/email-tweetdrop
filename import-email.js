const fs = require('fs')

const path = process.argv[2]
const file = fs.readFileSync(path, 'utf8')
const matches = file.match(
  /(https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+))/g
)

for (const match of matches) {
  console.log(match)
}

console.log(`Valid tweets detected: ${matches.length}`)
