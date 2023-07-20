import {r, RValue} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'

export async function up() {
  await connectRethinkDB()
  await r
    .table('NewMeeting')
    .filter({meetingType: 'retrospective'})
    // date of the addTeamHealthToAllMeetingSettingsRetrospective migration
    .filter((row: RValue) => row('createdAt').ge(new Date(1686226640890)))
    .update((row: RValue) => ({
      phases: row('phases').map((phase: RValue) =>
        r.branch(
          phase('phaseType').ne('TEAM_HEALTH'),
          phase,
          phase.merge({
            stages: phase('stages').map((stage: RValue) =>
              stage.merge({
                votes: stage('votes').map((vote: RValue) =>
                  r.branch(
                    vote('label').eq('😀'),
                    {
                      vote: 0,
                      userId: vote('userId')
                    },
                    vote('label').eq('😐'),
                    {
                      vote: 1,
                      userId: vote('userId')
                    },
                    {
                      vote: 2,
                      userId: vote('userId')
                    }
                  )
                )
              })
            )
          })
        )
      )
    }))
    .run()
  await r.getPoolMaster()?.drain()
}

export async function down() {
  await connectRethinkDB()
  await r
    .table('NewMeeting')
    .filter({meetingType: 'retrospective'})
    // date of the addTeamHealthToAllMeetingSettingsRetrospective migration
    .filter((row: RValue) => row('createdAt').ge(new Date(1686226640890)))
    .update((row: RValue) => ({
      phases: row('phases').map((phase: RValue) =>
        r.branch(
          phase('phaseType').ne('TEAM_HEALTH'),
          phase,
          phase.merge({
            stages: phase('stages').map((stage: RValue) =>
              stage.merge({
                votes: stage('votes').map((vote: RValue) =>
                  r.branch(
                    vote('vote').eq(0),
                    {
                      label: '😀',
                      userId: vote('userId')
                    },
                    vote('vote').eq(1),
                    {
                      label: '😐',
                      userId: vote('userId')
                    },
                    {
                      label: '😢',
                      userId: vote('userId')
                    }
                  )
                )
              })
            )
          })
        )
      )
    }))
    .run()
  await r.getPoolMaster()?.drain()
}
