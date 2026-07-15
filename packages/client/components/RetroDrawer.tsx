import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {RetroDrawerQuery} from '../__generated__/RetroDrawerQuery.graphql'
import {DiscussionThreadEnum} from '../types/constEnums'
import {cn} from '../ui/cn'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import RetroDrawerTemplateCard from './RetroDrawerTemplateCard'

const isGlobalBannerEnabled = window.__ACTION__.GLOBAL_BANNER_ENABLED

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
        <div
          className={cn(
            'flex flex-1 flex-col justify-stretch overflow-scroll bg-surface-card',
            'z-sidebar h-full',
            'fuzzy-tablet:w-[min(360px,100vw)] w-screen',
            'static sidebar-left:fixed sidebar-left:top-0 sidebar-left:right-0 sidebar-left:bottom-0',
            'select-none sidebar-left:select-auto',
            'sidebar-left:shadow-discussion-thread',
            'transition-all duration-200 ease-[cubic-bezier(0,0,.2,1)]',
            isGlobalBannerEnabled ? 'pt-6' : '',
            showDrawer
              ? 'fuzzy-tablet:translate-x-0 translate-x-[calc(360px_-_100vw)]'
              : 'translate-x-[360px]'
          )}
        >
          <div className='py-4'>
            <div className='flex justify-between px-4'>
              <div className='pb-4 font-semibold text-base'>Templates</div>
              <div
                className='cursor-pointer text-fg-secondary hover:opacity-50'
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
        </div>
      </ResponsiveDashSidebar>
    </>
  )
}
export default RetroDrawer
