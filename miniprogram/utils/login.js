function userlogin(dbhasuser){
  return new Promise((resolve, reject) => {
    console.log(dbhasuser)
    wx.showModal({//模态框确认获取用户数据
      showCancel:false,
      title: '提示',
      content: 'IOS端手机可能会出现样式错乱 \n如遇到此情况请更新手机系统',
      success (res) {//确认授权后修改后端数据
        if (res.confirm) {
          wx.getUserProfile({
            desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {//获取用户数据
              if(dbhasuser == 'false'){
                db.collection("iuser").add({//添加到数据库
                  data:{
                    avatarurl:res.userInfo.avatarUrl,
                    nickname:res.userInfo.nickName,
                    country:res.userInfo.country,
                    city:res.userInfo.city,
                    gender:res.userInfo.gender
                  }
                })
                console.log('add')
              }
              resolve(res.userInfo);
              wx.setStorageSync('userInfo', res.userInfo)
              wx.setStorageSync('hasUserInfo', 'true')
              wx.setStorageSync('avatarurl', res.userInfo.avatarUrl)
              wx.setStorageSync('nickname', res.userInfo.nickName)
            },
            fail: (res) =>{//拒绝后返回功能页面
              reject("调用失败"); 
              console.log('false:'+res)
              wx.switchTab({
                url: '/pages/index/index'
              })
            }
          })
        }
      }
    })
  })
}

export{
  userlogin
}