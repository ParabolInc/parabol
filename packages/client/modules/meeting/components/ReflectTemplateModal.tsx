import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import DialogContainer from '../../../components/DialogContainer'
import getTemplateList from '../../../utils/getTemplateList'
import {ReflectTemplateModal_retroMeetingSettings} from '../../../__generated__/ReflectTemplateModal_retroMeetingSettings.graphql'
import ReflectTemplateDetails from './ReflectTemplateDetails'
import ReflectTemplateList from './ReflectTemplateList'

interface Props {
  retroMeetingSettings: ReflectTemplateModal_retroMeetingSettings
}

const StyledDialogContainer = styled(DialogContainer)({
  flexDirection: 'row',
  width: 880,
  maxHeight: 500,
  minHeight: 500
})

const SCOPES = ['TEAM', 'ORGANIZATION', 'PUBLIC']

const ReflectTemplateModal = (props: Props) => {
  const {retroMeetingSettings} = props
  const {selectedTemplate, team} = retroMeetingSettings
  const {id: teamId, orgId} = team
  const lowestScope = getTemplateList(teamId, orgId, selectedTemplate)
  const listIdx = SCOPES.indexOf(lowestScope)
  const [activeIdx, setActiveIdx] = useState(listIdx)
  const gotoTeamTemplates = () => {
    setActiveIdx(0)
  }
  const gotoPublicTemplates = () => {
    setActiveIdx(2)
  }
  return (
    <StyledDialogContainer>
      <ReflectTemplateList
        settings={retroMeetingSettings}
        activeIdx={activeIdx}
        setActiveIdx={setActiveIdx}
      />
      <ReflectTemplateDetails
        settings={retroMeetingSettings}
        gotoTeamTemplates={gotoTeamTemplates}
        gotoPublicTemplates={gotoPublicTemplates}
      />
    </StyledDialogContainer>
  )
}
export default createFragmentContainer(ReflectTemplateModal, {
  retroMeetingSettings: graphql`
    fragment ReflectTemplateModal_retroMeetingSettings on RetrospectiveMeetingSettings {
      ...ReflectTemplateList_settings
      ...ReflectTemplateDetails_settings
      team {
        id
        orgId
      }
      selectedTemplate {
        ...getTemplateList_template
      }
    }
  `
})
