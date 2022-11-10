import {R} from 'rethinkdb-ts'

const enum MeetingTypeEnum {
  action = 'action',
  retrospective = 'retrospective',
  poker = 'poker'
}
const enum NewMeetingPhaseTypeEnum {
  lobby = 'lobby',
  checkin = 'checkin',
  updates = 'updates',
  firstcall = 'firstcall',
  agendaitems = 'agendaitems',
  lastcall = 'lastcall',
  reflect = 'reflect',
  group = 'group',
  vote = 'vote',
  discuss = 'discuss',
  SUMMARY = 'SUMMARY',
  SCOPE = 'SCOPE',
  ESTIMATE = 'ESTIMATE'
}

export const up = async function (r: R) {
  try {
    const getDiscussionIds = (meetingRow) => {
      return meetingRow('phases')
        .filter({phaseType: NewMeetingPhaseTypeEnum.ESTIMATE})('stages')
        .concatMap((row) => row('discussionId'))
    }
    const getCompletedStories = (meetingRow) => {
      return meetingRow('phases')
        .filter({phaseType: NewMeetingPhaseTypeEnum.ESTIMATE})('stages')
        .nth(0)
        .filter({isComplete: true})
        .map((row) => row('serviceTaskId'))
    }

    await r
      .table('NewMeeting')
      .filter({meetingType: MeetingTypeEnum.poker})
      .filter((row) => row('endedAt').default(null).ne(null))
      .update(
        (row) => ({
          commentCount: r
            .table('Comment')
            .getAll(r.args(getDiscussionIds(row)), {index: 'discussionId'})
            .count()
            .default(0),
          storyCount: getCompletedStories(row).count().default(0)
        }),
        {nonAtomic: true}
      )
      .run()
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r: R) {
  try {
    await r
      .table('NewMeeting')
      .filter({meetingType: MeetingTypeEnum.poker})
      .replace((row) => row.without('commentCount', 'storyCount'))
      .run()
  } catch (e) {
    console.log(e)
  }
}
