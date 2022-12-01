import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  try {
    await Promise.all([
      r.tableCreate('SecureDomain').run(),
      r.tableCreate('EmailVerification').run()
    ])
  } catch (e) {
    console.log(e)
  }
  try {
    await Promise.all([
      r.table('SecureDomain').indexCreate('domain').run(),
      r.table('EmailVerification').indexCreate('token').run(),
      r.table('EmailVerification').indexCreate('email').run()
    ])
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await Promise.all([r.tableDrop('SecureDomain').run(), r.tableDrop('EmailVerification').run()])
  } catch (e) {
    console.log(e)
  }
}
