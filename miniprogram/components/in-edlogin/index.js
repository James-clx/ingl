import {htmlRequest} from "../../utils/html.js"
import {showLoading,getOpenid,refreshPage} from "../../utils/inside_api.js"
import {verifyFormIsNull} from "../../utils/utils.js"
import {setCacheSync} from "../../utils/cache.js"
import {screenHeight} from "../../utils/utils.js"
var getuserinfo = require('../../utils/inside_api.js')
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
      getuserinfo.getLoginOpenid()
      .then(res => {
        var openid = res
        //var loginschedule = htmlRequest(['access/login_schoolsys', 'POST',{openid}]) // 判断能否进入教务系统
        wx.request({
          url: 'https://www.inguangli.cn/ingl/api/access/login_schoolsys',
          method:'POST',
          data:{
            openid:openid
          },
          success(res){
            // console.log(res.data.data)
            if(res.data.data == 'false'){
              wx.showModal({
                title: '用户已被封禁，请前往我的页面联系IN广理管理员',
              })
              return;
            }
          },
          fail(res){
            console.log(res)
          }
        })
        var blocklogintime = wx.getStorageSync('blocklogintime')
        if(blocklogintime){
          var timestamp = Date.parse(new Date());  
          timestamp = timestamp / 1000;  
          console.log(timestamp); 
          if((timestamp - blocklogintime) < 300){
            wx.showModal({
              title: '错误次数过多，请五分钟后再试',
            })
            var loginpages = 'schedule'
            blockremind.sendremind(openid,loginpages,this.data.student_number)
            return;
          }else{
            wx.removeStorageSync('blocklogintime')
            wx.removeStorageSync('loginfailcount')
            wx.removeStorageSync('loginfailtime')
          }
        }
      })
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
      setCacheSync({'cookies':cookies,'student_number':student_number,'password':password,'schedule_cache':schedule_cache['data']})

      // 清空表单
      this.setData({
        student_number:"",
        password:""
      })

      wx.removeStorageSync('blocklogintime')
      wx.removeStorageSync('loginfailcount')
      wx.removeStorageSync('loginfailtime')
      
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
      refreshPage('../../pages/schedule/schedule')
      
      wx.hideLoading()
    },

    // 登录失败
    loginFail(title,message){
      var loginfailtime = wx.getStorageSync('loginfailtime')
      var loginfailcount = wx.getStorageSync('loginfailcount')
      if(!loginfailcount){
        wx.setStorageSync('loginfailcount', 1)
      }
      if(!loginfailtime){
        var timestamp = Date.parse(new Date());  
        timestamp = timestamp / 1000;  
        console.log(timestamp);  
        wx.setStorageSync('loginfailtime', timestamp)
      }
      if(message.slice(0,10) == '您的帐号或密码不正确' && loginfailcount < 5){
        var timestamp = Date.parse(new Date());  
        timestamp = timestamp / 1000;  
        console.log(timestamp);  
        if((timestamp-loginfailtime)<60){
          wx.setStorageSync('loginfailcount', loginfailcount + 1)
        }else{
          wx.setStorageSync('loginfailtime', timestamp)
          wx.setStorageSync('loginfailcount', 1)
        }
      }
      if(message.slice(0,10) == '您的帐号或密码不正确' && loginfailcount >= 5){
        var timestamp = Date.parse(new Date());  
        timestamp = timestamp / 1000;  
        console.log(timestamp);  
        wx.setStorageSync('blocklogintime', timestamp)
        wx.setStorageSync('loginfailcount', 0)
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