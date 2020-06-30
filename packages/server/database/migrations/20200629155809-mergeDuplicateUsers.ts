import User from '../types/User'

export const up = async function(r) {
  try {
    const affectedEmails = await r
      .db('actionProduction')
      .table('User')
      .filter((user) =>
        user('email')
          .match('^DELETED$')
          .eq(null)
      )
      .group('email')
      .count()
      .ungroup()
      .filter((row) => row('reduction').gt(1))('group')
      .run()

    const allDuplicates = [] as User[][]
    affectedEmails.forEach((email) => {
      allDuplicates.push(
        r
          .db('actionProduction')
          .table('User')
          .getAll(email, {index: 'email'})
          .orderBy('createdAt')
          .coerceTo('array')
          .run()
      )
    })

    const toUpdate = [] as User[]
    const toDeleteIds = [] as string[]

    for await (const innerArr of allDuplicates) {
      const [old, ...newer] = innerArr

      for (const dup of newer) {
        old.identities = old.identities.concat(dup.identities)
        old.tms = old.tms.concat(dup.tms)
        old.email = dup.email ? dup.email : old.email
        old.picture = dup.picture ? dup.picture : old.picture
        toDeleteIds.push(dup.id)
      }

      old.identities = Array.from(new Set(old.identities))
      old.tms = Array.from(new Set(old.tms))

      toUpdate.push(old)
    }

    await r(toUpdate)
      .forEach((update) => {
        return r
          .table('User')
          .get(update('id'))
          .update(
            {
              email: update('email'),
              picture: update('picture'),
              tms: update('tms'),
              identities: update('identities')
            },
            {returnChanges: true}
          )
      })
      .run()

    await r
      .table('User')
      .getAll(r.args(toDeleteIds))
      .delete({returnChanges: true})
      .run()
  } catch (e) {
    console.log(e)
  }
}
