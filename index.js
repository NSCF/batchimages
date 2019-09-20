const batchFiles = require('./functions/batchFiles')

//path 
//var path = 'C:/testdata/Scrophulariaceae'
var path = 'H:\\Selmar Schonland Herbarium\\Proteaceae'

//exclude

batchFiles(path, 60, 'jpg')