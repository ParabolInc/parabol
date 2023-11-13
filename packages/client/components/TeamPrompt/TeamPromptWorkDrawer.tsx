import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useState} from 'react'
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
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import useAtmosphere from '../../hooks/useAtmosphere'

interface Props {
  meetingRef: TeamPromptWorkDrawer_meeting$key
  onToggleDrawer: () => void
}

const TeamPromptWorkDrawer = (props: Props) => {
  const {meetingRef, onToggleDrawer} = props
  const meeting = useFragment(
    graphql`
      fragment TeamPromptWorkDrawer_meeting on TeamPromptMeeting {
        viewerMeetingMember {
          user {
            featureFlags {
              gcal
            }
          }
        }
        id
        teamId
        ...ParabolTasksPanel_meeting
        ...GitHubIntegrationPanel_meeting
        ...JiraIntegrationPanel_meeting
        ...GCalIntegrationPanel_meeting
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()

  useEffect(() => {
    SendClientSideEvent(atmosphere, 'Your Work Drawer Impression', {
      teamId: meeting.teamId,
      meetingId: meeting.id
    })
  }, [])

  const [activeIdx, setActiveIdx] = useState(0)

  const baseTabs = [
    {
      icon: <ParabolLogoSVG />,
      service: 'PARABOL',
      label: 'Parabol',
      Component: ParabolTasksPanel
    },
    {icon: <GitHubSVG />, service: 'github', label: 'GitHub', Component: GitHubIntegrationPanel},
    {icon: <JiraSVG />, service: 'jira', label: 'Jira', Component: JiraIntegrationPanel},
    ...(meeting.viewerMeetingMember?.user.featureFlags.gcal
      ? ([
          {
            icon: <img className='h-6 w-6' src={gcalLogo} />,
            service: 'gcal',
            label: 'Google Calendar',
            Component: GCalIntegrationPanel
          }
        ] as const)
      : [])
  ] as const

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
                onClick={() => {
                  SendClientSideEvent(atmosphere, 'Your Work Integration Clicked', {
                    teamId: meeting.teamId,
                    meetingId: meeting.id,
                    service: baseTabs[idx]?.service
                  })
                  setActiveIdx(idx)
                }}
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
