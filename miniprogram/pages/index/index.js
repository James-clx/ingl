const app = getApp()
import{cloudDownLoad}from"../../utils/cloud.js"
const qiniuUploader = require("../../utils/qiniuUploader.js");
Page({
  data: {
    images:[],
    botTitle :[],
    botText : [],
    bannertitle:[],
    bannerimg:[],
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
    var bannerimg=[]
    var bannertitle=[]
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

    wx.request({
      url: 'https://www.inguangli.cn/ingl/api/get/all/banner',
      method:'GET',
      success (res) {
        var i = 0
        //按sortnum排序
        while(!!res.data[i]){
          bannerimg[res.data[i].sortnum]=(res.data[i])
          i++;
        }
        //给每个字段赋值
        for(var k = 0 ; k < bannerimg.length-1 ;k++){
          bannertitle[k]=bannerimg[k+1].title
          //循环存入data，防止setdata数据过长
          var index = "bannerimg[" + k + "]"
          that.setData({
            [index]:{src:bannerimg[k+1].image}
          })
        }
        that.setData({
          bannertitle:bannertitle,
        })
      },
      fail(res){
        console.log(res)
      }
    })
    // var map = 'https://qiniu.inguangli.cn/map.jpg'
    // const cloudimages = await cloudDownLoad([map])
    // console.log(cloudimages)
    // this.setData({
    //   cloudimg:cloudimages
    // })
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
      current: '', // 当前显示图片的http链接
      urls: [e.currentTarget.dataset.id], // 需要预览的图片http链接列表
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
      icon:'none'
    })
  
    //转移数据库
    // var movelikelist
    // var movepostlist
    // var movecommentlist

    //点赞表
    // wx.cloud.callFunction({
    //   name: 'getlike',//云函数名
    //   complete(res){
    //     movelikelist = res.result.data
    //     console.log(movelikelist)
    //     wx.cloud.callFunction({
    //       name: 'getallpost',//云函数名
    //       data:{
    //         lim:1000,
    //         pass:1000
    //       },
    //       complete(res){
    //         movepostlist = res.result.data
    //         console.log(movepostlist)
    //         var openid = new Array()
    //         var id = new Array()
    //         for (var i =0; i <movepostlist.length ; i++) {
    //           for(var k=0;k<movelikelist.length;k++){
    //             if(movepostlist[i]._id == movelikelist[k].likeid){
    //               openid.push(movelikelist[k]._openid)
    //               id.push((i+1))
    //               console.log(i)
    //             }        
    //           }
    //         }
    //         for (var i =0; i <openid.length ; i++) {
    //           (function (i) {
    //             setTimeout(function () {           
    //               console.log("openid:"+openid[i])
    //               console.log("id:"+id[i])
    //               wx.request({
    //                 url: 'https://www.inguangli.cn/ingl/api/add/forum/like',
    //                 method: 'POST',
    //                 data:{
    //                   openid: openid[i],
    //                   forum_id: id[i]
    //                 },
    //                 success (res) {
    //                   console.log(res.data)
    //                 },
    //                 fail(res){
    //                   console.log(res.data)
    //                 }
    //               })
    //             }, 1000 * i);
    //           })(i);  
    //         }
    //       }
    //     })
    //   }
    // })

    //说说表
    // wx.cloud.callFunction({
    //   name: 'getallpost',//云函数名
    //   data:{
    //     lim:1000,
    //     pass:1000
    //   },
    //   complete(res){
    //     movepostlist = res.result.data
    //     console.log(movepostlist)

    //     for (var i =0; i <movepostlist.length ; i++) {
    //       (function (i) {
    //         setTimeout(async function () {
    //           if(movepostlist[i].imgurl){
    //             const userpostimg = await cloudDownLoad('',[movepostlist[i].imgurl])//调用缓存app.js
    //             //获取七牛token
    //             wx.request({
    //               url: 'https://www.inguangli.cn/ingl/api/get/qiniu/token',
    //               method:'GET',
    //               data:{
    //                 file_name:movepostlist[i]._openid + '/' + movepostlist[i].pushtime,
    //               },
    //               async success(res){
    //                 //添加数据库                    
    //                 qiniuUploader.upload(userpostimg[0], res => {
    //                   console.log(movepostlist[i]._id+"---"+i)
    //                   wx.request({
    //                     url: 'https://www.inguangli.cn/ingl/api/add/forum',
    //                     method: 'POST',
    //                     data:{
    //                       set_top: 0,
    //                       avatarurl: movepostlist[i].avatarurl,
    //                       user_name: movepostlist[i].nickname,
    //                       openid: movepostlist[i]._openid,
    //                       hot: movepostlist[i].hot,
    //                       comment_count: movepostlist[i].commentcount,
    //                       imgurl: res.imageURL,
    //                       info: movepostlist[i].info,
    //                       create_time:Date.parse(movepostlist[i].pushtime)/1000
    //                     },
    //                     success (res) {
    //                       console.log(res.data)
    //                     },
    //                     fail(res){
    //                       console.log(res.data)
    //                     }
    //                   })
    //                 }, (error) => {
    //                   console.log('error' + error)
    //                 }, {
    //                   //这里是你所在大区的地址
    //                   uploadURL: 'https://up-z2.qbox.me/',
    //                   //文件名，与请求后端token的名字一样
    //                   key: movepostlist[i]._openid + '/' + movepostlist[i].pushtime,
    //                   //服务器上传地址
    //                   domain: 'http://qiniu.inguangli.cn/',
    //                   //这里的uptoken是后端返回来的
    //                   uptoken: res.data,
    //                 })
    //               },
    //               fail(res){
    //                 console.log(res)
    //               }
    //             })
    //           }else{
    //             var changetime = Date.parse(movepostlist[i].pushtime)
    //             movepostlist[i].pushtime = changetime / 1000
    //             console.log(movepostlist[i]._id+"---"+i)
    //             wx.request({
    //               url: 'https://www.inguangli.cn/ingl/api/add/forum',
    //               method: 'POST',
    //               data:{
    //                 set_top: 0,
    //                 avatarurl: movepostlist[i].avatarurl,
    //                 user_name: movepostlist[i].nickname,
    //                 openid: movepostlist[i]._openid,
    //                 hot: movepostlist[i].hot,
    //                 comment_count: movepostlist[i].commentcount,
    //                 imgurl: '',
    //                 info: movepostlist[i].info,
    //                 create_time:movepostlist[i].pushtime
    //               },
    //               success (res) {
    //                 console.log(res.data)
    //               },
    //               fail(res){
    //                 console.log(res.data)
    //               }
    //             })
    //           }              
    //         }, 1000 * i);
    //       })(i);
    //     }
    //   }
    // })

    //评论表
    // wx.cloud.callFunction({
    //   name: 'getallcomment',//云函数名
    //   complete(res){
    //     movecommentlist = res.result.data
    //     console.log(movecommentlist)
    //     wx.cloud.callFunction({
    //       name: 'getallpost',//云函数名
    //       data:{
    //         lim:1000,
    //         pass:1000
    //       },
    //       complete(res){
    //         movepostlist = res.result.data
    //         console.log(movepostlist)
    //         var id = new Array()
    //         var openid = new Array()
    //         var postuser = new Array()
    //         var commit = new Array()
    //         for (var i =0; i <movepostlist.length ; i++) {
    //           for(var k=0;k<movecommentlist.length;k++){
    //             if(movepostlist[i]._id == movecommentlist[k].postid){
    //               id.push((i+1))
    //               openid.push(movecommentlist[k]._openid)
    //               postuser.push(movecommentlist[k].postuser)
    //               commit.push(movecommentlist[k].commit)
    //               console.log(i)
    //             }        
    //           }
    //         }
    //         for (var i =0; i <openid.length ; i++) {
    //           (function (i) {
    //             setTimeout(function () {
    //               console.log("id:"+id[i])
    //               wx.request({
    //                 url: 'https://www.inguangli.cn/ingl/api/add/forum/comment',
    //                 method: 'POST',
    //                 data:{
    //                   openid: openid[i],
    //                   forum_id: id[i],
    //                   com_username:postuser[i],
    //                   content:commit[i]
    //                 },
    //                 success (res) {
    //                   console.log(res.data)
    //                 },
    //                 fail(res){
    //                   console.log(res.data)
    //                 }
    //               })
    //             }, 1000 * i);
    //           })(i);  
    //         }
    //       }
    //     })
    //   }
    // })

    //用户表
    // wx.cloud.callFunction({
    //   name: 'getuser',//云函数名
    //   complete(res){
    //     console.log(res.result.data)
    //     for (var i =0; i <res.result.data.length ; i++) {
    //       (function (i) {
    //         setTimeout(function () {
    //           wx.request({
    //             url: 'https://www.inguangli.cn/ingl/api/user/add',
    //             method: 'POST',
    //             data:{
    //               avatarurl: res.result.data[i].avatarurl,
    //               country: res.result.data[i].country,
    //               city: res.result.data[i].city,
    //               nickname: res.result.data[i].nickname,
    //               gender: res.result.data[i].gender,
    //               openid: res.result.data[i]._openid,
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
    //     }
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

