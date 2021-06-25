const app = getApp()
import{cloudDownLoad}from"../../utils/cloud.js"

Page({
  data: {
    images:[],
    botTitle :[],
    botText : [],
    animation : "text",
    mdimgHeight: 0,//初始时swiper的高度是0
    lgimgHeight: 0,
    xsimgHeight: 0,
    swiperHeight:0,
    current:0
  },

    // 事件处理函数
  toIndex() {
    this.setData({
      current:1
    })
  },
  
  toChange(){
    this.setData({
      animation : "",
      opacity:0
    })
  },

  toChangeEnd(){
    this.setData({
      animation : "text",
      opacity:100
    })
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
        console.log(rpxHeight)
      }
    })
  },

  async onLoad (option){
    // 获取云存储下的图片，返回数组
    var pula01 = 'cloud://user-1go7hmfiae35dce5.7573-user-1go7hmfiae35dce5-1306031834/admin/pula01.jpg'
    var pula02 = 'cloud://user-1go7hmfiae35dce5.7573-user-1go7hmfiae35dce5-1306031834/admin/pula02.jpg'
    var pula03 = 'cloud://user-1go7hmfiae35dce5.7573-user-1go7hmfiae35dce5-1306031834/admin/pula03.jpg'
    const images = await cloudDownLoad('',[pula01,pula02,pula03])
    console.log(images)
    this.catchScreenHeight()
    this.setData({
      images:images,
      botTitle : ["什么是IN广理","我们源于热爱","精彩等待探索"],
      botText : ["我同你讲","你们也是","惊喜连连"],
      animation : "text",
      opacity:100,
    })
  },

  toschoolinfo:function(){
    wx.navigateTo({
      url: '../schoolinfo/schoolinfo',
    })
  },

  toschoolnote:function(){
    wx.navigateTo({
      url: '../schoolnote/schoolnote',
    })
  },

  toschooltraffic:function(){
    wx.navigateTo({
      url: '../schooltraffic/schooltraffic',
    })
  },

  toschoollife:function(){
    wx.navigateTo({
      url: '../schoollife/schoollife',
    })
  },

  more:function(){
    wx.showToast({
      title:"敬请期待",
      image: '/images/fail.png',
    })
  },

    /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // wx.pageScrollTo({
    //   scrollTop: this.data.swiperHeight,
    //   duration: 300
    // })
  }
})

