const app = getApp()

// request的一个封装，suffix代表url后缀，method代表请求方法，data代表数据
function htmlRequest([suffix, method, data]) {
  const url = app.globalData.base_url + suffix
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      success: res => {
        resolve(res.data)
      },
      fail:res=>{
        reject(res.data)
      }
    })
  })
}

export{
  htmlRequest
}