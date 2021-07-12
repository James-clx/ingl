const app = getApp()
import{cloudDownLoad}from"../../utils/cloud.js"

Page({
  data: {
    img:['cloud://user-1go7hmfiae35dce5.7573-user-1go7hmfiae35dce5-1306031834/admin/map.jpg',
        'cloud://user-1go7hmfiae35dce5.7573-user-1go7hmfiae35dce5-1306031834/admin/jrxydl.png']
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
    var map = 'cloud://user-1go7hmfiae35dce5.7573-user-1go7hmfiae35dce5-1306031834/admin/map.jpg'
    var jrxydl = 'cloud://user-1go7hmfiae35dce5.7573-user-1go7hmfiae35dce5-1306031834/admin/jrxydl.png'
    const images = await cloudDownLoad('',[jrxydl,map])
    this.setData({
      img:images
    })
    console.log(this.data.img)
    console.log(e.currentTarget.dataset.id)
    wx.previewImage({
      current: this.data.img[e.currentTarget.dataset.id], // 当前显示图片的http链接
      urls: this.data.img // 需要预览的图片http链接列表
    })
  },

  onLoad:function (option){
    
  }
})

