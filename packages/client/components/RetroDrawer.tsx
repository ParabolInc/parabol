import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {RetroDrawerQuery} from '../__generated__/RetroDrawerQuery.graphql'
import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint, DiscussionThreadEnum} from '../types/constEnums'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import RetroDrawerTemplateCard from './RetroDrawerTemplateCard'
import {Drawer} from './TeamPrompt/TeamPromptDrawer'

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
              <div className='pb-4 text-base font-semibold'>Templates</div>
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
