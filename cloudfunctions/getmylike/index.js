// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init();
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('ilike')
    .where({
      userid:event.userid
    })
    .limit(10000)
    .get();
  }
  catch (e) {
    console.error(e)
  }
}