var util=require('../../utils/utils.js')
var gettime=require('../../utils/times.js')
var check = require('../../utils/check.js')
import{cloudDownLoad}from"../../utils/cloud.js"
const app=getApp()
const db=wx.cloud.database()
const _ = db.command

Page({
  /**
   * 页面的初始数据
   */
  data: {
    history:[],
    toppostlist:[],
    postlist:[],//推文数组
    userInfo: {},//用户信息
    filter:'0rpx',//主页面模糊
    iforumlength:'',//推文集合长度
    iforumcount:7,//推文显示条数
    openid:'',//用户openid
    loadModal:false,
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
        //驳回说说数量
        db.collection('iaudit')
        .where({
          reject:true
        })
        .count({
          success(res){
            that.setData({
              rejectcount:res.total
            })
          }
        })
        var userpostimglist = new Array();
        //获取数据条数
        db.collection('iaudit').count({
          success(res) {
            that.setData({
              iforumlength:res.total
            })
            console.log(that.data.iforumlength)
            if (that.data.iforumlength<7) {
              that.data.iforumcount = that.data.iforumlength
            }
            //调用云函数从数据库获取论坛数据
            wx.cloud.callFunction({
              name: 'getauditpost',//云函数名
              key: 'postlist',
              data:{
                lim:that.data.iforumcount,
                pass:that.data.iforumcount
              },
              async complete(res){
                console.log(res)
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
                  postlist:res.result.data.reverse(),
                  loadModal: false
                });
              }
            })
          }
        })
      }
    })
  },

  //拒绝按钮
  rejectpost:function(e){
    db.collection('iaudit').doc(e.currentTarget.dataset.info._id).update({
      data:{
        reject:true
      }
    })
    this.onShow()
  },

  //确认按钮，上传数据库
  uploadpost:function(e){
    wx.showLoading({
      title: '上传中',
    })
    //上传图片文件到数据库(有图片)
    if(e.currentTarget.dataset.info.imgurl){
      db.collection("iforum").add({//添加到数据库
        data:{
          _openid:e.currentTarget.dataset.info._openid,
          info:e.currentTarget.dataset.info.info,
          imgurl:e.currentTarget.dataset.info.imgurl,
          pushtime:e.currentTarget.dataset.info.pushtime,
          avatarurl:e.currentTarget.dataset.info.avatarurl,
          nickname:e.currentTarget.dataset.info.nickname,
          gender:e.currentTarget.dataset.info.gender,
          likecount:e.currentTarget.dataset.info.likecount,
          hot:e.currentTarget.dataset.info.hot,
          commentcount:e.currentTarget.dataset.info.commentcount
        }
      })
    }else{//没有上传图片
      db.collection("iforum").add({//添加到数据库
        data:{
          _openid:e.currentTarget.dataset.info._openid,
          info:e.currentTarget.dataset.info.info,
          pushtime:e.currentTarget.dataset.info.pushtime,
          avatarurl:e.currentTarget.dataset.info.avatarurl,
          nickname:e.currentTarget.dataset.info.nickname,
          gender:e.currentTarget.dataset.info.gender,
          likecount:e.currentTarget.dataset.info.likecount,
          hot:e.currentTarget.dataset.info.hot,
          commentcount:e.currentTarget.dataset.info.commentcount
        }
      })
      wx.hideLoading()
    }
    //重新抓取推文列表
    db.collection('iaudit').doc(e.currentTarget.dataset.info._id).remove()
    this.onShow()
    wx.showToast({
      title:"发布成功",
    })
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
})