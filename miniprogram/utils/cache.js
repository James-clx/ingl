function setCacheSync(object) {
  // 初始化变量
  let exist_storage = "" // 缓存是否已存在
  let old_storage = "" // 目标缓存
  for (let key in object) {
    old_storage = wx.getStorageSync(key)
    exist_storage = old_storage == "" ? false : old_storage
    if (!exist_storage) { // 缓存不存在
      _notStorageHandler(key, object[key])
      continue
    }
    // 缓存已存在
    _storageHandler(key, object[key], old_storage)
  }
}

// 缓存已存在
function _storageHandler(key, value, old_storage) {
  //判断缓存信息是否存在相同，如果存在不相同，则要更新缓存
  let old_storage_value = old_storage
  let new_storage_value = value
  if (old_storage_value != new_storage_value) {
    wx.setStorageSync(key, new_storage_value)
  }
}

// 缓存不存在
function _notStorageHandler(key, value) {
  wx.setStorageSync(key, value) // 直接设置缓存
}

function getCacheSync(key) {
  return wx.getStorageSync(key)
}

function clearCacheSingle(key) {
  wx.removeStorageSync(key)
}

function clearCacheAll(args) {
  for(let idx = 0;idx<args.length;idx++){
    wx.removeStorageSync(args[idx])
  }
}

export {
  setCacheSync,
  getCacheSync,
  clearCacheSingle,
  clearCacheAll,
}