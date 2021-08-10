import {htmlRequest} from "../../utils/html.js"
var check = require('../../utils/check.js')
var like = require('../../utils/like.js')
var userremind = require('../../utils/remind.js')
var userlogin = require('../../utils/login.js')
var getuserinfo = require('../../utils/inside_api.js')
import{cloudDownLoad}from"../../utils/cloud.js"
import {getOpenid} from "../../utils/inside_api.js"
const app=getApp()
const db=wx.cloud.database()
const _ = db.command
let nickname=''
let hasUserInfo=''
let pushinput=''//评论内容
var isPreview
let checkinput = true
let userblock
let dbhasuser
let postid
let openid = getOpenid()
let mylikelist = []//用户点赞数组

Page({
  /**
   * 页面的初始数据
   */
  data: {
    getcommentlist:[],//获取评论列表
    postlist:[],//推文数组
    showlikelist:[],//是否显示已点赞
    inputclean:'',//清空评论框数据
    loadModal: false,
    showinput:true,
    isios: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    const showinput =await htmlRequest(['showtallinput','get'])
    postid = options.postid
    userblock = options.userblock
    this.setData({
      showinput:showinput,
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
    wx.hideLoading()
    nickname = wx.getStorageSync('nickname',nickname)
    hasUserInfo = wx.getStorageSync('hasUserInfo',hasUserInfo),
    // 在右上角菜单 "...”中显示分享，menus可以单写转发shareAppMessage，分享朋友圈必须写shareAppMessage和shareTimeline
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });

    //设置点击放大图片事件不刷新页面
    if(that.data.isPreview){
      that.setData({
        loadModal: false,
        isPreview:false
      })
      return;
    }

    that.setData({
      showallinput:app.globalData.showallinput,
    })
    //获取终端机型
    wx.getSystemInfo({
      success: (res) => {
        if(res.platform=="ios"){
          that.setData({
            isios : true
          })
        }
      }
    })
    //获取评论列表
    wx.cloud.callFunction({
      name: 'getcomment',
      key: 'getcommentlist',
      data:{
        postid:postid
      },
      complete: res => {
        console.log(res)
        that.setData({
          getcommentlist:res.result.data.reverse()
        })
        //获取用户点赞列表
        wx.cloud.callFunction({
          name: 'getmylikeinfo',
          key: 'mylikelist',
          data:{
            userid:openid,
            likeid:postid
          },
          complete: res => {
            mylikelist = res.result.data
            var userpostimglist = new Array();
            //获取数据条数
            db.collection('iforum').count({
              success(res) {
                that.setData({
                  iforumlength:res.total
                })
                //调用云函数从数据库获取论坛数据
                wx.cloud.callFunction({
                  name: 'getpost',//云函数名
                  key: 'postlist',
                  data:{
                    postid:postid
                  },
                  async complete(res){
                    if(res.result.data[0].imgurl) {//判断有无图片信息
                      const userpostimg = await cloudDownLoad('',[res.result.data[0].imgurl])//调用缓存app.js
                      userpostimglist = userpostimg//将图片缓存信息存入数组
                      res.result.data[0].imgurl = userpostimglist//使用缓存的url替换本地图片url
                    }
                    that.setData({
                      inputclean: '',
                      //倒序存入数组
                      postlist:res.result.data.reverse()
                    });
                    pushinput=''
                    
                    var showlikelist = new Array()
                    for(var i=0;i<that.data.postlist.length;i++){
                      var showlike
                      for(var j=0;j<mylikelist.length;j++){
                        if(that.data.postlist[i]._id == mylikelist[j].likeid && mylikelist[j].userid == openid){
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
                      loadModal: false,
                    })
                  }
                })
              }
            })
          }
        })
      }
    })
  },

  //点击图片放大
  async tapimg(e){
    //设置点击事件不刷新页面
    this.setData({
      isPreview:true
    })
    wx.vibrateShort({type:"heavy"})
    let imgurl=e.currentTarget.dataset.id+''
    var userpostimg = new Array();
    userpostimg[0] = imgurl
    wx.previewImage({
      current: '', // 当前显示图片的http链接
      urls: userpostimg // 需要预览的图片http链接列表
    })
  },

  //点赞功能
  likeadd:function(e){
    wx.vibrateShort({type:"heavy"})
    //先改变图标
    var add = "showlikelist[" + e.currentTarget.dataset.num + "]"//重点在这里，组合出一个字符串
    var countlike = "postlist[" + e.currentTarget.dataset.num +"].likecount"//重点在这里，组合出一个字符串
    this.setData({
      [add]: false,//用中括号把str括起来即可
      [countlike] : this.data.postlist[e.currentTarget.dataset.num].likecount +1
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
    //先改变图标
    var add = "showlikelist[" + e.currentTarget.dataset.num + "]"//重点在这里，组合出一个字符串
    var countlike = "postlist[" + e.currentTarget.dataset.num +"].likecount"//重点在这里，组合出一个字符串
    this.setData({
      [add]: true,//用中括号把str括起来即可
      [countlike] : this.data.postlist[e.currentTarget.dataset.num].likecount -1
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

  //分享朋友圈
  share:function(e){
    var postlist = JSON.stringify(this.data.postlist)
    var getcommentlist = JSON.stringify(this.data.getcommentlist)
    var postid = e.currentTarget.dataset.id
    wx.navigateTo({
      url:'../share/share?postid='+postid+'&postlist='+postlist+'&getcommentlist='+getcommentlist
    })
  },

  login:function(openid){
    var checkdb = getuserinfo.getUser(openid)
    if (checkdb.code = '404') {
      dbhasuser = 'false'
    }else{
      dbhasuser = 'true'
    }
    userlogin.userlogin(dbhasuser,dbhasuser)
    .then(res =>{
      hasUserInfo = 'true'
      nickname = res.nickName
      if (userblock == 'false') {
        wx.showModal({
          title: '用户已被封禁',
          content: '申诉请前往IN广理公众号,在后台回复申诉即可',
          showCancel:false
        })
      }
    })
  },

  //获取输入框数据
  pushinput:function(event){
    pushinput=event.detail.value
    check.checktext(event.detail.value)
    .then(res => {
      checkinput = res
    })
  },

  //评论上传到数据库
  uploadcomment:function(e){
    wx.vibrateShort({type:"heavy"})
    var input = pushinput
    pushinput = ''
    var name = nickname
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
        hasUserInfo = wx.getStorageSync('hasUserInfo',hasUserInfo),
        nickname = wx.getStorageSync('nickname',nickname)
        return;
      }      
      if(input == ''){
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
        pushinput = input
        return;
      }
      this.setData({
        inputclean : ''
      })
      db.collection("icomment").add({//添加到数据库
        data:{
          commit:input,
          postid:e.currentTarget.dataset.id,//获取前端推文的id
          postuser:name
        }
      })
      db.collection("iforum").doc(e.currentTarget.dataset.id).update({
        data:{
          commentcount:e.currentTarget.dataset.count+1
        }
      })
      //用户订阅事件
      if (openid == this.data.postlist[0]._openid) {
        wx.requestSubscribeMessage({
          tmplIds: ['COikDS9yExM-SsBRbzlxl3fYKu4lHq1PStB66swghOA'],
          success (res) { 
            console.log(res)
          }
        })
      }else{
        userremind.sendremind(this.data.postlist[0]._openid,this.data.postlist[0].info,name,input)
      }
      //发布评论后重新抓取评论列表
      this.onShow()
    }
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
  },

  // 转发
  onShareAppMessage: function () {
    return {
      title: this.data.postlist[0].info,
      path: '/pages/talk/talk', // 点击访问的页面
      imageUrl: this.data.postlist[0].imgurl,     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。
    }
  }
})