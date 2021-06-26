App({
  data: {

    // 图片云存储下载地址
    cloud_downlode_image_url: "", //主页图片
    cloud_downlode_userpost_image_url: "" //user发布图片
  },
  onLaunch: function () {
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
    }
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId

      }
    })
    this.globalData = {
      base_url: "https://www.inguangli.cn/ingl/api/", //API请求的url前缀
      open_date: "2021-03-01",
    }
  }
})