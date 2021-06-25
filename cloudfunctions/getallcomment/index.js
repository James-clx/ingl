// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init();
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  var postid=event.postid
  try {
    return await db.collection('icomment')
    .limit(10000)
    .get();
  }
  catch (e) {
    console.error(e)
  }
}