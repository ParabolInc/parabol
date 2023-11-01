import {Close} from '@mui/icons-material'
import React from 'react'
import {DiscussionThreadEnum} from '../types/constEnums'
import ResponsiveDashSidebar from './ResponsiveDashSidebar'
import {Drawer} from './TeamPrompt/TeamPromptDrawer'

interface Props {
  setShowDrawer: (showDrawer: boolean) => void
  showDrawer: boolean
}

const RetroDrawer = (props: Props) => {
  const {showDrawer, setShowDrawer} = props

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
            <div className='text-base font-semibold'>Templates</div>
            <div className='cursor-pointer text-slate-600 hover:opacity-50' onClick={toggleDrawer}>
              <Close />
            </div>
          </div>
        </div>
      </Drawer>
    </ResponsiveDashSidebar>
  )
}
export default RetroDrawer
