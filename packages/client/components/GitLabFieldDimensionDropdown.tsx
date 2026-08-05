import {ExpandMore} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {GitLabFieldDimensionDropdown_stage$key} from '../__generated__/GitLabFieldDimensionDropdown_stage.graphql'
import interpolateVotingLabelTemplate from '../shared/interpolateVotingLabelTemplate'
import {SprintPokerDefaults} from '../types/constEnums'
import {cn} from '../ui/cn'
import {Menu} from '../ui/Menu/Menu'
import EditVotingLabelTemplateModal from './EditVotingLabelTemplateModal'
import type {EditModalConfig} from './GitLabFieldMenu'
import GitLabFieldMenu from './GitLabFieldMenu'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  clearError: () => void
  isFacilitator: boolean
  stageRef: GitLabFieldDimensionDropdown_stage$key
  submitScore(): void
}

const labelLookup = {
  [SprintPokerDefaults.GITLAB_FIELD_TIME_ESTIMATE]:
    SprintPokerDefaults.GITLAB_FIELD_TIME_ESTIMATE_LABEL,
  [SprintPokerDefaults.GITLAB_FIELD_WEIGHT]: SprintPokerDefaults.GITLAB_FIELD_WEIGHT_LABEL,
  [SprintPokerDefaults.SERVICE_FIELD_COMMENT]: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
  [SprintPokerDefaults.SERVICE_FIELD_NULL]: SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL
}

const GitLabFieldDimensionDropdown = (props: Props) => {
  const {clearError, stageRef, isFacilitator, submitScore} = props
  const stage = useFragment(
    graphql`
      fragment GitLabFieldDimensionDropdown_stage on EstimateStage {
        ...GitLabFieldMenu_stage
        finalScore
        serviceField {
          name
        }
      }
    `,
    stageRef
  )
  const {finalScore, serviceField} = stage
  const {name: serviceFieldName} = serviceField
  const [editModalConfig, setEditModalConfig] = useState<EditModalConfig | null>(null)

  const label =
    labelLookup[serviceFieldName as keyof typeof labelLookup] ||
    interpolateVotingLabelTemplate(serviceFieldName, finalScore)

  const trigger = (
    <PlainButton
      className={cn(
        'flex select-none text-fg-primary',
        isFacilitator
          ? 'hover:opacity-50 focus:opacity-50 active:opacity-50'
          : 'cursor-default pr-2'
      )}
    >
      <div className='text-sm'>{label}</div>
      <ExpandMore className={cn('h-[18px] w-[18px]', !isFacilitator && 'hidden')} />
    </PlainButton>
  )

  if (!isFacilitator) return trigger

  return (
    <>
      <Menu trigger={trigger} onOpenChange={(open) => open && clearError()}>
        <GitLabFieldMenu
          stageRef={stage}
          submitScore={submitScore}
          onOpenEditModal={setEditModalConfig}
        />
      </Menu>
      {editModalConfig && (
        <EditVotingLabelTemplateModal
          isOpen
          onClose={() => setEditModalConfig(null)}
          updateLabelTemplate={editModalConfig.updateLabelTemplate}
          defaultValue={editModalConfig.defaultValue}
          placeholder={editModalConfig.placeholder}
        />
      )}
    </>
  )
}

export default GitLabFieldDimensionDropdown
