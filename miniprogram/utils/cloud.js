
// 从云服务器上下载文件
async function cloudDownLoad(cloud_download_file_url){
  const results = []
  for(let i=0;i<cloud_download_file_url.length;i++){
    if(!wx.getStorageSync(cloud_download_file_url[i])){
      wx.downloadFile({
        url: cloud_download_file_url[i], //要下载的图片网络地址
        success: res => {
          // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
          if (res.statusCode === 200) {
            wx.setStorageSync(cloud_download_file_url[i], res.tempFilePath)
            results.push(res.tempFilePath)
          }
        }, fail: res => {
          console.log(res);
        }
      })
    }else{
      results.push(wx.getStorageSync(cloud_download_file_url[i]))
    }
  }
  return results
  // const results = []
  // for(let i=0;i<downloadfiles_name.length;i++){
  //   if(!wx.getStorageSync(downloadfiles_name[i])){
  //     const result = await wx.cloud.downloadFile({
  //       fileID: `${cloud_download_file_url}${downloadfiles_name[i]}`
  //     })
  //     if(result.statusCode == 200){
  //       wx.setStorageSync(downloadfiles_name[i], result.tempFilePath)
  //       results.push(result.tempFilePath)
  //     }
  //   }else{
  //     results.push(wx.getStorageSync(downloadfiles_name[i]))
  //   }
  // }
  // return results
}


export{
  cloudDownLoad
}