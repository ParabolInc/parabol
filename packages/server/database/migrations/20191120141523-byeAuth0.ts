import {R} from 'rethinkdb-ts'

export const up = async function(r: R) {
  try {
    await r.tableCreate('FailedAuthRequest').run()
    await r
      .table('FailedAuthRequest')
      .indexCreate('ipEmail', [r.row('ip'), r.row('email')])
      .run()
    await r
      .table('FailedAuthRequest')
      .indexCreate('ipTime', [r.row('ip'), r.row('time')])
      .run()
  } catch (e) {
    console.log(e)
  }

  await r
    .table('User')
    .update((user) => ({
      identities: user('identities').map((identity) => {
        return r.branch(
          identity('connection').eq('Username-Password-Authentication'),
          {
            id: identity('user_id'),
            isEmailVerified: false,
            type: 'LOCAL',
            verifiedEmailToken: null,
            verifiedEmailTokenExpiration: null,
            resetPasswordToken: null,
            resetPasswordTokenExpiration: null
          },
          {
            id: identity('user_id'),
            isEmailVerified: true,
            type: 'GOOGLE'
          }
        )
      })
    }))
    .run()
}

export const down = async function(r: R) {
  try {
    await r.tableDrop('FailedAuthRequest').run()
  } catch (e) {
    console.log(e)
  }

  await r
    .table('User')
    .update((user) => ({
      identities: user('identities').map((identity) => {
        return r.branch(
          identity('type').eq('LOCAL'),
          {
            user_id: identity('id'),
            connection: 'Username-Password-Authentication',
            isSocial: false,
            provider: 'auth0'
          },
          {
            user_id: identity('id'),
            connection: 'google-oauth2',
            isSocial: true,
            provider: 'google-oauth2'
          }
        )
      })
    }))
    .run()
}
