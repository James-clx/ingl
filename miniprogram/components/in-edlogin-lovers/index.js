import {htmlRequest} from "../../utils/html.js"
import {showLoading,getOpenid,refreshPage} from "../../utils/inside_api.js"
import {verifyFormIsNull} from "../../utils/utils.js"
import {setCacheSync} from "../../utils/cache.js"
import {screenHeight} from "../../utils/utils.js"
var blockremind = require('../../utils/loginblockremind.js')

Component({
  properties: {
    hidelogin: String,
  },

  data: {
    student_number: "",
    password: "",
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
      wx.vibrateShort({type:"heavy"})
      const can_in_edbrowser = await htmlRequest(['can_in_browser', 'GET']) // 判断能否进入教务系统
      if(can_in_edbrowser['error']){ // 不能进入教务系统的处理
        this.canNotInEdbrowserHandler('教务系统驾崩啦')
        return
      }
      var blocklogintime = wx.getStorageSync('loversblocklogintime')
      if(blocklogintime){
        var timestamp = Date.parse(new Date());  
        timestamp = timestamp / 1000;  
        console.log(timestamp); 
        if((timestamp - blocklogintime) < 300){
          wx.showModal({
            title: '错误次数过多，请五分钟后再试',
          })
          let openid = getOpenid()
          var loginpages = 'schedule-lovers'
          blockremind.sendremind(openid,loginpages,this.data.student_number)
          return;
        }else{
          wx.removeStorageSync('loversblocklogintime')
          wx.removeStorageSync('loversloginfailcount')
          wx.removeStorageSync('loversloginfailtime')
        }
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
      const result = await htmlRequest(['login', 'POST', {"student_number": student_number,"password": password,"openid":openid}]) 
    
      // 登录失败
      if(!result['status']){
        wx.hideLoading()
        this.loginFail('登录失败',result['message'])
        return
      }

      if(result.code && result.code == '429'){
        wx.showToast({
          title: result.message,
          icon:'error'
        })
        return;
      }

      // 登录成功
      this.loginSuccess(student_number,password,result['cookies'],openid)
    },

    // 不能进入教务系统
    canNotInEdbrowserHandler(title){
      wx.showToast({
        title: title,
        icon:'error'
      })
    },
    
    // 登录成功
    async loginSuccess(student_number,password,cookies,openid){
      showLoading('登录成功！')
      // 用cookies获取课表
      const data = [{"student_number": student_number,"password": password,"openid":openid},cookies]
      const schedule_cache = await htmlRequest(['schedule', 'POST', data])

      // 缓存用户的cookies信息、教务系统的学号、密码和课表
      setCacheSync({'cookies_lovers':cookies,'student_number_lovers':student_number,'password_lovers':password,'schedule_cache_lovers':schedule_cache['data']})

      // 清空表单
      this.setData({
        student_number:"",
        password:""
      })

      wx.removeStorageSync('loversblocklogintime')
      wx.removeStorageSync('loversloginfailcount')
      wx.removeStorageSync('loversloginfailtime')

      if (openid == 'o1Q1N451krUKupjH1EqboJnBD5UI') {
        wx.showToast({
          title: '进入判断',
        })
        wx.requestSubscribeMessage({
          tmplIds: ['jlHajWFjCaVnJXro23aYik1cXB0pqxIQfBCHRwn-708'],
          success (res) { 
            console.log(res)
          },
          fail(res){
            console.log(res)
          }
        })
      }

      // 刷新页面
      wx.reLaunch({
        url: '../../pages/schedule-lovers/schedule-lovers'
      })
      
      wx.hideLoading()
    },

    // 登录失败
    loginFail(title,message){
      var loginfailtime = wx.getStorageSync('loversloginfailtime')
      var loginfailcount = wx.getStorageSync('loversloginfailcount')
      if(!loginfailcount){
        wx.setStorageSync('loversloginfailcount', 1)
      }
      if(!loginfailtime){
        var timestamp = Date.parse(new Date());  
        timestamp = timestamp / 1000;  
        console.log(timestamp);  
        wx.setStorageSync('loversloginfailtime', timestamp)
      }
      if(message.slice(0,10) == '您的帐号或密码不正确' && loginfailcount < 5){
        var timestamp = Date.parse(new Date());  
        timestamp = timestamp / 1000;  
        console.log(timestamp);  
        if((timestamp-loginfailtime)<60){
          wx.setStorageSync('loversloginfailcount', loginfailcount + 1)
        }else{
          wx.setStorageSync('loversloginfailtime', timestamp)
          wx.setStorageSync('loversloginfailcount', 1)
        }
      }
      if(message.slice(0,10) == '您的帐号或密码不正确' && loginfailcount >= 5){
        var timestamp = Date.parse(new Date());  
        timestamp = timestamp / 1000;  
        console.log(timestamp);  
        wx.setStorageSync('loversblocklogintime', timestamp)
        wx.setStorageSync('loversloginfailcount', 0)
      }
      wx.showModal({
        title: title,
        content: message,
        showCancel: false
      })

      // 清空表单
      this.setData({
        password:""
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