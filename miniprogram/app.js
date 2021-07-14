App({
  data: {

    // 图片云存储下载地址
    cloud_downlode_image_url: "", //主页图片
    cloud_downlode_userpost_image_url: "" //user发布图片
  },

  onLaunch: function () {
    this.globalData = {
      base_url: "https://www.inguangli.cn/ingl/api/", //API请求的url前缀
      open_date: "2021-03-01",
      schedule_go_class_time: [{
        time: "1",
        start: "8:20",
        finish: "9:05"
      },
      {
        time: "2",
        start: "9:15",
        finish: "10:00"
      },
      {
        time: "3",
        start: "10:20",
        finish: "11:05"
      },
      {
        time: "4",
        start: "11:15",
        finish: "12:00"
      },
      {
        time: "5",
        start: "14:00",
        finish: "14:45"
      },
      {
        time: "6",
        start: "14:55",
        finish: "15:40"
      },
      {
        time: "7",
        start: "16:00",
        finish: "16:45"
      },
      {
        time: "8",
        start: "16:55",
        finish: "17:40"
      },
      {
        time: "9",
        start: "19:00",
        finish: "19:45"
      },
      {
        time: "10",
        start: "19:55",
        finish: "20:40"
      }
    ]
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
        evn:'user-1go7hmfiae35dce5',
        traceUser: true,
      })
    }
  },
})

