/*import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import UpdateAzureDevOpsDimensionFieldMutation from '../mutations/UpdateAzureDevOpsDimensionFieldMutation'
import {SprintPokerDefaults} from '../types/constEnums'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemHR from './MenuItemHR'

interface Props {
  menuProps: MenuProps
  stage: AzureDevOpsFieldMenu_stage
  submitScore(): void
}

const AzureDevOpsFieldMenu = (props: Props) => {
  const {menuProps, stage, submitScore} = props
  const atmosphere = useAtmosphere()
  const {portalStatus, isDropdown, closePortal} = menuProps
  const {meetingId, dimensionRef, serviceField, task} = stage
  if (task?.integration?.__typename !== 'AzureDevOpsWorkItem') return null
  const {integration} = task
  const {instanceId, projectKey, possibleEstimationFieldNames} = integration
  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField
  const defaultActiveidx = useMemo(() => {
    if (possibleEstimationFieldNames.length === 0) return undefined
    if (serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_COMMENT)
      return possibleEstimationFieldNames.length + 1
    if (serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_NULL) return possibleEstimationFieldNames.length + 2
    const idx = possibleEstimationFieldNames.indexOf(serviceFieldName)
    return idx === -1 ? undefined : idx
  }, [serviceFieldName, possibleEstimationFieldNames])

  if (possibleEstimationFieldNames.length === 0) {
    return (
      <Menu ariaLabel={'Loading'} portalStatus={portalStatus} isDropdown={isDropdown}>
        <MenuItem key={'noResults'} label={'<<Cannot connect to Jira>>'} />
      </Menu>
    )
  }

  const handleClick = (fieldName: string) => () => {
    UpdateAzureDevOpsDimensionFieldMutation(
      atmosphere,
      {
        dimensionName,
        fieldName,
        meetingId,
        instanceId,
        projectKey
      },
      {
        onCompleted: submitScore,
        onError: () => {
        }
      }
    )
    closePortal()
  }
  return (
    <Menu
      ariaLabel={'Select the Jira Field to push to'}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
      defaultActiveIdx={defaultActiveidx}
    >
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

export default createFragmentContainer(AzureDevOpsFieldMenu, {
  stage: graphql`
    fragment AzureDevOpsFieldMenu_stage on EstimateStage {
      dimensionRef {
        name
      }
      meetingId
      serviceField {
        name
      }
      task {
        integration {
          ... on AzureDevOpsWorkItem {
            __typename
            projectKey
            instanceId
            possibleEstimationFieldNames
          }
        }
      }
    }
  `
})
*/
