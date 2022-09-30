import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await r
      .table('User')
      .filter((row) => row('email').match('.*[A-Z].*'))
      .filter((row) => row('email').ne('DELETED'))('id')
      .coerceTo('array')
      .do((userIds) => {
        return r({
          user: r
            .table('User')
            .getAll(r.args(userIds))
            .update((row) => ({email: row('email').downcase()})),
          teamMembers: r
            .table('TeamMember')
            .getAll(r.args(userIds), {index: 'userId'})
            .update((row) => ({
              email: row('email').downcase()
            }))
        })
      })
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function () {
  // noop
}
