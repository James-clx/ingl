import {getCacheSync,setCacheSync,clearCacheAll} from "../../utils/cache.js"
import {htmlRequest} from "../../utils/html.js"
import {showLoading,refreshPage} from "../../utils/inside_api.js"

Page({
  data: {
    hidelogin: 'none', // 控制登录界面的隐藏显示
    ban_hide_weekeen: true, // 是否禁用显示周末这个按钮

    schedule_data:{}, // 所有课的数据
  },

  onLoad() {
    let edlogin_cache = getCacheSync('student_number') // 获取有无登录教务系统的缓存
    
    if(!edlogin_cache){ // 未登录教务系统的逻辑
      this.notHaveEdloginCache()
      return
    }

    // 已登录教务系统的逻辑
    this.HaveEdloginCache()
  },

  // 已登录教务系统的逻辑
  HaveEdloginCache(){
    let schedule_cache = getCacheSync('schedule_cache') // 获取课表缓存
    // 没有缓存课表信息的处理(只有清空了课表缓存才会进入这个分支,还没做)
    if(!schedule_cache){
      this.onShow()
      return
    }

    // 有缓存课表信息的处理
    this.HaveScheduleCache(schedule_cache)
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

  // 有缓存课表信息的处理
  HaveScheduleCache(schedule_cache){
    // 获取课表所有数据，绑定到课表组件上
    let schedule_data = schedule_cache
    // 隐藏登录界面并且不禁用显示周末按钮
    let hidelogin = 'none'
    let ban_hide_weekeen = false
    
    // 数据初始化
    this.setData({
      hidelogin: hidelogin,
      ban_hide_weekeen:ban_hide_weekeen,
      schedule_data:schedule_data,
    })
  },

  // 没有缓存课表信息的处理,每次进入页面都要判断
  async onShow(){
    let edlogin_cache = getCacheSync('student_number') // 获取有无登录教务系统的缓存

    if(!edlogin_cache){ // 未登录教务系统的逻辑
      this.notHaveEdloginCache()
      return
    }

    let schedule_cache = getCacheSync('schedule_cache') // 获取课表缓存
    // 如果没有课表缓存
    if(!schedule_cache){
      showLoading('加载中...')

      let student_number = getCacheSync('student_number')
      let password = getCacheSync('password')
      let cookies = getCacheSync('cookies')
      let openid =  getCacheSync('openid')
      // 用cookies获取课表
      const data = [{"student_number": student_number,"password": password,"openid":openid},cookies]
      const result = await htmlRequest(['schedule', 'POST', data])
      
      
      // 如果有cookies更新了，则要更新缓存
      if(result['cookies']){
        setCacheSync({'cookies':result["cookies"]})
      }



      // 如果检测到密码更改了，则要清空登录缓存让用户重新登录
      if(result['message']){
        wx.hideLoading()
        // 清空教务系统相关缓存
        clearCacheAll(['schedule_casche','student_number','password','cookies'])
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
      setCacheSync({'schedule_cache':result["data"]})
      this.data.schedule_data = result["data"]

      // 刷新页面
      refreshPage('../../pages/schedule/schedule')

      wx.hideLoading()
    }
  }
})