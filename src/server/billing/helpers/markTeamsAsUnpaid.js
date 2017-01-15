import getRethink from 'server/database/rethinkDriver';

export default async function makeTeamsAsUnpaid(orgs) {
  const r = getRethink();
  const orgIds = orgs.map((org) => org.id);
  return r.table('Team')
    .getAll(r.args(orgIds), {index: 'orgId'})
    .update({
      isPaid: false
    })
}
