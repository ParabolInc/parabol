import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import SwipeableViews from 'react-swipeable-views'
import useAtmosphere from '~/hooks/useAtmosphere'
import {SharingScopeEnum} from '~/__generated__/ReflectTemplateItem_template.graphql'
import Icon from '../../../components/Icon'
import Tab from '../../../components/Tab/Tab'
import Tabs from '../../../components/Tabs/Tabs'
import {desktopSidebarShadow} from '../../../styles/elevation'
import {PALETTE} from '../../../styles/paletteV3'
import {ReflectTemplateList_settings$key} from '../../../__generated__/ReflectTemplateList_settings.graphql'
import AddNewReflectTemplate from './AddNewReflectTemplate'
import ReflectTemplateListOrgRoot from './ReflectTemplateListOrgRoot'
import ReflectTemplateListPublicRoot from './ReflectTemplateListPublicRoot'
import ReflectTemplateListTeam from './ReflectTemplateListTeam'
import ReflectTemplateSearchBar from './ReflectTemplateSearchBar'

const WIDTH = 360
const TemplateSidebar = styled('div')({
  boxShadow: desktopSidebarShadow,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  width: WIDTH,
  zIndex: 1 // show above template details to show box-shadow
})

const Label = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 20,
  fontWeight: 600,
  lineHeight: '24px',
  paddingTop: 16,
  paddingLeft: 24,
  paddingBottom: 8
})

const StyledTabsBar = styled(Tabs)({
  boxShadow: `inset 0 -1px 0 ${PALETTE.SLATE_300}`,
  flexShrink: 0
})

const FullTab = styled(Tab)({
  padding: '4px 0 8px',
  width: '30%'
})

const WideTab = styled(FullTab)({
  width: '40%'
})

const TabContents = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
})

const TabLabel = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
})

const TabIcon = styled(Icon)({
  marginRight: 4
})

const containerStyle = {height: '100%'}
const innerStyle = {width: '100%', height: '100%'}
interface Props {
  activeIdx: number
  setActiveIdx: (idx: number) => void
  settingsRef: ReflectTemplateList_settings$key
}

const useReadyToSmoothScroll = (activeTemplateId: string) => {
  // Don't animate the scroll behavior on the initial render
  const oldActiveTemplateIdRef = useRef(activeTemplateId)
  const oldActiveTemplateId = oldActiveTemplateIdRef.current
  useEffect(() => {
    oldActiveTemplateIdRef.current = activeTemplateId
  }, [activeTemplateId])
  return oldActiveTemplateId !== activeTemplateId && oldActiveTemplateId !== '-tmp'
}

const templateIdxs = {
  TEAM: 0,
  ORGANIZATION: 1,
  PUBLIC: 2
} as const

const ReflectTemplateList = (props: Props) => {
  const {activeIdx, setActiveIdx, settingsRef} = props
  const settings = useFragment(
    graphql`
      fragment ReflectTemplateList_settings on RetrospectiveMeetingSettings {
        ...ReflectTemplateSearchBar_settings
        ...ReflectTemplateListTeam_settings
        id
        team {
          id
        }
        activeTemplate {
          ...getTemplateList_template
          id
          teamId
          orgId
        }
        teamTemplates {
          ...AddNewReflectTemplate_reflectTemplates
          id
        }
      }
    `,
    settingsRef
  )
  const {id: settingsId, team, teamTemplates} = settings
  const {id: teamId} = team
  const activeTemplateId = settings.activeTemplate?.id ?? '-tmp'
  const readyToScrollSmooth = useReadyToSmoothScroll(activeTemplateId)
  const atmosphere = useAtmosphere()
  const slideStyle = {scrollBehavior: readyToScrollSmooth ? 'smooth' : undefined}

  const clearSearch = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const settings = store.get(settingsId)
      if (!settings) return
      settings.setValue('', 'templateSearchQuery')
    })
  }

  const goToTab = (templateType: SharingScopeEnum) => {
    setActiveIdx(templateIdxs[templateType])
    clearSearch()
  }

  const onChangeIdx = (idx: number, _fromIdx: unknown, props: {reason: string}) => {
    //very buggy behavior, probably linked to the vertical scrolling.
    // to repro, go from team > org > team > org by clicking tabs & see this this get called for who knows why
    if (props.reason === 'focus') return
    setActiveIdx(idx)
    clearSearch()
  }

  return (
    <TemplateSidebar>
      <Label>Retro Templates</Label>
      <StyledTabsBar activeIdx={activeIdx}>
        <FullTab
          label={
            <TabLabel>
              <TabIcon>{'group'}</TabIcon> Team
            </TabLabel>
          }
          onClick={() => goToTab('TEAM')}
        />
        <WideTab
          label={
            <TabLabel>
              <TabIcon>{'business'}</TabIcon> Organization
            </TabLabel>
          }
          onClick={() => goToTab('ORGANIZATION')}
        />
        <FullTab
          label={
            <TabLabel>
              <TabIcon>{'public'}</TabIcon> Public
            </TabLabel>
          }
          onClick={() => goToTab('PUBLIC')}
        />
      </StyledTabsBar>
      <ReflectTemplateSearchBar clearSearch={clearSearch} settingsRef={settings} />
      <AddNewReflectTemplate
        teamId={teamId}
        reflectTemplates={teamTemplates}
        gotoTeamTemplates={() => goToTab('TEAM')}
      />
      <SwipeableViews
        enableMouseEvents
        index={activeIdx}
        onChangeIndex={onChangeIdx}
        containerStyle={containerStyle}
        style={innerStyle}
        slideStyle={slideStyle}
      >
        <TabContents>
          <ReflectTemplateListTeam
            activeTemplateId={activeTemplateId}
            showPublicTemplates={() => goToTab('PUBLIC')}
            settingsRef={settings}
            teamId={teamId}
            isActive={activeIdx === 0}
          />
        </TabContents>
        <TabContents>
          {activeIdx === 1 && <ReflectTemplateListOrgRoot teamId={teamId} />}
        </TabContents>
        <TabContents>
          {activeIdx === 2 && <ReflectTemplateListPublicRoot teamId={teamId} />}
        </TabContents>
      </SwipeableViews>
      {/* add a key to clear the error when they change */}
    </TemplateSidebar>
  )
}

export default ReflectTemplateList
