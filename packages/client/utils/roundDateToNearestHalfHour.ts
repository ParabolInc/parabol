const roundDateToNearestHalfHour = (time: Date) => {
  const newTime = new Date(time)
  const oldMins = newTime.getMinutes()
  if (oldMins >= 45) {
    // round up
    newTime.setHours(newTime.getHours() + 1)
    newTime.setMinutes(0)
  } else if (oldMins > 20) {
    // round to nearest :30 minutes
    newTime.setMinutes(30)
  } else {
    // round down
    newTime.setMinutes(0)
  }
  newTime.setSeconds(0)
  return newTime
}

export default roundDateToNearestHalfHour
