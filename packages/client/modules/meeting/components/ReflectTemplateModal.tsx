import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useState} from 'react'
import {useFragment} from 'react-relay'
import {ReflectTemplateModal_retroMeetingSettings$key} from '../../../__generated__/ReflectTemplateModal_retroMeetingSettings.graphql'
import DialogContainer from '../../../components/DialogContainer'
import useAtmosphere from '../../../hooks/useAtmosphere'
import getTemplateList from '../../../utils/getTemplateList'
import {setActiveTemplate} from '../../../utils/relay/setActiveTemplate'
import CustomTemplateUpgradeMsg from './CustomTemplateUpgradeMsg'
import ReflectTemplateDetails from './ReflectTemplateDetails'
import ReflectTemplateList from './ReflectTemplateList'

interface Props {
  closePortal: () => void
  retroMeetingSettingsRef: ReflectTemplateModal_retroMeetingSettings$key
}

const StyledDialogContainer = styled(DialogContainer)({
  flexDirection: 'row',
  width: 880,
  maxHeight: 520,
  minHeight: 520
})

const SCOPES = ['TEAM', 'ORGANIZATION', 'PUBLIC']

const ReflectTemplateModal = (props: Props) => {
  const {closePortal, retroMeetingSettingsRef} = props
  const retroMeetingSettings = useFragment(
    graphql`
      fragment ReflectTemplateModal_retroMeetingSettings on RetrospectiveMeetingSettings {
        ...ReflectTemplateList_settings
        ...ReflectTemplateDetails_settings
        meetingType
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
  const {selectedTemplate, team, activeTemplate, meetingType} = retroMeetingSettings
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

  const displayUpgradeDetails = () => {
    setShowUpgradeDetails(true)
  }

  const hideUpgradeDetails = () => {
    setShowUpgradeDetails(false)
  }

  useEffect(() => {
    if (showUpgradeDetails) hideUpgradeDetails()
  }, [activeTemplate])

  return (
    <StyledDialogContainer>
      <ReflectTemplateList
        settingsRef={retroMeetingSettings}
        activeIdx={activeIdx}
        setActiveIdx={setActiveIdx}
        displayUpgradeDetails={displayUpgradeDetails}
      />
      {showUpgradeDetails ? (
        <CustomTemplateUpgradeMsg orgId={orgId} meetingType={meetingType} />
      ) : (
        <ReflectTemplateDetails
          settings={retroMeetingSettings}
          gotoTeamTemplates={gotoTeamTemplates}
          gotoPublicTemplates={gotoPublicTemplates}
          closePortal={closePortal}
        />
      )}
    </StyledDialogContainer>
  )
}
export default ReflectTemplateModal
