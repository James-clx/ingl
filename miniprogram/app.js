App({
  data: {

    // 图片云存储下载地址
    cloud_downlode_image_url: "", //主页图片
    cloud_downlode_userpost_image_url: "" //user发布图片
  },
  // onHide(){
  //   // 判断有无浏览器缓存，如果有则后台关闭浏览器，并清空浏览器缓存
  //   const browser_cache = wx.getStorageSync('browser_cache') == {}?false:wx.getStorageSync
  //   ('browser_cache')
  //   let openid = wx.getStorageSync('openid')
  //   // 获取用户的openid,判断缓存有没有openid，没有则保存到缓存中
  //   if(!openid){
  //     wx.login({
  //       async success(res){
  //         // 发送 res.code 到后台换取 openId,并存入缓存
  //         wx.request({
  //           url:"https://www.inguangli.cn/ingl/api/get_openid",
  //           method:'POST',
  //           data:{'code':res.code}
  //         })
  //         wx.setStorageSync('openid', openid)
  //       }
  //     })
  //     openid = wx.getStorageSync('openid')
  //   }

  //   if(browser_cache){
  //     const url = "https://www.inguangli.cn/ingl/api/quit_browser"
  //     wx.request({
  //       url:url,
  //       method:'POST',
  //       data:{'executor_url':browser_cache['executor_url'],'session_id':browser_cache['session_id']
  //     ,'openid':openid}
  //     })
  //     wx.removeStorageSync('browser_cache')
  //   }
  // },

  onLaunch: function () {
    this.globalData = {
      base_url: "https://www.inguangli.cn/ingl/api/", //API请求的url前缀
      open_date: "2021-03-01",
    }
    wx.cloud.init({
      evn: "user-1go7hmfiae35dce5"
    })
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
      // 小程序初始化的时候就在后台把浏览器打开
      // let edlogin_cache = wx.getStorageSync('edlogin_cache') // 判断有无登录信息的缓存
      // if(!edlogin_cache){ //无缓存
      //   const url = "https://www.inguangli.cn/ingl/api/can_in_browser"
      //     wx.request({
      //       url:url,
      //       method:'GET',
      //       success(res){
      //         wx.setStorageSync('temp', res.data['error'])
      //       }
      //     }) // 判断能否进入教务系统
      //   if(!wx.getStorageSync('temp')){
      //     this._open_browser_and_get_code_image()
      //     wx.removeStorageSync('temp')
      //   }
      // }
    }
  },
  // 截图浏览器并获取它的验证码图片
  // async _open_browser_and_get_code_image(){
  //   // 判断浏览器信息是否有缓存，如果没有则进行逻辑
  //   const temp = wx.getStorageSync('browser_cache')
  //   const have_browser_cache = temp==""?false : temp
  //   if(!have_browser_cache){
  //     // 获取用户的openid,判断缓存有没有openid，没有则保存到缓存中
  //     let openid = wx.getStorageSync('openid')
  //     if(!openid){
  //       wx.login({
  //         async success(res){
  //           // 发送 res.code 到后台换取 openId,并存入缓存
  //           const url = "https://www.inguangli.cn/ingl/api/get_openid"
  //           wx.request({
  //             url:url,
  //             method:'POST',
  //             data:{'code':res.code},
  //             success(res){
  //               wx.setStorageSync('openid', res.data)
  //             }
  //           })
  //         }
  //       })
  //       openid = wx.getStorageSync('openid')
  //     }
  //     // 打开浏览器并截图
  //     const url = "https://www.inguangli.cn/ingl/api/open_browser"
  //     wx.request({
  //       url:url,
  //       method:'POST',
  //       data:{'openid':openid},
  //       success(res){
  //         let browser_data = res.data
  //         wx.setStorageSync('browser_cache',{'executor_url':browser_data['executor_url'],'session_id':browser_data['session_id']}) // 打开浏览器并把浏览器的数据存进缓存
  //       }
  //     })
      
    // }
  // }
})

