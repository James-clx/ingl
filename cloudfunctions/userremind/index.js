// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.subscribeMessage.send({
        "touser": event.openid,
        "page": 'pages/user/user',
        "lang":"zh_CN",
        "data": {
          "time3": {
            "value": event.time
          },
          "thing1": {
            "value": event.postinfo
          },
          "thing4": {
            "value": event.username
          },
          "thing2": {
            "value": event.info
          }
        },
        "templateId": 'TEMPLATE_ID',
        "miniprogramState": 'developer'
      })
    return result
  } catch (err) {
    return err
  }
}