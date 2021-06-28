// components/in-week_select/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    weekarray: [],

  },

  /**
   * 组件的方法列表
   */
  methods: {
    //周次选择器
    bindPickerChange(e) {
      this.setData({
        todayweek: e.detail.value
      })
    },
    //回到当前周次
    backweek() {
      this.setData({
        todayweek: this.data.backweek
      })
    },
  }
})