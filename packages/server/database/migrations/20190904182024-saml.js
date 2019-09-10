exports.up = async (r) => {
  try {
    await r.tableCreate('SAML')
  } catch (e) {
    console.log(e)
  }
  try {
    await r.table('SAML').indexCreate('domain')
  } catch (e) {
    console.log(e)
  }
}

exports.down = async (r) => {
  try {
    await r.tableDrop('SAML')
  } catch (e) {
    console.log(e)
  }
}
