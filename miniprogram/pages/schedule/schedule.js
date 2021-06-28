import {get_term_today_week} from "../../utils/times.js"
import {get_cache_sync} from "../../utils/cache.js"

const app = getApp()

Page({
  data: {
    hidelogin: 'none', // 是否显示登录界面
    hideweekend: true, // 是否隐藏周末
    ban_hide: true, // 是否禁用显示周末这个按钮
  },

  onLoad() {
    // 有登录缓存的逻辑,这里要做个判断有无登录缓存
    let edlogin_cache = get_cache_sync('student_number') // 判断有无登录信息的缓存
    if(!edlogin_cache){ //无缓存
    }



    let hidelogin = this.data.hidelogin
    let hideweekend = this.data.hideweekend
    let ban_hide = this.data.ban_hide
    if (edlogin_cache) {
      // 已登录教务系统的逻辑
      hidelogin = 'none'
      hideweekend = true
      ban_hide = false
    } else {
      // 没有登录教务系统的逻辑
      // let term_today_week = get_term_today_week() //这周是第几周
      hidelogin = 'block'
      hideweekend = true
      ban_hide = true
    }

    // 数据初始化
    this.setData({
      hidelogin: hidelogin,
      hideweekend:hideweekend,
      ban_hide:ban_hide
    })
  },

  onShow() {
    let date1 = new Date();
    let day = date1.getDay()
    var weekarray = new Array()
    for (var i = 1; i <= 20; i++) {
      weekarray[i - 1] = i
    }
    if (day == 0) {
      day = 7
    }
    wx.getSystemInfo({
      success: (res) => {
        let clientHeight = res.windowHeight
        let clientWidth = res.windowWidth
        let ratio = 750 / clientWidth; //计算为百分比
        let rpxHeight = ratio * clientHeight
        this.setData({
          swiperHeight: rpxHeight,
          weekarray: weekarray,
          day: day
        })
      }
    })
  },

  // 周末是否隐藏
  hideweekend() {
    // 如果没有登录的话，这里的显示周末按钮是按不了的
    const ban_hide = this.data.ban_hide
    if(!ban_hide){
      let hideweekend = !this.data.hideweekend
      this.setData({
        hideweekend: hideweekend,
      })
    }
  },
})