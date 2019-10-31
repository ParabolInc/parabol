exports.up = async (r) => {
  try {
    await r.tableCreate('SAML').run()
  } catch (e) {
    console.log(e)
  }
  try {
    await r
      .table('SAML')
      .indexCreate('domain')
      .run()
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r.tableDrop('SAML').run()
  } catch (e) {
    console.log(e)
  }
}
