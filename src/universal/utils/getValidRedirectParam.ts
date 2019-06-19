const getValidRedirectParam = (search = window.location.search) => {
  const param = new URLSearchParams(search).get('redirectTo')
  return !param || param.startsWith('//') || param.startsWith('.') ? null : param
}

export default getValidRedirectParam
