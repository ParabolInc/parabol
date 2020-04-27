export const getGoogleApiConfig = () => ({
  user: process.env.MAIL_GOOGLE_USER || null,
  pass: process.env.MAIL_GOOGLE_PASS || null,
})
