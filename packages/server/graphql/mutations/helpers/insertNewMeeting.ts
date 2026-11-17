import type {Compilable} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import type {AnyMeeting} from '../../../postgres/types/Meeting'

// A lone insert is atomic, so only a meeting that brings rows of its own pays 2 more round trips for a transaction
const insertNewMeeting = async (meeting: AnyMeeting, inserts: Compilable[]) => {
  const pg = getKysely()
  const values = {...meeting, phases: JSON.stringify(meeting.phases)}
  if (inserts.length === 0) {
    await pg.insertInto('NewMeeting').values(values).execute()
    return
  }
  await pg.transaction().execute(async (trx) => {
    await trx.insertInto('NewMeeting').values(values).execute()
    await Promise.all(inserts.map((insert) => trx.executeQuery(insert)))
  })
}

export default insertNewMeeting
