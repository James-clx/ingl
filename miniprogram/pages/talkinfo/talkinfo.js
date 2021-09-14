import {htmlRequest} from "../../utils/html.js"
var check = require('../../utils/check.js')
var like = require('../../utils/like.js')
var userremind = require('../../utils/remind.js')
var userlogin = require('../../utils/login.js')
var getuserinfo = require('../../utils/inside_api.js')
import{cloudDownLoad}from"../../utils/cloud.js"
import {getOpenid} from "../../utils/inside_api.js"
const app=getApp()
let nickname=''
let hasUserInfo=''
let pushinput=''//评论内容
var isPreview
let userblock
let dbhasuser
let postid
let postcount
let openid

Page({
  /**
   * 页面的初始数据
   */
  data: {
    getcommentlist:[],//获取评论列表
    postlist:[],//推文数组
    images:[],
    inputclean:'',//清空评论框数据
    loadModal: false,
    showinput:true,
    isios: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    postid = options.postid
    postcount = options.postcount
    var that = this
    const showinput =await htmlRequest(['showtallinput','get'])
    that.setData({
      showinput:showinput,
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
    let that = this;//将this另存为
    openid = getOpenid()
    wx.hideLoading()
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

    //评论权限
    wx.request({
      url: 'https://www.inguangli.cn/ingl/api/access/issue_forum_comment',
      method: 'POST',
      data:{
        openid:openid
      },
      success (res) {
        if(res.data.data == 'false'){
          userblock = 'false'
        }else{
          userblock = 'true'
        }
      },
      fail(res){
        console.log(res.data)
      }
    })

    //获取说说内容
    wx.request({
      url: 'https://www.inguangli.cn/ingl/api/get/forum/detail',
      method: 'POST',
      data:{
        openid:openid,
        forum_id:postid
      },
      async success (res) {
        if (!res.data.forum_data.create_time) {
          wx.setStorageSync('deletepost', postcount)
          wx.navigateBack({
            delta: 1,
          })
          return
        }
        // if(res.data.forum_data.imgurl != ''){
        //   var postimg = res.data.forum_data.imgurl
        //   const cloudimages = await cloudDownLoad([postimg])
        //   that.setData({
        //     images:cloudimages
        //   })
        // }
        that.setData({
          postlist:res.data.forum_data,
          getcommentlist:res.data.forum_comment,
          inputclean: '',
          loadModal: false,
        })
        pushinput=''
      },
      fail(res){
        console.log(res.data)
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
    wx.previewImage({
      current: '', // 当前显示图片的http链接
      urls: [e.currentTarget.dataset.id] // 需要预览的图片http链接列表
    })
  },

  //点赞功能
  likeadd:function(e){
    wx.vibrateShort({type:"heavy"})
    like.utillikeadd(e.currentTarget.dataset.id,openid)
    .then(res => {
      var that = this
      that.onShow()
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
    like.utillikeminuus(e.currentTarget.dataset.id,openid)
    .then(res => {
      var that = this
      that.onShow()
      wx.showToast({
        mask:'true',
        duration:1000,
        title:res,
        image: '/images/like.png',
      })
    })
  },

  //分享朋友圈
  share:function(e){
    var postlist = JSON.stringify(this.data.postlist)
    var getcommentlist = JSON.stringify(this.data.getcommentlist)
    var postid = e.currentTarget.dataset.id
    wx.navigateTo({
      url:'../share/share?postlist='+postlist+'&getcommentlist='+getcommentlist
    })
  },

  login:function(openid){
    var checkdb
    if (!openid) {
      var useropenid = getOpenid()
      that.login(useropenid)
    }else{
      getuserinfo.getUser(openid)
      .then(res => {
        console.log(res)
        checkdb = res
        if (checkdb.code != 200) {
          dbhasuser = 'false'
        }else{
          dbhasuser = 'true'
        }
        userlogin.userlogin(openid,dbhasuser)
        .then(res =>{
          hasUserInfo = 'true'
          nickname = res.nickName
        })
      })
    }
  },

  //获取输入框数据
  pushinput:function(event){
    pushinput=event.detail.value
  },

  //评论上传到数据库
  uploadcomment:function(e){
    wx.vibrateShort({type:"heavy"})
    var that = this
    nickname = wx.getStorageSync('nickname',nickname)
    hasUserInfo = wx.getStorageSync('hasUserInfo',hasUserInfo)
    var input = pushinput
    pushinput = ''
    var name = nickname
    if (userblock == 'false') {
      wx.showToast({
        title:"用户已被封禁",
        icon:'none'
      })
      return;
    }else{
      if(!hasUserInfo){
        openid = getOpenid()
        that.login(openid)
        hasUserInfo = wx.getStorageSync('hasUserInfo',hasUserInfo),
        nickname = wx.getStorageSync('nickname',nickname)
        pushinput = input
        return;
      }      
      if(input == ''){
        wx.showToast({
          title:"不能什么都不写哦!",
          icon:'none'
        })
        return;
      }
      wx.showLoading({
        title: '上传中',
      })
      check.checktext(input,openid)
      .then(res => {
        console.log(res)
        if(res == false){
          wx.hideLoading()
          wx.showToast({
            icon: 'none',
            title: '文字违规',
          })
          pushinput = input
          return;
        }
        that.setData({
          inputclean : ''
        })

        wx.request({
          url: 'https://www.inguangli.cn/ingl/api/add/forum/comment',
          method:'POST',
          data:{
            openid: openid,
            content:input,
            forum_id:e.currentTarget.dataset.id,//获取前端推文的id
            com_username:name
          },
          success (res) {
            console.log(res.data)

            wx.request({
              url: 'https://www.inguangli.cn/ingl/api/get/forum/comment',
              method:"GET",
              data:{
                forum_id:e.currentTarget.dataset.id,//获取前端推文的id
              },
              success (res) {
                console.log(res.data.data)
                that.setData({
                  getcommentlist:res.data.data
                })
              },
              fail(res){
                console.log(res.data)
              }
            })
          },
          fail(res){
            console.log(res.data)
          }
        })
      
        wx.hideLoading()
      
        //发布评论后重新抓取评论列表
        that.onShow()
        if (openid == that.data.postlist.openid) {
          wx.requestSubscribeMessage({
            tmplIds: ['COikDS9yExM-SsBRbzlxl3fYKu4lHq1PStB66swghOA'],
            success (res) { 
              console.log(res)
            },
            fail(res){
              console.log(res)
            }
          })
        }else{
          userremind.sendremind(that.data.postlist.openid,that.data.postlist.info,name,input)
        }
      })
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