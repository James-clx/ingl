function verify_form_is_null(object) {
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

export {
  verify_form_is_null
}