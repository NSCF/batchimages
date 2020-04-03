const moveFile = require('move-file');
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const readdir = promisify(fs.readdir)
const renameFolder = promisify(fs.rename)
const stat = promisify(fs.stat);

module.exports = async function(targetPath, batchSize, targetFileTypes, exclude){

  var targetPath = path.resolve(process.cwd(), targetPath);

  //get the list of files
  readdir(targetPath).then(items => {
    var moveFilePromiseArray = []

    
    targetFileTypes = targetFileTypes.map(type => {
      if(type[0] != '.') {
        return '.' + type
      }
      else {
        return type
      }
    })

    let targetFileTypesUpper = targetFileTypes.map(x => x.toUpperCase())
    var targetFiles = items.filter(item => {
      let itemExtUpper = path.extname(item).toUpperCase()
      return targetFileTypesUpper.includes(itemExtUpper)
    })

    //to simplify, make everything upper case
    //NB this might cause issues for moving files on case sensitive file systems
    targetFiles = targetFiles.map(x => x.toUpperCase())

    //remove if in exclude
    if(exclude && Array.isArray(exclude) && exclude.length > 0){
      exclude = exclude.map(x => x.toUpperCase())
      let fileBarcodes = targetFiles.map(f => f.replace(/\.[^/.]+$/, "")) //remove file extensions, see https://stackoverflow.com/questions/4250364/how-to-trim-a-file-extension-from-a-string-in-javascript/34301737
      let barcodesToCapture = fileBarcodes.filter(fileBarcode => {
        return !exclude.some(ex => fileBarcode == ex || (fileBarcode.startsWith(ex) && isNaN(fileBarcode[ex.length])))
      })

      targetFiles = targetFiles.filter(targetFile => barcodesToCapture.includes(targetFile.replace(/\.[^/.]+$/, "")))

    }

    //make a dictionary of occurrences
    let occurrenceGroups = {}
    targetFiles.forEach(targetFile => {
      let fileBarcode = targetFile.replace(path.extname(targetFile), "")
      let base = ''
      if (fileBarcode.includes('-')) {//-1, -2, etc
        base = fileBarcode.slice(0, fileBarcode.lastIndexOf('-'))
      }
      else if (/[A-Z]/.test(fileBarcode[fileBarcode.length - 1])){ //A, B, etc
        //get the index of the last number before the letters
        let lastnumIndex = fileBarcode.length -1
        while(isNaN(fileBarcode[lastnumIndex])){
          --lastnumIndex
        }
        base = fileBarcode.substring(0, lastnumIndex + 1)
      }
      else {
        base = fileBarcode
      }

      if(occurrenceGroups[base]){
        occurrenceGroups[base].push(targetFile)
      }
      else {
        occurrenceGroups[base] = [targetFile]
      }
    })

    let keys = Object.keys(occurrenceGroups)
    //first move all the files
    let firstKeyInd = 0
    let lastKeyInd = firstKeyInd + batchSize
    let counter = 0
    while (firstKeyInd < keys.length) {
      
      let thisChunkKeys = keys.slice(firstKeyInd, lastKeyInd)
      let thisChunkFiles = []
      thisChunkKeys.forEach(key => thisChunkFiles = [...thisChunkFiles, ...occurrenceGroups[key]])

      for (var fileName of thisChunkFiles) {
        var oldPath = path.join(targetPath, fileName)
        var newPath = path.join(targetPath, `tempsub${counter}`,   fileName)
        moveFilePromiseArray.push(moveFile(oldPath, newPath))
      }

      counter++ 

      firstKeyInd = lastKeyInd
      lastKeyInd = firstKeyInd + batchSize

    }
    //once moved rename the folders
    Promise.all(moveFilePromiseArray)
    .then(async _ => {
      
      var folderRenamePromises = []
      
      //get what's in the folder now
      
      var dirs = fs.readdirSync(targetPath).filter(f => fs.statSync(path.join(targetPath, f)).isDirectory())
      dirs = dirs.filter(dir => dir.includes('tempsub'))

      for (var dir of dirs) {
        var dirPath = path.join(targetPath, dir)
        try {
          var dirItems =  await readdir(dirPath);
        }
        catch(err) {
          console.log('error reading subdirectory ' + dir + ': ' + err)
        }

        dirItems.sort();
        
        var firstItem = dirItems[0]
        var lastItem = dirItems[dirItems.length - 1]
        var newFolderName = firstItem.replace(path.extname(firstItem), '') + ' - ' + lastItem.replace(path.extname(lastItem), '')
        var newFolderPath = path.join(targetPath, newFolderName) 
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