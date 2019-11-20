import {R} from 'rethinkdb-ts'

const transformIdentities = (identities) => {
  return identities.map((identity) => {
    if (identity.connection === 'Username-Password-Authentication') {
      return {
        id: identity.user_id,
        isEmailVerified: false,
        type: 'LOCAL',
        verifiedEmailToken: null,
        verifiedEmailTokenExpiration: null,
        resetPasswordToken: null,
        resetPasswordTokenExpiration: null
      }
    } else if (identity.connection === 'google-oauth2') {
      return {
        id: identity.user_id,
        isEmailVerified: true,
        type: 'GOOGLE'
      }
    } else {
      console.log('Unknown identity', identity)
      return null
    }
  })
}

export const up = async function(r: R) {
  const users = await r.table('User').run()
  const nextUsers = users.map((user) => ({
    id: user.id,
    identities: transformIdentities(user.identities)
  }))
  await r(nextUsers)
    .forEach((user) => {
      return r
        .table('User')
        .get(user('id'))
        .update({
          identities: user('identities')
        })
    })
    .run()
}

const detransformIdentities = (identities) => {
  return identities.map((identity) => {
    if (identity.type === 'LOCAL') {
      return {
        user_id: identity.id,
        connection: 'Username-Password-Authentication',
        isSocial: false,
        provider: 'auth0'
      }
    } else if (identity.type === 'GOOGLE') {
      return {
        user_id: identity.id,
        connection: 'google-oauth2',
        isSocial: true,
        provider: 'google-oauth2'
      }
    } else {
      console.log('Unknown identity', identity)
      return null
    }
  })
}

export const down = async function(r: R) {
  const users = await r.table('User').run()
  const nextUsers = users.map((user) => ({
    id: user.id,
    identities: detransformIdentities(user.identities)
  }))
  await r(nextUsers)
    .forEach((user) => {
      return r
        .table('User')
        .get(user('id'))
        .update({
          identities: user('identities')
        })
    })
    .run()
}
