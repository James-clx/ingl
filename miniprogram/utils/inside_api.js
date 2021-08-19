import {
  setCacheSync,
  getCacheSync
} from "cache.js"
import {
  htmlRequest
} from "html.js"

function showLoading(title) {
  wx.showLoading({
    title,
    mask: true
  })
}

function getOpenid() {
  let openid = getCacheSync('openid')
  if (!openid) {
    wx.login({
      async success(res) {
        // 发送 res.code 到后台换取 openId,并存入缓存
        const openid = await htmlRequest(['get_openid', 'POST', {
          'code': res.code
        }])
        setCacheSync({
          'openid': openid
        })
      }
    })
  }
  openid = getCacheSync('openid')
  return openid
}

function refreshPage(url){
  wx.switchTab({
    url,
    success: function(e) {
      var page = getCurrentPages().pop();
      if (page == undefined || page == null) return;
      page.onLoad();
    }
  })
}

function getUser(openid) {
  var openid = openid
  var userinfo = ''
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://www.inguangli.cn/ingl/api/user/search/openid',
      method: 'POST',
      data:{
        "openid":openid
      },
      success (res) {
        userinfo = res.data
        resolve(userinfo);
      },
      fail(res){
        console.log(res.data)
        reject("调用失败"); 
      }
    })
  })
}

function getBlock(openid) {
  var userblock
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'https://www.inguangli.cn/ingl/api/access/issue_forum',
      method: 'POST',
      data:{
        "openid":'o1Q1N451krUKupjH1EqboJnBD5UI'
      },
      success (res) {
        userblock = res.data.data
        resolve(userblock);
      },
      fail(res){
        console.log(res.data)
        reject("调用失败"); 
      }
    })
  })
}

function getLoginOpenid() {
  return new Promise((resolve, reject) => {
    let openid
    wx.login({
      success(res) {
        wx.request({
          url: 'https://www.inguangli.cn/ingl/api/get_openid',
          method:'POST',
          data:{
            code:res.code
          },
          success(res){
            openid = res.data
            resolve(openid)
          },
          fail(res){
            console.log(res)
          }
        })
      }
    })
    openid = getCacheSync('openid')
  })
}

export {
  showLoading,
  getOpenid,
  refreshPage,
  getUser,
  getBlock,
  getLoginOpenid
}