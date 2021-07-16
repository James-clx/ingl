
// 违规字符检查

function checktext(input){
  var info = input

  return new Promise((resolve, reject) => {
    var check = null
    wx.cloud.callFunction({
      name: 'checktxt',
      data: {
        txt: info
      },
      success(res) {
        console.log(info)
        if (res.result.errCode == 87014) {
          check = false
        }else{
          check = true
        }
        resolve(check);
      },
      fail(err){
        reject("调用失败"); 
      }
    })
  })
}

export{
  checktext
}