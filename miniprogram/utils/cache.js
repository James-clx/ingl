function setCacheSync(key, value) {
  // 判断是否有该缓存
  let exist_storage = wx.getStorageSync(key) == ""?false:wx.getStorageSync(key)
  if (exist_storage) {
    //判断缓存信息是否存在相同，如果存在不相同，则要更新缓存
    for (let i = 0; i < Object.keys(exist_storage).length; i++) {
      if (value[Object.keys(exist_storage)[i]] != exist_storage[Object.keys(exist_storage)[i]]) {
        wx.setStorageSync(key, value)
      }
    }
  } else {
    wx.setStorageSync(key, value)
  }
}

function getCacheSync(key) {
  return wx.getStorageSync(key)
}

function clearCacheSingle(key){
  wx.removeStorageSync(key)
}

export {
  setCacheSync,
  getCacheSync,
  clearCacheSingle,
}