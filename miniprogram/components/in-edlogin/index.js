import {htmlRequest} from "../../utils/html.js"
import {showLoading,getOpenid} from "../../utils/inside_api.js"
import {verifyFormIsNull} from "../../utils/utils.js"
import {setCacheSync} from "../../utils/cache.js"
import {screenHeight} from "../../utils/utils.js"

Component({
  properties: {
    swiperHeight: String,
    hidelogin: String,
  },

  data: {
    student_number: "",
    password: 0,
    swiperHeight:0,
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
    // 教务系统登录
    async login(e) {
      const can_in_edbrowser = await htmlRequest(['can_in_browser', 'GET']) // 判断能否进入教务系统
      if(can_in_edbrowser['error']){ // 不能进入教务系统的处理
        this.canNotInEdbrowserHandler('教务系统驾崩啦')
        return
      }
      // 能进入教务系统的处理
      this.canInEdbrowserHandler()
    },

    async canInEdbrowserHandler(){
      // 获取表单信息
      let student_number = this.data.student_number
      let password = this.data.password

      // 验证学号密码是否为空
      let input_error = verifyFormIsNull({'input':[student_number,password],'title':'学号或密码'})
      if(input_error){return}

      // 获取用户的openid
      let openid = getOpenid()

      showLoading("请稍等...")
      //发送登录的网络数据请求
      const result = await htmlRequest(['login', 'POST', {"account": student_number,"password": password,"openid":openid}]) 

      // 登录失败
      if(!result['status']){
        wx.hideLoading()
        this.loginFail('登录失败',result['message'])
        return
      }

      // 登录成功
      this.loginSuccess(student_number,password,result['cookies'])
    },

    // 不能进入教务系统
    canNotInEdbrowserHandler(title){
      wx.showToast({
        title: title,
        icon:'error'
      })
    },
    
    // 登录成功
    async loginSuccess(student_number,password,cookies){
      showLoading('登录成功！')
      // 缓存用户的cookies信息、教务系统的学号、密码
      setCacheSync('cookies',cookies)
      setCacheSync('student_number',student_number)
      setCacheSync('password',password)

      // 用cookies获取课表,并存入缓存
      const data = [{"account": student_number,"password": password},cookies]
      const schedule_cache = await htmlRequest(['schedule', 'POST', data])
      setCacheSync('schedule_cache',schedule_cache)

      // 刷新页面
      wx.switchTab({
        url: '../../pages/schedule/schedule',
        success: function(e) {
          var page = getCurrentPages().pop();
          if (page == undefined || page == null) return;
          page.onLoad();
        }
      })
      wx.hideLoading()
    },

    // 登录失败
    loginFail(title,message){
      wx.showModal({
        title: title,
        content: message,
        showCancel: false
      })
    },

    // 以下函数与登录的操作无关

    // 防止触摸穿透
    doNotMove() {
      return
    },
    // 获取表单信息
    getStudentNumber(e) {
      this.data.student_number = e.detail.value
    },
    getPassword(e) {
      this.data.password = e.detail.value
    }
  }
})