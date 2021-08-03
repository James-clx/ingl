import {clearCacheSingle,clearCacheAll} from "../../utils/cache.js"
import {htmlRequest} from "../../utils/html.js"
var userlogin = require('../../utils/login.js')
const db=wx.cloud.database()
let dbhasuser
let userblock
let hasUserInfo =  false//缓存是否有用户信息
let openid = ''//用户openid

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
    var that = this
    var login = wx.getStorageSync('hasUserInfo',login)
    wx.cloud.callFunction({
      name:'getOpenid',
      complete:res=>{
        if(!login){
          console.log(!login)
          that.login(res.result.openid)
        }
        openid = res.result.openid
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
          hasUserInfo = 'true'
          that.setData({
            userInfo : res,
          })
          if (that.data.userblock == 'true') {
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