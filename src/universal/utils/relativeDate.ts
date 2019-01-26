import fromnow from 'fromnow'

const relativeDate = (date, options = {max: 1, suffix: true}) => {
  const relativeDateL = fromnow(date, options)
  // captilize Just now
  return relativeDateL[0].toUpperCase() + relativeDateL.slice(1)
}

export default relativeDate
