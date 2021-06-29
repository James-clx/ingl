Component({
  properties: {
    weekarray: Array,
    selected_week: Number,
    today_week :Number
  },

  data: {},

  methods: {
    //周次选择器
    pickerChange(e) {
      // 传递给外部的数据
      let selected_week = e.detail.value
      this.triggerEvent('pickerchange',selected_week)
    },
    //回到当前周次
    backWeek() {
      let today_week = this.data.today_week
      this.triggerEvent('backweek',today_week)
    },
  }
})