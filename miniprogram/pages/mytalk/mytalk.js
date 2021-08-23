import {getOpenid} from "../../utils/inside_api.js"
var getuserinfo = require('../../utils/inside_api.js')
var userlogin = require('../../utils/login.js')
var like = require('../../utils/like.js')
const app=getApp()
let dbhasuser
let userblock
let hasUserInfo = false//缓存是否有用户信息
let openid
let iforumcount = 0//推文显示条数
let morepost = true

Page({

  /**
   * 页面的初始数据
   */
  data: {
    postlist:[],//推文数组    
    //auditpostlist:[],//审核中推文数组
    showlikestatus:[],
    showlikenum:[],
    likecount:0,
    userInfo: {},//用户信息
    shownothing:'none',
    isadmin:false,
    loadModal: false,
    iforumlength : ''//推文集合长度
  },

 /**
   * 生命周期函数--监听页面显示
   */
  async onLoad (options) {
    userblock = options.userblock
    var that = this
    that.setData({
      loadModal: true
    })
    setTimeout(function () {
      that.setData({
        loadModal: false
      })
    },1500)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow() {
    openid = getOpenid()
    wx.hideLoading()
    let that = this;//将this另存为
    var login = wx.getStorageSync('hasUserInfo',login)
    if(!login){
      getuserinfo.getLoginOpenid()
      .then(res => {
        that.login(res)
        return;
      })
    }
    hasUserInfo = wx.getStorageSync('hasUserInfo',hasUserInfo),
    //设置点击事件不刷新页面
    that.setData({
      userInfo : wx.getStorageSync('userInfo',that.data.userInfo)
    })
    
    //查看是否管理员
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

    //获取点赞、发帖数
    wx.request({
      url: 'https://www.inguangli.cn/ingl/api/get/forum_like/forum_sum',
      method: 'POST',
      data:{
        openid:openid
      },
      success (res) {
        that.setData({
          likecount:res.data.my_forum_like_sum,
          iforumlength:res.data.my_forum_sum
        })
      },
      fail(res){
        console.log(res.data)
      }
    })

    //获取审核中的说说
    // wx.cloud.callFunction({
    //   name: 'getmyauditpost',
    //   key: 'auditpostlist',
    //   data:{
    //     openid:openid
    //   },
    //   complete: res => {
    //     console.log(res.result.data)
    //     that.setData({
    //       auditpostlist:res.result.data
    //     })
    //   }
    // })   
  
    //获取我的说说
    wx.request({
      url: 'https://www.inguangli.cn/ingl/api/get/my/forum/comment',
      method: 'POST',
      data:{
        openid:openid,
        limit: 7,
        offest: iforumcount,
      },
      success (res) {
        if (!res.data.data) {
          that.setData({
            shownothing:'block',
            loadModal: false
          })
        }else if(that.data.postlist.length-7 != iforumcount){
          var pustpostlist = new Array()
          var pustlikestatus = new Array()
          var pustlikenum = new Array()
          pustpostlist = that.data.postlist
          pustlikestatus = that.data.showlikestatus
          pustlikenum = that.data.showlikenum
          for (let i = 0; i < 7; i++) {
            if (!res.data.data[i]) {
              morepost = false
              continue;
            }else{
              morepost = true
              pustpostlist.push(res.data.data[i])
              pustlikestatus.push(res.data.data[i].have_forum_like)
              pustlikenum.push(res.data.data[i].forum_like_sum)
            }
          }
          that.setData({
            postlist:pustpostlist,
            showlikestatus:pustlikestatus,
            showlikenum:pustlikenum,
            loadModal: false
          })
        }
      },
      fail(res){
        console.log(res.data)
      }
    })
  },

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
        hasUserInfo = 'true'
        that.setData({
          userInfo : res,
        })
        that.onShow()
      })
    })
  },

  //置顶说说
  settop:function(e){
    console.log(e.detail.value)
    wx.vibrateShort({type:"heavy"})
    if (e.detail.value) {
      wx.request({
        url: 'https://www.inguangli.cn/ingl/api/set/forum/setup',
        method: 'GET',
        data:{
          forum_id:e.currentTarget.dataset.id
        },
        success (res) {
          console.log(res.data)
        },
        fail(res){
          console.log(res.data)
        }
      })
    }else{
      wx.request({
        url: 'https://www.inguangli.cn/ingl/api/cancel/forum/setup',
        method: 'GET',
        data:{
          forum_id:e.currentTarget.dataset.id
        },
        success (res) {
          console.log(res.data)
        },
        fail(res){
          console.log(res.data)
        }
      })
    }
  },

  //删除已发布说说
  deletepost:function(e){
    wx.vibrateShort({type:"heavy"})
    let that = this;//将this另存为
    wx.showModal({
      title: '确认删除',
      content: '确认删除后不能恢复',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: 'https://www.inguangli.cn/ingl/api/delete/my/forum',
            method: 'GET',
            data:{
              forum_id:e.currentTarget.dataset.id
            },
            success (res) {
              console.log(res.data)
              wx.showToast({
                title:res.data.message,
              })
              //重新抓取说说列表
              iforumcount = 0
              that.data.postlist = []
              that.data.showlikenum = []
              that.data.showlikestatus = []
              that.onShow()
            },
            fail(res){
              console.log(res.data)
            }
          })
        }
        else if (res.cancel) {
          return false;    
        }
      }
    })
  },

  //删除审核中推文
  // deleteauditpost:function(e){
  //   wx.vibrateShort({type:"heavy"})
  //   let that = this;//将this另存为
  //   wx.showModal({
  //     title: '确认删除',
  //     content: '确认删除后不能恢复',
  //     success: function (res) {
  //       if (res.confirm) {
  //         db.collection('iaudit')
  //         .where({
  //           _id:e.currentTarget.dataset.id
  //         })
  //         .remove()
  //         wx.showToast({
  //           title:"删除成功",
  //         })
  //         //重新抓取推文列表
  //         that.onShow()
  //       }
        
  //       else if (res.cancel) {
  //         return false;    
  //       }
  //     }
  //   })
  // },

  totalkinfo:function(e){
    var postid = e.currentTarget.dataset.id
    wx.navigateTo({
      url:'../talkinfo/talkinfo?postid='+postid
    })
  },

  shownothing:function(){
    wx.switchTab({
      url: '/pages/talk/talk'
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

  onPullDownRefresh:function(){
    var that = this
    wx.vibrateShort({type:"heavy"})
    wx.showNavigationBarLoading() //在标题栏中显示加载
    iforumcount = 0
    that.setData({
      loadModal: true,
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

  //关闭页面触发函数
  onHide: function() {
    iforumcount = 0
    this.data.postlist = []
    this.data.showlikenum = []
    this.data.showlikestatus = []
    //关闭页面时移除审核中的说说
    // db.collection('iaudit')
    // .where({
    //   reject:true,
    //   _openid:openid
    // })
    // .remove()
  },

  onUnload: function(){
    this.onHide()
  }
})