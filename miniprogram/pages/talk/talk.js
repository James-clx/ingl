import {htmlRequest} from "../../utils/html.js"
var gettime=require('../../utils/times.js')
var check = require('../../utils/check.js')
var like = require('../../utils/like.js')
var userlogin = require('../../utils/login.js')
var getuserinfo = require('../../utils/inside_api.js')
import{cloudDownLoad}from"../../utils/cloud.js"
import {getOpenid} from "../../utils/inside_api.js"
const app=getApp()
const db=wx.cloud.database()
const _ = db.command
let imgurl=''
let avatarurl=''
let nickname=''
let gender=''
let checkinput = true
let hasUserInfo =  false//缓存是否有用户信息
let userInfo = []
let iforumlength = ''//推文集合长度
let iforumcount = 7//推文显示条数
let openid = getOpenid()//用户openid
let times = ''//上传推文时间
let inputclean = ''//清空评论框数据
let userblock = ''//全局变量
let dbhasuser = ''
let mylikelist = []//用户点赞数组

Page({
  /**
   * 页面的初始数据
   */
  data: {
    toppostlist:[],
    toppostlistcount:0,
    postlist:[],//推文数组
    showlikelist:[],//是否显示已点赞
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
    const showallinput =await htmlRequest(['showtallinput','get'])
    this.setData({
      showallinput:showallinput
    })
  },

  onReady: function() {
    this.setData({
      loadModal: true
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this;//将this另存为
    var login = wx.getStorageSync('hasUserInfo',login)
    if(!login){
      that.login(openid)
      return;
    }
    userInfo = wx.getStorageSync('userInfo',userInfo),
    hasUserInfo = wx.getStorageSync('hasUserInfo',hasUserInfo),
    avatarurl = wx.getStorageSync('avatarurl',avatarurl)
    nickname = wx.getStorageSync('nickname',nickname)
    //获取置顶说说
    wx.cloud.callFunction({
      name: 'gettoppost',
      key: 'toppostlist',
      complete: res => {
        that.setData({
          toppostlist:res.result.data,
          toppostlistcount:res.result.data.length
        })
      }
    })
    getuserinfo.getBlock(openid)
    .then(res => {
      userblock = res
    })
    var userpostimglist = new Array();
    //获取数据条数
    db.collection('iforum').count({
      success(res) {
        iforumlength = res.total
        //获取用户点赞列表
        wx.cloud.callFunction({
          name: 'getmylike',
          key: 'mylikelist',
          data:{
            userid:openid
          },
          complete: res => {
            mylikelist = res.result.data
            //调用云函数从数据库获取论坛数据
            wx.cloud.callFunction({
              name: 'getallpost',//云函数名
              key: 'postlist',
              data:{
                lim:iforumlength,
                pass:iforumcount
              },
              async complete(res){
                for(var i=iforumcount;i<res.result.data.length;i++){
                  if(res.result.data[i].imgurl) {//判断有无图片信息
                    const userpostimg = await cloudDownLoad('',[res.result.data[i].imgurl])//调用缓存app.js
                    userpostimglist.push(userpostimg)//将图片缓存信息存入数组
                  }else{
                    continue;
                  }
                }
                for(var i=0;i<res.result.data.length;i++){
                  if(userpostimglist[i]) {//判断有无图片信息
                    res.result.data[i].imgurl = userpostimglist[i]//使用缓存的url替换本地图片url
                  }else{
                    continue;
                  }
                }
                inputclean = ''
                that.setData({
                  //倒序存入数组
                  postlist:res.result.data.reverse()
                });
                
                var showlikelist = new Array()
                var postlikelist = that.data.postlist
                //将置顶说说倒序并插入postlist数组头部
                var toppost = that.data.toppostlist.reverse()
                for(var i = 0 ; i < toppost.length ; i++){
                  postlikelist.unshift(toppost[i])
                }
                for(var i=0 ; i<postlikelist.length ; i++){
                  var showlike
                  for(var j=0;j<mylikelist.length;j++){
                    if(postlikelist[i]._id == mylikelist[j].likeid && mylikelist[j].userid == openid){
                      showlike=false
                      break;
                    }else{
                      showlike=true
                    }
                  }
                  showlikelist.push(showlike)
                }
                that.setData({
                  showlikelist:showlikelist,
                  loadModal: false
                })
              }
            })
          }
        })
      }
    })
  },

  login:function(openid){
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
        this.onShow()
        if (userblock == 'false') {
          wx.showModal({
            title: '用户已被封禁',
            content: '申诉请前往IN广理公众号,在后台回复申诉即可',
            showCancel:false
          })
        }
      })
    })
  },

  totalkinfo:function(e){
    var postid = e.currentTarget.dataset.id
    wx.navigateTo({
      url:'../talkinfo/talkinfo?postid='+postid+'&userblock='+userblock
    })
    db.collection("iforum").doc(e.currentTarget.dataset.id).update({//添加到数据库
      data:{
        hot:e.currentTarget.dataset.hot+Math.ceil(Math.random()*4)
      }
    })
  },

  //点赞功能
  likeadd:function(e){
    wx.vibrateShort({type:"heavy"})
    var num = e.currentTarget.dataset.num - this.data.toppostlist.length
    var countadd
    if (num < 0) {
      num = this.data.toppostlist.length + num
      countadd = "toppostlist[" + num + "].likecount"//重点在这里，组合出一个字符串
    }else{
      countadd = "postlist[" + num + "].likecount"//重点在这里，组合出一个字符串
    }
    //先改变图标
    var add = "showlikelist[" + e.currentTarget.dataset.num + "]"//重点在这里，组合出一个字符串
    this.setData({
      [add]: false,//用中括号把str括起来即可
      [countadd] : this.data.postlist[e.currentTarget.dataset.num].likecount +1
    })
    //再更新数据
    like.utillikeadd(e.currentTarget.dataset.id,e.currentTarget.dataset.openid,openid)
    .then(res => {
      var that = this
      that.onShow()
    })
    wx.showToast({
      mask:'true',
      duration:1500,
      title:"点赞成功",
      image: '/images/liked.png',
    })
  },

  //取消点赞功能
  likeminuus:function(e){
    wx.vibrateShort({type:"heavy"})
    var num = e.currentTarget.dataset.num - this.data.toppostlist.length
    var countadd
    if (num < 0) {
      num = this.data.toppostlist.length + num
      countadd = "toppostlist[" + num + "].likecount"//重点在这里，组合出一个字符串
    }else{
      countadd = "postlist[" + num + "].likecount"//重点在这里，组合出一个字符串
    }
    //先改变图标
    var add = "showlikelist[" + e.currentTarget.dataset.num + "]"//重点在这里，组合出一个字符串
    this.setData({
      [add]: true,//用中括号把str括起来即可
      [countadd] : this.data.postlist[e.currentTarget.dataset.num].likecount -1
    })
    //再更新数据
    like.utillikeminuus(e.currentTarget.dataset.id,e.currentTarget.dataset.openid,openid)
    .then(res => {
      var that = this
      that.onShow()
    })
    wx.showToast({
      mask:'true',
      duration:1500,
      title:"取消点赞",
      image: '/images/like.png',
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
    wx.vibrateShort({type:"heavy"})
    if (userblock == 'false') {
      wx.showToast({
        title:"用户已被封禁",
        image: '/images/fail.png',
      })
      return;
    }else{     
      if(!hasUserInfo){
        openid = getuseropenid.getOpenid()
        this.login(openid)
        userInfo = wx.getStorageSync('userInfo',userInfo),
        hasUserInfo = wx.getStorageSync('hasUserInfo',hasUserInfo),
        avatarurl = wx.getStorageSync('avatarurl',avatarurl)
        nickname = wx.getStorageSync('nickname',nickname)
        return;
      }
      if(this.data.info == ''&&imgurl == ''){
        wx.showToast({
          title:"不能什么都不写哦",
          image: '/images/fail.png',
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
      if(imgurl){
        var info = this.data.info
        wx.cloud.uploadFile({
          cloudPath: 'userpost/'+openid+'/'+times, // 上传至云端的路径
          filePath: imgurl, // 小程序临时文件路径
          success: res => {//上传云端成功后向数据库添加记录
            // 返回文件 ID
            var posturl = res.fileID
            db.collection("iforum").add({//添加到数据库
              data:{
                info:info,
                imgurl:posturl,
                pushtime:gettime.formatTime(new Date()),
                avatarurl:userurl,
                nickname:name,
                gender:gender,
                likecount:0,
                hot:0,
                commentcount:0,
                reject:false
              }
            })
          },
          fail: console.error//执行失败报错
        })
      }else{//没有上传图片
        db.collection("iforum").add({//添加到数据库
          data:{
            info:this.data.info,
            pushtime:gettime.formatTime(new Date()),
            avatarurl:userurl,
            nickname:name,
            gender:gender,
            likecount:0,
            hot:0,
            commentcount:0,
            reject:false
          }
        })
      }
      wx.hideLoading()
      //重新抓取推文列表
      this.onShow()
      //清空上传信息数据
      imgurl='',
      this.setData({
        //发布后关闭发布页面
        info:'',
        Img:"",
        filter:'0rpx',
        showinputinfo:'none',//打开上传信息页面
        showinputpage:'block',//隐藏打开页面按钮
      });
      wx.showToast({
        title:"发布成功",
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
    wx.vibrateShort({type:"heavy"})
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.setData({
      loadModal: true
    })
    this.onShow()
  //模拟加载
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(iforumlength<iforumcount+7 && iforumlength>iforumcount){
      this.setData({
        loadModal: true
      })
      iforumcount = iforumlength
      this.onShow()
    }else if(iforumlength<iforumcount+7){
      wx.showToast({
        title:"到底啦",
      })
    }else{
      this.setData({
        loadModal: true
      })
      iforumcount = iforumcount+7
      this.onShow()
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