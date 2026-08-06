import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {ExpandMore} from '~/ui/icons'
import type {GitHubFieldDimensionDropdown_stage$key} from '../__generated__/GitHubFieldDimensionDropdown_stage.graphql'
import interpolateVotingLabelTemplate from '../shared/interpolateVotingLabelTemplate'
import {SprintPokerDefaults} from '../types/constEnums'
import {cn} from '../ui/cn'
import {Menu} from '../ui/Menu/Menu'
import EditVotingLabelTemplateModal from './EditVotingLabelTemplateModal'
import GitHubFieldMenu, {type EditModalConfig} from './GitHubFieldMenu'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  clearError: () => void
  isFacilitator: boolean
  stageRef: GitHubFieldDimensionDropdown_stage$key
  submitScore(): void
}

const labelLookup = {
  [SprintPokerDefaults.SERVICE_FIELD_COMMENT]: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
  [SprintPokerDefaults.SERVICE_FIELD_NULL]: SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL
}

const GitHubFieldDimensionDropdown = (props: Props) => {
  const {clearError, stageRef, isFacilitator, submitScore} = props
  const stage = useFragment(
    graphql`
      fragment GitHubFieldDimensionDropdown_stage on EstimateStage {
        ...GitHubFieldMenu_stage
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
        <GitHubFieldMenu
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

export default GitHubFieldDimensionDropdown
