import React, {useEffect, useState} from 'react'
import styled from 'react-emotion'
import EditorHelpModalContainer from 'universal/containers/EditorHelpModalContainer/EditorHelpModalContainer'
import TaskColumn from 'universal/modules/teamDashboard/components/TaskColumn/TaskColumn'
import ui from 'universal/styles/ui'
import {AreaEnum, ITask} from 'universal/types/graphql'
import {columnArray, MEETING, meetingColumnArray} from 'universal/utils/constants'
import makeTasksByStatus from 'universal/utils/makeTasksByStatus'
import {createFragmentContainer, graphql} from 'react-relay'

const RootBlock = styled('div')({
  display: 'flex',
  flex: '1',
  width: '100%'
})

const ColumnsBlock = styled('div')({
  display: 'flex',
  flex: '1',
  margin: '0 auto',
  maxWidth: ui.taskColumnsMaxWidth,
  minWidth: ui.taskColumnsMinWidth,
  padding: `0 ${ui.taskColumnPaddingInnerSmall}`,
  width: '100%',

  [ui.dashBreakpoint]: {
    paddingLeft: ui.taskColumnPaddingInnerLarge,
    paddingRight: ui.taskColumnPaddingInnerLarge
  }
})

interface Props {
  area: AreaEnum
  getTaskById: (taskId: string) => Partial<ITask> | undefined | null
  isMyMeetingSection?: boolean
  myTeamMemberId: string
  tasks: any
  teamMemberFilterId?: string
  teams?: any
}

const TaskColumns = (props: Props) => {
  const {
    area,
    getTaskById,
    isMyMeetingSection,
    myTeamMemberId,
    teamMemberFilterId,
    teams,
    tasks
  } = props
  const [groupedTasks, setGroupedTasks] = useState(() => {
    return makeTasksByStatus(tasks.edges.map(({node}) => node))
  })
  useEffect(() => {
    const nodes = tasks.edges.map(({node}) => node)
    setGroupedTasks(makeTasksByStatus(nodes))
  }, [tasks])
  const lanes = area === MEETING ? meetingColumnArray : columnArray
  return (
    <RootBlock>
      <ColumnsBlock>
        {lanes.map((status) => (
          <TaskColumn
            key={status}
            area={area}
            isMyMeetingSection={isMyMeetingSection}
            getTaskById={getTaskById}
            myTeamMemberId={myTeamMemberId}
            teamMemberFilterId={teamMemberFilterId}
            tasks={groupedTasks[status]}
            status={status}
            teams={teams}
          />
        ))}
      </ColumnsBlock>
      <EditorHelpModalContainer />
    </RootBlock>
  )
}

export default createFragmentContainer(
  TaskColumns,
  graphql`
    fragment TaskColumns_tasks on TaskConnection {
      edges {
        node {
          ...TaskColumn_tasks
          status
          sortOrder
        }
      }
    }
  `
)
