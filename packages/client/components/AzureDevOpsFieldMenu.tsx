//import styled from '@emotion/styled-base'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {useFragment} from 'react-relay'
//import {isConstructorDeclaration} from 'typescript'
//import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import UpdateAzureDevOpsDimensionFieldMutation from '../mutations/UpdateAzureDevOpsDimensionFieldMutation'
import useModal from '../hooks/useModal'
//import textOverflow from '../styles/helpers/textOverflow'
//import {PALETTE} from '../styles/paletteV3'
//import {FONT_FAMILY, ICON_SIZE} from '../styles/typographyV2'
import {SprintPokerDefaults} from '../types/constEnums'
import {AzureDevOpsFieldMenu_stage$key} from '../__generated__/AzureDevOpsFieldMenu_stage.graphql'
//import FlatButton from './FlatButton'
//import Icon from './Icon'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemHR from './MenuItemHR'
//import UpdateUserProfileMutation from '~/mutations/UpdateUserProfileMutation'
import useAtmosphere from '~/hooks/useAtmosphere'
/*
const LabelOptionRoot = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  minWidth: '300px'
})

const LabelOptionBlock = styled('div')({
  display: 'block',
  flexDirection: 'column',
  maxWidth: '200px',
  paddingTop: 12,
  paddingLeft: 16,
  paddingBottom: 12,
  flexGrow: 1
})

const LabelOptionName = styled('div')({
  color: PALETTE.SLATE_700,
  display: 'flex',
  fontFamily: FONT_FAMILY.SANS_SERIF,
  lineHeight: '24px'
})

const LabelOptionSub = styled('div')({
  ...textOverflow,
  color: PALETTE.SLATE_600,
  fontFamily: FONT_FAMILY.SANS_SERIF,
  fontSize: 12,
  lineHeight: '16px'
})

const EditButtonGroup = styled('div')({
  paddingLeft: '8px',
  paddingRight: '8px',
  marginTop: 'auto',
  marginBottom: 'auto'
})
const Button = styled(FlatButton)({
  alignItems: 'center',
  color: PALETTE.SLATE_600,
  height: 32,
  justifyContent: 'center',
  padding: 0,
  width: 32
})

const ActionButton = styled(Icon)({
  fontSize: ICON_SIZE.MD18
})*/

interface Props {
  menuProps: MenuProps
  stageRef: AzureDevOpsFieldMenu_stage$key
  submitScore(): void
}

interface MenuOption {
  label: string
  fieldValue: string
}

const AzureDevOpsFieldMenu = (props: Props) => {
  const {menuProps, stageRef, submitScore} = props
  /*
  user story - [Origional Estimate, Comment, ...possibleFielNames, Do Not Update]
  task - [Estimate Hours, Comment, ...possibleFielNames, Do Not Update]
  other - [Comment, ...possibleFilesNames, Do Not Update]

  *possibleFileNames is a list of ADO fields than can accept the estimate......unique per work item type
  */
  const atmosphere = useAtmosphere()
  const stage = useFragment(
    graphql`
      fragment AzureDevOpsFieldMenu_stage on EstimateStage {
        serviceField {
          name
        }
        dimensionRef {
          name
        }
        task {
          integration {
            ... on AzureDevOpsWorkItem {
              __typename
              id
              title
              teamProject
              url
              state
              type
            }
          }
        }
        meetingId
      }
    `,
    stageRef
  )
  const {portalStatus, isDropdown, closePortal} = menuProps
  const {serviceField, task, meetingId, dimensionRef} = stage
  const {name: serviceFieldName} = serviceField
  const {name: dimensionName} = dimensionRef
  /*const defaults = [
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL
  ] as string[]*/
  const defaultActiveIdx = useMemo(() => {
    if (serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL
      || serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_COMMENT) {
      return 1
    } else {
      return 0
    }
  }, [serviceFieldName])
  const {
    modalPortal,
    openPortal,
    closePortal: closeModal
  } = useModal({
    id: 'editAzureDevOpsLabel',
    parentId: 'azureDevOpsFieldMenu'
  })
  if (!modalPortal) {
    console.log('no modalPortal')
  }
  if (!openPortal) {
    console.log('no openPortal')
  }
  if (!closeModal) {
    console.log('no closeModal')
  }
  if (task?.integration?.__typename !== 'AzureDevOpsWorkItem') return null
  const {integration} = task
  const {id: workItemId, title, teamProject, url, state, type: workItemType} = integration
  console.log(`AzureDevOpsFieldMenu -type:${workItemType} | id:${workItemId} | url:${url} | state:${state} | title:${title}`)
  const getInstanceId = (url: URL) => {
    const index = url.pathname.indexOf('/', 1)
    return url.hostname + url.pathname.substring(0, index)
  }
  const handleClick = (fieldName: string) => () => {
    console.log(`handleClick - fieldName: ${fieldName}`)
    console.log(`handleClick - serviceFieldName: ${serviceFieldName}`)
    console.log(`handleClick - url:${url}`)
    if (fieldName !== serviceFieldName) {
      UpdateAzureDevOpsDimensionFieldMutation(
        atmosphere,
        {
          meetingId,
          instanceId: getInstanceId(new URL(url)),
          dimensionName,
          fieldName,
          projectKey: teamProject
        },
        {
          onCompleted: submitScore,
          onError: () => {
            /* noop */
          }
        }
      )
    } else {
      submitScore()
    }
    closePortal()
  }
  const getDefaultMenuValues = (workItemType: string): MenuOption[] => {
    console.log(`inside getDefaultMenuValues with a workItemType of ${workItemType}`)
    if (workItemType === 'User Story') {
      return [
        {label: SprintPokerDefaults.AZUREDEVOPS_USERSTORY_FIELD_LABEL, fieldValue: SprintPokerDefaults.AZUREDEVOPS_USERSTORY_FIELD},
        {label: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL, fieldValue: SprintPokerDefaults.SERVICE_FIELD_COMMENT},
      ]
    } else if (workItemType === 'Task') {
      return [
        {label: SprintPokerDefaults.AZUREDEVOPS_TAKS_FIELD_LABEL, fieldValue: SprintPokerDefaults.AZUREDEVOPS_TASK_FIELD},
        {label: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL, fieldValue: SprintPokerDefaults.SERVICE_FIELD_COMMENT},
      ]
    } else {
      return [
        {label: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL, fieldValue: SprintPokerDefaults.SERVICE_FIELD_COMMENT}
      ]
    }
  }
  const menuValues = getDefaultMenuValues(workItemType)
  console.log(`menuValues: ${JSON.stringify(menuValues)}`)
  /*const openEditModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    openPortal()
  }*/
  //const defaultLabelTemplate = `${dimensionName}: {{#}}`
  //const serviceFieldTemplate = defaults.includes(serviceFieldName)
  //  ? defaultLabelTemplate
  //  : serviceFieldName
  return (
    <>
      <Menu
        ariaLabel={'Select where to publish the estimate'}
        portalStatus={portalStatus}
        isDropdown={isDropdown}
        defaultActiveIdx={defaultActiveIdx}
      >
        {menuValues.map(({label, fieldValue}) => {
         return <MenuItem key={fieldValue} label={label} onClick={handleClick(fieldValue)} />
        })}
        <MenuItemHR />
        <MenuItem
          label={SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL}
          onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_NULL)}
        />
      </Menu>
    </>
  )
}

export default AzureDevOpsFieldMenu
