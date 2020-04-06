const unbatch = require('./functions/unbatchToNewLocation.j')

let sourcePath = 'H:\\Herbarium Specimen Images\\UKZN Bews'
let targetPath = 'F:\\Images\\Herbaria\\Bews'

let moveOrCopy = 'move' //VNB always check this

unbatch(sourcePath, targetPath, moveOrCopy)