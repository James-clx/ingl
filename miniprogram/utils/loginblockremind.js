function sendremind(openid,loginpages,studentnumber){
  studentnumber = studentnumber
  if(studentnumber.length>20){
    studentnumber=longtextcharge(studentnumber)
  }

  wx.request({
    url: 'https://www.inguangli.cn/ingl/api/miss/message',
    method:'POST',
    data: {
      openid:openid,
      login_type:loginpages,
      username:studentnumber
    },
    success(res){
      console.log(res)
    },
    fail(res){
      console.log(res)
    }
  })
}

function longtextcharge(text){
  var chargedtext
  text = text.slice(0,15)
  chargedtext = text + '...'
  return chargedtext
}

export{
  sendremind,
  longtextcharge
}