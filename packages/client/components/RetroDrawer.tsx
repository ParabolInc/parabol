import styled from '@emotion/styled'
import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {RetroDrawerQuery} from '../__generated__/RetroDrawerQuery.graphql'
import useBreakpoint from '../hooks/useBreakpoint'
import {desktopSidebarShadow} from '../styles/elevation'
import {
  BezierCurve,
  Breakpoint,
  DiscussionThreadEnum,
  GlobalBanner,
  ZIndex
} from '../types/constEnums'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import RetroDrawerTemplateCard from './RetroDrawerTemplateCard'

const isGlobalBannerEnabled = window.__ACTION__.GLOBAL_BANNER_ENABLED

const Drawer = styled('div')<{isDesktop: boolean; isMobile: boolean; isOpen: boolean}>(
  ({isDesktop, isMobile, isOpen}) => ({
    boxShadow: isDesktop ? desktopSidebarShadow : undefined,
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'stretch',
    overflow: 'hidden',
    paddingTop: isGlobalBannerEnabled ? GlobalBanner.HEIGHT : 0,
    position: isDesktop ? 'fixed' : 'static',
    bottom: 0,
    top: 0,
    right: isDesktop ? 0 : undefined,
    userSelect: isDesktop ? undefined : 'none',
    transition: `all 200ms ${BezierCurve.DECELERATE}`,
    transform: `translateX(${
      isOpen
        ? isMobile
          ? `calc(${DiscussionThreadEnum.WIDTH}px - 100vw)`
          : 0
        : `${DiscussionThreadEnum.WIDTH}px`
    })`,
    width: isMobile ? '100vw' : `min(${DiscussionThreadEnum.WIDTH}px, 100vw)`,
    zIndex: ZIndex.SIDEBAR,
    height: '100%',
    '@supports (height: 1svh) and (height: 1lvh)': {
      height: isDesktop ? '100lvh' : '100svh'
    }
  })
)

interface Props {
  queryRef: PreloadedQuery<RetroDrawerQuery>
  showDrawer: boolean
  setShowDrawer: (showDrawer: boolean) => void
}

const RetroDrawer = (props: Props) => {
  const {queryRef, showDrawer, setShowDrawer} = props

  const {viewer} = usePreloadedQuery<RetroDrawerQuery>(
    graphql`
      query RetroDrawerQuery(
        $first: Int!
        $type: MeetingTypeEnum!
        $meetingId: ID!
        $isMenuOpen: Boolean!
      ) {
        viewer {
          meeting(meetingId: $meetingId) {
            id
          }
          availableTemplates(first: $first, type: $type)
            @connection(key: "RetroDrawer_availableTemplates")
            @include(if: $isMenuOpen) {
            edges {
              node {
                ...RetroDrawerTemplateCard_template
                id
              }
            }
          }
        }
      }
    `,
    queryRef
  )

  const templates = viewer.availableTemplates?.edges
  const meeting = viewer.meeting
  const isMobile = !useBreakpoint(Breakpoint.FUZZY_TABLET)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const toggleDrawer = () => {
    setShowDrawer(!showDrawer)
  }

  const handleCloseDrawer = () => {
    setShowDrawer(false)
  }

  return (
    <>
      <ResponsiveDashSidebar
        isOpen={showDrawer}
        isRightDrawer
        onToggle={toggleDrawer}
        sidebarWidth={DiscussionThreadEnum.WIDTH}
      >
        <Drawer
          className='overflow-scroll'
          isDesktop={isDesktop}
          isMobile={isMobile}
          isOpen={showDrawer}
        >
          <div className='py-4'>
            <div className='flex justify-between px-4'>
              <div className='pb-4 font-semibold text-base'>Templates</div>
              <div
                className='cursor-pointer text-slate-600 hover:opacity-50'
                onClick={toggleDrawer}
              >
                <Close />
              </div>
            </div>
            {templates?.map((template) => (
              <RetroDrawerTemplateCard
                key={template.node.id}
                meetingId={meeting!.id}
                templateRef={template.node}
                handleCloseDrawer={handleCloseDrawer}
              />
            ))}
          </div>
        </Drawer>
      </ResponsiveDashSidebar>
    </>
  )
}
export default RetroDrawer
