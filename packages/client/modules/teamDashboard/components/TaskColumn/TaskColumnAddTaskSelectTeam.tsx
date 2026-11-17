import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TaskColumnAddTaskSelectTeam_teams$key} from '~/__generated__/TaskColumnAddTaskSelectTeam_teams.graphql'
import type {TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import AddTaskButton from '../../../../components/AddTaskButton/AddTaskButton'
import TeamPickerMenuContent from '../../../../components/TeamPicker/TeamPickerMenuContent'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import CreateTaskMutation from '../../../../mutations/CreateTaskMutation'
import {Menu} from '../../../../ui/Menu/Menu'
import {taskStatusLabels} from '../../../../utils/taskStatus'

interface Props {
  status: TaskStatusEnum
  sortOrder: number
  teams: TaskColumnAddTaskSelectTeam_teams$key
  userId: string
}

const TaskColumnAddTaskSelectTeam = (props: Props) => {
  const {sortOrder, status, teams: teamsRef, userId} = props
  const teams = useFragment(
    graphql`
      fragment TaskColumnAddTaskSelectTeam_teams on Team @relay(plural: true) {
        ...TeamPickerMenuContent_teams
      }
    `,
    teamsRef
  )
  const label = taskStatusLabels[status]
  const atmosphere = useAtmosphere()
  const onSelectTeam = (teamId: string) => {
    CreateTaskMutation(
      atmosphere,
      {
        newTask: {
          sortOrder,
          status,
          teamId,
          userId
        }
      },
      {}
    )
  }
  return (
    <Menu trigger={<AddTaskButton label={label} />}>
      <TeamPickerMenuContent teamsRef={teams} selectedTeamIds={[]} onSelectTeam={onSelectTeam} />
    </Menu>
  )
}

export default TaskColumnAddTaskSelectTeam
