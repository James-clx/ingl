import {htmlRequest} from "../../utils/html.js"
//const qiniuUploader = require("../../utils/qiniuUploader.js");
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
let checkinput = true
let hasUserInfo =  false//缓存是否有用户信息
let userInfo = []
let iforumcount = 0//拉取说说开始条数
let openid//用户openid
let times = ''//上传推文时间
let inputclean = ''//清空评论框数据
let userblock = ''//全局变量
let dbhasuser = ''
let morepost = true

Page({
  /**
   * 页面的初始数据
   */
  data: {
    toppostlist:[],
    showlikestatus:[],
    showlikenum:[],
    postlist:[],//推文数组
    showTalklogin :'block',//页面展示信息授权模态框
    showinputpage:'block',//上传信息按钮
    showinputinfo:'none',//上传信息页面
    filter:'0rpx',//主页面模糊
    loadModal:false,
    showallinput:false,
    Img:"",
    info:''//发布推文页面输入框数据
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
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    openid = getOpenid()
    let that = this;//将this另存为
    var login = wx.getStorageSync('hasUserInfo',login)
    if(!login){
      that.login(openid)
      return;
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
    //获取说说
    inputclean = ''
    wx.request({
      url: 'https://www.inguangli.cn/ingl/api/get/forum/list',
      method: 'POST',
      data:{
        limit:7,
        offest:iforumcount,
        openid:openid
      },
      success (res) {
        if (that.data.postlist.length-7 != iforumcount) {
          console.log(res.data)
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
          console.log(that.data.showlikenum)
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
  },

  //登录
  login:function(openid){
    if (!openid) {
      this.onLoad()
      return
    }
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
    var numadd = this.data.showlikenum[e.currentTarget.dataset.num]
    var likestatus = "showlikestatus[" + e.currentTarget.dataset.num + "]";
    var likesnum = "showlikenum[" + e.currentTarget.dataset.num + "]";
    this.setData({
      [likestatus]:'true',
      [likesnum]:numadd+1
    })
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
    var numadd = this.data.showlikenum[e.currentTarget.dataset.num]
    var likestatus = "showlikestatus[" + e.currentTarget.dataset.num + "]";
    var likesnum = "showlikenum[" + e.currentTarget.dataset.num + "]";
    this.setData({
      [likestatus]:'false',
      [likesnum]:numadd-1
    })
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
    check.checktext(event.detail.value)
    .then(res => {
      checkinput = res
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

  //确认按钮，上传数据库
  upload:function(){
    var that = this
    wx.vibrateShort({type:"heavy"})
    if (userblock == false) {
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
      if(checkinput == false){
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '文字违规',
        })
        return;
      }
      //上传图片文件到数据库(有图片)
      var name = nickname
      var userurl = avatarurl
      var info = that.data.info
      if(imgurl){
        console.log(imgurl)

        // qiniuUploader.upload(imgurl, (res) => {
        //   //上传成功，上传成功一张图片，进入一次这个方法，也就是返回一次
        //   console.log(res)
        // },
        // (error) => {
        //   //图片上传失败，可以在七牛的js里面自己加了一个err错误的返回值console.log('error: '+ error)           
        //   console.log('error: '+ error)
        // },           
        // {           
        //   domain:'qxx6xjgqs.hn-bkt.clouddn.com',           
        //   uptokenURL:'https://get.qiniutoken.com/minibx/geo_f/gain_qn_token',           
        //   uploadURL:'https://up.qbox.me',//华东key: fileHead + imgName,// 自定义文件 keyregion:'ECN',           
        // });

        wx.cloud.uploadFile({
          cloudPath: 'userpost/'+openid+'/'+times, // 上传至云端的路径
          filePath: imgurl, // 小程序临时文件路径
          success: res => {//上传云端成功后向数据库添加记录 
            // 返回文件 ID
            var posturl = res.fileID
            wx.request({
              url: 'https://www.inguangli.cn/ingl/api/add/forum',
              method: 'POST',
              data:{
                set_top:0,
                avatarurl:userurl,
                user_name:name,
                openid:openid,
                hot:0,
                imgurl:posturl,
                info:info,
                create_time:Date.parse(times.replace(/-/g, '/'))/1000
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
                });
                //重新抓取推文列表
                that.onShow()
              },
              fail(res){
                console.log(res.data)
              }
            })
          },
          fail: console.error//执行失败报错
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
            create_time:Date.parse(times.replace(/-/g, '/'))/1000
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
        }
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