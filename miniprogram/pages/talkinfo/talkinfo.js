var util=require('../../utils/utils.js')
var gettime=require('../../utils/times.js')
var check = require('../../utils/check.js')
import{cloudDownLoad}from"../../utils/cloud.js"
const app=getApp()
const db=wx.cloud.database()
const _ = db.command
let nickname=''
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
    getcommentlist:[],//获取评论列表
    postlist:[],//推文数组
    likelist:[],//点赞数组
    mylikelist:[],//用户点赞数组
    showlikelist:[],//是否显示已点赞
    openid:'',//用户openid
    inputclean:'',//清空评论框数据
    userblock: '',//全局变量
    postid:'',
    chooseunname: 'none',
    //匿名发布(暂不可用)
    setunname: false,
    changename: '',
    loadModal: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.postid)
    this.setData({
      postid:options.postid
    })
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    let that = this;//将this另存为
    var getcommentlist
    var likelist
    var isPreview
    var history
    wx.hideLoading()
    nickname = wx.getStorageSync('nickname',nickname)
    // 在右上角菜单 "...”中显示分享，menus可以单写转发shareAppMessage，分享朋友圈必须写shareAppMessage和shareTimeline
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    wx.cloud.callFunction({
      name:'getOpenid',
      complete:res=>{
        var openid = res.result.openid
        that.setData({
          openid:openid,
          loadModal: true,
        })
        //获取评论列表
        wx.cloud.callFunction({
          name: 'getcomment',
          key: 'getcommentlist',
          data:{
            postid:that.data.postid
          },
          complete: res => {
            getcommentlist=res.result.data
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
            console.log(res)
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
              name: 'getpost',//云函数名
              key: 'postlist',
              data:{
                postid:that.data.postid
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
                  getcommentlist:getcommentlist,
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
                  loadModal: false,
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

  //分享朋友圈
  share:function(e){
    var postlist = JSON.stringify(this.data.postlist)
    var getcommentlist = JSON.stringify(this.data.getcommentlist)
    var postid = e.currentTarget.dataset.id
    wx.navigateTo({
      url:'../share/share?postid='+postid+'&postlist='+postlist+'&getcommentlist='+getcommentlist
    })
  },

  //输入框聚焦事件
  focuscomment:function(){
    this.setData({
      chooseunname:'block'
    })
  },

  //输入失聚焦事件
  outinputcomment:function(){
    this.setData({
      chooseunname:'none'
    })
  },

  //获取输入框数据
  pushinput:function(event){
    pushinput=event.detail.value
    check.checktext(event.detail.value)
    .then(res => {
      console.log(res)
      checkinput = res
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

  //评论上传到数据库
  uploadcomment:function(e){
    var name = nickname
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
      if(checkname == false || checkinput == false){
        wx.showToast({
          icon: 'none',
          title: '文字违规',
        })
        return;
      }
      if(this.data.setunname == true){
        name = this.data.changename
      }
      db.collection("icomment").add({//添加到数据库
        data:{
          commit:pushinput,
          postid:e.currentTarget.dataset.id,//获取前端推文的id
          postuser:name,
        }
      })
      db.collection("iforum").doc(e.currentTarget.dataset.id).update({
        data:{
          commentcount:e.currentTarget.dataset.count+1
        }
      })
      //发布后关闭匿名选择框
      this.outinputcomment()
      //发布评论后重新抓取评论列表
      this.onShow()
    }
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