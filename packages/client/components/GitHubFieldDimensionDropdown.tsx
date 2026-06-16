import styled from '@emotion/styled'
import {ExpandMore} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import type {GitHubFieldDimensionDropdown_stage$key} from '../__generated__/GitHubFieldDimensionDropdown_stage.graphql'
import interpolateVotingLabelTemplate from '../shared/interpolateVotingLabelTemplate'
import {SprintPokerDefaults} from '../types/constEnums'
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
    <Wrapper isFacilitator={isFacilitator}>
      <CurrentValue>{label}</CurrentValue>
      <StyledIcon isFacilitator={isFacilitator} />
    </Wrapper>
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
