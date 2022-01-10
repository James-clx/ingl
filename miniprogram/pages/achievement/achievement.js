// miniprogram/pages/achievement/achievement.js
import {htmlRequest} from "../../utils/html.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    schoolyear:[],
    achievement:[],
    allachievement:[],
    TabCur: 0,
    scrollLeft:0,
    yearpick:'',
    loadModal:false,
    hidelogin: 'none',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    var that = this;
    var openid = wx.getStorageSync('openid')
    var student_number = wx.getStorageSync('student_number')
    var password = wx.getStorageSync('password')
    var cookies = wx.getStorageSync('cookies')

    wx.request({
      url: 'https://www.inguangli.cn/ingl/api/achievement',
      method:'POST',
      data:[
        {
          openid : openid,
          student_number :student_number,
          password : password
        },
        {
          JSESSIONID : cookies.JSESSIONID
        },
      ],
      success(res){
        var yearpick = that.data.yearpick
        if(yearpick == ''){
          yearpick = res.data.data.school_year[res.data.data.school_year.length-1]
          that.setData({
            scrollLeft:(res.data.data.school_year.length-1)*60,
            TabCur: res.data.data.school_year.length-1,
          })
        }
        var achievement = []
        for(var i = 0 ; i < res.data.data.info.length ; i++){
          if(res.data.data.info[i].school_year == yearpick){
            achievement.push(res.data.data.info[i])
          }
        }
        that.setData({
          loadModal:false,
          allachievement:res.data.data.info,
          yearpick:res.data.data.school_year[res.data.data.school_year.length],
          schoolyear:res.data.data.school_year,
          achievement:achievement,
        })
      },
      fail(res){
        console.log(res)
      }
    })
    that.setData({
      loadModal: true,
      scrollLeft:60,
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
  onShow: function () {
    var that = this;
    that.setData({
      loadModal:false,
    })
    let edlogin_cache = wx.getStorageSync('student_number') // 获取有无登录教务系统的缓存
    if(!edlogin_cache){ // 未登录教务系统的逻辑
      that.notHaveEdloginCache()
      return
    }    
  },

    // 未登录教务系统的逻辑
    notHaveEdloginCache(){
      // 数据初始化
      this.setData({
        hidelogin: 'block',
        ban_hide_weekeen: true,
        schedule_data:{},
      })
    },

  tabSelect(e) {
    var that = this;
    var achievement = []
    for (let i = 0 ; i < that.data.allachievement.length ; i++) {
      if(that.data.allachievement[i].school_year == that.data.schoolyear[e.currentTarget.dataset.id]){
        achievement.push(that.data.allachievement[i])
      }
    }
    that.setData({
      yearpick:that.data.schoolyear[e.currentTarget.dataset.id],
      achievement : achievement,
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id-1)*60,
      loadModal:true
    })
    setTimeout(function () {
      that.setData({
        loadModal: false
      })
    },1500)
    this.onShow();
  },

  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  myschedule(e){
    wx.switchTab({
      url: '../../pages/schedule/schedule',
    })
  },

  toloversschedule(e){
    wx.navigateTo({
      url: '../../pages/schedule-lovers/schedule-lovers',
    })
  },

  queryachievement(e){
    wx.navigateTo({
      url: '../../pages/achievement/achievement',
    })
  },
})