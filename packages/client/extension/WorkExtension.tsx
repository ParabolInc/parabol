import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
// import {useFragment} from 'react-relay'
// import {TeamPromptWorkDrawer_meeting$key} from '../../__generated__/TeamPromptWorkDrawer_meeting.graphql'
import Tabs from '../components/Tabs/Tabs'
import Tab from '../components/Tab/Tab'
import ParabolLogoSVG from '../components/ParabolLogoSVG'
import GitHubSVG from '../components/GitHubSVG'
import ParabolTasksPanel from '../components/TeamPrompt/WorkDrawer/ParabolTasksPanel'
import GitHubIntegrationPanel from '../components/TeamPrompt/WorkDrawer/GitHubIntegrationPanel'
import useAuthRoute from '../hooks/useAuthRoute'
import useAtmosphere from '../hooks/useAtmosphere'
import GenericAuthentication from '../components/GenericAuthentication'
import useTrebuchetEvents from '../hooks/useTrebuchetEvents'
import useServiceWorkerUpdater from '../hooks/useServiceWorkerUpdater'

const WorkExtension = () => {
  useTrebuchetEvents()
  useServiceWorkerUpdater()
  const atmosphere = useAtmosphere()
  const {authObj} = atmosphere

  const [activeIdx, setActiveIdx] = useState(0)

  const baseTabs = [
    {
      icon: <ParabolLogoSVG />,
      label: 'Parabol',
      Component: ParabolTasksPanel
    },
    {icon: <GitHubSVG />, label: 'GitHub', Component: GitHubIntegrationPanel}
  ]

  const {Component} = baseTabs[activeIdx]!

  return authObj ? (
    <div className='w-96 bg-white'>
      <div className='pt-4'>
        <div className='border-b border-solid border-slate-300'>
          <div className='flex justify-between px-4'>
            <div className='text-base font-semibold'>Your Work</div>
          </div>
          <Tabs activeIdx={activeIdx}>
            {baseTabs.map((tab, idx) => (
              <Tab
                key={tab.label}
                onClick={() => setActiveIdx(idx)}
                label={<div className='flex items-center justify-center'>{tab.icon}</div>}
              />
            ))}
          </Tabs>
        </div>
      </div>
      <Component meetingRef={null} />
    </div>
  ) : (
    <GenericAuthentication
      page='signin'
      goToPage={() => {
        console.log('new page')
      }}
    />
  )
}

export default WorkExtension
