const db=wx.cloud.database()
//点赞功能
function utillikeadd(id,openid,useropenid){
  //获取用户点赞列表
  wx.cloud.callFunction({
    name: 'getlikecount',
    data:{
      likeid:id
    },
    complete: res => {
      console.log(res)
      db.collection("iforum").doc(id).update({//添加到数据库
        data:{
          likecount:res.result.data.length+1
        }
      })
      db.collection("ilike").add({//添加到数据库
        data:{
          postuser:openid,
          likeid:id,
          userid:useropenid
        }
      })
    }
  })
  console.log("finish")
}

//取消点赞功能
function utillikeminuus(id,openid,useropenid){
  //获取用户点赞列表
  wx.cloud.callFunction({
    name: 'getlikecount',
    data:{
      likeid:id
    },
    complete: res => {
      console.log(res)
      db.collection("iforum").doc(id).update({//添加到数据库
        data:{
          likecount:res.result.data.length-1
        }
      })
      db.collection("ilike")//添加到数据库
      .where({
        postuser:openid,
        likeid:id,
        userid:useropenid
      })
      .remove()
    }
  })
  console.log("finish")
}

export{
  utillikeadd,
  utillikeminuus
}