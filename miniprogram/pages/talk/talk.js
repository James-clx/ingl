import {htmlRequest} from "../../utils/html.js"
var gettime=require('../../utils/times.js')
var check = require('../../utils/check.js')
var userlogin = require('../../utils/login.js')
import{cloudDownLoad}from"../../utils/cloud.js"
const app=getApp()
const db=wx.cloud.database()
const _ = db.command
let info=''//发布推文页面输入框数据
let imgurl=''
let avatarurl=''
let nickname=''
let gender=''
var isPreview
let checkinput = true
let hasUserInfo =  false//缓存是否有用户信息
let userInfo = []
let iforumlength = ''//推文集合长度
let iforumcount = 7//推文显示条数
let openid = ''//用户openid
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
    postlist:[],//推文数组
    showlikelist:[],//是否显示已点赞
    showTalklogin :'block',//页面展示信息授权模态框
    showinputpage:'block',//上传信息按钮
    showinputinfo:'none',//上传信息页面
    filter:'0rpx',//主页面模糊
    loadModal:false,
    showallinput:false
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
    var isPreview
    wx.hideLoading()
    wx.cloud.callFunction({
      name:'getOpenid',
      complete:res=>{
        if(!login){
          console.log(!login)
          that.login(res.result.openid)
        }
        openid = res.result.openid
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
              toppostlist:res.result.data
            })
          }
        })
        wx.cloud.callFunction({
          name: 'getdbuser',
          key: 'getdbuser',
          data:{
            id:openid
          },
          complete: res => {
            userblock = res.result.data[0].block
          }
        })
        //设置点击事件不刷新页面
        if(that.data.isPreview){
          isPreview=false
          return;
        }
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
                        // console.log(userpostimglist[i])
                      }else{
                        continue;
                      }
                    }
                    inputclean = ''
                    that.setData({
                      isPreview:isPreview,
                      //倒序存入数组
                      postlist:res.result.data.reverse()
                    });
                    
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
                      loadModal: false
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

  login:function(openid){
    var that = this
    wx.cloud.callFunction({
      name: 'getdbuser',
      key: 'getdbuser',
      data:{
        id:openid
      },
      complete: res => {
        if (res.result.data) {
          console.log(res.result.data[0].block)
          if(res.result.data[0].block == 'true'){
            userblock = 'true'
            dbhasuser = 'true'
          }else{
            userblock = 'false'
            dbhasuser = 'true'
          }
        }else{
          userblock = 'false'
          dbhasuser = 'false'
        }
        userlogin.userlogin(dbhasuser)
        .then(res =>{
          userInfo = res
          hasUserInfo = 'true'
          avatarurl = res.avatarUrl
          nickname = res.nickName
          if (userblock == 'true') {
            wx.showModal({
              title: '用户已被封禁',
              content: '申诉请前往IN广理公众号,在后台回复申诉即可',
              showCancel:false
            })
          }
        })
      }
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
    console.log(e)
    console.log(e.currentTarget.dataset.id)
    console.log(openid)
    //获取用户点赞列表
    wx.cloud.callFunction({
      name: 'getlikecount',
      data:{
        likeid:e.currentTarget.dataset.id
      },
      complete: res => {
        console.log(res)
        db.collection("iforum").doc(e.currentTarget.dataset.id).update({//添加到数据库
          data:{
            likecount:res.result.data.length+Math.ceil(Math.random()*4)
          }
        })
        db.collection("ilike").add({//添加到数据库
          data:{
            postuser:e.currentTarget.dataset.openid,
            likeid:e.currentTarget.dataset.id,
            userid:openid
          }
        })
        var that = this
        //重新抓取推文列表
        that.onShow()
      }
    })
    
    wx.showToast({
      mask:true,
      title:"点赞成功",
      image: '/images/like.png',
    })
  },

    //取消点赞功能
    likeminuus:function(e){
      wx.vibrateShort({type:"heavy"})
      console.log(e.currentTarget.dataset.id+'delete')
      console.log(openid)
      //获取用户点赞列表
      wx.cloud.callFunction({
        name: 'getlikecount',
        data:{
          likeid:e.currentTarget.dataset.id
        },
        complete: res => {
          console.log(res)
          db.collection("iforum").doc(e.currentTarget.dataset.id).update({//添加到数据库
            data:{
              likecount:res.result.data.length-1
            }
          })
          db.collection("ilike")//添加到数据库
          .where({
            postuser:e.currentTarget.dataset.openid,
            likeid:e.currentTarget.dataset.id,
            userid:openid
          })
          .remove()
          .then(res => {
            var that = this
            //重新抓取推文列表
            that.onShow()
          })
        }
      })
      wx.showToast({
        mask:true,
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
    console.log(that.data.Img)
    wx.previewImage({
      current: that.data.Img1,
      urls:that.data.Img,
    })
  },

  //发布推文页面输入框数据
  handleinfo:function(event){
    info=event.detail.value
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
        console.log(res.tempFilePaths[0])
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
    console.log(userblock)
    if (userblock == 'true') {
      wx.showToast({
        title:"用户已被封禁",
        image: '/images/fail.png',
      })
      return;
    }else{          
      wx.showLoading({
        title: '上传中',
      })
      if(info == ''&&imgurl == ''){
        wx.hideLoading()
        wx.showToast({
          title:"不能什么都不写哦",
          image: '/images/fail.png',
        })
        return;
      }
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
      console.log(imgurl)
      if(imgurl){
        wx.cloud.uploadFile({
          cloudPath: 'userpost/'+openid+'/'+times, // 上传至云端的路径
          filePath: imgurl, // 小程序临时文件路径
          success: res => {//上传云端成功后向数据库添加记录
            // 返回文件 ID
            console.log(res.fileID+'success')
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
            wx.hideLoading()
            wx.showLoading({
              title: '刷新中',
            })
            //重新抓取推文列表
            this.onShow()
            this.setData({
              //倒序存入数组
              Img:"",
              info:'',
              //发布后关闭发布页面
              filter:'0rpx',
              showinputinfo:'none',//打开上传信息页面
              showinputpage:'block',//隐藏打开页面按钮
            });
            imgurl=''
            wx.showToast({
              title:"已提交审核",
            })
          },
          fail: console.error//执行失败报错
        })
      }else{//没有上传图片
        db.collection("iforum").add({//添加到数据库
          data:{
            info:info,
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
        //重新抓取推文列表
        this.onShow()
        this.setData({
          //倒序存入数组
          Img:"",
          info:'',
          //发布后关闭发布页面
          filter:'0rpx',
          showinputinfo:'none',//打开上传信息页面
          showinputpage:'block',//隐藏打开页面按钮
        });
        //清空图片数组
        imgurl='',
        wx.showToast({
          title:"发布成功",
        })
      }
    }
  },
  //关闭页面
  close:function(){
    this.setData({
      info:'',
      Img:"",
      filter:'0rpx',
      showinputinfo:'none',//打开上传信息页面
      showinputpage:'block',//隐藏打开页面按钮
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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