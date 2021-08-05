const app = getApp()
import{cloudDownLoad}from"../../utils/cloud.js"

Page({
  data: {
    img:['cloud://user-1go7hmfiae35dce5.7573-user-1go7hmfiae35dce5-1306031834/admin/liantong.png']
  },

// 获取屏幕高度
  catchScreenHeight(){
    wx.getSystemInfo({
      success:(res) => {
        let clientHeight = res.windowHeight
        let clientWidth = res.windowWidth
        let ratio = 750 / clientWidth;//计算为百分比
        let rpxHeight = ratio * clientHeight
        this.setData({
          swiperHeight: rpxHeight
        })
      }
    })
  },
  
  //点击图片放大
  async tapimg(e){
    wx.vibrateShort({type:"heavy"})
    //e.currentTarget.dataset.id
    const images = await cloudDownLoad(app.data.cloud_downlode_image_url,['liantong.png'])
    this.setData({
      img:images
    })
    wx.previewImage({
      current: e.currentTarget.dataset.id, // 当前显示图片的http链接
      urls: this.data.img // 需要预览的图片http链接列表
    })
  },

  totalk:function(){
    wx.switchTab({
      url: '../talk/talk',
    })
  },

  //下载跳转
  download:function(){
    wx.navigateTo({
      url: '../download/download',
    })
  },

  gowechatminipeogram:function(){
    wx.navigateToMiniProgram({
    appId: 'wx1129fc27588b7898',
    path: '',
    envVersion: 'release',// 打开正式版
      success(res) {
          // 打开成功
      },
      fail: function (err) {
      }
    })
  },

  makePhoneCall: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.id // 仅为示例，并非真实的电话号码
    })
  },

  onLoad:function (option){
    
  },

  onShareAppMessage: function () {
    return {
      title: 'IN广理',
      path: '/pages/schoollife/schoollife', // 点击访问的页面
      imageUrl: '',     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。
    }
  }
})

