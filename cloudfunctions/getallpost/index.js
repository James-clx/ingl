// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init();
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('iforum').limit(event.lim).skip(event.lim-event.pass).get();
  }
  catch (e) {
    console.error(e)
  }
}