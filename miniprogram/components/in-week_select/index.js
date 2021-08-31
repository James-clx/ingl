Component({
  properties: {
    weekarray: Array,
    selected_week: Number,
    today_week :Number
  },

  data: {
    swiperHeight:0
  },

  attached() {

    wx.getSystemInfo({
      success:(res) => {
        let clientHeight = res.windowHeight
        let clientWidth = res.windowWidth
        let ratio = 750 / clientWidth;//计算为百分比
        let rpxHeight = ratio * clientHeight - 420
        this.setData({
          swiperHeight: rpxHeight
        })
      }
    })
  },

  methods: {
    //周次选择器
    onPickerChange(e) {
      // 传递给外部的数据
      let selected_week = Number(e.detail.value) + 1
      this.triggerEvent('pickerorbackweek',selected_week)
    },
    //回到当前周次
    backWeek() {
      let today_week = this.data.today_week
      this.triggerEvent('pickerorbackweek',today_week)
    },
  }
})