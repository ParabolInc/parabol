import promisify from 'es6-promisify'
import {AUTH0_DB_CONNECTION} from './constants'
import makeWebAuth from './makeWebAuth'

const auth0ChangePassword = async (email) => {
  const webAuth = await makeWebAuth()
  const changePassword = promisify(webAuth.changePassword, webAuth)
  return changePassword({
    connection: AUTH0_DB_CONNECTION,
    email
  })
}

export default auth0ChangePassword
