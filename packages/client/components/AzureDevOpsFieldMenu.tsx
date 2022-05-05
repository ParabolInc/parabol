import styled from '@emotion/styled-base'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import useModal from '../hooks/useModal'
import textOverflow from '../styles/helpers/textOverflow'
import {PALETTE} from '../styles/paletteV3'
import {FONT_FAMILY, ICON_SIZE} from '../styles/typographyV2'
import {SprintPokerDefaults} from '../types/constEnums'
import {AzureDevOpsFieldMenu_stage$key} from '../__generated__/AzureDevOpsFieldMenu_stage.graphql'
import FlatButton from './FlatButton'
import Icon from './Icon'
import Menu from './Menu'
import MenuItem from './MenuItem'

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
})

interface Props {
  menuProps: MenuProps
  stageRef: AzureDevOpsFieldMenu_stage$key
  submitScore(): void
}

const AzureDevOpsFieldMenu = (props: Props) => {
  const {menuProps, stageRef, submitScore} = props
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
  const {serviceField, task, dimensionRef, meetingId} = stage
  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField
  const defaults = [
    SprintPokerDefaults.SERVICE_FIELD_COMMENT,
    SprintPokerDefaults.SERVICE_FIELD_NULL
  ] as string[]
  const defaultActiveIdx = defaults.indexOf(serviceFieldName) + 1
  const {
    modalPortal,
    openPortal,
    closePortal: closeModal
  } = useModal({
    id: 'editAzureDevOpsLabel',
    parentId: 'azureDevOpsFieldMenu'
  })

  if (task?.integration?.__typename !== 'AzureDevOpsWorkItem') return null
  const {integration} = task
  const {type} = integration
  const handleClick = (labelTemplate: string) => () => {
    if (labelTemplate !== serviceFieldName) {
      // call the mutation
    } else {
      submitScore()
    }
    closePortal()
  }
  const openEditModal = (e: React.MouseEvent) => {
    e.stopPropagation()
    openPortal()
  }
  const defaultLabelTemplate = `${dimensionName}: {{#}}`
  const serviceFieldTemplate = defaults.includes(serviceFieldName)
    ? defaultLabelTemplate
    : serviceFieldName
  return (
    <>
      <Menu
        ariaLabel={'Select where to publish the estimate'}
        portalStatus={portalStatus}
        isDropdown={isDropdown}
        defaultActiveIdx={defaultActiveIdx}
      >
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

export default AzureDevOpsFieldMenu
