import {htmlRequest} from "../../utils/html.js"
const qiniuUploader = require("../../utils/qiniuUploader.js");
var gettime=require('../../utils/times.js')
var check = require('../../utils/check.js')
var like = require('../../utils/like.js')
var userlogin = require('../../utils/login.js')
var getuserinfo = require('../../utils/inside_api.js')
import {getOpenid} from "../../utils/inside_api.js"
const app=getApp()
let imgurl=''
let avatarurl=''
let nickname=''
let hasUserInfo =  false//缓存是否有用户信息
let userInfo = []
let iforumcount = 0//拉取说说开始条数
let openid//用户openid
let times = ''//上传推文时间
let inputclean = ''//清空评论框数据
let userblock = ''//全局变量
let dbhasuser = ''
let morepost = true
let searchinfo = ''

Page({
  /**
   * 页面的初始数据
   */
  data: {
    toppostlist:[],
    showlikestatus:[],
    showlikenum:[],
    postlist:[],//推文数组
    searchlist:[],
    showTalklogin :'block',//页面展示信息授权模态框
    showinputpage:'block',//上传信息按钮
    showinputinfo:'none',//上传信息页面
    filter:'0rpx',//主页面模糊
    loadModal:false,
    showallinput:false,
    swiperHeight:0,
    showsearchtalk:'none',
    Img:"",
    info:'',//发布推文页面输入框数据

    //导航条选择器数据
    TabCur: 0,
    scrollLeft:0,
    navlist:[],
    choosepartition: 0,
    displaypartition: 0,

    isadmin:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    var that = this
    const showallinput =await htmlRequest(['showtallinput','get'])
    that.setData({
      showallinput:showallinput,
      loadModal: true,
    })
    setTimeout(function () {
      that.setData({
        loadModal: false
      })
    },1500)
    wx.request({
      url: 'https://www.inguangli.cn/ingl/api/access/forum_setup',
      method: 'POST',
      data:{
        openid:openid
      },
      success (res) {
        that.setData({
          isadmin:res.data.data
        })
      },
      fail(res){
        console.log(res.data)
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    openid = getOpenid()
    let that = this;//将this另存为
    var login = wx.getStorageSync('hasUserInfo',login)
    if(!login){
      getuserinfo.getLoginOpenid()
      .then(res => {
        that.login(res)
        return;
      })
    }
    var deletepost = wx.getStorageSync('deletepost',deletepost)
    if (deletepost) {
      if (deletepost == -1) {
        wx.showToast({
          title: '该说说已被删除',
          icon:'none'
        })
        that.setData({
          toppostlist:[]
        })
        wx.removeStorageSync('deletepost')
      }else{
        wx.showToast({
          title: '该说说已被删除',
          icon:'none'
        })
        var deletepostlist = "postlist[" + deletepost + "]";
        var deleteshowlikenum = "showlikenum[" + deletepost + "]";
        var deleteshowlikestatus = "showlikestatus[" + deletepost + "]";
        that.setData({
          [deletepostlist]:'',
          [deleteshowlikenum]:'',
          [deleteshowlikestatus]:'',
        })
        wx.removeStorageSync('deletepost')
      }
    }
   
    userInfo = wx.getStorageSync('userInfo',userInfo),
    hasUserInfo = wx.getStorageSync('hasUserInfo',hasUserInfo),
    avatarurl = wx.getStorageSync('avatarurl',avatarurl)
    nickname = wx.getStorageSync('nickname',nickname)
    
    //用户封禁状态
    if(!openid){
      getuserinfo.getLoginOpenid()
      .then(res => {
        getuserinfo.getBlock(res)
        .then(res => {
          userblock = res
          if (userblock == 'false' && dbhasuser == 'true') {
            wx.showModal({
              title: '用户已被封禁',
              content: '申诉请前往IN广理公众号,在后台回复申诉即可',
              showCancel:false
            })
          }
        })
      })
    }else{
      getuserinfo.getBlock(openid)
      .then(res => {
        userblock = res
        if (userblock == 'false' && dbhasuser == 'true') {
          wx.showModal({
            title: '用户已被封禁',
            content: '申诉请前往IN广理公众号,在后台回复申诉即可',
            showCancel:false
          })
        }
      })
    }

    wx.request({
      url: 'https://www.inguangli.cn/ingl/api/get/forum/part/list',
      method:'GET',
      success(res){
        var topnavlist = []
        topnavlist[0] = '最新'
        for(var i = 0 ; i < res.data.data.length ; i++){
          topnavlist[i+1] = res.data.data[i]
        }
        that.setData({
          navlist:topnavlist
        })
      },
      fail(res){
        console.log(res)
      }
    })
    
    //获取说说
    inputclean = ''
    if(iforumcount >= that.data.postlist.length){
      wx.request({
        url: 'https://www.inguangli.cn/ingl/api/get/forum/list',
        method: 'POST',
        data:{
          limit:7,
          offest:iforumcount,
          openid:openid,
          forum_part_id:this.data.displaypartition
        },
        success (res) {
          if (that.data.postlist.length-7 != iforumcount) {
            var pustpostlist = new Array()
            var pustlikestatus = new Array()
            var pustlikenum = new Array()
            pustpostlist = that.data.postlist
            pustlikestatus = that.data.showlikestatus
            pustlikenum = that.data.showlikenum
            for (let i = 0; i < 7; i++) {
              if (!res.data.forum_list[i]) {
                morepost = false
                continue;
              }else{
                morepost = true
                pustpostlist.push(res.data.forum_list[i])
                pustlikestatus.push(res.data.forum_list[i].have_forum_like)
                pustlikenum.push(res.data.forum_list[i].forum_like_sum)
              }
            }
            that.setData({
              postlist:pustpostlist,
              showlikestatus:pustlikestatus,
              showlikenum:pustlikenum,
              loadModal: false
            });
            if (res.data.forum_setup_data.create_time) {
              that.setData({
                toppostlist:res.data.forum_setup_data,
              })
            }
          }
        },
        fail(res){
          console.log(res.data)
        }
      })
    }
  },

  //登录
  login:function(openid){
    var openid = openid
    var that = this
    var checkdb
    getuserinfo.getUser(openid)
    .then(res => {
      checkdb = res
      if (checkdb.code != 200) {
        dbhasuser = 'false'
      }else{
        dbhasuser = 'true'
      }
      userlogin.userlogin(openid,dbhasuser)
      .then(res =>{
        userInfo = res
        hasUserInfo = 'true'
        avatarurl = res.avatarUrl
        nickname = res.nickName
        that.onShow()
      })
    })
    
  },

  searchtalk:function(){
    wx.getSystemInfo({
      success:(res) => {
        let clientHeight = res.windowHeight
        let clientWidth = res.windowWidth
        let ratio = 750 / clientWidth;//计算为百分比
        let rpxHeight = ratio * clientHeight - 400
        this.setData({
          swiperHeight: rpxHeight,
          showsearchtalk:'block',
          filter:'5rpx'
        })
      }
    })
  },

  searchinfo:function(event){
    searchinfo = event.detail.value
  },

  search:function(){
    if(searchinfo == ''){
      wx.showToast({
        title: '要搜些什么呀？',
        icon:'none'
      })
      return;
    }
    var that = this
    wx.request({
      url: 'https://www.inguangli.cn/ingl/api/cancel/forum/search/name/content',
      method:'GET',
      data:{
        forum_content:searchinfo
      },
      success(res){
        if(res.data.code != '200'){
          wx.showToast({
            icon:'error',
            title: '搜索失败',
          })
        }
        that.setData({
          searchlist:res.data.data
        })
        console.log(that.data.searchlist)
      },
      fail(res){
        console.log(res)
      }
    })
  },

  hidesearch:function(){
    var swiperHeight = this.data.swiperHeight*0.2
    this.setData({
      swiperHeight: swiperHeight,
    })
    var that = this
    setTimeout(function(){
      that.setData({
        swiperHeight: 0,
        showsearchtalk:'none',
        filter:'0rpx'
      })
    },50)
  },

  //顶部导航栏选择
  tabSelect(e) {
    var that = this
    if(e.currentTarget.dataset.id != this.data.TabCur){
      wx.vibrateShort({type:"heavy"})
      iforumcount = 0
      that.setData({
        TabCur: e.currentTarget.dataset.id,
        scrollLeft: (e.currentTarget.dataset.id-1)*60,
        displaypartition:e.currentTarget.dataset.id,
        loadModal: true,
        toppostlist:[],
        postlist:[],
        showlikenum:[],
        showlikestatus:[],
      })
      that.onShow()
      setTimeout(function () {
        that.setData({
          loadModal: false
        })
      },1500)
    }
  },

  //跳转到说说详细页面
  totalkinfo:function(e){
    var postid = e.currentTarget.dataset.id
    wx.navigateTo({
      url:'../talkinfo/talkinfo?postid='+postid+'&postcount='+e.currentTarget.dataset.num
    })
  },

  //点赞功能
  likeadd:function(e){
    wx.vibrateShort({type:"heavy"})
    if(e.currentTarget.dataset.num == -1){
      var numadd = this.data.toppostlist.forum_like_sum
      var likestatus = "toppostlist.have_forum_like";
      var likesnum = "toppostlist.forum_like_sum";
      this.setData({
        [likestatus]:'true',
        [likesnum]:numadd+1
      })
    }else{
      var numadd = this.data.showlikenum[e.currentTarget.dataset.num]
      var likestatus = "showlikestatus[" + e.currentTarget.dataset.num + "]";
      var likesnum = "showlikenum[" + e.currentTarget.dataset.num + "]";
      this.setData({
        [likestatus]:'true',
        [likesnum]:numadd+1
      })
    }
    like.utillikeadd(e.currentTarget.dataset.id,openid)
    .then(res => {
      var that = this
      //that.onShow()
      wx.showToast({
        mask:'true',
        duration:1000,
        title:res,
        image: '/images/liked.png',
      })
    })
  },

  //取消点赞功能
  likeminuus:function(e){
    wx.vibrateShort({type:"heavy"})
    if(e.currentTarget.dataset.num == -1){
      var numadd = this.data.toppostlist.forum_like_sum
      var likestatus = "toppostlist.have_forum_like";
      var likesnum = "toppostlist.forum_like_sum";
      this.setData({
        [likestatus]:'false',
        [likesnum]:numadd-1
      })
    }else{
      var numadd = this.data.showlikenum[e.currentTarget.dataset.num]
      var likestatus = "showlikestatus[" + e.currentTarget.dataset.num + "]";
      var likesnum = "showlikenum[" + e.currentTarget.dataset.num + "]";
      this.setData({
        [likestatus]:'false',
        [likesnum]:numadd-1
      })
    }
    like.utillikeminuus(e.currentTarget.dataset.id,openid)
    .then(res => {
      var that = this
      //that.onShow()
      wx.showToast({
        mask:'true',
        duration:1000,
        title:res,
        image: '/images/like.png',
      })
    })
  },

  openinputpage:function(){//打开上传信息页面    
    times = gettime.formatTimes(new Date()),
    this.setData({
      filter:'5rpx',
      showinputpage:'none',//隐藏打开页面按钮
      showinputinfo:'block',//打开上传信息页面
    })
  },

  //长按删除图片
  deleteImage: function(){
    var that = this;
    wx.showModal({
      title: '确认删除',
      content: '',
      success: function (res) {
        if (res.confirm) {
          that.data.Img.splice;
        }
        else if (res.cancel) {
          return false;    
        }
        that.setData({
          Img:""
        });
      }
    })
  },

  //选择图片
  previewImage: function(){
    var that = this;
    wx.previewImage({
      current: that.data.Img1,
      urls:that.data.Img,
    })
  },

  //发布推文页面输入框数据
  handleinfo:function(event){
    this.setData({
      info:event.detail.value
    })
  },
  
  //上传图片
  chooseImage:function(){
    var that=this;
    wx.chooseImage({
      count: 1,
      success:function(res) {
        imgurl = res.tempFilePaths[0]
        that.setData({
          Img:res.tempFilePaths,
          Img1:res.tempFilePaths[0],
          imageInfo:""
        })
      }
    })
  },

  //选择分区
  choosepartition:function(e){
    var choosenum = e.currentTarget.dataset.id
    if(choosenum == this.data.choosepartition){
      this.setData({
        choosepartition:0
      })
    }else{
      this.setData({
        choosepartition:choosenum
      })
    }
  },

  //确认按钮，上传数据库
  upload:function(){
    var that = this
    wx.vibrateShort({type:"heavy"})
    if (userblock == 'false') {
      wx.showToast({
        title:"用户已被封禁",
        icon:'none'
      })
      return;
    }else{     
      if(!hasUserInfo){
        openid = getuseropenid.getOpenid()
        that.login(openid)
        userInfo = wx.getStorageSync('userInfo',userInfo),
        hasUserInfo = wx.getStorageSync('hasUserInfo',hasUserInfo),
        avatarurl = wx.getStorageSync('avatarurl',avatarurl)
        nickname = wx.getStorageSync('nickname',nickname)
        return;
      }
      if(that.data.info == ''&&imgurl == ''){
        wx.showToast({
          title:"不能什么都不写哦!",
          icon:'none'
        })
        return;
      }
      wx.showLoading({
        title: '上传中',
      })
      //上传图片文件到数据库(有图片)
      var name = nickname
      var userurl = avatarurl
      var info = that.data.info
      check.checktext(info,openid)
      .then(res => {
        if(res == false){
          wx.hideLoading()
          wx.showToast({
            icon: 'none',
            title: '文字违规',
          })
          return;
        }
        if(imgurl){
          console.log(imgurl)
          //获取七牛token
          wx.request({
            url: 'https://www.inguangli.cn/ingl/api/get/qiniu/token',
            method:'GET',
            data:{
              file_name:openid + '/' + times
            },
            success(res){
              //添加数据库
              qiniuUploader.upload(imgurl, res => {
                console.log(res)
                wx.request({
                  url: 'https://www.inguangli.cn/ingl/api/add/forum',
                  method: 'POST',
                  data:{
                    set_top:0,
                    avatarurl:userurl,
                    user_name:name,
                    openid:openid,
                    hot:0,
                    imgurl:res.imageURL,
                    info:info,
                    create_time:Date.parse(times.replace(/-/g, '/'))/1000,
                    forum_part_id:that.data.choosepartition
                  },
                  success (res) {
                    wx.hideLoading()
                    wx.showToast({
                      title:res.data.message,
                    })
                    //清空上传信息数据
                    imgurl=''
                    iforumcount = 0
                    that.setData({
                      //发布后关闭发布页面
                      info:'',
                      Img:"",
                      postlist:[],
                      showlikenum:[],
                      showlikestatus:[],
                      filter:'0rpx',
                      showinputinfo:'none',//打开上传信息页面
                      showinputpage:'block',//隐藏打开页面按钮
                      choosepartition:0
                    });
                    //重新抓取推文列表
                    that.onShow()
                  },
                  fail(res){
                    console.log(res.data)
                  }
                })
              }, (error) => {
                console.log('error' + error)
              }, {
                //这里是你所在大区的地址
                uploadURL: 'https://up-z2.qbox.me/',
                //文件名，与请求后端token的名字一样
                key: openid + '/' + times,
                //服务器上传地址
                domain: 'http://qiniu.inguangli.cn/',
                //这里的uptoken是后端返回来的
                uptoken: res.data,
              })
            },
            fail(res){
              console.log(res)
            }
          })
        }else{
          wx.request({
            url: 'https://www.inguangli.cn/ingl/api/add/forum',
            method: 'POST',
            data:{
              set_top:0,
              avatarurl:userurl,
              user_name:name,
              openid:openid,
              hot:0,
              imgurl:'',
              info:info,
              create_time:Date.parse(times.replace(/-/g, '/'))/1000,
              forum_part_id:that.data.choosepartition
            },
            success (res) {
              console.log(res.data)
              wx.hideLoading()
              wx.showToast({
                title:res.data.message,
              })
              //清空上传信息数据
              imgurl=''
              iforumcount = 0
              that.setData({
                //发布后关闭发布页面
                info:'',
                Img:"",
                postlist:[],
                showlikenum:[],
                showlikestatus:[],
                filter:'0rpx',
                showinputinfo:'none',//打开上传信息页面
                showinputpage:'block',//隐藏打开页面按钮
                choosepartition:0
              });
              //重新抓取推文列表
              that.onShow()
            },
            fail(res){
              console.log(res.data)
            }
          })
        }
        wx.pageScrollTo({
          scrollTop: 0
        })
        wx.requestSubscribeMessage({
          tmplIds: ['COikDS9yExM-SsBRbzlxl3fYKu4lHq1PStB66swghOA'],
          success (res) { 
            console.log(res)
          },
          fail(res){
            console.log(res)
          }
        })
      })
    }
  },

  //关闭页面
  close:function(){
    imgurl='',
    this.setData({
      info:'',
      Img:"",
      filter:'0rpx',
      showinputinfo:'none',//打开上传信息页面
      showinputpage:'block',//隐藏打开页面按钮
      choosepartition:0
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh:function(){
    var that = this
    wx.vibrateShort({type:"heavy"})
    wx.showNavigationBarLoading() //在标题栏中显示加载
    iforumcount = 0
    that.setData({
      loadModal: true,
      toppostlist:[],
      postlist:[],
      showlikenum:[],
      showlikestatus:[],
    })
    that.onShow()
    setTimeout(function () {
      that.setData({
        loadModal: false
      })
    },1500)
  //模拟加载
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    if (!morepost) {
      wx.showToast({
        title: '到底了!',
        icon:'none'
      })
    }else{
      that.setData({
        loadModal: true
      })
      setTimeout(function () {
        that.setData({
          loadModal: false
        })
      },1500)
      iforumcount = iforumcount+7
      that.onShow()
    }
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '理工说说',
      path: '/pages/talk/talk', // 点击访问的页面
      imageUrl: '',     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。
    }
  }
})