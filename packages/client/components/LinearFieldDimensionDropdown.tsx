import {ExpandMore} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {LinearFieldDimensionDropdown_stage$key} from '../__generated__/LinearFieldDimensionDropdown_stage.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import interpolateVotingLabelTemplate from '../shared/interpolateVotingLabelTemplate'
import {SprintPokerDefaults} from '../types/constEnums'
import LinearFieldMenu from './LinearFieldMenu'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  clearError: () => void
  isFacilitator: boolean
  stageRef: LinearFieldDimensionDropdown_stage$key
  submitScore(): void
}

const labelLookup = {
  [SprintPokerDefaults.LINEAR_FIELD_ESTIMATE]: SprintPokerDefaults.LINEAR_FIELD_ESTIMATE_LABEL,
  [SprintPokerDefaults.LINEAR_FIELD_PRIORITY]: SprintPokerDefaults.LINEAR_FIELD_PRIORITY_LABEL,
  [SprintPokerDefaults.SERVICE_FIELD_COMMENT]: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
  [SprintPokerDefaults.SERVICE_FIELD_NULL]: SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL
}

const LinearFieldDimensionDropdown = (props: Props) => {
  const {clearError, stageRef, isFacilitator, submitScore} = props
  const stage = useFragment(
    graphql`
      fragment LinearFieldDimensionDropdown_stage on EstimateStage {
        ...LinearFieldMenu_stage
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
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLButtonElement>(
    MenuPosition.UPPER_RIGHT,
    {
      isDropdown: true,
      id: 'linearFieldMenu'
    }
  )

  const onClick = () => {
    if (!isFacilitator) return
    togglePortal()
    clearError()
  }

  const label =
    labelLookup[serviceFieldName as keyof typeof labelLookup] ||
    interpolateVotingLabelTemplate(serviceFieldName, finalScore)

  return (
    <>
      <PlainButton
        className={`flex text-slate-700 select-none ${isFacilitator ? 'hover:opacity-50 focus:opacity-50 active:opacity-50' : 'cursor-default'} ${!isFacilitator ? 'pr-2' : ''}`}
        onClick={onClick}
        ref={originRef}
      >
        <div className='text-sm'>{label}</div>
        <ExpandMore className={`h-[18px] w-[18px] ${!isFacilitator ? 'hidden' : ''}`} />
      </PlainButton>
      {menuPortal(
        <LinearFieldMenu menuProps={menuProps} stageRef={stage} submitScore={submitScore} />
      )}
    </>
  )
}

export default LinearFieldDimensionDropdown
