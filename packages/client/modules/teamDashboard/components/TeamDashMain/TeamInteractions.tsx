import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {TeamInteractions_team$key} from '~/__generated__/TeamInteractions_team.graphql'
import relativeDate from '../../../../utils/date/relativeDate'

/*
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
 */

interface Props {
  teamRef: TeamInteractions_team$key
}

const TeamInteractions = (props: Props) => {
  const {teamRef} = props
  const team = useFragment(
    graphql`
      fragment TeamInteractions_team on Team {
        id
        userInteractions(last: 100) @connection(key: "TeamInteractions_userInteractions") {
          edges {
            node {
              id
              sender {
                id
                preferredName
                picture
              }
              receiver {
                id
                preferredName
                picture
              }
              emoji
              createdAt
            }
          }
        }
      }
    `,
    teamRef
  )

  const interactions = useMemo(() => team.userInteractions.edges.map((edge) => edge.node), [team])

  return (
    <aside className='w-96 overflow-y-auto border-l border-primary/20 '>
      <header className='flex items-center justify-between border-b border-primary/20 px-4 py-4'>
        <div className='text-base font-semibold leading-7 text-slate-700'>Activity feed</div>
      </header>
      <div className='divide-y divide-primary/20'>
        {interactions.map((item, index) => (
          <li key={index} className='list-none px-4 py-4'>
            <div className='flex items-center gap-x-3'>
              <img
                src={item.sender.picture}
                alt=''
                className='bg-gray-800 h-6 w-6 flex-none rounded-full'
              />
              <div className='flex-auto truncate text-sm font-semibold text-slate-700'>
                {item.sender.preferredName}
              </div>
              <time dateTime={item.createdAt} className='text-gray-600 flex-none text-xs'>
                {relativeDate(item.createdAt)}
              </time>
            </div>
            <div className='text-gray-500 mt-1 truncate text-sm'>
              Gave <span className='font-semibold'>{item.emoji}</span> to{' '}
              <span className='font-semibold '>{item.receiver.preferredName}</span>
            </div>
          </li>
        ))}
      </div>
    </aside>
  )
}

export default TeamInteractions
