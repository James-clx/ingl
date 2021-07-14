// 新建个云函数文件
const cloud = require('wx-server-sdk')
cloud.init({
  env:'user-1go7hmfiae35dce5'
})

exports.main = async (event, context) => {  
  try{
    const result = await cloud.openapi.security.msgSecCheck({
      content:event.txt
    })
    return result
  }catch(error){
    return error
  }
}