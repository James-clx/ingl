const app = getApp()

function get_term_today_week() {
  let today_date = new Date()
  let open_date = new Date(app.globalData.open_date)
  let day = parseInt((today_date - open_date) / (1000 * 60 * 60 * 24))
  let result = Math.ceil(day/7)
  return result
}

export{
  get_term_today_week
}

