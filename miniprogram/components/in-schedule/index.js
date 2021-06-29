const app = getApp()

Component({
  properties: {
    hideweekend: Boolean,  // 是否隐藏周末
    selected_week_data: Array,  // 课表的数据
    point_day:Number,  // 指向今天的周次的星期数
    selected_week_date:Array
  },

  data: {
    // 课程详细信息相关数据
    show_class_message: 'none', // 控制课程详细信息的显示隐藏
    ccourse_info_target: {}, // 保存课程的详细信息

    schedule_go_class_time:[], // 上课节数和上课时间
  },
  attached(){
    let schedule_go_class_time = app.globalData.schedule_go_class_time
    this.setData({
      schedule_go_class_time:schedule_go_class_time
    })
  },
  methods: {
    showCardView(e){
      let course_info_all = e.currentTarget.dataset.info // 点击的课程的所有详细信息
      // 获取要显示的目标数据
      let course_target_data = this.getTargetCourseData(course_info_all)

      // 显示课程信息框
      let show_class_message = 'block'

      //初始化数据
      this.setData({
        show_class_message:show_class_message,
        course_info_target:course_target_data
      })  
    },
    getTargetCourseData(course_info_all){
      let course_target_data = {}
      course_target_data['course_name'] = course_info_all.course_name
      course_target_data['course_type'] = course_info_all.course_type
      course_target_data['class_location'] = course_info_all.class_location
      course_target_data['teacher_name'] = course_info_all.teacher_name
      return course_target_data
    }
  },
  pageLifetimes:{
  },
})