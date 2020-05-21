const safeIdentify = (userId: string, email: string) => {
  const {analytics} = window
  if (!analytics || typeof analytics.identify !== 'function') return
  analytics.identify(userId, {
    // VERY important! email is required since hubspot uses it as an ID
    // even though we identified previously on the client & server & linked the userId to the email
    // hubspot is a special snowflake & shall be treated as such
    email
  })
}

export default safeIdentify
