import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {JiraServerFieldMenu_stage$key} from '../__generated__/JiraServerFieldMenu_stage.graphql'
import type {MenuProps} from '../hooks/useMenu'
import useUpdateIntegrationDimensionFieldMutation from '../mutations/useUpdateIntegrationDimensionFieldMutation'
import {SprintPokerDefaults} from '../types/constEnums'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemHR from './MenuItemHR'

interface Props {
  menuProps: MenuProps
  stage: JiraServerFieldMenu_stage$key
  submitScore(): void
}

const JiraServerFieldMenu = (props: Props) => {
  const {menuProps, stage: stageRef, submitScore} = props
  const [updateIntegrationDimensionField] = useUpdateIntegrationDimensionFieldMutation()
  const {portalStatus, isDropdown, closePortal} = menuProps

  const stage = useFragment(
    graphql`
      fragment JiraServerFieldMenu_stage on EstimateStage {
        dimensionRef {
          name
        }
        meetingId
        serviceField {
          name
        }
        task {
          id
          integration {
            ... on JiraServerIssue {
              __typename
              id
              possibleEstimationFieldNames
            }
          }
        }
      }
    `,
    stageRef
  )
  const {meetingId, dimensionRef, serviceField, task} = stage

  if (task?.integration?.__typename !== 'JiraServerIssue') return null

  const {id: taskId, integration} = task
  const {possibleEstimationFieldNames} = integration

  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField
  // biome-ignore lint/correctness/useHookAtTopLevel: legacy
  const defaultActiveidx = useMemo(() => {
    if (possibleEstimationFieldNames.length === 0) return undefined
    if (serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_COMMENT)
      return possibleEstimationFieldNames.length + 1
    if (serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_NULL)
      return possibleEstimationFieldNames.length + 2
    const idx = possibleEstimationFieldNames.indexOf(serviceFieldName)
    return idx === -1 ? undefined : idx
  }, [serviceFieldName, possibleEstimationFieldNames])

  const handleClick = (fieldName: string) => () => {
    updateIntegrationDimensionField(
      {variables: {meetingId, taskId, dimensionName, fieldId: fieldName}},
      {onSuccess: submitScore}
    )
    closePortal()
  }
  return (
    <Menu
      ariaLabel={'Select the JiraServer Field to push to'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
      defaultActiveIdx={defaultActiveidx}
    >
      {possibleEstimationFieldNames.length === 0 && (
        <div className='px-4 pt-2 pb-0 text-fg-secondary text-sm'>No fields found</div>
      )}
      {possibleEstimationFieldNames.map((fieldName) => {
        return <MenuItem key={fieldName} label={fieldName} onClick={handleClick(fieldName)} />
      })}
      <MenuItemHR />
      <MenuItem
        key={'__comment'}
        label={SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL}
        onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_COMMENT)}
      />
      <MenuItem
        key={'__null'}
        label={SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL}
        onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_NULL)}
      />
    </Menu>
  )
}

export default JiraServerFieldMenu
