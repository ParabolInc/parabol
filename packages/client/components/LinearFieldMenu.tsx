import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {LinearFieldMenu_stage$key} from '../__generated__/LinearFieldMenu_stage.graphql'
import type {MenuProps} from '../hooks/useMenu'
import useUpdateIntegrationDimensionFieldMutation from '../mutations/useUpdateIntegrationDimensionFieldMutation'
import {SprintPokerDefaults} from '../types/constEnums'
import Menu from './Menu'
import MenuItem from './MenuItem'

interface Props {
  menuProps: MenuProps
  stageRef: LinearFieldMenu_stage$key
  submitScore(): void
}

const LinearFieldMenu = (props: Props) => {
  const {menuProps, stageRef, submitScore} = props
  const [updateIntegrationDimensionField] = useUpdateIntegrationDimensionFieldMutation()
  const stage = useFragment(
    graphql`
      fragment LinearFieldMenu_stage on EstimateStage {
        serviceField {
          name
        }
        dimensionRef {
          name
        }
        task {
          id
          integration {
            ... on _xLinearIssue {
              __typename
              id
            }
          }
        }
        meetingId
      }
    `,
    stageRef
  )
  const {portalStatus, isDropdown, closePortal} = menuProps
  const {serviceField, task, dimensionRef, meetingId} = stage
  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField
  const defaults = [
    SprintPokerDefaults.LINEAR_FIELD_ESTIMATE,
    SprintPokerDefaults.LINEAR_FIELD_PRIORITY,
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL
  ] as string[]
  const defaultActiveIdx = defaults.indexOf(serviceFieldName)

  if (task?.integration?.__typename !== '_xLinearIssue') return null
  const {id: taskId} = task
  const handleClick = (labelTemplate: string) => () => {
    if (labelTemplate !== serviceFieldName) {
      updateIntegrationDimensionField(
        {variables: {meetingId, taskId, dimensionName, fieldId: labelTemplate}},
        {onSuccess: submitScore}
      )
    } else {
      submitScore()
    }
    closePortal()
  }
  return (
    <>
      <Menu
        ariaLabel={'Select how to publish estimate to Linear'}
        portalStatus={portalStatus}
        isDropdown={isDropdown}
        defaultActiveIdx={defaultActiveIdx}
      >
        <MenuItem
          label={SprintPokerDefaults.LINEAR_FIELD_ESTIMATE_LABEL}
          onClick={handleClick(SprintPokerDefaults.LINEAR_FIELD_ESTIMATE)}
        />
        <MenuItem
          label={SprintPokerDefaults.LINEAR_FIELD_PRIORITY_LABEL}
          onClick={handleClick(SprintPokerDefaults.LINEAR_FIELD_PRIORITY)}
        />
        <MenuItem
          label={SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL}
          onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_COMMENT)}
        />
        <MenuItem
          label={SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL}
          onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_NULL)}
        />
      </Menu>
    </>
  )
}

export default LinearFieldMenu
