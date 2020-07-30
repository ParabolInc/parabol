import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import SwipeableViews from 'react-swipeable-views'
import Icon from '../../../components/Icon'
import Tab from '../../../components/Tab/Tab'
import Tabs from '../../../components/Tabs/Tabs'
import {PALETTE} from '../../../styles/paletteV2'
import getTemplateList from '../../../utils/getTemplateList'
import {ReflectTemplateList_settings} from '../../../__generated__/ReflectTemplateList_settings.graphql'
import AddNewReflectTemplate from './AddNewReflectTemplate'
import ReflectTemplateListOrgRoot from './ReflectTemplateListOrgRoot'
import ReflectTemplateListPublicRoot from './ReflectTemplateListPublicRoot'
import ReflectTemplateListTeam from './ReflectTemplateListTeam'

const WIDTH = 360
const TemplateSidebar = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: WIDTH
})

const Label = styled('div')({
  color: PALETTE.TEXT_MAIN,
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '24px',
  paddingTop: 16,
  paddingLeft: 24,
  paddingBottom: 8
})

const StyledTabsBar = styled(Tabs)({
  boxShadow: `inset 0 -1px 0 ${PALETTE.BORDER_LIGHTER}`
})

const FullTab = styled(Tab)({
  // justifyContent: 'center',
  padding: '4px 0 8px',
  width: WIDTH / 3
})

const TabContents = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  // justifyContent: 'center',
  height: '100%'
})

const TabLabel = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
})

const containerStyle = {height: '100%'}
const innerStyle = {width: '100%', height: '100%'}
interface Props {
  settings: ReflectTemplateList_settings
}

const SCOPES = ['TEAM', 'ORGANIZATION', 'PUBLIC']


const ReflectTemplateList = (props: Props) => {
  const {settings} = props
  const {selectedTemplate, team, teamTemplates} = settings
  const {id: teamId, orgId} = team
  const {id: selectedTemplateId} = selectedTemplate
  const lowestScope = getTemplateList(teamId, orgId, selectedTemplate)
  const listIdx = SCOPES.indexOf(lowestScope)
  const [activeIdx, setActiveIdx] = useState(listIdx)
  return (
    <TemplateSidebar>
      <Label>Retro Templates</Label>
      <StyledTabsBar activeIdx={activeIdx}>
        <FullTab label={<TabLabel><Icon>{'group'}</Icon> Team</TabLabel>} onClick={() => setActiveIdx(0)} />
        <FullTab label={<TabLabel><Icon>{'business'}</Icon> Organization</TabLabel>} onClick={() => setActiveIdx(1)} />
        <FullTab label={<TabLabel><Icon>{'public'}</Icon> Public</TabLabel>} onClick={() => setActiveIdx(2)} />
      </StyledTabsBar>
      <SwipeableViews
        enableMouseEvents
        index={activeIdx}
        onChangeIndex={(idx) => setActiveIdx(idx)}
        containerStyle={containerStyle}
        style={innerStyle}
      >
        <TabContents>
          <ReflectTemplateListTeam selectedTemplateId={selectedTemplateId} showPublicTemplates={() => setActiveIdx(2)} teamTemplates={teamTemplates} teamId={teamId} />
        </TabContents>
        <TabContents>
          <ReflectTemplateListOrgRoot teamId={teamId} />
        </TabContents>
        <TabContents>
          <ReflectTemplateListPublicRoot teamId={teamId} />
        </TabContents>
      </SwipeableViews>
      {/* add a key to clear the error when they change */}
      <AddNewReflectTemplate
        teamId={teamId}
        reflectTemplates={teamTemplates}
      />
    </TemplateSidebar >
  )
}

export default createFragmentContainer(
  ReflectTemplateList,
  {
    settings: graphql`
      fragment ReflectTemplateList_settings on RetrospectiveMeetingSettings {
        id
        team {
          id
          orgId
        }
        selectedTemplate {
          ...getTemplateList_template
          id
          teamId
          orgId
        }
        teamTemplates {
          ...ReflectTemplateListTeam_teamTemplates
          ...AddNewReflectTemplate_reflectTemplates
          id
        }
      }
    `
  }
)
