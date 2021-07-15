var util=require('../../utils/utils.js')
var gettime=require('../../utils/times.js')
var check = require('../../utils/check.js')
import{cloudDownLoad}from"../../utils/cloud.js"
const app=getApp()
const db=wx.cloud.database()
const _ = db.command
let info=''//发布推文页面输入框数据
let imgurl=''
let avatarurl=''
let nickname=''
let gender=''
let pushinput=''//评论内容
var isPreview
let checkname = true
let checkinput = true

Page({
  /**
   * 页面的初始数据
   */
  data: {
    history:[],
    toppostlist:[],
    postlist:[],//推文数组
    likelist:[],//点赞数组
    mylikelist:[],//用户点赞数组
    showlikelist:[],//是否显示已点赞
    userInfo: {},//用户信息
    getuser:[],//数据库账号信息
    hasUserInfo: false,//缓存是否有用户信息
    canIUseGetUserProfile: false,//是否可以获取用户权限
    showTalklogin :'block',//页面展示信息授权模态框
    showinputpage:'block',//上传信息按钮
    showinputinfo:'none',//上传信息页面
    filter:'0rpx',//主页面模糊
    iforumlength:'',//推文集合长度
    iforumcount:7,//推文显示条数
    openid:'',//用户openid
    nickName : '',//用户名称
    avatarUrl : '',//用户头像
    times:'',//上传推文时间
    inputclean:'',//清空评论框数据
    userblock: '',//全局变量
    dbhasuser:'',
    touchStartTime: 0,// 触摸开始时间
    touchEndTime: 0,  // 触摸结束时间
    lastTapTime: 0, // 最后一次单击事件点击发生时间
    lastTapTimeoutFunc: null,// 单击事件点击后要触发的函数
    loadModal:false,
    //匿名发布
    setunname: false,
    changename: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
 
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this;//将this另存为
    var isPreview
    var history
    wx.hideLoading()
    wx.cloud.callFunction({
      name:'getOpenid',
      complete:res=>{
        var openid = res.result.openid
        that.setData({
          openid:openid,
          loadModal: true,
        })
        //获取置顶说说
        wx.cloud.callFunction({
          name: 'gettoppost',
          key: 'toppostlist',
          complete: res => {
            that.setData({
              toppostlist:res.result.data
            })
          }
        })

        //获取点赞列表
        wx.cloud.callFunction({
          name: 'getlike',
          key: 'likelist',
          complete: res => {
            that.setData({
              likelist:res.result.data
            })
          }
        })

        //获取用户点赞列表
        wx.cloud.callFunction({
          name: 'getmylike',
          key: 'mylikelist',
          data:{
            userid:that.data.openid
          },
          complete: res => {
            that.setData({
              mylikelist:res.result.data
            })
          }
        })

        //设置点击事件不刷新页面
        if(that.data.isPreview){
          isPreview=false
          return;
        }
        //获取全部缓存
        wx.getStorageInfo({
          success(res) {
            history=res.keys
          },
        })
        var userpostimglist = new Array();
        //获取数据条数
        db.collection('iforum').count({
          success(res) {
            that.setData({
              iforumlength:res.total
            })
            //调用云函数从数据库获取论坛数据
            wx.cloud.callFunction({
              name: 'getallpost',//云函数名
              key: 'postlist',
              data:{
                lim:that.data.iforumlength,
                pass:that.data.iforumcount
              },
              async complete(res){
                for(var i=that.data.iforumcount;i<res.result.data.length;i++){
                  if(res.result.data[i].imgurl) {//判断有无图片信息
                    const userpostimg = await cloudDownLoad('',[res.result.data[i].imgurl])//调用缓存app.js
                    userpostimglist.push(userpostimg)//将图片缓存信息存入数组
                  }else{
                    continue;
                  }
                }
                for(var i=0;i<res.result.data.length;i++){
                  if(userpostimglist[i]) {//判断有无图片信息
                    res.result.data[i].imgurl = userpostimglist[i]//使用缓存的url替换本地图片url
                    // console.log(userpostimglist[i])
                  }else{
                    continue;
                  }
                }
                that.setData({
                  isPreview:isPreview,
                  history:history,
                  inputclean: '',
                  //倒序存入数组
                  postlist:res.result.data.reverse()
                });
                pushinput=''
                
                var showlikelist = new Array()
                for(var i=0;i<that.data.postlist.length;i++){
                  var showlike
                  for(var j=0;j<that.data.mylikelist.length;j++){
                    if(that.data.postlist[i]._id == that.data.mylikelist[j].likeid && that.data.mylikelist[j].userid == that.data.openid){
                      showlike=false
                      break;
                    }else{
                      showlike=true
                    }
                  }
                  showlikelist.push(showlike)
                }
                that.setData({
                  showlikelist:showlikelist,
                  loadModal: false
                })
              }
            })
          }
        })
        //检查后台有无用户信息，下次进入时继续调用此判断
        that.setData({
          userInfo : wx.getStorageSync('userInfo',that.data.userInfo),
          hasUserInfo : wx.getStorageSync('hasUserInfo',that.data.hasUserInfo),
          avatarurl : wx.getStorageSync('avatarurl',avatarurl),
          nickname : wx.getStorageSync('nickname',nickname)
        })
        avatarurl = wx.getStorageSync('avatarurl',avatarurl)
        nickname = wx.getStorageSync('nickname',nickname)
        wx.cloud.callFunction({
          name: 'getuser',
          key: 'getuser',
          complete: res => {
            for(var i=0;i<res.result.data.length;i++){
              if(this.data.openid == res.result.data[i]._openid && res.result.data[i].block == 'true'){
                wx.showModal({
                  title: '用户已被封禁',
                  content: '申诉请前往IN广理公众号,在后台回复申诉即可',
                  showCancel:false
                })
                that.setData({
                  userblock : 'true',
                  dbhasuser : 'true'
                })
                break;
              }else if(this.data.openid == res.result.data[i]._openid && res.result.data[i].block != 'true'){
                that.setData({
                  userblock : 'false',
                  dbhasuser : 'true'
                })
                break;
              }else{
                that.setData({
                  userblock : 'false',
                  dbhasuser : 'false'
                })
              }
            }
            if(that.data.hasUserInfo == '' || that.data.dbhasuser == 'false'){
              console.log(that.data.dbhasuser)
              wx.showModal({//模态框确认获取用户数据
                showCancel:false,
                title: '提示',
                content: 'IOS端手机可能会出现样式错乱 \n如遇到此情况请更新手机系统',
                success (res) {//确认授权后修改后端数据
                  if (res.confirm) {
                    wx.getUserProfile({
                      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                      success: (res) => {//获取用户数据
                        if(that.data.dbhasuser == 'false'){
                          db.collection("iuser").add({//添加到数据库
                            data:{
                              avatarurl:res.userInfo.avatarUrl,
                              nickname:res.userInfo.nickName,
                              country:res.userInfo.country,
                              city:res.userInfo.city,
                              gender:res.userInfo.gender,
                              block:that.data.userblock
                            }
                          })
                          console.log('add')
                        }
                        avatarurl = res.userInfo.avatarUrl
                        nickname = res.userInfo.nickName
                        that.setData({
                          userInfo: res.userInfo,
                          hasUserInfo: true,
                          showTalklogin : 'none',
                          canIUseGetUserProfile: true
                        })
                        wx.setStorageSync('userInfo', that.data.userInfo)
                        wx.setStorageSync('hasUserInfo', that.data.hasUserInfo)
                        wx.setStorageSync('avatarurl', avatarurl)
                        wx.setStorageSync('nickname', nickname)
                      },
                      fail: (res) =>{//拒绝后返回功能页面
                        console.log('false')
                        wx.switchTab({
                          url: '/pages/funct/funct'
                        })
                      }
                    })
                  }
                }
              })
            }
          }
        })
      }
    })
    console.log(that.data)
  },

  touchStart: function(e) {
    this.touchStartTime = e.timeStamp
  },

  touchEnd: function(e) {
    this.touchEndTime = e.timeStamp
  },

  totalkinfo:function(e){
    var that = this
    // 当前点击的时间
    var currentTime = e.timeStamp
    var lastTapTime = that.lastTapTime
    // 更新最后一次点击时间
    that.lastTapTime = currentTime
    
    // 如果两次点击时间在250毫秒内，则认为是双击事件
    if (currentTime - lastTapTime < 250) {
      // 成功触发双击事件时，取消单击事件的执行
      clearTimeout(that.lastTapTimeoutFunc);
      // 判断说说的点赞状态
      if(e.currentTarget.dataset.likestate == true){
        that.likeadd(e)
      }else{
        that.likeminuus(e)
      }
      
    } else {
      // 单击事件延时250毫秒执行，这和最初的浏览器的点击250ms延时有点像。
      that.lastTapTimeoutFunc = setTimeout(function () {
        var postid = e.currentTarget.dataset.id
        wx.navigateTo({
          url:'../talkinfo/talkinfo?postid='+postid
        })
      }, 250);
      db.collection("iforum").doc(e.currentTarget.dataset.id).update({//添加到数据库
        data:{
          hot:e.currentTarget.dataset.hot+1
        }
      })
    }
  },

  //点赞功能
  likeadd:function(e){
    console.log(e)
    console.log(e.currentTarget.dataset.id)
    console.log(this.data.openid)
    //获取用户点赞列表
    wx.cloud.callFunction({
      name: 'getlikecount',
      data:{
        likeid:e.currentTarget.dataset.id
      },
      complete: res => {
        console.log(res)
        db.collection("iforum").doc(e.currentTarget.dataset.id).update({//添加到数据库
          data:{
            likecount:res.result.data.length+1
          }
        })
        db.collection("ilike").add({//添加到数据库
          data:{
            postuser:e.currentTarget.dataset.openid,
            likeid:e.currentTarget.dataset.id,
            userid:this.data.openid
          }
        })
        var that = this
        //重新抓取推文列表
        that.onShow()
      }
    })
    
    wx.showToast({
      title:"点赞成功",
      image: '/images/like.png',
    })
  },

    //取消点赞功能
    likeminuus:function(e){
      console.log(e.currentTarget.dataset.id+'delete')
      console.log(this.data.openid)
      //获取用户点赞列表
      wx.cloud.callFunction({
        name: 'getlikecount',
        data:{
          likeid:e.currentTarget.dataset.id
        },
        complete: res => {
          console.log(res)
          db.collection("iforum").doc(e.currentTarget.dataset.id).update({//添加到数据库
            data:{
              likecount:res.result.data.length-1
            }
          })
          db.collection("ilike")//添加到数据库
          .where({
            postuser:e.currentTarget.dataset.openid,
            likeid:e.currentTarget.dataset.id,
            userid:this.data.openid
          })
          .remove()
          .then(res => {
            var that = this
            //重新抓取推文列表
            that.onShow()
          })
        }
      })
      wx.showToast({
        title:"取消点赞",
        image: '/images/like.png',
      })
    },

  openinputpage:function(){//打开上传信息页面
    this.setData({
      times:gettime.formatTimes(new Date()),
      filter:'5rpx',
      showinputpage:'none',//隐藏打开页面按钮
      showinputinfo:'block',//打开上传信息页面
    })
  },

  //长按删除图片
  deleteImage: function(){
    var that = this;
    wx.showModal({
      title: '确认删除',
      content: '',
      success: function (res) {
        if (res.confirm) {
          that.data.Img.splice;
        }
        else if (res.cancel) {
          return false;    
        }
        that.setData({
          Img:""
        });
      }
    })
  },

  //选择图片
  previewImage: function(){
    var that = this;
    console.log(that.data.Img)
    wx.previewImage({
      current: that.data.Img1,
      urls:that.data.Img,
    })
  },

  //发布推文页面输入框数据
  handleinfo:function(event){
    info=event.detail.value
    check.checktext(event.detail.value)
    .then(res => {
      console.log(res)
      checkinput = res
    })
  },
  
  //上传图片
  chooseImage:function(){
    var that=this;
    wx.chooseImage({
      count: 1,
      success:function(res) {
        console.log(res.tempFilePaths[0])
        imgurl = res.tempFilePaths[0]
        that.setData({
          Img:res.tempFilePaths,
          Img1:res.tempFilePaths[0],
          imageInfo:""
        })
      }
    })
  },

  //设置是否匿名
  setunname(e) {
    this.setData({
      setunname : e.detail.value
    })
  },

  //改名
  changename:function(event){
    this.setData({
      changename:event.detail.value
    })
    check.checktext(event.detail.value)
    .then(res => {
      console.log(res)
      checkname = res
    })
  },

  //确认按钮，上传数据库
  upload:function(){
    console.log(this.data.userblock)
    if (this.data.userblock == 'true') {
      wx.showToast({
        title:"用户已被封禁",
        image: '/images/fail.png',
      })
      return;
    }else{          
      wx.showLoading({
        title: '上传中',
      })
      if(info == ''&&imgurl == ''){
        wx.hideLoading()
        wx.showToast({
          title:"不能什么都不写哦",
          image: '/images/fail.png',
        })
        return;
      }
      if(checkname == false || checkinput == false){
        wx.showToast({
          icon: 'none',
          title: '文字违规',
        })
        return;
      }
      //上传图片文件到数据库(有图片)
      var times = this.data.times
      var name = nickname
      var userurl = avatarurl
      if(this.data.setunname == true){
        name = this.data.changename
        userurl = "cloud://user-1go7hmfiae35dce5.7573-user-1go7hmfiae35dce5-1306031834/admin/unname.png"
      }
      console.log(imgurl)
      if(imgurl){
        wx.cloud.uploadFile({
          cloudPath: 'userpost/'+nickname+'/'+times, // 上传至云端的路径
          filePath: imgurl, // 小程序临时文件路径
          success: res => {//上传云端成功后向数据库添加记录
            // 返回文件 ID
            console.log(res.fileID+'success')
            var posturl = res.fileID
            db.collection("iaudit").add({//添加到数据库
              data:{
                info:info,
                imgurl:posturl,
                pushtime:gettime.formatTime(new Date()),
                avatarurl:userurl,
                nickname:name,
                gender:gender,
                likecount:0,
                hot:0,
                commentcount:0,
                reject:false
              }
            })
            wx.hideLoading()
            wx.showLoading({
              title: '刷新中',
            })
            //重新抓取推文列表
            this.onShow()
            this.setData({
              //倒序存入数组
              Img:"",
              info:'',
              //发布后关闭发布页面
              filter:'0rpx',
              showinputinfo:'none',//打开上传信息页面
              showinputpage:'block',//隐藏打开页面按钮
            });
            imgurl=''
            wx.showToast({
              title:"投稿成功，已提交审核",
            })
          },
          fail: console.error//执行失败报错
        })
      }else{//没有上传图片
        db.collection("iaudit").add({//添加到数据库
          data:{
            info:info,
            pushtime:gettime.formatTime(new Date()),
            avatarurl:userurl,
            nickname:name,
            gender:gender,
            likecount:0,
            hot:0,
            commentcount:0,
            reject:false
          }
        })
        //重新抓取推文列表
        this.onShow()
        this.setData({
          //倒序存入数组
          Img:"",
          info:'',
          //发布后关闭发布页面
          filter:'0rpx',
          showinputinfo:'none',//打开上传信息页面
          showinputpage:'block',//隐藏打开页面按钮
        });
        //清空图片数组
        imgurl='',
        wx.showToast({
          title:"投稿成功，已提交审核",
        })
      }
    }
  },
  //关闭页面
  close:function(){
    this.setData({
      info:'',
      Img:"",
      filter:'0rpx',
      showinputinfo:'none',//打开上传信息页面
      showinputpage:'block',//隐藏打开页面按钮
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh:function(){
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.onShow()
  //模拟加载
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.iforumlength<this.data.iforumcount+7 && this.data.iforumlength>this.data.iforumcount){
      this.setData({
        iforumcount:this.data.iforumlength
      })
      this.onShow()
    }else if(this.data.iforumlength<this.data.iforumcount+7){
      wx.showToast({
        title:"到底啦",
      })
    }else{
      this.setData({
        iforumcount:this.data.iforumcount+7
      })
      this.onShow()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '理工说说',
      path: '/pages/talk/talk', // 点击访问的页面
      imageUrl: '',     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。
    }
  }
})