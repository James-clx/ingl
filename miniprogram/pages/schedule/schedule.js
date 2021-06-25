// pages/schedule/schedule.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showclassmassage:'none',
    course_name:'',
    course_type:'',
    class_location:'',
    teacher_name:'',
    swiperHeight:0,
    day:'',//星期几
    termstart:'',//学期开始周次
    todayweek:'',//选择周次
    backweek:'',//今日周次
    hideweekend:true,
    hidelogin:'block',
    weekarray: [],
    colorArrays: [ "#85B8CF", "#90C652", "#D8AA5A", "#FC9F9D", "#0A9A84", "#61BC69", "#12AEF3", "#E29AAD"],
    date7:['1','2','3','4','5','6','7'],
    date5:['1','2','3','4','5'],
    time:[
      {
        time:"1",
        start:"8:20",
        finish:"9:05"
      },
      {
        time:"2",
        start:"9:15",
        finish:"10:00"
      },
      {
        time:"3",
        start:"10:20",
        finish:"11:05"
      },
      {
        time:"4",
        start:"11:15",
        finish:"12:00"
      },
      {
        time:"5",
        start:"14:00",
        finish:"14:45"
      },
      {
        time:"6",
        start:"14:55",
        finish:"15:40"
      },
      {
        time:"7",
        start:"16:00",
        finish:"16:45"
      },
      {
        time:"8",
        start:"16:55",
        finish:"17:40"
      },
      {
        time:"9",
        start:"19:00",
        finish:"19:45"
      },
      {
        time:"10",
        start:"19:55",
        finish:"20:40"
      }
    ],
    "z101": [
      {
        "course_name": "概率论与数理统计",
        "course_type": "理论教学",
        "class_location": "7-218",
        "teacher_name": "王彦华",
        "class": "18计科3班(Z),18计科5班(Z)",
        "student_num": "113",
        "pitch_num": 1,
        "weekday":1
      },
      {
        "course_name": "离散数学",
        "course_type": "理论教学",
        "class_location": "7-118",
        "teacher_name": "王彦华",
        "class": "18计科3班(Z),18计科5班(Z)",
        "student_num": "113",
        "pitch_num": 3,
        "weekday":1
      },
      {
        "course_name": "前端设计技术",
        "course_type": "理论教学",
        "class_location": "11-402（I类机房）",
        "teacher_name": "张国梅",
        "class": "18计科3班(Z)",
        "student_num": "55",
        "pitch_num": 5,
        "weekday":1
      },
      {
          "course_name": "大数据技术基础",
          "course_type": "理论教学",
          "class_location": "11-403",
          "teacher_name": "陈洪钧",
          "class": "18计科3班(Z)",
          "student_num": "55",
          "pitch_num": 1,
          "weekday":2
      },
      {
          "course_name": "高级架构技术",
          "course_type": "理论教学",
          "class_location": "11-502（I类机房）",
          "teacher_name": "赵玉刚",
          "class": "18计科3班(Z)",
          "student_num": "55",
          "pitch_num": 5,
          "weekday":2
      },
      {
          "course_name": "高级架构技术",
          "course_type": "理论教学",
          "class_location": "11-502（I类机房）",
          "teacher_name": "赵玉刚",
          "class": "18计科3班(Z)",
          "student_num": "55",
          "pitch_num": 3,
          "weekday":2
      },
      {
          "course_name": "前端设计技术",
          "course_type": "理论教学",
          "class_location": "11-406（I类机房）",
          "teacher_name": "张国梅",
          "class": "18计科3班(Z)",
          "student_num": "55",
          "pitch_num": 5,
          "weekday":3
      },
      {
          "course_name": "Python语言基础",
          "course_type": "理论教学",
          "class_location": "11-502（I类机房）",
          "teacher_name": "原峰山",
          "class": "18计科3班(Z)",
          "student_num": "55",
          "pitch_num": 1,
          "weekday":3
      },
      {
          "course_name": "Python语言基础",
          "course_type": "理论教学",
          "class_location": "11-502（I类机房）",
          "teacher_name": "原峰山",
          "class": "18计科3班(Z)",
          "student_num": "55",
          "pitch_num": 7,
          "weekday":3
      },
      {
          "course_name": "操作系统",
          "course_type": "理论教学",
          "class_location": "11-503（I类机房）",
          "teacher_name": "王煜林",
          "class": "18计科3班(Z)",
          "student_num": "55",
          "pitch_num": 9,
          "weekday":3
      },
      {
          "course_name": "操作系统",
          "course_type": "理论教学",
          "class_location": "11-503（I类机房）",
          "teacher_name": "王煜林",
          "class": "18计科3班(Z)",
          "student_num": "55",
          "pitch_num": 3,
          "weekday":3
      },
      {
          "course_name": "软件工程",
          "course_type": "理论教学",
          "class_location": "11-503（I类机房）",
          "teacher_name": "罗建平",
          "class": "18计科3班(Z)",
          "student_num": "55",
          "pitch_num": 1,
          "weekday":4
      },
      {
          "course_name": "软件工程",
          "course_type": "理论教学",
          "class_location": "11-503（I类机房）",
          "teacher_name": "罗建平",
          "class": "18计科3班(Z)",
          "student_num": "55",
          "pitch_num": 1,
          "weekday":7
      },
      {
          "course_name": "离散数学",
          "course_type": "理论教学",
          "class_location": "7-118",
          "teacher_name": "王彦华",
          "class": "18计科3班(Z),18计科5班(Z)",
          "student_num": "113",
          "pitch_num": 1,
          "weekday":5
      },
      {
          "course_name": "大数据技术基础",
          "course_type": "理论教学",
          "class_location": "11-402（I类机房）",
          "teacher_name": "陈洪钧",
          "class": "18计科3班(Z)",
          "student_num": "55",
          "pitch_num": 1,
          "weekday":6
      }
    ],
  },

  showCardView:function(e){
    this.setData({
      showclassmassage:'block',
      course_name:this.data.z101[e.currentTarget.dataset.index].course_name,
      course_type:this.data.z101[e.currentTarget.dataset.index].course_type,
      class_location:this.data.z101[e.currentTarget.dataset.index].class_location,
      teacher_name:this.data.z101[e.currentTarget.dataset.index].teacher_name
    })
  },

  hidemask:function(){
    this.setData({
      showclassmassage:'none',
    })
  },

  hideweekend:function(){
    var hideweekend=!this.data.hideweekend
    this.setData({
      hideweekend:hideweekend,
    })
    console.log(this.data.hideweekend)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    //计算开学日期是第几周
    let date2 = new Date('2021-03-01')
    getWeekInYear(date2)
    function getWeekInYear(date) {
      console.log(date)
      //判断该星期是否跨年，如果跨年就是第一周
      let weekStartDate = getWeekStartByDate(date) //一周开始时间
      console.log(weekStartDate,'weekStartDate')
      let endDate = getDateFromDay(weekStartDate, 6) //一周结束时间
      console.log(endDate,'endDate')
      if (weekStartDate.getFullYear() != endDate.getFullYear()) {
          console.log(endDate.getFullYear() + '年第1周')
          let termstart = 1
          return termstart
      }
      let d1 = new Date(date)
      let d2 = new Date(date)
      d2.setMonth(0)
      d2.setDate(1)
      d2 = getWeekStartByDate(d2)
      console.log(d2,'d2')
      let rq = d1 - d2
      let days = Math.ceil(rq / (24 * 60 * 60 * 1000)) + 1
      let termstart = Math.ceil(days / 7)
      console.log(termstart + '周')
      that.setData({
        termstart:termstart
      })
    }
    function getWeekStartByDate(date) {
      let day = date.getDay()
      return getDateFromDay(date, -day+1)
    }
    function getDateFromDay(dayDate, day) {
      let date = new Date()
      date.setTime(dayDate.getTime() + day * 24 * 60 * 60 * 1000)
      return date
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let date1 = new Date();
    let day = date1.getDay()
    var weekarray = new Array()
    for(var i=1;i<=20;i++){
      weekarray[i-1] = i
    }
    if(day == 0){
      day = 7
    }
    wx.getSystemInfo({
      success:(res) => {
        let clientHeight = res.windowHeight
        let clientWidth = res.windowWidth
        let ratio = 750 / clientWidth;//计算为百分比
        let rpxHeight = ratio * clientHeight
        this.setData({
          swiperHeight: rpxHeight,
          weekarray:weekarray,
          day:day
        })
        console.log(this.data.day)
      }
    })
    var that = this

    //计算现在是今年的第几周
    let date = new Date()
    getWeekInYear(date)
    function getWeekInYear(date) {
      console.log(date)
      //判断该星期是否跨年，如果跨年就是第一周
      let weekStartDate = getWeekStartByDate(date) //一周开始时间
      console.log(weekStartDate,'weekStartDate')
      let endDate = getDateFromDay(weekStartDate, 6) //一周结束时间
      console.log(endDate,'endDate')
      if (weekStartDate.getFullYear() != endDate.getFullYear()) {
          console.log(endDate.getFullYear() + '年第1周')
          let num = 1
          return num
      }
      let d1 = new Date(date)
      let d2 = new Date(date)
      d2.setMonth(0)
      d2.setDate(1)
      d2 = getWeekStartByDate(d2)
      console.log(d2,'d2')
      let rq = d1 - d2
      let days = Math.ceil(rq / (24 * 60 * 60 * 1000)) + 1
      let num = Math.ceil(days / 7)
      console.log( num + '周')
      console.log(that.data.termstart)
      var todayweek = num - that.data.termstart
      that.setData({
        todayweek:todayweek,
        backweek:todayweek
      })
      console.log(that.data.todayweek)
    }

    function getWeekStartByDate(date) {
        let day = date.getDay()
        return getDateFromDay(date, -day+1)
    }
    function getDateFromDay(dayDate, day) {
        let date = new Date()
        date.setTime(dayDate.getTime() + day * 24 * 60 * 60 * 1000)
        return date
    }
  },

  //选择器事件
  bindPickerChange: function(e) {
    this.setData({
      todayweek: e.detail.value
    })
  },

  //回到当前周次
  backweek:function(){
    this.setData({
      todayweek: this.data.backweek
    })
  },
  
  //账号
  account:function(e){
    console.log(e.detail.value)
  },

  //密码
  passwd:function(e){
    console.log(e.detail.value)
  },

  //登录
  login:function(){
    this.setData({
      hidelogin:'none'
    })
  }
})