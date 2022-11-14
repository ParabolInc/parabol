import styled from '@emotion/styled'
import {
  Business as BusinessIcon,
  Group as GroupIcon,
  Public as PublicIcon
} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useRef} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import SwipeableViews from 'react-swipeable-views'
import useAtmosphere from '~/hooks/useAtmosphere'
import {SharingScopeEnum} from '~/__generated__/ReflectTemplateItem_template.graphql'
import Tab from '../../../components/Tab/Tab'
import Tabs from '../../../components/Tabs/Tabs'
import useBreakpoint from '../../../hooks/useBreakpoint'
import {desktopSidebarShadow} from '../../../styles/elevation'
import {PALETTE} from '../../../styles/paletteV3'
import {Breakpoint} from '../../../types/constEnums'
import {ReflectTemplateList_settings$key} from '../../../__generated__/ReflectTemplateList_settings.graphql'
import {ReflectTemplateList_viewer$key} from '../../../__generated__/ReflectTemplateList_viewer.graphql'
import AddNewReflectTemplate from './AddNewReflectTemplate'
import ReflectTemplateListOrgRoot from './ReflectTemplateListOrgRoot'
import ReflectTemplateListPublicRoot from './ReflectTemplateListPublicRoot'
import ReflectTemplateListTeam from './ReflectTemplateListTeam'
import ReflectTemplateSearchBar from './ReflectTemplateSearchBar'

const WIDTH = 360
const TemplateSidebar = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  boxShadow: desktopSidebarShadow,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  width: !isDesktop ? '100%' : WIDTH,
  zIndex: 1 // show above template details to show box-shadow
}))

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

const TabIcon = styled('div')({
  width: 24,
  height: 24,
  marginRight: 4
})

const containerStyle = {height: '100%'}
const innerStyle = {width: '100%', height: '100%'}
interface Props {
  activeIdx: number
  setActiveIdx: (idx: number) => void
  settingsRef: ReflectTemplateList_settings$key
  viewerRef: ReflectTemplateList_viewer$key
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

export const templateIdxs = {
  TEAM: 0,
  ORGANIZATION: 1,
  PUBLIC: 2
} as const

const ReflectTemplateList = (props: Props) => {
  const {activeIdx, setActiveIdx, settingsRef, viewerRef} = props
  const settings = useFragment(
    graphql`
      fragment ReflectTemplateList_settings on RetrospectiveMeetingSettings {
        ...ReflectTemplateSearchBar_settings
        ...ReflectTemplateListTeam_settings
        id
        team {
          ...AddNewReflectTemplate_team
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
  const viewer = useFragment(
    graphql`
      fragment ReflectTemplateList_viewer on User {
        ...ReflectTemplateListTeam_viewer
        ...AddNewReflectTemplate_viewer
      }
    `,
    viewerRef
  )
  const {id: settingsId, team, teamTemplates} = settings
  const {id: teamId} = team
  const activeTemplateId = settings.activeTemplate?.id ?? '-tmp'
  const readyToScrollSmooth = useReadyToSmoothScroll(activeTemplateId)
  const atmosphere = useAtmosphere()
  const slideStyle = {scrollBehavior: readyToScrollSmooth ? 'smooth' : undefined}
  const templateType = Object.keys(templateIdxs).find(
    (key) => templateIdxs[key as keyof typeof templateIdxs] === activeIdx
  ) as SharingScopeEnum

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

  const onChangeIdx = (idx: number, _fromIdx: number, props: {reason: string}) => {
    //very buggy behavior, probably linked to the vertical scrolling.
    // to repro, go from team > org > team > org by clicking tabs & see this this get called for who knows why
    if (props.reason === 'focus') return
    setActiveIdx(idx)
    clearSearch()
  }
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_GRID)

  return (
    <TemplateSidebar isDesktop={isDesktop}>
      <Label>Retro Templates</Label>
      <StyledTabsBar activeIdx={activeIdx}>
        <FullTab
          label={
            <TabLabel>
              <TabIcon>
                <GroupIcon />
              </TabIcon>{' '}
              Team
            </TabLabel>
          }
          onClick={() => goToTab('TEAM')}
        />
        <WideTab
          label={
            <TabLabel>
              <TabIcon>
                <BusinessIcon />
              </TabIcon>{' '}
              Organization
            </TabLabel>
          }
          onClick={() => goToTab('ORGANIZATION')}
        />
        <FullTab
          label={
            <TabLabel>
              <TabIcon>
                <PublicIcon />
              </TabIcon>{' '}
              Public
            </TabLabel>
          }
          onClick={() => goToTab('PUBLIC')}
        />
      </StyledTabsBar>
      <ReflectTemplateSearchBar
        templateType={templateType}
        clearSearch={clearSearch}
        settingsRef={settings}
      />
      <AddNewReflectTemplate
        reflectTemplatesRef={teamTemplates}
        teamRef={team}
        viewerRef={viewer}
        gotoTeamTemplates={() => goToTab('TEAM')}
      />

      <SwipeableViews
        enableMouseEvents
        index={activeIdx}
        onChangeIndex={onChangeIdx as any /* typedef is wrong */}
        containerStyle={containerStyle}
        style={innerStyle}
        slideStyle={slideStyle as any}
      >
        <TabContents>
          <ReflectTemplateListTeam
            activeTemplateId={activeTemplateId}
            showPublicTemplates={() => goToTab('PUBLIC')}
            settingsRef={settings}
            teamId={teamId}
            isActive={activeIdx === 0}
            viewerRef={viewer}
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
