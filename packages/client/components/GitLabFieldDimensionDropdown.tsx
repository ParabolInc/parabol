import styled from '@emotion/styled'
import {ExpandMore} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import type {GitLabFieldDimensionDropdown_stage$key} from '../__generated__/GitLabFieldDimensionDropdown_stage.graphql'
import interpolateVotingLabelTemplate from '../shared/interpolateVotingLabelTemplate'
import {SprintPokerDefaults} from '../types/constEnums'
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

const Wrapper = styled(PlainButton)<{isFacilitator: boolean}>(({isFacilitator}) => ({
  color: PALETTE.SLATE_700,
  cursor: isFacilitator ? undefined : 'default',
  display: 'flex',
  paddingRight: isFacilitator ? undefined : 8,
  userSelect: 'none',
  ':hover,:focus,:active': {
    opacity: isFacilitator ? '50%' : undefined
  }
}))

const CurrentValue = styled('div')({
  fontSize: 14
})

const StyledIcon = styled(ExpandMore)<{isFacilitator: boolean}>(({isFacilitator}) => ({
  height: 18,
  width: 18,
  display: isFacilitator ? undefined : 'none'
}))

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
    <Wrapper isFacilitator={isFacilitator}>
      <CurrentValue>{label}</CurrentValue>
      <StyledIcon isFacilitator={isFacilitator} />
    </Wrapper>
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
