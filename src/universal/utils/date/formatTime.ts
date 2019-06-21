const formatTime = (date: Date) => {
  const hours = date.getHours()
  const mins = date.getMinutes()
  const minutes = String(mins).padStart(2, '0')
  const hour = hours % 12 || 12
  const period = hours >= 12 ? 'pm' : 'am'
  return `${hour}:${minutes}${period}`
}

export default formatTime
