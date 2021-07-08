// miniprogram/pages/share/share.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    getcommentlist:[],//获取评论列表
    postlist:[],//推文数组
    postid:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var postlist = JSON.parse(options.postlist)
    var getcommentlist = JSON.parse(options.getcommentlist)
    console.log(postlist)
    this.setData({
      postlist:postlist,
      postid:options.postid,
      getcommentlist:getcommentlist
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
  onPullDownRefresh: function () {

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
      path: '/pages/share/share', // 点击访问的页面
      imageUrl: this.data.postlist[0].imgurl,     //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。
    }
  },
  // 分享朋友圈，前提是必须有转发onShareAppMessage
  onShareTimeline:function(){
    return{
      imageUrl:this.data.postlist[0].imgurl,
      title: this.data.postlist[0].info,
      //query: '' //页面参数 如： ？title='123'
    }
  }
})