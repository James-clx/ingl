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

export {
  showLoading,
  getOpenid,
  refreshPage,
}