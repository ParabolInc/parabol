import getRethink from '../database/rethinkDriver'
import {RDatum} from '../database/stricterR'
import RethinkForeignKeyLoaderMaker from './RethinkForeignKeyLoaderMaker'

export const tasksByDiscussionId = new RethinkForeignKeyLoaderMaker(
  'tasks',
  'discussionId',
  async (discusisonIds) => {
    const r = await getRethink()
    return (
      r
        .table('Task')
        .getAll(r.args(discusisonIds), {index: 'discussionId'})
        // include archived cards in the conversation, since it's persistent
        .run()
    )
  }
)

export const tasksByTeamId = new RethinkForeignKeyLoaderMaker(
  'tasks',
  'teamId',
  async (teamIds) => {
    const r = await getRethink()
    // waraning! contains private tasks
    return r
      .table('Task')
      .getAll(r.args(teamIds), {index: 'teamId'})
      .filter((task: RDatum) => task('tags').contains('archived').not())
      .run()
  }
)
