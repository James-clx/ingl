function screenHeight(){
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: (res) => {
        let clientHeight = res.windowHeight
        let clientWidth = res.windowWidth
        let ratio  = 750 / clientWidth; //计算为百分比
        let rpxHeight = ratio * clientHeight
        resolve(rpxHeight)
      },
      fail:res=>{
        reject(res.data)
      }
    })
  })
}

function verifyFormIsNull(object) {
  // 验证信息是否为空
  for (let i in object['input']) {
    if (object['input'][i] == "") {
      wx.showToast({
        title: object['title'] + '为空',
        icon: 'error',
        duration: 2000
      })
      return true
    }
  }
  return false
}

// 定义一个深拷贝函数  接收目标target参数
function deepClone(target) {
  // 定义一个变量
  let result;
  // 如果当前需要深拷贝的是一个对象的话
  if (typeof target === 'object') {
  // 如果是一个数组的话
      if (Array.isArray(target)) {
          result = []; // 将result赋值为一个数组，并且执行遍历
          for (let i in target) {
              // 递归克隆数组中的每一项
              result.push(deepClone(target[i]))
          }
       // 判断如果当前的值是null的话；直接赋值为null
      } else if(target===null) {
          result = null;
       // 判断如果当前的值是一个RegExp对象的话，直接赋值    
      } else if(target.constructor===RegExp){
          result = target;
      }else {
       // 否则是普通对象，直接for in循环，递归赋值对象的所有值
          result = {};
          for (let i in target) {
              result[i] = deepClone(target[i]);
          }
      }
   // 如果不是对象的话，就是基本数据类型，那么直接赋值
  } else {
      result = target;
  }
   // 返回最终结果
  return result;
}

export {
  verifyFormIsNull,
  screenHeight,
  deepClone,
} 