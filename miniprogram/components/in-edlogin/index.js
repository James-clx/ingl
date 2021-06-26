import {htmlRequest} from "../../utils/html.js"
import {showLoading} from "../../utils/inside_api.js"

Component({
  properties: {
    swiperHeight: String,
    hidelogin: String,
  },

  data: {
    student_number: "",
    password: 0
  },

  methods: {
    // 防止触摸穿透
    doNotMove() {
      return
    },
    // 获取表单信息
    getStudentNumber(e) {
      this.student_number = e.detail.value
    },
    getPassword(e) {
      this.password = e.detail.value
    },
    // 登录逻辑处理
    async login(e) {
      let student_number = this.student_number
      let password = this.password
      if (student_number && password) {
        //发送登录的网络数据请求
        showLoading('请稍等')
        const result = await htmlRequest(['login', 'POST', {
          "account": student_number,
          "password": password
        }])
        wx.hideLoading()
        if (result['status']) {
          //登录成功
        } else {
          //登录失败
          wx.showModal({
            title: '登陆失败',
            content: result['message'],
            showCancel: false
          })
        }
      }else{
        wx.showToast({
          title: '学号或密码为空',
          icon: 'error',
          duration: 2000
        })
      }
    }
  }
})