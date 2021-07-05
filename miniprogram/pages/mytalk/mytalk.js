var util=require('../../utils/utils.js')
var gettimes=require('../../utils/times.js')
import{cloudDownLoad}from"../../utils/cloud.js"
const app=getApp()
const db=wx.cloud.database()
const _ = db.command
let avatarurl=''
let nickname=''
let pushinput=''//评论内容
var isPreview
Page({

  /**
   * 页面的初始数据
   */
  data: {
    getcommentlist:[],//获取评论列表
    postlist:[],//推文数组
    likelist:[],//点赞数组
    mylikelist:[],//用户点赞数组
    showlikelist:[],//是否显示已点赞
    likecount:0,
    userInfo: {},//用户信息
    getuser:[],//数据库账号信息
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    showTalklogin :'block',//页面展示信息授权模态框
    iforumlength:'',//推文集合长度
    iforumcount:7,//推文显示条数
    openid:'',//用户openid
    nickName : '',//用户名称
    avatarUrl : '',//用户头像
    inputclean:'',
    shownothing:'none',
    dbhasuser:'',
    userblock:''
  },

 /**
   * 生命周期函数--监听页面显示
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow() {
    let that = this;//将this另存为
    var canIUseGetUserProfile
    var getcommentlist
    var likecount
    var likelist
    var isPreview
    //设置点击事件不刷新页面
    if (wx.getUserProfile) {//修改后台用户数据为真
      canIUseGetUserProfile= true
    }
    //获取评论列表
    wx.cloud.callFunction({
      name: 'getallcomment',
      key: 'getcommentlist',
      complete: res => {
        getcommentlist=res.result.data
      }
    })
    //获取点赞列表
    wx.cloud.callFunction({
      name: 'getlike',
      key: 'likelist',
      complete: res => {
        var likecount = 0
        for (var i=0;i<res.result.data.length;i++) {
          if(res.result.data[i].postuser == that.data.openid){
            likecount = likecount+1
          }
        }
        that.setData({
          likecount:likecount,
          likelist:res.result.data
        })
      }
    })    

    if(that.data.isPreview){
      isPreview=false
      return;
    }
    wx.cloud.callFunction({
      name:'getOpenid',
      complete:res=>{
        var openid = res.result.openid
        that.setData({
          canIUseGetUserProfile: true,
          getcommentlist:res.result.data,
          isPreview:false,
          openid:openid
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
      
        var userpostimglist = new Array();
        wx.showLoading({
          title: '刷新中',
        })
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
              wx.hideLoading()
              return;
            }
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
                wx.hideLoading()

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
                  showlikelist:showlikelist
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
            console.log(that.data.openid)
            console.log(res)
            for(var i=0;i<res.result.data.length;i++){
              console.log('enter')
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
                        }
                        avatarurl = res.userInfo.avatarUrl
                        nickname = res.userInfo.nickName
                        that.setData({
                          userInfo: res.userInfo,
                          hasUserInfo: true,
                          showTalklogin : 'none',
                          canIUseGetUserProfile: true,
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
  },

  //删除推文
  deletepost:function(e){
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

  totalkinfo:function(e){
    var postid = e.currentTarget.dataset.postid
    wx.navigateTo({
      url:'../talkinfo/talkinfo?postid='+postid
    })
  },

  //点击图片放大
  async tapimg(e){
    //设置点击事件不刷新页面
    this.setData({
      isPreview:true
    })
    let imgurl=e.currentTarget.dataset.id+''
    for(var i=0;i<this.data.postlist.length;i++){
      if(imgurl==this.data.postlist[i].imgurl){
        console.log(this.data.postlist[i].imgurl)
        const userpostimg = await cloudDownLoad('',[this.data.postlist[i].imgurl])//调用缓存app.js
        wx.previewImage({
          current: '', // 当前显示图片的http链接
          urls: userpostimg // 需要预览的图片http链接列表
        })
      }
    }
  },

  shownothing:function(){
    wx.switchTab({
      url: '/pages/talk/talk'
    })
  },

  //点赞功能
  likeadd:function(e){
    console.log(e.currentTarget.dataset.id)
    console.log(this.data.openid)
    db.collection("iforum").doc(e.currentTarget.dataset.id).update({//添加到数据库
      data:{
        likecount:e.currentTarget.dataset.like+1
      }
    })
    db.collection("ilike").add({//添加到数据库
      data:{
        postuser:e.currentTarget.dataset.openid,
        likeid:e.currentTarget.dataset.id,
        userid:this.data.openid
      }
    })
    //重新抓取推文列表
    this.onShow()
    wx.showToast({
      title:"点赞成功",
      image: '/images/like.png',
    })
  },

    //取消点赞功能
    likeminuus:function(e){
      console.log(e.currentTarget.dataset.id+'delete')
      console.log(this.data.openid)
      db.collection("iforum").doc(e.currentTarget.dataset.id).update({//添加到数据库
        data:{
          likecount:e.currentTarget.dataset.like-1
        }
      })
      db.collection("ilike")//添加到数据库
      .where({
        postuser:e.currentTarget.dataset.openid,
        likeid:e.currentTarget.dataset.id,
        userid:this.data.openid
      })
      .remove()
      //重新抓取推文列表
      this.onShow()
      wx.showToast({
        title:"取消点赞",
        image: '/images/like.png',
      })
    },

  //获取输入框数据
  pushinput:function(event){
    pushinput=event.detail.value
  },

  //评论上传到数据库
  uploadcomment:function(e){
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
      if(pushinput == ''){
        wx.hideLoading()
        wx.showToast({
          title:"不能什么都不写哦",
          image: '/images/fail.png',
        })
        return;
      }
      db.collection("icomment").add({//添加到数据库
        data:{
          commit:pushinput,
          postid:e.currentTarget.dataset.id,//获取前端推文的id
          postuser:nickname,
        }
      })
      //发布评论后重新抓取评论列表
      this.onShow()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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
      wx.showLoading({
        title: '刷新中',
      })
      this.setData({
        iforumcount:this.data.iforumlength
      })
      this.onShow()
    }else if(this.data.iforumlength<this.data.iforumcount+7){
      wx.showToast({
        title:"到底啦",
      })
    }else{
      wx.showLoading({
        title: '刷新中',
      })
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

  }
})