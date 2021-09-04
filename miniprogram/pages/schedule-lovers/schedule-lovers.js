import {getCacheSync,setCacheSync,clearCacheAll} from "../../utils/cache.js"
import {htmlRequest} from "../../utils/html.js"
import {showLoading,refreshPage} from "../../utils/inside_api.js"

Page({
  data: {
    hidelogin: 'none', // 控制登录界面的隐藏显示
    ban_hide_weekeen: true, // 是否禁用显示周末这个按钮

    schedule_data_lovers:{}, // 所有课的数据
    schedule_data_me:{}//情侣课表数据
  },

  onLoad() {
    let edlogin_cache = getCacheSync('student_number_lovers') // 获取有无登录教务系统的缓存
    if(!edlogin_cache){ // 未登录教务系统的逻辑
      this.notHaveEdloginCache()
      return
    }

    // 已登录教务系统的逻辑
    this.HaveEdloginCache()
  },

  // 已登录教务系统的逻辑
  HaveEdloginCache(){
    let schedule_cache_lovers = getCacheSync('schedule_cache_lovers') // 获取课表缓存
    let schedule_cache_me = getCacheSync('schedule_cache') // 获取情侣课表缓存
    // 没有缓存课表信息的处理(只有清空了课表缓存才会进入这个分支,还没做)
    if(!schedule_cache_lovers){
      this.onShow()
      return
    }

    // 有缓存课表信息的处理
    this.HaveScheduleCache(schedule_cache_lovers,schedule_cache_me)
  },

  // 未登录教务系统的逻辑
  notHaveEdloginCache(){
    // 数据初始化
    this.setData({
      hidelogin: 'block',
      ban_hide_weekeen: true,
      schedule_data_lovers:{},
      schedule_data_me:{}
    })
  },

  // 有缓存课表信息的处理
  HaveScheduleCache(schedule_cache_lovers,schedule_cache_me){
    // 获取课表所有数据，绑定到课表组件上
    let schedule_data_lovers = schedule_cache_lovers
    let schedule_data_me = schedule_cache_me
    // 隐藏登录界面并且不禁用显示周末按钮
    let hidelogin = 'none'
    let ban_hide_weekeen = false
    console.log(schedule_data_lovers)
    // 数据初始化
    this.setData({
      hidelogin: hidelogin,
      ban_hide_weekeen:ban_hide_weekeen,
      schedule_data_lovers:schedule_data_lovers,
      schedule_data_me:schedule_data_me
    })
    console.log(this.data.schedule_data_lovers)
  },

  // 没有缓存课表信息的处理,每次进入页面都要判断
  async onShow(){
    let edlogin_cache = getCacheSync('student_number_lovers') // 获取有无登录教务系统的缓存

    if(!edlogin_cache){ // 未登录教务系统的逻辑
      this.notHaveEdloginCache()
      return
    }

    let schedule_cache_lovers = getCacheSync('schedule_cache_lovers') // 获取课表缓存
    // 如果没有课表缓存
    if(!schedule_cache_lovers){
      showLoading('加载中...')

      let student_number = getCacheSync('student_number_lovers')
      let password = getCacheSync('password_lovers')
      let cookies = getCacheSync('cookies_lovers')
      let openid =  getCacheSync('openid')
      // 用cookies获取课表
      const data = [{"student_number": student_number,"password": password,"openid":openid},cookies]
      const result = await htmlRequest(['schedule', 'POST', data])
      
      
      // 如果有cookies更新了，则要更新缓存
      if(result['cookies']){
        setCacheSync({'cookies_lovers':result["cookies"]})
      }



      // 如果检测到密码更改了，则要清空登录缓存让用户重新登录
      if(result['message']){
        wx.hideLoading()
        // 清空教务系统相关缓存
        clearCacheAll(['schedule_casche_lovers','student_number_lovers','password_lovers','cookies_lovers'])
        // 提示信息
        wx.showModal({
          title: "清除缓存失败",
          content: result['message'],
          showCancel: false
        })

        // 刷新页面
        refreshPage('../../pages/schedule/schedule')
        
        return
      }
      setCacheSync({'schedule_cache_lovers':result["data"]})
      this.data.schedule_data_lovers = result["data"]

      // 刷新页面
      refreshPage('../../pages/schedule-lovers/schedule-lovers')

      wx.hideLoading()
    }
  },

  // 转发
  onShareAppMessage: function () {
    return {
      title: '广州理工课程表',
      path: '/pages/schedule/schedule', // 点击访问的页面
      imageUrl: '',     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。
    }
  }
})