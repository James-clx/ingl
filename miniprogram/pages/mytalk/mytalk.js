import{cloudDownLoad}from"../../utils/cloud.js"
const app=getApp()
const db=wx.cloud.database()
const _ = db.command
let avatarurl=''
let nickname=''
var isPreview
Page({

  /**
   * 页面的初始数据
   */
  data: {
    postlist:[],//推文数组
    mylikelist:[],//用户点赞数组
    showlikelist:[],//是否显示已点赞
    //auditpostlist:[],//审核中推文数组
    likecount:0,
    userInfo: {},//用户信息
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    iforumlength:'',//推文集合长度
    iforumcount:7,//推文显示条数
    openid:'',//用户openid
    nickName : '',//用户名称
    avatarUrl : '',//用户头像
    inputclean:'',
    shownothing:'none',
    userblock:'',
    isadmin:false,
    loadModal: false
  },

 /**
   * 生命周期函数--监听页面显示
   */
  async onLoad (options) {
    this.setData({
      userblock:options.userblock
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow() {
    wx.hideLoading()
    let that = this;//将this另存为
    var canIUseGetUserProfile
    //设置点击事件不刷新页面
    if (wx.getUserProfile) {//修改后台用户数据为真
      canIUseGetUserProfile= true
    }

    if(that.data.isPreview){
      isPreview=false
      return;
    }
    wx.cloud.callFunction({
      name:'getOpenid',
      complete:res=>{
        var openid = res.result.openid
        that.setData({
          userInfo : wx.getStorageSync('userInfo',that.data.userInfo),
          hasUserInfo : wx.getStorageSync('hasUserInfo',that.data.hasUserInfo),
          avatarurl : wx.getStorageSync('avatarurl',avatarurl),
          nickname : wx.getStorageSync('nickname',nickname),
          loadModal: true,
          canIUseGetUserProfile: true,
          getcommentlist:res.result.data,
          isPreview:false,
          openid:openid
        })
        //查看是否管理员
        wx.cloud.callFunction({
          name: 'getadmin',
          key: 'isadmin',
          complete: res => {
            var isadmin = false
            for(var i=0;i<res.result.data.length;i++){
              if(that.data.openid == res.result.data[i].useropenid){
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
        //     openid:that.data.openid
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
          _openid:that.data.openid
        })
        .count({
          success(res) {
            if(res.total<=7&&res.total>0){
              that.setData({
                iforumlength:res.total,
                iforumcount:res.total,
                shownothing:'none'
              })
            }else if(res.total>7){
              that.setData({
                iforumlength:res.total,
                shownothing:'none'
              })
            }else{
              console.log('1')
              that.setData({
                shownothing:'block'
              })
              return;
            }
            //获取用户点赞列表
            wx.cloud.callFunction({
              name: 'getmylike',
              key: 'mylikelist',
              data:{
                userid:that.data.openid
              },
              complete: res => {
                that.setData({
                  likecount:res.result.data.length,
                  mylikelist:res.result.data
                })
                //调用云函数从数据库获取论坛数据
                wx.cloud.callFunction({
                  name: 'getmypost',//云函数名
                  key: 'postlist',
                  data:{
                    openid:that.data.openid,
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
                      //倒序存入数组
                      postlist:res.result.data.reverse()
                    });

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
      url:'../talkinfo/talkinfo?postid='+postid+'&userblock='+this.data.userblock
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
            likecount:res.result.data.length+Math.ceil(Math.random()*4)
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
      mask:true,
      title:"点赞成功",
      image: '/images/like.png',
    })
  },

  //取消点赞功能
  likeminuus:function(e){
    wx.vibrateShort({type:"heavy"})
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
      mask:true,
      title:"取消点赞",
      image: '/images/like.png',
    })
  },



  onPullDownRefresh:function(){
    wx.vibrateShort({type:"heavy"})
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
      _openid:this.data.openid
    })
    .remove()
  },

  onUnload: function(){
    this.onHide()
  }
})