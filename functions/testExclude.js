var targetFiles = ["NU1234.jpg", "NU1235.jpg", "NU1236.jpg"]
var exclude = ["NU1234"]
var fileExt = ".jpg"

//remove if required
if(exclude && Array.isArray(exclude)){
  targetFiles = targetFiles.filter(file => {
    return !exclude.some(ex => file == `${ex}${fileExt}` )
  })
}

var i = 0