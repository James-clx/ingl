import {deepClone} from "../../utils/utils.js"
import {getTermTodayWeek} from "../../utils/times.js"

const app = getApp()

Component({
  properties: {
    ban_hide_weekeen: Boolean, // 是否禁止按显示周末这个按钮
    schedule_data: Object ,// 获取的所有课表数据
  },

  data: {
    hideweekend: true, // 控制显示和隐藏周末
    weekarray: [], // 周次控制器的总数

    // 课程表的相关数据
    point_day: 0, // 指向今天星期几
    selected_week_data: {}, // 用户选择的周次的数据
    selected_week_date: [], // 日
    schedule_data: {}, // 所有的课表数据
    _schedule_date: [], // 单个课表的日数据
    today_week: 0, // 今天的周次
    selected_week:0, // 用户选择的周次

    // 课程详细信息相关数据
    show_class_message: 'none', // 控制课程详细信息的显示隐藏
    ccourse_info_target: {}, // 保存课程的详细信息

    // 其他信息
    schedule_go_class_time: app.globalData.schedule_go_class_time, // 课程表左边栏
  },

  // 这里是用于没登录的时候的初始化
  attached() {
    // 指向今天星期几
    let today = new Date();
    let point_day = today.getDay() == 0 ? 7 : today.getDay()

    // 数据初始化
    this.setData({
      point_day: point_day,
    })
  },

  observers: {
    'schedule_data': function (schedule_data) {
      // 如果schedule_data有数据，那么就要初始化课程表
      if (Object.keys(schedule_data).length) {
        this.data.schedule_data = schedule_data // 保存数据，以便二次使用

        // 判断目前周数是否大于数据的周数总数，大于则维持数据周数总数
        let today_week_cache = getTermTodayWeek()
        let max_week = Object.keys(schedule_data).length
        let today_week = today_week_cache > max_week?max_week:today_week_cache

        let weekarray = []
        // 控制组件的周数
        weekarray = []
        for (let i = 1; i <= max_week; i++) {
          weekarray[i - 1] = i
        }

        // 客户默认选择本周
        let selected_week = today_week

        // 拿取该周的数据
        let temp = 'weektime' + selected_week
        let selected_week_data = schedule_data[temp]['data']

        // 处理日的数据
        let selected_week_date = this.getDateHandler(schedule_data, temp)

        this.setData({
          today_week:today_week,
          selected_week:selected_week,
          selected_week_data:selected_week_data,
          selected_week_date:selected_week_date,
          weekarray:weekarray,
        })
        return
      }
      // 如果schedule_data没有数据，也要初始化值
      this.setData({
        today_week:0,
        selected_week:[],
        selected_week_data:{},
        selected_week_date:[],
        weekarray:0,
      })
    },
    'hideweekend': function (hideweekend) {
      // 当用户按下显示周末按钮时，就要把日的数据计算出来并绑定到页面上
      this.data.hideweekend = hideweekend
      let _schedule_date = this.data._schedule_date
      if (_schedule_date.length) {
        let schedule_date = deepClone(_schedule_date)
        // 如果是隐藏周末，就要删除数据最后两个数据
        this.popTwoDate(hideweekend, schedule_date)
        this.setData({
          selected_week_date: schedule_date
        })
      }
    }
  },

  methods: {
    
    // 周末是否隐藏
    onHideWeekend() {
      let hideweekend = !this.data.hideweekend
        this.setData({
          hideweekend: hideweekend,
        })
    },

    // 周次选择或回到本周后的数据重新绑定
    onPickerOrBackWeek(options) {
      // 获取数据
      let selected_week = Number(options.detail)
      let schedule_data = this.data.schedule_data
      let temp = 'weektime' + selected_week

      // 处理日的数据
      let selected_week_date = this.getDateHandler(schedule_data, temp)

      let selected_week_data = schedule_data[temp]['data']
      // 数据绑定
      this.setData({
        selected_week: selected_week,
        selected_week_data: selected_week_data,
        selected_week_date: selected_week_date
      })
    },

    // 获取数据的月日后，要处理该数据，目前不需要月，只需要日就可以了,处理完后还要赋值，因为后面还要用到
    getDateHandler(schedule_data, temp) {
      let selected_week_date = schedule_data[temp]['date']
      let selected_week_date_handler = this.processDate(selected_week_date)
      // 把数据深拷贝下来，用来隐藏/显示周末
      this.data._schedule_date = deepClone(selected_week_date_handler)
      // 如果是隐藏周末，就要删除数据最后两个数据
      let hideweekend = this.data.hideweekend
      selected_week_date = this.popTwoDate(hideweekend, selected_week_date_handler)
      return selected_week_date
    },

    // 隐藏周末要删除周六日的日数
    popTwoDate(hideweekend, selected_week_date) {
      if (hideweekend) {
        selected_week_date.pop()
        selected_week_date.pop()
      }
      return selected_week_date
    },

    // 处理月日数据，目前不需要月，只需要日
    processDate(selected_week_date) {
      let day = []
      for (let idx in selected_week_date) {
        let day_split = parseInt(selected_week_date[idx].split('-')[1])
        day.push(day_split)
      }
      return day
    },

    // 以下是课程详细信息的相关函数
    showCardView(e) {
      let course_info_all = e.currentTarget.dataset.info // 点击的课程的所有详细信息
      // 获取要显示的目标数据
      let course_target_data = this.getTargetCourseData(course_info_all)

      // 显示课程信息框
      let show_class_message = 'block'

      //初始化数据
      this.setData({
        show_class_message: show_class_message,
        course_info_target: course_target_data
      })
    },

    getTargetCourseData(course_info_all) {
      let course_target_data = {}
      course_target_data['course_name'] = course_info_all.course_name
      course_target_data['course_type'] = course_info_all.course_type
      course_target_data['class_location'] = course_info_all.class_location
      course_target_data['teacher_name'] = course_info_all.teacher_name
      return course_target_data
    }
  },
})