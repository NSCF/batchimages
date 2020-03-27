const unbatch = require('./functions/unbatchToNewLocation')

let sourcePath = 'H:\\Herbarium Specimen Images\\UKZN Bews'
let targetPath = 'F:\\Images\\Herbaria\\Bews'

unbatch(sourcePath, targetPath)