import {sql} from 'kysely'
import getKysely from '../../../../postgres/getKysely'
import type {DataLoaderWorker} from '../../../graphql'

/**
 * Persist the facilitator queue. Members absent from `rotation` keep a null order, which leaves
 * them at the top of the line for the next meeting.
 */
const setFacilitatorRotation = async (
  teamId: string,
  rotation: string[],
  dataLoader: DataLoaderWorker
) => {
  await getKysely()
    .updateTable('TeamMember')
    .set({
      facilitatorOrder: sql<number>`array_position(${sql.val(rotation)}::text[], "userId")`
    })
    .where('teamId', '=', teamId)
    .where('userId', 'in', rotation)
    .execute()
  dataLoader.clearAll('teamMembers')
}

export default setFacilitatorRotation
