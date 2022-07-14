import graphql from 'babel-plugin-relay/macro'
import plural from 'parabol-client/utils/plural'
import {makeTeamPromptStats_meeting$key} from 'parabol-client/__generated__/makeTeamPromptStats_meeting.graphql'
import {readInlineData} from 'react-relay'

const makeTeamPromptStats = (meetingRef: makeTeamPromptStats_meeting$key) => {
  const meeting = readInlineData(
    graphql`
      fragment makeTeamPromptStats_meeting on TeamPromptMeeting @inline {
        id
        taskCount
        commentCount
        responses {
          plaintextContent
        }
      }
    `,
    meetingRef
  )

  const {responses, taskCount: newTaskCount, commentCount} = meeting
  const responseCount = responses.filter((resp) => !!resp.plaintextContent).length

  return [
    {value: responseCount, label: plural(responseCount, 'Response')},
    {value: commentCount, label: plural(commentCount, 'Comment')},
    {value: newTaskCount, label: plural(newTaskCount, 'New Task')}
  ]
}

export default makeTeamPromptStats
