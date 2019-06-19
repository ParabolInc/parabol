const formatTime = (date: Date, isUTC = false) => {
  const hours = isUTC ? date.getUTCHours() : date.getHours()
  const mins = isUTC ? date.getUTCMinutes() : date.getMinutes()
  const minutes = String(mins).padStart(2, '0')
  const hour = hours % 12
  const period = hours > 12 ? 'pm' : 'am'
  return `${hour}:${minutes}${period}`
}

export default formatTime
