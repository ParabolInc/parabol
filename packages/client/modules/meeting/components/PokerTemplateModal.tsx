import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import DialogContainer from '../../../components/DialogContainer'
import getTemplateList from '../../../utils/getTemplateList'
import {PokerTemplateModal_pokerMeetingSettings} from '../../../__generated__/PokerTemplateModal_pokerMeetingSettings.graphql'
import PokerTemplateDetails from './PokerTemplateDetails'
import PokerTemplateList from './PokerTemplateList'

interface Props {
  pokerMeetingSettings: PokerTemplateModal_pokerMeetingSettings
}

const StyledDialogContainer = styled(DialogContainer)({
  flexDirection: 'row',
  width: 880,
  maxHeight: 500,
  minHeight: 500
})

const SCOPES = ['TEAM', 'ORGANIZATION', 'PUBLIC']

const PokerTemplateModal = (props: Props) => {
  const {pokerMeetingSettings} = props
  const {selectedTemplate, team} = pokerMeetingSettings
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
      <PokerTemplateList
        settings={pokerMeetingSettings}
        activeIdx={activeIdx}
        setActiveIdx={setActiveIdx}
      />
      <PokerTemplateDetails
        settings={pokerMeetingSettings}
        gotoTeamTemplates={gotoTeamTemplates}
        gotoPublicTemplates={gotoPublicTemplates}
      />
    </StyledDialogContainer>
  )
}
export default createFragmentContainer(PokerTemplateModal, {
  pokerMeetingSettings: graphql`
    fragment PokerTemplateModal_pokerMeetingSettings on PokerMeetingSettings {
      ...PokerTemplateList_settings
      ...PokerTemplateDetails_settings
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
