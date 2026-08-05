import {ExpandMore} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {JiraServerFieldDimensionDropdown_stage$key} from '../__generated__/JiraServerFieldDimensionDropdown_stage.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {SprintPokerDefaults} from '../types/constEnums'
import {cn} from '../ui/cn'
import JiraServerFieldMenu from './JiraServerFieldMenu'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  clearError: () => void
  isFacilitator: boolean
  stageRef: JiraServerFieldDimensionDropdown_stage$key
  submitScore(): void
}

const labelLookup = {
  [SprintPokerDefaults.SERVICE_FIELD_COMMENT]: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
  [SprintPokerDefaults.SERVICE_FIELD_NULL]: SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL
} as const

const JiraServerFieldDimensionDropdown = (props: Props) => {
  const {clearError, stageRef, isFacilitator, submitScore} = props

  const stage = useFragment(
    graphql`
      fragment JiraServerFieldDimensionDropdown_stage on EstimateStage {
        ...JiraServerFieldMenu_stage
        serviceField {
          name
        }
        task {
          integration {
            ... on JiraServerIssue {
              id
              possibleEstimationFieldNames
            }
          }
        }
      }
    `,
    stageRef
  )

  const {serviceField, task} = stage
  const possibleEstimationFieldNames = task?.integration?.possibleEstimationFieldNames ?? []
  const {name: serviceFieldName} = serviceField
  const {togglePortal, menuPortal, originRef, menuProps} = useMenu<HTMLButtonElement>(
    MenuPosition.UPPER_RIGHT,
    {
      isDropdown: true
    }
  )

  const onClick = () => {
    if (!isFacilitator) return
    togglePortal()
    clearError()
  }

  const lookupServiceFieldName = [
    ...possibleEstimationFieldNames,
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL
  ].includes(serviceFieldName)
    ? serviceFieldName
    : SprintPokerDefaults.SERVICE_FIELD_COMMENT

  const label =
    labelLookup[lookupServiceFieldName as keyof typeof labelLookup] ?? lookupServiceFieldName
  return (
    <PlainButton
      className={cn(
        'flex select-none text-fg-primary',
        isFacilitator
          ? 'hover:opacity-50 focus:opacity-50 active:opacity-50'
          : 'cursor-default pr-2'
      )}
      onClick={onClick}
      ref={originRef}
    >
      <div className='text-sm'>{label}</div>
      <ExpandMore className={cn('h-[18px] w-[18px]', !isFacilitator && 'hidden')} />
      {menuPortal(
        <JiraServerFieldMenu menuProps={menuProps} stage={stage} submitScore={submitScore} />
      )}
    </PlainButton>
  )
}

export default JiraServerFieldDimensionDropdown
