import {clearCacheSingle,clearCacheAll} from "../../utils/cache.js"
import {htmlRequest} from "../../utils/html.js"

const db=wx.cloud.database()
let avatarurl=''
let nickname=''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUseGetUserProfile: false,
    openid:'',//用户openid
    nickName : '',//用户名称
    avatarUrl : '',//用户头像
    dbhasuser:'',
    userblock:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    wx.cloud.callFunction({
      name:'getOpenid',
      complete:res=>{
        var openid = res.result.openid
        that.setData({
          canIUseGetUserProfile: true,
          openid:openid
        })
        //用户获取点赞数量
        wx.cloud.callFunction({
          name: 'getlike',
          key: 'likelist',
          complete: res => {
            var likecount = 0
            for (var i=0;i<res.result.data.length;i++) {
              if(res.result.data[i].postuser == that.data.openid){
                likecount = likecount+1
              }
            }
            that.setData({
              likecount:likecount,
              likelist:res.result.data
            })
          }
        })    
        //用户推文数量
        db.collection('iforum')
        .where({
          _openid:that.data.openid
        })
        .count({
          success(res) {
            that.setData({
              iforumlength:res.total,
            })
          }
        })
        //检查后台有无用户信息，下次进入时继续调用此判断
        that.setData({
          userInfo : wx.getStorageSync('userInfo',that.data.userInfo),
          hasUserInfo : wx.getStorageSync('hasUserInfo',that.data.hasUserInfo),
          avatarurl : wx.getStorageSync('avatarurl',avatarurl),
          nickname : wx.getStorageSync('nickname',nickname)
        })
        avatarurl = wx.getStorageSync('avatarurl',avatarurl)
        nickname = wx.getStorageSync('nickname',nickname)
        wx.cloud.callFunction({
          name: 'getuser',
          key: 'getuser',
          complete: res => {
            console.log(that.data.openid)
            console.log(res)
            for(var i=0;i<res.result.data.length;i++){
              console.log('enter')
              if(this.data.openid == res.result.data[i]._openid && res.result.data[i].block == 'true'){
                wx.showModal({
                  title: '用户已被封禁',
                  content: '申诉请前往IN广理公众号,在后台回复申诉即可',
                  showCancel:false
                })
                that.setData({
                  userblock : 'true',
                  dbhasuser : 'true'
                })
                break;
              }else if(this.data.openid == res.result.data[i]._openid && res.result.data[i].block != 'true'){
                that.setData({
                  userblock : 'false',
                  dbhasuser : 'true'
                })
                break;
              }else{
                that.setData({
                  userblock : 'false',
                  dbhasuser : 'false'
                })
              }
            }
            if(that.data.hasUserInfo == '' || that.data.dbhasuser == 'false'){
              console.log(that.data.dbhasuser)
              wx.showModal({//模态框确认获取用户数据
                showCancel:false,
                title: '提示',
                content: 'IOS端手机可能会出现样式错乱 \n如遇到此情况请更新手机系统',
                success (res) {//确认授权后修改后端数据
                  if (res.confirm) {
                    wx.getUserProfile({
                      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                      success: (res) => {//获取用户数据
                        if(that.data.dbhasuser == 'false'){
                          db.collection("iuser").add({//添加到数据库
                            data:{
                              avatarurl:res.userInfo.avatarUrl,
                              nickname:res.userInfo.nickName,
                              country:res.userInfo.country,
                              city:res.userInfo.city,
                              gender:res.userInfo.gender,
                              block:that.data.userblock
                            }
                          })
                        }
                        avatarurl = res.userInfo.avatarUrl
                        nickname = res.userInfo.nickName
                        that.setData({
                          userInfo: res.userInfo,
                          hasUserInfo: true,
                          showTalklogin : 'none',
                          canIUseGetUserProfile: true,
                        })
                        wx.setStorageSync('userInfo', that.data.userInfo)
                        wx.setStorageSync('hasUserInfo', that.data.hasUserInfo)
                        wx.setStorageSync('avatarurl', avatarurl)
                        wx.setStorageSync('nickname', nickname)
                      },
                      fail: (res) =>{//拒绝后返回功能页面
                        console.log('false')
                        wx.switchTab({
                          url: '/pages/funct/funct'
                        })
                      }
                    })
                  }
                }
              })
            }
          }
        })
      }
    })
  },

  tomytalk:function(){
    wx.navigateTo({
      url: '../mytalk/mytalk',
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