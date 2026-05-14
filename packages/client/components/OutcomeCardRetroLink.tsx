import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {OutcomeCardRetroLink_task$key} from '~/__generated__/OutcomeCardRetroLink_task.graphql'
import RetroDiscussionLink from './RetroDiscussionLink'

interface Props {
  taskRef: OutcomeCardRetroLink_task$key
  openInNewTab?: boolean
}

const OutcomeCardRetroLink = ({taskRef, openInNewTab}: Props) => {
  const task = useFragment(
    graphql`
      fragment OutcomeCardRetroLink_task on Task {
        retroDiscussion {
          meetingName
          topicTitle
          url
        }
      }
    `,
    taskRef
  )
  if (!task.retroDiscussion) return null
  const {meetingName, topicTitle, url} = task.retroDiscussion
  return (
    <RetroDiscussionLink
      meetingName={meetingName}
      topicTitle={topicTitle}
      url={url}
      openInNewTab={openInNewTab}
    />
  )
}

export default OutcomeCardRetroLink
