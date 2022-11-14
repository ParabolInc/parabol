import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import DialogContainer from '../../../components/DialogContainer'
import useAtmosphere from '../../../hooks/useAtmosphere'
import getTemplateList from '../../../utils/getTemplateList'
import {setActiveTemplate} from '../../../utils/relay/setActiveTemplate'
import {ReflectTemplateModal_retroMeetingSettings$key} from '../../../__generated__/ReflectTemplateModal_retroMeetingSettings.graphql'
import {ReflectTemplateModal_viewer$key} from '../../../__generated__/ReflectTemplateModal_viewer.graphql'
import CustomTemplateUpgradeMsg from './CustomTemplateUpgradeMsg'
import ReflectTemplateDetails from './ReflectTemplateDetails'
import ReflectTemplateList from './ReflectTemplateList'

interface Props {
  closePortal: () => void
  retroMeetingSettingsRef: ReflectTemplateModal_retroMeetingSettings$key
  viewerRef: ReflectTemplateModal_viewer$key
}

const StyledDialogContainer = styled(DialogContainer)({
  flexDirection: 'row',
  width: 880,
  maxHeight: 520,
  minHeight: 520
})

const SCOPES = ['TEAM', 'ORGANIZATION', 'PUBLIC']

const ReflectTemplateModal = (props: Props) => {
  const {closePortal, retroMeetingSettingsRef, viewerRef} = props
  const retroMeetingSettings = useFragment(
    graphql`
      fragment ReflectTemplateModal_retroMeetingSettings on RetrospectiveMeetingSettings {
        ...ReflectTemplateList_settings
        ...ReflectTemplateDetails_settings
        team {
          id
          orgId
        }
        selectedTemplate {
          id
          ...getTemplateList_template
        }
        activeTemplate {
          id
        }
      }
    `,
    retroMeetingSettingsRef
  )
  const viewer = useFragment(
    graphql`
      fragment ReflectTemplateModal_viewer on User {
        ...ReflectTemplateDetails_viewer
        ...ReflectTemplateList_viewer
      }
    `,
    viewerRef
  )
  const {selectedTemplate, team, activeTemplate} = retroMeetingSettings
  const {id: teamId, orgId} = team
  const lowestScope = getTemplateList(teamId, orgId, selectedTemplate)
  const listIdx = SCOPES.indexOf(lowestScope)
  const [activeIdx, setActiveIdx] = useState(listIdx)
  const [showUpgradeDetails, setShowUpgradeDetails] = useState(false)
  const gotoTeamTemplates = () => {
    setActiveIdx(0)
  }
  const gotoPublicTemplates = () => {
    setActiveIdx(2)
  }

  const atmosphere = useAtmosphere()
  useEffect(() => {
    setActiveTemplate(atmosphere, teamId, selectedTemplate.id, 'retrospective')
  }, [])

  useEffect(() => {
    if (showUpgradeDetails) setShowUpgradeDetails(false)
  }, [activeTemplate])

  return (
    <StyledDialogContainer>
      <ReflectTemplateList
        settingsRef={retroMeetingSettings}
        activeIdx={activeIdx}
        setActiveIdx={setActiveIdx}
        setShowUpgradeDetails={setShowUpgradeDetails}
        viewerRef={viewer}
      />
      {showUpgradeDetails ? (
        <CustomTemplateUpgradeMsg orgId={orgId} />
      ) : (
        <ReflectTemplateDetails
          settings={retroMeetingSettings}
          gotoTeamTemplates={gotoTeamTemplates}
          gotoPublicTemplates={gotoPublicTemplates}
          closePortal={closePortal}
          viewer={viewer}
        />
      )}
    </StyledDialogContainer>
  )
}
export default ReflectTemplateModal
