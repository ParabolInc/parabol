import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await r
      .table('User')
      .replace((row) =>
        row.without(
          'welcomeSentAt',
          'cacheExpiresAt',
          'cachedAt',
          'emailVerified',
          'name',
          'nickname'
        )
      )
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function () {
  // noop
}
