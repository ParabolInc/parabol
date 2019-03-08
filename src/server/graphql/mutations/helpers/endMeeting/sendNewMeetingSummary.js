import getRethink from 'server/database/rethinkDriver'
import sendEmailPromise from 'server/email/sendEmail'
import {RETROSPECTIVE} from 'universal/utils/constants'

const getRetroMeeting = (meetingId) => {
  const r = getRethink()
  return r
    .table('NewMeeting')
    .get(meetingId)
    .merge((meeting) => ({
      meetingMembers: r
        .table('MeetingMember')
        .getAll(meetingId, {index: 'meetingId'})
        .merge((meetingMember) => ({
          user: r
            .table('User')
            .get(meetingMember('userId'))
            // email clients don't typically display SVGs, so when a user uploads an SVG, we upload a PNG with it
            // when we email the client, we use the png version
            .merge((row) => ({
              ext: row('picture')
                .match('svg$')('start')
                .default(null)
            }))
            .merge((row) => ({
              picture: r.branch(
                row('ext'),
                row('picture')
                  .slice(0, row('ext'))
                  .add('png'),
                row('picture')
              )
            })),
          tasks: r
            .table('Task')
            .getAll(meeting('teamId'), {index: 'teamId'})
            .filter({
              userId: meetingMember('userId'),
              meetingId
            })
            .filter((task) =>
              task('tags')
                .contains('private')
                .not()
            )
            .coerceTo('array')
        }))
        .coerceTo('array'),
      team: r.table('Team').get(meeting('teamId')),
      reflectionGroups: r
        .table('RetroReflectionGroup')
        .getAll(meetingId, {index: 'meetingId'})
        .filter({isActive: true})
        .merge((reflectionGroup) => ({
          reflections: r
            .table('RetroReflection')
            .getAll(reflectionGroup('id'), {index: 'reflectionGroupId'})
            .filter({isActive: true})
            .merge((reflection) => ({
              phaseItem: r.table('CustomPhaseItem').get(reflection('retroPhaseItemId'))
            }))
            .coerceTo('array'),
          voteCount: reflectionGroup('voterIds')
            .count()
            .default(0)
        }))
        .filter((group) => group('voteCount').ge(1))
        .orderBy(r.desc('voteCount'))
        .coerceTo('array')
    }))
}

const meetingGetters = {
  [RETROSPECTIVE]: getRetroMeeting
}

export default async function sendNewMeetingSummary(newMeeting) {
  const {id: meetingId, meetingType, summarySentAt} = newMeeting
  const r = getRethink()
  if (summarySentAt) return
  const specificMeeting = await meetingGetters[meetingType](meetingId)
  const emails = specificMeeting.meetingMembers.map((member) => member.user.email)
  const emailString = emails.join(', ')
  const emailSuccess = await sendEmailPromise(emailString, 'newMeetingSummaryEmailCreator', {
    meeting: specificMeeting
  })
  if (emailSuccess) {
    const now = new Date()
    await r
      .table('NewMeeting')
      .get(meetingId)
      .update({summarySentAt: now})
  }
}
