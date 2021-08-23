
// 违规字符检查

function checktext(input,openid){
  var info = input
  var useropenid = openid
  console.log(useropenid)
  console.log(info)
  return new Promise((resolve, reject) => {
    var check = null
    console.log(info)
    wx.request({
      url: 'https://www.inguangli.cn/ingl/api/get/msg_sec_check',
      method:'POST',
      data:{
        openid:useropenid,
        content:info
      },
      success(res){
        console.log(res)
        if (res.data.suggest == 'risky') {
          check = false
        }else{
          check = true
        }
        resolve(check);
      },
      fail(res){
        console.log(res)
        reject("调用失败"); 
      }
    })
  })
}

export{
  checktext
}