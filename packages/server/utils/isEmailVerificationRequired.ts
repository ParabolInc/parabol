import getRethink from '../database/rethinkDriver'

const isEmailVerificationRequired = async (domain: string) => {
  const r = await getRethink()
  return r
    .table('SecureDomain')
    .getAll(domain, {index: 'domain'})
    .count()
    .gt(0)
    .run()
}

export default isEmailVerificationRequired
