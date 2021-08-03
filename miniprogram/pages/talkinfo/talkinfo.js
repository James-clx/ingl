import {htmlRequest} from "../../utils/html.js"
var check = require('../../utils/check.js')
var like = require('../../utils/like.js')
import{cloudDownLoad}from"../../utils/cloud.js"
const app=getApp()
const db=wx.cloud.database()
const _ = db.command
let nickname=''
let pushinput=''//评论内容
var isPreview
let checkinput = true
let userblock
let postid
let openid
let mylikelist = []//用户点赞数组

Page({
  /**
   * 页面的初始数据
   */
  data: {
    getcommentlist:[],//获取评论列表
    postlist:[],//推文数组
    showlikelist:[],//是否显示已点赞
    inputclean:'',//清空评论框数据
    loadModal: false,
    showinput:true,
    isios: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad (options) {
    const showinput =await htmlRequest(['showtallinput','get'])
    postid = options.postid
    userblock = options.userblock
    this.setData({
      showinput:showinput,
    })
  },

  onReady: function() {
    this.setData({
      loadModal: true
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this;//将this另存为
    wx.hideLoading()
    nickname = wx.getStorageSync('nickname',nickname)
    // 在右上角菜单 "...”中显示分享，menus可以单写转发shareAppMessage，分享朋友圈必须写shareAppMessage和shareTimeline
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });

    //设置点击放大图片事件不刷新页面
    if(that.data.isPreview){
      that.setData({
        loadModal: false,
        isPreview:false
      })
      return;
    }

    wx.cloud.callFunction({
      name:'getOpenid',
      complete:res=>{
        openid = res.result.openid
        that.setData({
          showallinput:app.globalData.showallinput,
        })
        //获取终端机型
        wx.getSystemInfo({
          success: (res) => {
            if(res.platform=="ios"){
              that.setData({
                isios : true
              })
            }
          }
        })
        //获取评论列表
        wx.cloud.callFunction({
          name: 'getcomment',
          key: 'getcommentlist',
          data:{
            postid:postid
          },
          complete: res => {
            that.setData({
              getcommentlist:res.result.data.reverse()
            })
            //获取用户点赞列表
            wx.cloud.callFunction({
              name: 'getmylikeinfo',
              key: 'mylikelist',
              data:{
                userid:openid,
                likeid:postid
              },
              complete: res => {
                console.log(res.result.data)
                mylikelist = res.result.data
                var userpostimglist = new Array();
                //获取数据条数
                db.collection('iforum').count({
                  success(res) {
                    that.setData({
                      iforumlength:res.total
                    })
                    //调用云函数从数据库获取论坛数据
                    wx.cloud.callFunction({
                      name: 'getpost',//云函数名
                      key: 'postlist',
                      data:{
                        postid:postid
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
                          inputclean: '',
                          //倒序存入数组
                          postlist:res.result.data.reverse()
                        });
                        pushinput=''
                        
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
                          loadModal: false,
                        })
                      }
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

  //点击图片放大
  async tapimg(e){
    //设置点击事件不刷新页面
    this.setData({
      isPreview:true
    })
    wx.vibrateShort({type:"heavy"})
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

  //分享朋友圈
  share:function(e){
    var postlist = JSON.stringify(this.data.postlist)
    var getcommentlist = JSON.stringify(this.data.getcommentlist)
    var postid = e.currentTarget.dataset.id
    wx.navigateTo({
      url:'../share/share?postid='+postid+'&postlist='+postlist+'&getcommentlist='+getcommentlist
    })
  },

  //获取输入框数据
  pushinput:function(event){
    pushinput=event.detail.value
    check.checktext(event.detail.value)
    .then(res => {
      checkinput = res
    })
  },

  //评论上传到数据库
  uploadcomment:function(e){
    wx.vibrateShort({type:"heavy"})
    var name = nickname
    if (userblock == 'true') {
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
      if(checkinput == false){
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '文字违规',
        })
        return;
      }
      this.setData({
        inputclean : ''
      })
      db.collection("icomment").add({//添加到数据库
        data:{
          commit:pushinput,
          postid:e.currentTarget.dataset.id,//获取前端推文的id
          postuser:name
        }
      })
      db.collection("iforum").doc(e.currentTarget.dataset.id).update({
        data:{
          commentcount:e.currentTarget.dataset.count+1
        }
      })
      //发布评论后重新抓取评论列表
      this.onShow()
    }
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
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
  },

  // 转发
  onShareAppMessage: function () {
    return {
      title: this.data.postlist[0].info,
      path: '/pages/talk/talk', // 点击访问的页面
      imageUrl: this.data.postlist[0].imgurl,     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。
    }
  }
})