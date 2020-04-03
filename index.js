const batchFiles = require('./functions/batchFiles')

//var targetDir = 'C:/testdata/Scrophulariaceae'
var targetDir = String.raw`H:\Herbarium Specimen Images\Wits Moss\test`

//exclude
let exclude = require('./exclude') //VNB

let targetFileTypes = ['.jpg', '.jpeg'] //an array of target file types for data capture, may be more than one

batchFiles(targetDir, 3, targetFileTypes, exclude)