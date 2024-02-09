function* generateHourIntervals(startTime: Date, endTime: Date) {
  const oneHour = 60 * 60 * 1000 // One hour in milliseconds
  let currentTime = new Date(startTime.getTime())

  while (currentTime <= endTime) {
    const nextTime = new Date(currentTime.getTime() + oneHour)
    yield [new Date(currentTime), new Date(nextTime)]
    currentTime = nextTime
  }
}

export default generateHourIntervals
