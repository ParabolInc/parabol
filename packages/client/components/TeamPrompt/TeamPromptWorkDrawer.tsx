import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import {TeamPromptWorkDrawerQuery} from '../../__generated__/TeamPromptWorkDrawerQuery.graphql'
import {TeamPromptWorkDrawer_meeting$key} from '../../__generated__/TeamPromptWorkDrawer_meeting.graphql'
import Tabs from '../Tabs/Tabs'
import Tab from '../Tab/Tab'
import ParabolLogoSVG from '../ParabolLogoSVG'
import GitHubSVG from '../GitHubSVG'
import ParabolTasksPanel from './WorkDrawer/ParabolTasksPanel'
import GitHubIntegrationPanel from './WorkDrawer/GitHubIntegrationPanel'

interface Props {
  queryRef: PreloadedQuery<TeamPromptWorkDrawerQuery>
  meetingRef: TeamPromptWorkDrawer_meeting$key
  onToggleDrawer: () => void
}

const TeamPromptWorkDrawer = (props: Props) => {
  const {queryRef, meetingRef, onToggleDrawer} = props
  const data = usePreloadedQuery<TeamPromptWorkDrawerQuery>(
    graphql`
      query TeamPromptWorkDrawerQuery($after: DateTime, $teamId: ID!, $userIds: [ID!]) {
        ...GitHubIntegrationPanel_query @arguments(teamId: $teamId)
        viewer {
          id
          ...ParabolTasksPanel_user @arguments(userIds: $userIds)
        }
      }
    `,
    queryRef
  )
  const {viewer} = data

  const meeting = useFragment(
    graphql`
      fragment TeamPromptWorkDrawer_meeting on TeamPromptMeeting {
        ...ParabolTasksPanel_meeting
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
        <ParabolTasksPanel userRef={viewer} meetingRef={meeting} />
      ) : (
        <GitHubIntegrationPanel queryRef={data} />
      )}
    </>
  )
}

export default TeamPromptWorkDrawer
