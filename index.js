const batchFiles = require('./functions/batchFiles')

//path 
//var path = 'C:/testdata/Scrophulariaceae'
var path = 'H:\\Herbarium Specimen Images\\SANBI Compton\\Theophrastaceae\\JPEG'

//exclude
let exclude = require('./exclude') //VNB


//VNB make sure to update exclude if some images already captured!!
batchFiles(path, 60, 'jpg', exclude)