import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {usePreloadedQuery} from 'react-relay'
import {DiscussionThreadEnum} from '../types/constEnums'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import RetroDrawerTemplateCard from './RetroDrawerTemplateCard'
import {Drawer} from './TeamPrompt/TeamPromptDrawer'
import retroDrawerQuery, {RetroDrawerQuery} from '../__generated__/RetroDrawerQuery.graphql'

interface Props {
  setShowDrawer: (showDrawer: boolean) => void
  showDrawer: boolean
  queryRef: any
}

const RetroDrawer = (props: Props) => {
  const {queryRef, showDrawer, setShowDrawer} = props
  const data = usePreloadedQuery<RetroDrawerQuery>(
    graphql`
      query RetroDrawerQuery($first: Int!) {
        viewer {
          availableTemplates(first: $first) @connection(key: "RetroDrawer_availableTemplates") {
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
  const templates = data.viewer.availableTemplates.edges

  const toggleDrawer = () => {
    setShowDrawer(!showDrawer)
  }

  return (
    <ResponsiveDashSidebar
      isOpen={showDrawer}
      isRightDrawer
      onToggle={() => {}}
      sidebarWidth={DiscussionThreadEnum.WIDTH}
    >
      <Drawer isDesktop={true} isMobile={false} isOpen={showDrawer}>
        <div className='pt-4'>
          <div className='flex justify-between px-4'>
            <div className='pb-4 text-base font-semibold'>Templates</div>
            <div className='cursor-pointer text-slate-600 hover:opacity-50' onClick={toggleDrawer}>
              <Close />
            </div>
          </div>
          {templates.map((template) => (
            <RetroDrawerTemplateCard key={template.node.id} templateRef={template.node} />
          ))}
        </div>
      </Drawer>
    </ResponsiveDashSidebar>
  )
}
export default RetroDrawer
