Component({
  /**
   * 组件的属性列表
   */
  properties: {
    hideweekend: Boolean,
  },

  /**
   * 组件的初始数据
   */
  data: {
    can_in_guangli:false, //能否进入教务系统的文字显示控制

    todayweek: '', //选择周次
    showclassmassage: 'none',
    course_name: '',
    course_type: '',
    class_location: '',
    teacher_name: '',
    swiperHeight: 0,
    day: '', //星期几
    termstart: '', //学期开始周次
    backweek: '', //今日周次
    
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

  /**
   * 组件的方法列表
   */
  methods: {
  },
  pageLifetimes:{
  },
})