const isAndroid = () => {
  return navigator.userAgent.toLowerCase().indexOf('android') > -1
}

export default isAndroid()
