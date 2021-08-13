//点赞功能
function utillikeadd(id,openid){
  //获取用户点赞列表
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://www.inguangli.cn/ingl/api/add/forum/like',
      method: 'POST',
      data:{
        openid:openid,
        forum_id:id
      },
      success (res) {
        console.log(res.data)
        resolve(res.data.message)
      },
      fail(res){
        console.log(res.data)
        reject(res.data)
      }
    })
  })
}

//取消点赞功能
function utillikeminuus(id,openid){
  //获取用户点赞列表
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://www.inguangli.cn/ingl/api/forum/unlike',
      method: 'POST',
      data:{
        openid:openid,
        forum_id:id
      },
      success (res) {
        console.log(res.data)
        resolve(res.data.message)
      },
      fail(res){
        console.log(res.data)
        reject(res.data)
      }
    })
  })
}

export{
  utillikeadd,
  utillikeminuus
}