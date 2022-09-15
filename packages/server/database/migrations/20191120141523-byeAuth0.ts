import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await Promise.all([
      r.tableCreate('FailedAuthRequest').run(),
      r.tableCreate('PasswordResetRequest').run()
    ])
    await Promise.all([
      r.table('FailedAuthRequest').indexCreate('ip').run(),
      r.table('FailedAuthRequest').indexCreate('email').run(),
      r.table('PasswordResetRequest').indexCreate('ip').run(),
      r.table('PasswordResetRequest').indexCreate('email').run(),
      r.table('PasswordResetRequest').indexCreate('token').run()
    ])
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
            type: 'LOCAL'
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

export const down = async function (r: R) {
  try {
    await Promise.all([
      r.tableDrop('FailedAuthRequest').run(),
      r.tableDrop('PasswordResetRequest').run()
    ])
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
