import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {usePreloadedQuery, type PreloadedQuery} from 'react-relay'
import type {PageSharingQuery} from '../../__generated__/PageSharingQuery.graphql'
import {Avatar} from '../../ui/Avatar/Avatar'

interface Props {
  queryRef: PreloadedQuery<PageSharingQuery>
}

export const PageSharing = (props: Props) => {
  const {queryRef} = props
  const ref = useRef<HTMLInputElement>(null)

  const query = usePreloadedQuery<PageSharingQuery>(
    graphql`
      query PageSharingQuery($pageId: ID!) {
        viewer {
          page(pageId: $pageId) {
            access {
              guests {
                email
                role
              }
              users {
                user {
                  preferredName
                }
                role
              }
              teams {
                team {
                  name
                }
                role
              }
              organizations {
                organization {
                  name
                }
                role
              }
            }
          }
        }
      }
    `,
    queryRef
  )

  const {viewer} = query
  const {page} = viewer

  const {access} = page
  const {guests, users, teams, organizations} = access
  return (
    <div className='flex flex-col overflow-hidden'>
      <form className='flex w-full min-w-44 flex-col items-center justify-center space-y-3 rounded-md bg-slate-100 p-2'>
        <input
          autoFocus
          value={searchQuery}
          className='w-full outline-hidden focus:ring-2'
          ref={ref}
        />
      </form>
      <div className='grid w-96 auto-rows-[1px] grid-cols-[repeat(auto-fit,minmax(112px,1fr))] gap-x-1 overflow-auto'>
        {guests.map((guest, idx) => (
          <div
            className={
              'flex w-full cursor-pointer items-center rounded-md px-4 py-1 text-sm leading-8 text-slate-700 outline-hidden hover:bg-slate-200! hover:text-slate-900 focus:bg-slate-200 data-highlighted:bg-slate-100 data-highlighted:text-slate-900'
            }
            key={guest.email}
          >
            <Avatar className='h-6 w-6' />
            <div className='pl-3'>{guest.email}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
