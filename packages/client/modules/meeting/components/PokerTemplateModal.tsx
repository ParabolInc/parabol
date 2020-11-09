import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import DialogContainer from '../../../components/DialogContainer'
import getTemplateList from '../../../utils/getTemplateList'
import {PokerTemplateModal_pokerMeetingSettings} from '../../../__generated__/PokerTemplateModal_pokerMeetingSettings.graphql'
import PokerTemplateDetails from './PokerTemplateDetails'
import PokerTemplateList from './PokerTemplateList'
import SwipeableViews from 'react-swipeable-views'
import PokerTemplateScaleDetailsRoot from './PokerTemplateScaleDetailsRoot'

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
const containerStyle = {height: '100%'}
const innerStyle = {width: '100%', height: '100%'}
const TabContents = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
})

const PokerTemplateModal = (props: Props) => {
  const {pokerMeetingSettings} = props
  const {selectedTemplate, team} = pokerMeetingSettings
  const {id: teamId, orgId} = team
  const lowestScope = getTemplateList(teamId, orgId, selectedTemplate)
  const listIdx = SCOPES.indexOf(lowestScope)
  const [activeIdx, setActiveIdx] = useState(listIdx)
  const [scaleId] = useState("Pi8StrPy8")
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

      <SwipeableViews
        enableMouseEvents
        index={scaleId ? 0 : 1}
        containerStyle={containerStyle}
        style={innerStyle}
      >
        <TabContents>
          <PokerTemplateDetails
            settings={pokerMeetingSettings}
            gotoTeamTemplates={gotoTeamTemplates}
            gotoPublicTemplates={gotoPublicTemplates}
          />
        </TabContents>
        <TabContents>
          <PokerTemplateScaleDetailsRoot teamId={teamId} scaleId={scaleId} isActive={scaleId != undefined} />
        </TabContents>
      </SwipeableViews>


    </StyledDialogContainer >
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
