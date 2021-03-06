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

  //跳转小理出行
  toxiaolitrip:function(){
    wx.navigateTo({
      url: '../xiaolitrip/xiaolitrip',
    })
  },

  onLoad:function (option){
    
  },

  onShareAppMessage: function () {
    return {
      title: 'IN广理-周边交通',
      path: '/pages/schooltraffic/schooltraffic', // 点击访问的页面
      imageUrl: '',     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。
    }
  },
  // 分享朋友圈，前提是必须有转发onShareAppMessage
  onShareTimeline:function(){
    return{
      imageUrl:'/images/schooltraffic.jpg',
      title: 'IN广理-周边交通',
      //query: '' //页面参数 如： ？title='123'
    }
  }
})

