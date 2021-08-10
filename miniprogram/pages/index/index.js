const db=wx.cloud.database()
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
    current:0,
    cloudimg:[]
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
      }
    })
  },

  async onLoad (option){
    var that = this
    var img = []
    var botTitle=[]
    var botText=[]
    that.catchScreenHeight()
    wx.request({
      url: 'https://www.inguangli.cn/ingl/api/tweetswiper',
      success (res) {
        var i = 0
        //按sortnum排序
        while(!!res.data[i]){
          img[res.data[i].sortnum]=(res.data[i])
          i++;
        }
        //给每个字段赋值
        for(var k = 0 ; k < img.length-1 ;k++){
          botTitle[k]=img[k+1].title
          botText[k]=img[k+1].compendium
          //循环存入data，防止setdata数据过长
          var index = "images[" + k + "]"
          that.setData({
            [index]:{src:img[k+1].image}
          })
        }
        that.setData({
          botTitle:botTitle,
          botText:botText,
          animation:"text",
          opacity:100,
        })
      }
    })
    var map = 'cloud://user-1go7hmfiae35dce5.7573-user-1go7hmfiae35dce5-1306031834/admin/map.jpg'
    const cloudimages = await cloudDownLoad('',[map])
    this.setData({
      cloudimg:cloudimages
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

  async tapimg(e){
    wx.vibrateShort({type:"heavy"})
    //e.currentTarget.dataset.id
    
    wx.previewImage({
      current: this.data.cloudimg[e.currentTarget.dataset.id], // 当前显示图片的http链接
      urls: this.data.cloudimg, // 需要预览的图片http链接列表
    })
  },

  //跳转小理出行
  toxiaolitrip:function(){
    wx.navigateTo({
      url: '../xiaolitrip/xiaolitrip',
    })
  },

  //饿了么
  eClick: function(e) {
    wx.navigateToMiniProgram({
      appId: 'wxece3a9a4c82f58c9',
      path: 'taoke/pages/shopping-guide/index?scene=YwrAVku',
      success(res) {
      }
    })
  },

  //美团外卖
  mClick: function(e) {
    wx.navigateToMiniProgram({
      appId: 'wx2c348cf579062e56',
      path: 'outer_packages/r2xinvite/coupon/coupon?inviteCode=NnOIp-QOs8SiYF1dcSlL5r8phPrCf6qkH7evMyjIoureqol0OXXaopfjjblE0yPgNw22r_NFexLpR3Cn-sECbi0ZXVsL3DN_CNStnH5Vxh41_KCmzND6LdIM05GaAmDZ_RO_U0QVty_ySCWtajlGei8NAOoWtwninoYsthKaUlE',
      success(res) {
      }
    })
   },

  more:function(){
    wx.showToast({
      title:"敬请期待",
      image: '/images/fail.png',
    })
    
    //转移数据库
    // wx.cloud.callFunction({
    //   name: 'getuser',//云函数名
    //   complete(res){
    //     console.log(res.result.data)
    //     for (var i = 0; i < res.result.data.length; i++) {
    //       (function (i) {
    //         setTimeout(function () {
    //           wx.request({
    //             url: 'https://www.inguangli.cn/ingl/api/user/add',
    //             method: 'POST',
    //             data:{
    //               "openid":res.result.data[i]._openid,
    //               "avatarurl":res.result.data[i].avatarurl,
    //               "nickname":res.result.data[i].nickname,
    //               "country":res.result.data[i].country,
    //               "city":res.result.data[i].city,
    //               "gender":res.result.data[i].gender
    //             },
    //             success (res) {
    //               console.log(res.data)
    //             },
    //             fail(res){
    //               console.log(res.data)
    //             }
    //           })
    //         }, 1000 * i);
    //       })(i);
    //       }
    //   }
    // })
    
  },

    /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // wx.pageScrollTo({
    //   scrollTop: this.data.swiperHeight,
    //   duration: 300
    // })
  },

  onShareAppMessage: function () {
    return {
      title: 'IN广理',
      path: '/pages/index/index', // 点击访问的页面
      imageUrl: '',     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。
    }
  },
  // 分享朋友圈，前提是必须有转发onShareAppMessage
  onShareTimeline:function(){
    return{
      imageUrl:'/images/logo.jpg',
      title: 'IN广理',
      //query: '' //页面参数 如： ？title='123'
    }
  }
})

