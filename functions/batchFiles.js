const moveFile = require('move-file');
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const readdir = promisify(fs.readdir)
const renameFolder = promisify(fs.rename)
const stat = promisify(fs.stat);

module.exports = async function(targetPath, batchSize, fileExt, exclude){
  //fileExt is used to filtering files to batch


  var targetPath = path.resolve(process.cwd(), targetPath);

  //get the list of files
  readdir(targetPath).then(items => {
    var moveFilePromiseArray = []

    if(fileExt[0] != '.') {
      fileExt = '.' + fileExt
    }

    var targetFiles = items.filter(item => item.toUpperCase().includes(fileExt.toUpperCase()))

    //remove if required
    if(exclude && Array.isArray(exclude)){
      targetFiles = targetFiles.filter(file => {
        return !exclude.some(ex => file.toUpperCase() == `${ex.toUpperCase()}${fileExt.toUpperCase()}` )
      })
    }

    //first move all the files
    var batches = Math.ceil(targetFiles.length/batchSize); //the number of batches
    for (var i = 0; i < batches; i++) {
      var firstFileInd = i * batchSize;
      var lastFileInd = firstFileInd + batchSize
      var thisChunk = targetFiles.slice(firstFileInd, lastFileInd)
      for (var j of thisChunk) {
        var fileName = path.basename(j)
        var oldPath = targetPath + '/' + fileName
        var newPath = `${targetPath}/tempsub${i}/${fileName}`
        moveFilePromiseArray.push(moveFile(oldPath, newPath))
      } 
    }

    //then rename the folders
    Promise.all(moveFilePromiseArray)
    .then(async _ => {
      
      var folderRenamePromises = []
      
      //get what's in the folder now
      
      var dirs = fs.readdirSync(targetPath).filter(f => fs.statSync(path.join(targetPath, f)).isDirectory())
      dirs = dirs.filter(dir => dir.includes('tempsub'))

      for (var dir of dirs) {
        var dirPath = targetPath + '\\' + dir
        try {
          var dirItems =  await readdir(dirPath);
        }
        catch(err) {
          console.log('error reading subdirectory ' + dir + ': ' + err)
        }

        dirItems.sort();
        
        var firstItem = dirItems[0]
        var lastItem = dirItems[dirItems.length - 1]
        var newFolderName = firstItem.replace(fileExt, '') + ' ' + lastItem.replace(fileExt, '')
        var newFolderPath = targetPath + '\\' + newFolderName
        folderRenamePromises.push(renameFolder(dirPath, newFolderPath))
      }
      Promise.all(folderRenamePromises).then( _ => {
        console.log('file chunks complete')
      })
      .catch(err => {
        console.log('Error renaming subfolders: ' + err) 
      })
    })
    .catch(err => {
      console.log('error moving files: ' + err)
    })
  })
  .catch(err => {
    console.log('There was an error reading the directory: ' + err)
  })
}