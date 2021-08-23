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

  wx.request({
    url: 'https://www.inguangli.cn/ingl/api/subscribe_message',
    method:'POST',
    data: {
      openid:openid,
      forum_content:postinfo,
      username:username,
      comment_content:info,
      page:'pages/mytalk/mytalk'
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