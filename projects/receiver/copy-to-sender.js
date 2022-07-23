const fs = require('fs-extra')
function showError(err) {
  console.error(err)
}
fs.copy('./dist/web/extension.js', '../sender/dist/receiver/dist/web/extension.js', showError)
fs.copy('./package.json', '../sender/dist/receiver/package.json', showError)
fs.copy('./package.nls.json', '../sender/dist/receiver/package.nls.json', showError)

console.log('Copied receiver files to sender extension.')
