import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {TeamDashMainQuery} from '~/__generated__/TeamDashMainQuery.graphql'
import StartMeetingFAB from '../../../../components/StartMeetingFAB'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'
import TeamColumnsContainer from '../../containers/TeamColumns/TeamColumnsContainer'
import TeamTasksHeaderContainer from '../../containers/TeamTasksHeader/TeamTasksHeaderContainer'
import TeamDrawer from './TeamDrawer'

const activityItems = [
  {
    user: {
      name: 'Georg Washington',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    emoji: '👍',
    receiver: {
      name: 'Michael Jackson',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    date: '1h',
    dateTime: '2023-01-23T11:00'
  },
  {
    user: {
      name: 'Freddy Mercury',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    emoji: '🤯',
    receiver: {
      name: 'David Bowie',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    date: '1h',
    dateTime: '2023-01-23T11:00'
  },
  {
    user: {
      name: 'Michael Foster',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    emoji: '🤡',
    receiver: {
      name: 'Michael Foster',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    date: '1h',
    dateTime: '2023-01-23T11:00'
  }
]

const TeamInteractions = () => {
  return (
    <aside className='w-96 overflow-y-auto border-l border-primary/20 '>
      <header className='flex items-center justify-between border-b border-primary/20 px-4 py-4'>
        <div className='text-base font-semibold leading-7 text-slate-700'>Activity feed</div>
      </header>
      <div className='divide-y divide-primary/20'>
        {activityItems.map((item, index) => (
          <li key={index} className='list-none px-4 py-4'>
            <div className='flex items-center gap-x-3'>
              <img
                src={item.user.imageUrl}
                alt=''
                className='bg-gray-800 h-6 w-6 flex-none rounded-full'
              />
              <div className='flex-auto truncate text-sm font-semibold text-slate-700'>
                {item.user.name}
              </div>
              <time dateTime={item.dateTime} className='text-gray-600 flex-none text-xs'>
                {item.date} ago
              </time>
            </div>
            <div className='text-gray-500 mt-1 truncate text-sm'>
              Gave <span className='font-semibold'>{item.emoji}</span> to{' '}
              <span className='font-semibold '>{item.receiver.name}</span>
            </div>
          </li>
        ))}
      </div>
    </aside>
  )
}

const AbsoluteFab = styled(StartMeetingFAB)({
  position: 'absolute'
})

const RootBlock = styled('div')({
  display: 'flex',
  height: '100%',
  width: '100%'
})

const TasksMain = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  position: 'relative'
})

const TasksHeader = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  width: '100%'
})

const TasksContent = styled('div')({
  display: 'flex',
  flex: 1,
  height: '100%',
  margin: 0,
  minHeight: 0,
  width: '100%'
})

interface Props {
  queryRef: PreloadedQuery<TeamDashMainQuery>
}

const TeamDashMain = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<TeamDashMainQuery>(
    graphql`
      query TeamDashMainQuery($teamId: ID!) {
        viewer {
          team(teamId: $teamId) {
            name
            ...TeamTasksHeaderContainer_team
          }
          ...TeamColumnsContainer_viewer
          ...TeamDrawer_viewer
        }
      }
    `,
    queryRef
  )

  const {viewer} = data
  const team = viewer.team!
  const {name: teamName} = team
  useDocumentTitle(`Team Dashboard | ${teamName}`, teamName)

  return (
    <RootBlock>
      <TasksMain>
        <TasksHeader>
          <TeamTasksHeaderContainer team={team} />
        </TasksHeader>
        <TasksContent>
          <TeamColumnsContainer viewer={viewer} />
        </TasksContent>
        <AbsoluteFab />
      </TasksMain>
      <TeamInteractions />
      <TeamDrawer viewer={viewer} />
    </RootBlock>
  )
}
export default TeamDashMain
