import AtlassianClientManager from 'universal/utils/AtlassianClientManager'
import makeAppLink from './makeAppLink'
import {ATLASSIAN_SCOPE} from 'universal/utils/constants'
import fetch from 'node-fetch'

class AtlassianManager extends AtlassianClientManager {
  static async init (code: string) {
    const queryParams = {
      grant_type: 'authorization_code',
      client_id: process.env.ATLASSIAN_CLIENT_ID,
      client_secret: process.env.ATLASSIAN_CLIENT_SECRET,
      code,
      redirect_uri: makeAppLink('auth/atlassian')
    }

    const uri = `https://auth.atlassian.com/oauth/token`

    const tokenRes = await fetch(uri, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(queryParams)
    })

    const tokenJson = await tokenRes.json()

    console.log('token', tokenJson)
    const {access_token: accessToken, refesh_token: refreshToken, error, scope} = tokenJson
    if (error) {
      throw new Error(`Atlassian: ${error}`)
    }
    const providedScope = scope.split(' ')
    const matchingScope =
      new Set([...ATLASSIAN_SCOPE.split(' '), ...providedScope]).size === providedScope.length
    if (!matchingScope) {
      throw new Error(`bad scope: ${scope}`)
    }
    return new AtlassianManager(accessToken, {fetch, refreshToken})
  }
}

export default AtlassianManager
