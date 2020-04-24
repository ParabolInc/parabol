const isValidDate = (maybeDate) => {
  const time = maybeDate.getTime()
  // new Date(null) starts at epoch
  return !isNaN(time) && time !== 0
}

export default isValidDate
