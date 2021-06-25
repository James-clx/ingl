
// 从云服务器上下载文件
async function cloudDownLoad(cloud_download_file_url,downloadfiles_name){
  const results = []
  for(let i=0;i<downloadfiles_name.length;i++){
    if(!wx.getStorageSync(downloadfiles_name[i])){
      const result = await wx.cloud.downloadFile({
        fileID: `${cloud_download_file_url}${downloadfiles_name[i]}`
      })
      if(result.statusCode == 200){
        wx.setStorageSync(downloadfiles_name[i], result.tempFilePath)
        results.push(result.tempFilePath)
      }
    }else{
      results.push(wx.getStorageSync(downloadfiles_name[i]))
    }
  }
  return results
}


export{
  cloudDownLoad
}