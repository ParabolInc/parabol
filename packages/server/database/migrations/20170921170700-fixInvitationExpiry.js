exports.up = async (r) => {
  r.table('Invitation')
    .update((doc) => {
      return r.branch(
        doc('tokenExpiration')
          .typeOf()
          .eq('NUMBER')
          .default(false),
        {tokenExpiration: r.epochTime(doc('tokenExpiration'))},
        null
      )
    })
    .run()
}

exports.down = async () => {
  // noop
}
