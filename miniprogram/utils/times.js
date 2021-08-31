const app = getApp()

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  // const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':')
}

const formatTimes = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute,second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getTermTodayWeek() {
  let today_date = new Date()
  let open_date = new Date(app.globalData.open_date)
  let day = parseInt((today_date - open_date) / (1000 * 60 * 60 * 24))
  let day_num = day < 0 ? 1 : (day+7) / 7
  let result = parseInt(day_num)
  return result
}

export{
  getTermTodayWeek,
  formatTime,
  formatTimes
}

