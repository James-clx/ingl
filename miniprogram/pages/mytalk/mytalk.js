import{cloudDownLoad}from"../../utils/cloud.js"
var like = require('../../utils/like.js')
const app=getApp()
const db=wx.cloud.database()
const _ = db.command
let userblock
let openid
let iforumcount = 7//推文显示条数
let mylikelist = []//用户点赞数组

Page({

  /**
   * 页面的初始数据
   */
  data: {
    postlist:[],//推文数组    
    showlikelist:[],//是否显示已点赞
    //auditpostlist:[],//审核中推文数组
    likecount:0,
    userInfo: {},//用户信息
    shownothing:'none',
    isadmin:false,
    loadModal: false,
    iforumlength : ''//推文集合长度
  },

 /**
   * 生命周期函数--监听页面显示
   */
  async onLoad (options) {
    userblock = options.userblock
  },

  onReady: function() {
    this.setData({
      loadModal: true
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow() {
    wx.hideLoading()
    let that = this;//将this另存为
    //设置点击事件不刷新页面
    wx.cloud.callFunction({
      name:'getOpenid',
      complete:res=>{
        openid = res.result.openid
        that.setData({
          userInfo : wx.getStorageSync('userInfo',that.data.userInfo),
          getcommentlist:res.result.data
        })
        //查看是否管理员
        wx.cloud.callFunction({
          name: 'getadmin',
          key: 'isadmin',
          complete: res => {
            var isadmin = false
            for(var i=0;i<res.result.data.length;i++){
              if(openid == res.result.data[i].useropenid){
                isadmin = true
                break;
              }
            }
            that.setData({
              isadmin:isadmin
            })
          }
        })

        

        //获取审核中的说说
        // wx.cloud.callFunction({
        //   name: 'getmyauditpost',
        //   key: 'auditpostlist',
        //   data:{
        //     openid:openid
        //   },
        //   complete: res => {
        //     console.log(res.result.data)
        //     that.setData({
        //       auditpostlist:res.result.data
        //     })
        //   }
        // })   
      
        var userpostimglist = new Array();
        db.collection('iforum')
        .where({
          _openid:openid
        })
        .count({
          success(res) {
            if(res.total<=7&&res.total>0){
              iforumcount = res.total
              that.setData({
                iforumlength : res.total,
                shownothing:'none'
              })
            }else if(res.total>7){
              that.setData({
                iforumlength : res.total,
                shownothing:'none'
              })
            }else{
              console.log('1')
              that.setData({
                shownothing:'block',
                loadModal: false,
                iforumlength:0
              })
              return;
            }
            //获取用户点赞列表
            wx.cloud.callFunction({
              name: 'getmylike',
              key: 'mylikelist',
              data:{
                userid:openid
              },
              complete: res => {
                mylikelist = res.result.data
                that.setData({
                  likecount:res.result.data.length
                })
                //调用云函数从数据库获取论坛数据
                wx.cloud.callFunction({
                  name: 'getmypost',//云函数名
                  key: 'postlist',
                  data:{
                    openid:openid,
                    lim:that.data.iforumlength,
                    pass:iforumcount
                  },
                  async complete(res){
                    for(var i=iforumcount;i<res.result.data.length;i++){
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
                      //倒序存入数组
                      postlist:res.result.data.reverse()
                    });

                    var showlikelist = new Array()
                    for(var i=0;i<that.data.postlist.length;i++){
                      var showlike
                      for(var j=0;j<mylikelist.length;j++){
                        if(that.data.postlist[i]._id == mylikelist[j].likeid && mylikelist[j].userid == openid){
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
          }
        })
      }
    })
  },

  //置顶推文
  settop:function(e){
    wx.vibrateShort({type:"heavy"})
    console.log(e.detail.value)
    console.log(e.currentTarget.dataset.id)
    db.collection("iforum").doc(e.currentTarget.dataset.id).update({
      data:{
        settop:e.detail.value
      }
    })
  },

  //删除已发布推文
  deletepost:function(e){
    wx.vibrateShort({type:"heavy"})
    let that = this;//将this另存为
    wx.showModal({
      title: '确认删除',
      content: '确认删除后不能恢复',
      success: function (res) {
        if (res.confirm) {
          db.collection('iforum')
          .where({
            _id:e.currentTarget.dataset.id
          })
          .remove()
          wx.showToast({
            title:"删除成功",
          })
          //重新抓取推文列表
          that.onShow()
        }
        
        else if (res.cancel) {
          return false;    
        }
      }
    })
  },

    //删除审核中推文
    deleteauditpost:function(e){
      wx.vibrateShort({type:"heavy"})
      let that = this;//将this另存为
      wx.showModal({
        title: '确认删除',
        content: '确认删除后不能恢复',
        success: function (res) {
          if (res.confirm) {
            db.collection('iaudit')
            .where({
              _id:e.currentTarget.dataset.id
            })
            .remove()
            wx.showToast({
              title:"删除成功",
            })
            //重新抓取推文列表
            that.onShow()
          }
          
          else if (res.cancel) {
            return false;    
          }
        }
      })
    },

  totalkinfo:function(e){
    var postid = e.currentTarget.dataset.id
    wx.navigateTo({
      url:'../talkinfo/talkinfo?postid='+postid+'&userblock='+userblock
    })
    db.collection("iforum").doc(e.currentTarget.dataset.id).update({//添加到数据库
      data:{
        hot:e.currentTarget.dataset.hot+Math.ceil(Math.random()*4)
      }
    })
  },

  shownothing:function(){
    wx.switchTab({
      url: '/pages/talk/talk'
    })
  },

  //点赞功能
  likeadd:function(e){
    wx.vibrateShort({type:"heavy"})
    //先改变图标
    var add = "showlikelist[" + e.currentTarget.dataset.num + "]"//重点在这里，组合出一个字符串
    this.setData({
      [add]: false//用中括号把str括起来即可
    })
    //再更新数据
    like.utillikeadd(e.currentTarget.dataset.id,e.currentTarget.dataset.openid,openid)
    .then(res => {
      var that = this
      that.onShow()
    })
    wx.showToast({
      mask:true,
      title:"点赞成功",
      image: '/images/like.png',
    })
  },

  //取消点赞功能
  likeminuus:function(e){
    wx.vibrateShort({type:"heavy"})
    //先改变图标
    var add = "showlikelist[" + e.currentTarget.dataset.num + "]"//重点在这里，组合出一个字符串
    this.setData({
      [add]: true//用中括号把str括起来即可
    })
    //再更新数据
    like.utillikeminuus(e.currentTarget.dataset.id,e.currentTarget.dataset.openid,openid)
    .then(res => {
      var that = this
      that.onShow()
    })
    wx.showToast({
      mask:true,
      title:"取消点赞",
      image: '/images/like.png',
    })
  },

  onPullDownRefresh:function(){
    wx.vibrateShort({type:"heavy"})
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.setData({
      loadModal: true
    })
    this.onShow()
  //模拟加载
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.iforumlength<iforumcount+7 && this.data.iforumlength>iforumcount){
      this.setData({
        loadModal: true
      })
      iforumcount = iforumlength
      this.onShow()
    }else if(this.data.iforumlength<iforumcount+7){
      wx.showToast({
        title:"到底啦",
      })
    }else{
      this.setData({
        loadModal: true
      })
      iforumcount = iforumcount+7
      this.onShow()
    }
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  //   return {
  //     title: '我的说说',
  //     path: '/pages/mytalk/mytalk', // 点击访问的页面
  //     imageUrl: '',     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。
  //   }
  // },

  onHide: function() {
    db.collection('iaudit')
    .where({
      reject:true,
      _openid:openid
    })
    .remove()
  },

  onUnload: function(){
    this.onHide()
  }
})