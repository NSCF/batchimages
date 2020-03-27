//read all files in subfolders and copy to a new folder, such as on another hard drive
//for unbatching images in subfolders within a family folder

const copyFile = require('cp-file')
const fs = require('fs-extra') //for reading contents on a dir only (not recursive)
const dir = require('node-dir') //for recursively reading directories
const path = require('path')

//for logging progress
function getProgress(sourceFileCount, targetPath){
  dir.promiseFiles(targetPath).then(items => {
    let filesMoved = items.filter(item => item.endsWith('.jpg') || item.endsWith('.jpeg') || item.endsWith('.tif'))//TODO check for other file extensions for images
    let percentage = Math.round(filesMoved / sourceFileCount * 100)
    console.log(percentage + '% complete')
  })
}
function showProgress(sourcePath, targetPath) {
  dir.promiseFiles(sourcePath).then(items => {
    let filesToMove = items.filter(item => item.endsWith('.jpg') || item.endsWith('.jpeg') || item.endsWith('.tif'))//TODO check for other file extensions for images
    let sourceFileCount = filesToMove.length
    setInterval(getProgress(sourceFileCount, targetPath), 1000)
  })
}

/**
 * sourcePath is a directory containing all the folders with family names
 * targetPath is the directory to move everything to
 */
module.exports = async function(sourcePath, targetPath){

  //get the target path subfolders
  let subfolders = await fs.readdir(sourcePath)
  subfolders = subfolders.filter(item => !path.extname(item)) //only stuff that doesn't have extentions

  //get the list of files in source subfolders, recursively
  dir.promiseFiles(sourcePath).then(items => {

    showProgress(sourcePath, targetPath)
    
    let filesToMove = items.filter(item => item.endsWith('.jpg') || item.endsWith('.jpeg') || item.endsWith('.tif'))//TODO check for other file extensions for images
    
    let moveFilePromiseArray = [];

    filesToMove.forEach(fileToMove => {
      let family = subfolders.find(familyName => fileToMove.toLowerCase().includes(familyName.toLowerCase()))
      let fileNameOnly = path.basename(fileToMove)
      let newFilePath = path.resolve(targetPath, family, fileNameOnly)
      moveFilePromiseArray.push(copyFile(fileToMove, newFilePath))
    })

    Promise.all(moveFilePromiseArray).then(_ => {
      console.log('all files successfully moved')
    })
    .catch(err => {
      console.log('error moving files: ' + err)
    })
  })
  .catch(err => {
    console.log('There was an error reading the directory: ' + err)
  })
}