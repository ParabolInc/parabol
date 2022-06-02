import {r} from 'rethinkdb-ts'
import {getUsersByEmails} from '../../../postgres/queries/getUsersByEmails'
import {MutationResolvers} from '../resolverTypes'

const toggleAllowInsights: MutationResolvers['toggleAllowInsights'] = async (
  _source,
  {value, domain, emails},
  {dataLoader}
) => {
  const organizations = await dataLoader.get('organizationsByActiveDomain').load(domain)
  if (organizations.length === 0) {
    return {
      error: {message: `No organizations match ${domain}. First call 'setOrganizationDomain'`}
    }
  }
  const orgIds = organizations.map(({id}) => id)
  if (emails.length < 1) {
    return {error: {message: 'Must include at least 1 email'}}
  }
  const users = await getUsersByEmails(emails)
  const userIds = users.map(({id}) => id)
  // add them
  const recordsReplaced = await Promise.all(
    userIds.map(async (userId) => {
      return r
        .table('OrganizationUser')
        .getAll(r.args(orgIds), {index: 'orgId'})
        .filter({
          userId
        })
        .filter((row) => row('removedAt').default(null).eq(null))
        .update({allowInsights: value})('replaced')
        .run()
    })
  )
  return {organizationUsersAffected: recordsReplaced.reduce((x, y) => x + y)}
}

export default toggleAllowInsights
