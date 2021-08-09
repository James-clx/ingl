var gettime=require('./times.js')

function sendremind(openid,postinfo,username,info){
  postinfo = postinfo
  username = username
  info = info
  if(postinfo.length>20){
    postinfo=longtextcharge(postinfo)
  }
  if(username.length>20){
    username=longtextcharge(username)
  }
  if(info.length>20){
    info=longtextcharge(info)
  }
  wx.cloud.callFunction({
    // 要调用的云函数名称
    name: 'userremind',
    // 传递给云函数的参数
    data: {
      openid:openid,
      time:gettime.formatTimes(new Date()),
      postinfo:postinfo,
      username:username,
      info:info
    },
    success: res => {
      console.log(res)
      // output: res.result === 3
    },
    fail: err => {
      console.log(err)
      // handle error
    },
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