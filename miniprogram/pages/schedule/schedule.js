import {showLoading} from "../../utils/inside_api.js"
import {get_term_today_week} from "../../utils/times.js"

const app = getApp()

Page({
  data: {
    hidelogin: '', // 是否显示登录界面
    hideweekend: true, // 是否显示周末



    showclassmassage: 'none',
    course_name: '',
    course_type: '',
    class_location: '',
    teacher_name: '',
    swiperHeight: 0,
    day: '', //星期几
    termstart: '', //学期开始周次
    todayweek: '', //选择周次
    backweek: '', //今日周次
    
    weekarray: [],
    date7: ['1', '2', '3', '4', '5', '6', '7'],
    date5: ['1', '2', '3', '4', '5'],
    time: [{
        time: "1",
        start: "8:20",
        finish: "9:05"
      },
      {
        time: "2",
        start: "9:15",
        finish: "10:00"
      },
      {
        time: "3",
        start: "10:20",
        finish: "11:05"
      },
      {
        time: "4",
        start: "11:15",
        finish: "12:00"
      },
      {
        time: "5",
        start: "14:00",
        finish: "14:45"
      },
      {
        time: "6",
        start: "14:55",
        finish: "15:40"
      },
      {
        time: "7",
        start: "16:00",
        finish: "16:45"
      },
      {
        time: "8",
        start: "16:55",
        finish: "17:40"
      },
      {
        time: "9",
        start: "19:00",
        finish: "19:45"
      },
      {
        time: "10",
        start: "19:55",
        finish: "20:40"
      }
    ]
  },

  onLoad: function (options) {
    showLoading('加载中')
    // 判断有无登录教务系统
    // can_in_educational_system = this.check_cache()
    if (false) {
      // 已登录教务系统的逻辑
      this.hidelogin = 'none'
    } else {
      //没有登录教务系统的逻辑
      let term_today_week = get_term_today_week() //这周是第几周
      this.hidelogin = 'block'
    }
    // 数据初始化
    this.setData({
      hidelogin: this.hidelogin
    })
    wx.hideLoading()
  },

  // 周末是否隐藏
  hideweekend: function () {
    let hideweekend = !this.data.hideweekend
    this.setData({
      hideweekend: hideweekend,
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

  //选择器事件
  bindPickerChange: function (e) {
    this.setData({
      todayweek: e.detail.value
    })
  },

  //回到当前周次
  backweek: function () {
    this.setData({
      todayweek: this.data.backweek
    })
  }
})