import {screenHeight} from "../../utils/utils.js"

Component({
  properties: {
    show_class_message:String, // 控制课程详细信息的显示隐藏
    course_info_target:Object,
  },

  data: {
    screen_height: 0, // 框高
  },
  async attached(){
    // 框高
    let screen_height = await screenHeight()
    // 初始化数据
    this.setData({
      swiperHeight: screen_height,
    })
  },

  methods: {
    hideMask(){
      this.setData({
        show_class_message: "none"
      })
    }
  }
})
