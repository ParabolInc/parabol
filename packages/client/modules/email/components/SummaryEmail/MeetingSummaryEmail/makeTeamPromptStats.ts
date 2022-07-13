import graphql from 'babel-plugin-relay/macro'
import plural from 'parabol-client/utils/plural'
import {makeTeamPromptStats_meeting$key} from 'parabol-client/__generated__/makeTeamPromptStats_meeting.graphql'
import {readInlineData} from 'react-relay'
import getPhaseByTypename from '~/utils/getPhaseByTypename'
import {isNotNull} from '~/utils/predicates'

const makeTeamPromptStats = (meetingRef: makeTeamPromptStats_meeting$key) => {
  const meeting = readInlineData(
    graphql`
      fragment makeTeamPromptStats_meeting on TeamPromptMeeting @inline {
        id
        meetingMembers {
          ... on TeamPromptMeetingMember {
            tasks {
              id
            }
          }
        }
        phases {
          id
          ... on TeamPromptResponsesPhase {
            __typename
            stages {
              discussion {
                thread(first: 1000) @connection(key: "DiscussionThread_thread") {
                  edges {
                    cursor
                  }
                }
              }
            }
          }
        }
        responses {
          plaintextContent
        }
      }
    `,
    meetingRef
  )

  const {phases, responses, meetingMembers} = meeting
  const responseCount = responses.filter((resp) => !!resp.plaintextContent).length
  const newTaskCount = meetingMembers.reduce((sum, {tasks}) => sum + tasks!.length, 0)

  const phase = getPhaseByTypename(phases, 'TeamPromptResponsesPhase')
  const allStages = phase.stages?.filter(isNotNull) || []
  // :TODO: (jmtaber129): Only use real comments - this number includes tasks.
  const commentCount = allStages.reduce(
    (sum, {discussion}) => sum + discussion.thread.edges.length,
    0
  )

  return [
    {value: responseCount, label: plural(responseCount, 'Response')},
    {value: commentCount, label: plural(commentCount, 'Comment')},
    {value: newTaskCount, label: plural(newTaskCount, 'New Task')}
  ]
}

export default makeTeamPromptStats
