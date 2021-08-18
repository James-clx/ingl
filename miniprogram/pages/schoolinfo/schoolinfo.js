const app = getApp()
import{cloudDownLoad}from"../../utils/cloud.js"

Page({
  data: {
    img:[]
  },

  async onLoad(option){
    // var wmxycz = 'http://qiniu.inguangli.cn/wmxycz.png'
    // var liantong = 'http://qiniu.inguangli.cn/liantong.png'
    // const images = await cloudDownLoad([wmxycz,liantong])
    // this.setData({
    //   img:images
    // })
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
  tapimg(e){
    wx.vibrateShort({type:"heavy"})
    //e.currentTarget.dataset.id
    wx.previewImage({
      current: '', // 当前显示图片的http链接
      urls: [e.currentTarget.dataset.id], // 需要预览的图片http链接列表
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
  
  onShareAppMessage: function () {
    return {
      title: 'IN广理-校园事务',
      path: '/pages/schoolinfo/schoolinfo', // 点击访问的页面
      imageUrl: '',     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。
    }
  },
  // 分享朋友圈，前提是必须有转发onShareAppMessage
  onShareTimeline:function(){
    return{
      imageUrl:'/images/schoolnote.jpg',
      title: 'IN广理-校园事务',
      //query: '' //页面参数 如： ？title='123'
    }
  }
})

