import {getCacheSync} from "../../utils/cache.js"
import {getTermTodayWeek} from "../../utils/times.js"
import {deepClone} from "../../utils/utils.js"

Page({
  data: {
    hidelogin: 'none', // 是否显示登录界面
    hideweekend: true, // 是否隐藏周末
    ban_hide: true, // 是否禁用显示周末这个按钮
    weekarray: [], // 周次控制器的总数

    selected_week_data: [], // 用户选择的周次的数据
    selected_week_date: [], // 用户选择的周次的日期，直接显示到页面
    selected_week: 0, // 用户选择的周次
    today_week: 0, // 今天的周次
    point_day: 0, // 指向今天的周次的星期数

    _schedule_data: {}, // 课表的数据
    _schedule_date:{}, //课表的日期，用来显示和隐藏周末
  },

  onLoad() {
    let edlogin_cache = getCacheSync('student_number') // 用来判断有无登录信息的缓存
    
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
      this.notHaveScheduleCache()
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
      hideweekend: true,
      ban_hide: true,
      weekarray:[],
      selected_week_data: [],
      selected_week:0,
      today_week:0,
      point_day:0,
    })
  },

  // 有缓存课表信息的处理
  HaveScheduleCache(schedule_cache){
    let _schedule_data = schedule_cache['data']

    // 保存数据以备二次使用
    this.data._schedule_data = _schedule_data

    // 控制组件的周数
    let weekarray = []
    let schedule_weeks_total = Object.keys(_schedule_data).length
    for (let i = 1; i <= schedule_weeks_total; i++) {
      weekarray[i - 1] = i
    }

    // 获取这周是第几周
    let today_week = getTermTodayWeek() // 这周是第几周
    let selected_week = today_week // 客户默认选择本周
    
    // 拿取该周的数据
    let temp = 'weektime' + selected_week
    let selected_week_data = _schedule_data[temp]['data']

    // 获取数据的月日后，要处理该数据，目前不需要月，只需要日就可以了,处理完后还要赋值，因为后面还要用到
    let selected_week_date = this.getDateHandler(_schedule_data,temp)

    // 指向今天星期几
    let today= new Date();
    let point_day = today.getDay() == 0?7:today.getDay()

    // 其他的数据
    let hideweekend = true
    let hidelogin = 'none'
    let ban_hide = false

    // 数据初始化
    this.setData({
      hidelogin: hidelogin,
      hideweekend:hideweekend,
      ban_hide:ban_hide,
      weekarray:weekarray,
      selected_week_data:selected_week_data,
      selected_week:selected_week,
      today_week:today_week,
      point_day:point_day,
      selected_week_date:selected_week_date,
    })
  },

  // 没有缓存课表信息的处理
  notHaveScheduleCache(){

  },

  // 以下是工具函数

  // 周次选择后的数据重新绑定
  pickerChange(options){
    // 获取数据
    let selected_week = Number(options.detail) + 1
    let _schedule_data = this.data._schedule_data
    let temp = 'weektime' + selected_week
    
    // 处理日的数据
    let selected_week_date = this.getDateHandler(_schedule_data,temp)

    let selected_week_data = _schedule_data[temp]['data']
    // 数据绑定
    this.setData({
      selected_week:selected_week,
      selected_week_data:selected_week_data,
      selected_week_date:selected_week_date
    })
  },

  // 回到本周
  backWeek(options){
    // 获取数据
    let today_week = Number(options.detail)
    let _schedule_data = this.data._schedule_data
    let temp = 'weektime' + today_week

    // 处理日的数据
    let selected_week_date = this.getDateHandler(_schedule_data,temp)

    let selected_week_data = _schedule_data[temp]['data']
    
    // 数据绑定
    this.setData({
      today_week:today_week,
      selected_week_data:selected_week_data,
      selected_week:today_week,
      selected_week_date:selected_week_date
    })
  },
  
  // 处理月日数据，目前不需要月，只需要日
  processDate(selected_week_date){
    let day = []
    for(let idx in selected_week_date){
      let day_split = parseInt(selected_week_date[idx].split('-')[1])
      day.push(day_split)
    }
    return day
  },

  // 周末是否隐藏
  hideWeekend() {
    // 如果没有登录的话，这里的显示周末按钮是按不了的
    const ban_hide = this.data.ban_hide
    if(!ban_hide){
      let hideweekend = !this.data.hideweekend
      this.data.hideweekend = hideweekend
      
      let _schedule_date = deepClone(this.data._schedule_date)
      // 如果是隐藏周末，就要删除数据最后两个数据
      let selected_week_date = this.popTwoDate(hideweekend,_schedule_date)

      this.setData({
        hideweekend: hideweekend,
        selected_week_date:selected_week_date
      })
    }
  },

  // 获取数据的月日后，要处理该数据，目前不需要月，只需要日就可以了,处理完后还要赋值，因为后面还要用到
  getDateHandler(_schedule_data,temp){
    let selected_week_date = _schedule_data[temp]['date']
    let selected_week_date_handler = this.processDate(selected_week_date)
    // 把数据深拷贝下来，用来隐藏/显示周末
    this.data._schedule_date = deepClone(selected_week_date_handler)
    // 如果是隐藏周末，就要删除数据最后两个数据
    let hideweekend = this.data.hideweekend
    selected_week_date = this.popTwoDate(hideweekend,selected_week_date_handler)
    return selected_week_date
  },

  // 隐藏周末要删除周六日的日数
  popTwoDate(hideweekend,selected_week_date){
    if(hideweekend){
      selected_week_date.pop()
      selected_week_date.pop()
    }
    return selected_week_date
  }
})