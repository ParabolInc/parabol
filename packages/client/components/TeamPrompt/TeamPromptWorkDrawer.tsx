import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import {TeamPromptWorkDrawer_meeting$key} from '../../__generated__/TeamPromptWorkDrawer_meeting.graphql'
import Tabs from '../Tabs/Tabs'
import Tab from '../Tab/Tab'
import ParabolLogoSVG from '../ParabolLogoSVG'
import GitHubSVG from '../GitHubSVG'
import ParabolTasksPanel from './WorkDrawer/ParabolTasksPanel'
import GitHubIntegrationPanel from './WorkDrawer/GitHubIntegrationPanel'
import JiraSVG from '../JiraSVG'
import JiraIntegrationPanel from './WorkDrawer/JiraIntegrationPanel'
import gcalLogo from '../../styles/theme/images/graphics/google-calendar.svg'
import GCalIntegrationPanel from './WorkDrawer/GCalIntegrationPanel'

interface Props {
  meetingRef: TeamPromptWorkDrawer_meeting$key
  onToggleDrawer: () => void
}

const TeamPromptWorkDrawer = (props: Props) => {
  const {meetingRef, onToggleDrawer} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptWorkDrawer_meeting on TeamPromptMeeting {
        ...ParabolTasksPanel_meeting
        ...GitHubIntegrationPanel_meeting
        ...JiraIntegrationPanel_meeting
        ...GCalIntegrationPanel_meeting
      }
    `,
    meetingRef
  )

  const [activeIdx, setActiveIdx] = useState(0)

  const baseTabs = [
    {
      icon: <ParabolLogoSVG />,
      label: 'Parabol',
      Component: ParabolTasksPanel
    },
    {icon: <GitHubSVG />, label: 'GitHub', Component: GitHubIntegrationPanel},
    {icon: <JiraSVG />, label: 'Jira', Component: JiraIntegrationPanel},
    {
      icon: <img className='h-6 w-6' src={gcalLogo} />,
      label: 'Google Calendar',
      Component: GCalIntegrationPanel
    }
  ]

  const {Component} = baseTabs[activeIdx]!

  return (
    <>
      <div className='pt-4'>
        <div className='border-b border-solid border-slate-300'>
          <div className='flex justify-between px-4'>
            <div className='text-base font-semibold'>Your Work</div>
            <div
              className='cursor-pointer text-slate-600 hover:opacity-50'
              onClick={onToggleDrawer}
            >
              <Close />
            </div>
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
      <Component meetingRef={meeting} />
    </>
  )
}

export default TeamPromptWorkDrawer
