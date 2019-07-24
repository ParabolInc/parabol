import React from 'react'
import {MeetingMemberTaskSummaryList_meetingMember} from '../../../../../../__generated__/MeetingMemberTaskSummaryList_meetingMember.graphql'
import plural from '../../../../../utils/plural'
import {createFragmentContainer, graphql} from 'react-relay'
import TaskSummarySection from './TaskSummarySection'
import SummaryAvatarHeader from './SummaryAvatarHeader'

interface Props {
  meetingMember: MeetingMemberTaskSummaryList_meetingMember
}

const MeetingMemberTaskSummaryList = (props: Props) => {
  const {meetingMember} = props
  const newTasks = meetingMember.tasks || []
  const doneTasks = meetingMember.doneTasks || []
  const doneTasksLabel = `${doneTasks.length} ${plural(doneTasks.length, 'Task')} Done`
  const newTasksLabel = `${newTasks.length} New ${plural(newTasks.length, 'Task')}`
  return (
    <>
      <SummaryAvatarHeader meetingMember={meetingMember} />
      <TaskSummarySection label={doneTasksLabel} tasks={doneTasks} />
      <TaskSummarySection label={newTasksLabel} tasks={newTasks} />
    </>
  )
}

export default createFragmentContainer(MeetingMemberTaskSummaryList, {
  meetingMember: graphql`
    fragment MeetingMemberTaskSummaryList_meetingMember on MeetingMember {
      ...SummaryAvatarHeader_meetingMember
      ... on ActionMeetingMember {
        tasks {
          ...TaskSummarySection_tasks
        }
        doneTasks {
          ...TaskSummarySection_tasks
        }
      }
      ... on RetrospectiveMeetingMember {
        tasks {
          ...TaskSummarySection_tasks
        }
      }
    }
  `
})
