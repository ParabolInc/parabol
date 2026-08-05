import {ExpandMore} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {JiraFieldDimensionDropdown_stage$key} from '../__generated__/JiraFieldDimensionDropdown_stage.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {SprintPokerDefaults} from '../types/constEnums'
import JiraFieldMenu from './JiraFieldMenu'
import PlainButton from './PlainButton/PlainButton'

interface Props {
  clearError: () => void
  isFacilitator: boolean
  stageRef: JiraFieldDimensionDropdown_stage$key
  submitScore(): void
}

const labelLookup = {
  [SprintPokerDefaults.SERVICE_FIELD_COMMENT]: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
  [SprintPokerDefaults.SERVICE_FIELD_NULL]: SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL
}

const JiraFieldDimensionDropdown = (props: Props) => {
  const {clearError, stageRef, isFacilitator, submitScore} = props

  const stage = useFragment(
    graphql`
      fragment JiraFieldDimensionDropdown_stage on EstimateStage {
        ...JiraFieldMenu_stage
        serviceField {
          name
        }
        task {
          integration {
            ... on JiraIssue {
              possibleEstimationFields {
                fieldId
                fieldName
              }
            }
          }
        }
      }
    `,
    stageRef
  )

  const {serviceField, task} = stage
  const possibleEstimationFields = task?.integration?.possibleEstimationFields ?? []
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

  const validFields = [
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL,
    ...possibleEstimationFields.map(({fieldName}) => fieldName)
  ]
  const lookupServiceFieldName = validFields.includes(serviceFieldName)
    ? serviceFieldName
    : SprintPokerDefaults.SERVICE_FIELD_COMMENT

  const label =
    labelLookup[lookupServiceFieldName as keyof typeof labelLookup] ?? lookupServiceFieldName
  return (
    <>
      <PlainButton
        className={`flex select-none text-fg-primary ${isFacilitator ? 'hover:opacity-50 focus:opacity-50 active:opacity-50' : 'cursor-default pr-2'}`}
        onClick={onClick}
        ref={originRef}
      >
        <div className='text-sm'>{label}</div>
        <ExpandMore className={`h-[18px] w-[18px] ${!isFacilitator ? 'hidden' : ''}`} />
      </PlainButton>
      {menuPortal(<JiraFieldMenu menuProps={menuProps} stage={stage} submitScore={submitScore} />)}
    </>
  )
}

export default JiraFieldDimensionDropdown
