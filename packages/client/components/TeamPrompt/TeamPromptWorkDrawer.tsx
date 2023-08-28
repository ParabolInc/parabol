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
      }
    `,
    meetingRef
  )

  const [activeIdx, setActiveIdx] = useState(0)

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
            <Tab
              key='parabol'
              onClick={() => setActiveIdx(0)}
              label={
                <div className='flex items-center justify-center'>
                  <ParabolLogoSVG />
                </div>
              }
            />
            <Tab
              key='github'
              onClick={() => setActiveIdx(1)}
              label={
                <div className='flex items-center justify-center'>
                  <GitHubSVG />
                </div>
              }
            />
          </Tabs>
        </div>
      </div>
      {activeIdx === 0 ? (
        <ParabolTasksPanel meetingRef={meeting} />
      ) : (
        <GitHubIntegrationPanel meetingRef={meeting} />
      )}
    </>
  )
}

export default TeamPromptWorkDrawer
