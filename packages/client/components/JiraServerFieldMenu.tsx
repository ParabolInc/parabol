import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {useTranslation} from 'react-i18next'
import {useFragment} from 'react-relay'
import {PALETTE} from '~/styles/paletteV3'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import UpdateJiraServerDimensionFieldMutation from '../mutations/UpdateJiraServerDimensionFieldMutation'
import {SprintPokerDefaults} from '../types/constEnums'
import {JiraServerFieldMenu_stage$key} from '../__generated__/JiraServerFieldMenu_stage.graphql'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemHR from './MenuItemHR'

const NoFieldsLabel = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  padding: '8px 16px 0'
})

interface Props {
  menuProps: MenuProps
  stage: JiraServerFieldMenu_stage$key
  submitScore(): void
}

const JiraServerFieldMenu = (props: Props) => {
  const {menuProps, stage: stageRef, submitScore} = props

  const {t} = useTranslation()

  const atmosphere = useAtmosphere()
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
          integration {
            ... on JiraServerIssue {
              __typename
              id
              projectId
              issueType
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

  const {integration} = task
  const {projectId, issueType, possibleEstimationFieldNames} = integration

  const {name: dimensionName} = dimensionRef
  const {name: serviceFieldName} = serviceField
  /* eslint-disable react-hooks/rules-of-hooks */
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
    UpdateJiraServerDimensionFieldMutation(
      atmosphere,
      {
        dimensionName,
        fieldName,
        issueType,
        projectId,
        meetingId
      },
      {
        onCompleted: submitScore,
        onError: () => {
          /* noop */
        }
      }
    )
    closePortal()
  }
  return (
    <Menu
      ariaLabel={t('JiraServerFieldMenu.SelectTheJiraServerFieldToPushTo')}
      portalStatus={portalStatus}
      isDropdown={isDropdown}
      defaultActiveIdx={defaultActiveidx}
    >
      {possibleEstimationFieldNames.length === 0 && (
        <NoFieldsLabel>{t('JiraServerFieldMenu.NoFieldsFound')}</NoFieldsLabel>
      )}
      {possibleEstimationFieldNames.map((fieldName) => {
        return <MenuItem key={fieldName} label={fieldName} onClick={handleClick(fieldName)} />
      })}
      <MenuItemHR />
      <MenuItem
        key={t('JiraServerFieldMenu.Comment')}
        label={SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL}
        onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_COMMENT)}
      />
      <MenuItem
        key={t('JiraServerFieldMenu.Null')}
        label={SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL}
        onClick={handleClick(SprintPokerDefaults.SERVICE_FIELD_NULL)}
      />
    </Menu>
  )
}

export default JiraServerFieldMenu
