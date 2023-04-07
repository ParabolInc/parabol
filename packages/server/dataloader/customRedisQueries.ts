// Sometimes, a value cached is redis is harder to get than simply querying the primary key on a table
// this allows redis to cache the results of arbitrarily complex rethinkdb queries

import ms from 'ms'
import getRethink from '../database/rethinkDriver'
import {RDatum} from '../database/stricterR'
import getKysely from '../postgres/getKysely'

// All results must be mapped to their ids!
const customRedisQueries = {
  endTimesByTemplateId: async (templateIds: string[]) => {
    const r = await getRethink()
    const aQuarterAgo = new Date(Date.now() - ms('90d'))
    const meetings = (await (
      r
        .table('NewMeeting')
        .getAll(r.args(templateIds), {index: 'templateId'})
        .pluck('templateId', 'endedAt')
        .filter((row: RDatum) => row('endedAt').ge(aQuarterAgo))
        .group('templateId' as any) as any
    )
      .limit(1000)('endedAt')
      .run()) as {group: string; reduction: Date[]}[]
    return templateIds.map((id) => {
      const group = meetings.find((meeting) => meeting.group === id)
      return group ? group.reduction.map((date) => date.getTime()) : []
    })
  },
  publicTemplates: async (meetingTypes: string[]) => {
    const pg = getKysely()
    const publicTemplatesByType = await Promise.all(
      meetingTypes.map((type) => {
        const templateType = type === 'poker' ? 'poker' : 'retrospective'
        // Will convert to PG by Mar 1, 2023
        return pg
          .selectFrom('MeetingTemplate')
          .selectAll()
          .where('teamId', '=', 'aGhostTeam')
          .where('isActive', '=', true)
          .where('type', '=', templateType)
          .execute()
      })
    )

    return publicTemplatesByType
  },
  starterScales: async (teamIds: string[]) => {
    const r = await getRethink()

    const starterScales = await Promise.all(
      teamIds.map((teamId) => {
        return r
          .table('TemplateScale')
          .getAll(teamId, {index: 'teamId'})
          .filter({isStarter: true})
          .filter((row: RDatum) => row('removedAt').default(null).eq(null))
          .run()
      })
    )

    return starterScales
  }
} as const

export default customRedisQueries
