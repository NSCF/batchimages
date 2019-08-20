const batchFiles = require('./functions/batchFiles')

//var path = 'C:/testdata/Scrophulariaceae'
var path = 'F:/Herbarium Specimen Images/SANBI Compton/Scrophulariaceae2Batched'

batchFiles(path, 50, 'jpg')