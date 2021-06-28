import {set_cache_sync,get_cache_sync} from "cache.js"
import {htmlRequest} from "html.js"

function showLoading(title) {
  wx.showLoading({
    title,
    mask: true
  })
}

function get_openid() {
  let openid = get_cache_sync('openid')
  if (!openid) {
    wx.login({
      async success(res) {
        // 发送 res.code 到后台换取 openId,并存入缓存
        const openid = await htmlRequest(['get_openid', 'POST', {
          'code': res.code
        }])
        set_cache_sync('openid', openid)
      }
    })
  }
  openid = get_cache_sync('openid')
  return openid
}

export {
  showLoading,
  get_openid
}