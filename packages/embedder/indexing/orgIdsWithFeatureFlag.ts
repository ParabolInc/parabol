import getRethink from 'parabol-server/database/rethinkDriver'
import {RDatum} from 'parabol-server/database/stricterR'

export const orgIdsWithFeatureFlag = async () => {
  // I had to add a secondary index to the Organization table to get
  // this query to be cheap
  const r = await getRethink()
  return await r
    .table('Organization')
    .getAll('relatedDiscussions', {index: 'featureFlagsIndex' as any})
    .filter((r: RDatum) => r('featureFlags').contains('relatedDiscussions'))
    .map((r: RDatum) => r('id'))
    .coerceTo('array')
    .run()
}
