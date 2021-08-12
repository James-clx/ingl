import {clearCacheSingle,clearCacheAll} from "../../utils/cache.js"
import {htmlRequest} from "../../utils/html.js"
var userlogin = require('../../utils/login.js')
var getuserinfo = require('../../utils/inside_api.js')
import {getOpenid} from "../../utils/inside_api.js"
const db=wx.cloud.database()
let dbhasuser
let userblock
let hasUserInfo = false//缓存是否有用户信息
let openid//用户openid

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:[],
    modalName:null,
    isadmin:false,
    //rejectcount:0,
    iforumlength:'',//推文集合长度
    likecount:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    openid = getOpenid()
    var that = this
    var login = wx.getStorageSync('hasUserInfo',login)
    if(!login){
      that.login(openid)
      return;
    }
    hasUserInfo = wx.getStorageSync('hasUserInfo',hasUserInfo),
    that.setData({
      userInfo : wx.getStorageSync('userInfo',that.data.userInfo),
    })
    //是否管理员
    wx.cloud.callFunction({
      name: 'getadmin',
      key: 'isadmin',
      complete: res => {
        var isadmin = false
        for(var i=0;i<res.result.data.length;i++){
          if(openid == res.result.data[i].useropenid){
            isadmin = true
            break;
          }
        }
        that.setData({
          isadmin:isadmin
        })
      }
    })
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
    //获取点赞列表
    wx.cloud.callFunction({
      name: 'getmylike',
      key: 'mylikelist',
      data:{
        userid:openid
      },
      complete: res => {
        that.setData({
          likecount:res.result.data.length,
          loadModal: true,
        })
      }
    })     

    db.collection('iforum')
    .where({
      _openid:openid
    })
    .count({
      success(res) {
        that.setData({
          iforumlength:res.total,
          shownothing:'none'
        })
      }
    })
    //未审核数量
    // wx.cloud.callFunction({
    //   name: 'getfalseaudit',
    //   key: 'rejectcount',
    //   complete: res => {
    //     console.log(res.result.total)
    //     that.setData({
    //       rejectcount:res.result.total
    //     })
    //   }
    // })     
  },

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
        hasUserInfo = 'true'
        that.setData({
          userInfo : res,
        })
        that.onShow()
      })
    })
  },

  //跳转到我的说说
  tomytalk:function(){
    wx.navigateTo({
      url: '../mytalk/mytalk?userblock='+userblock,
    })
  },

  toauditpost:function(){
    wx.navigateTo({
      url: '../auditpost/auditpost',
    })
  },

  //打开模态框
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },

  //关闭模态框
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  
  //清空所有缓存
  cleanAllCache(){
    try {
      wx.clearStorageSync()
      this.setData({
        userInfo: '',
        likecount: 0,
        iforumlength: 0
      })
      wx.showToast({
        title:"已登出"
      })
    } catch(e) {
      // Do something when catch error
    }
  },  

  // 清空课表缓存
  async cleanSchedule(){
    const can_in_edbrowser = await htmlRequest(['can_in_browser', 'GET']) // 判断能否进入教务系统
    if(can_in_edbrowser['error']){ // 不能进入教务系统的处理
      this.canNotInEdbrowserHandler('教务系统驾崩啦')
      return
    }
    // 清空schedule_cache课表缓存
    clearCacheSingle('schedule_cache')

    // 提示信息
    wx.showToast({
      title:"已清空课表缓存"
    })
  },

  // 清空教务系统相关缓存
  logoutEdlogin(){
    // 清空教务系统相关缓存
    clearCacheAll(['schedule_cache','student_number','password','cookies'])

    // 提示信息
    wx.showToast({
      title:"已注销教务系统"
    })
  },
      // 不能进入教务系统
    canNotInEdbrowserHandler(title){
      wx.showToast({
        title: title,
        icon:'error'
      })
    },
})