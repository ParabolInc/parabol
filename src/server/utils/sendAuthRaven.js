import sendSentryEvent from 'server/utils/sendSentryEvent'

const sendAuthRaven = (authToken, title, breadcrumb, returnValue, error) => {
  sendSentryEvent(authToken, breadcrumb, error)
  const {message} = breadcrumb
  return returnValue !== undefined ? returnValue : {error: {title, message}}
}

export default sendAuthRaven
