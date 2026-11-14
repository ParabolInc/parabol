import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ConfluenceParentPageListQuery} from '../../__generated__/ConfluenceParentPageListQuery.graphql'

const gqlQuery = graphql`
  query ConfluenceParentPageListQuery($teamId: ID!, $cloudId: ID!, $spaceId: ID!, $query: String!) {
    viewer {
      teamMember(teamId: $teamId) {
        integrations {
          atlassian {
            confluencePageSearch(cloudId: $cloudId, spaceId: $spaceId, query: $query) {
              id
              title
            }
          }
        }
      }
    }
  }
`

export interface ConfluenceParentPageListProps {
  queryRef: PreloadedQuery<ConfluenceParentPageListQuery>
  teamId: string
  cloudId: string
  spaceId: string
  query: string
  onPick: (page: {id: string; title: string}) => void
}

export const ConfluenceParentPageList = (props: ConfluenceParentPageListProps) => {
  const {queryRef, onPick} = props
  const data = usePreloadedQuery<ConfluenceParentPageListQuery>(gqlQuery, queryRef)
  const options = data.viewer.teamMember?.integrations.atlassian?.confluencePageSearch ?? []

  if (options.length === 0) {
    return <div className='px-3 py-2 text-fg-muted text-sm'>No matching pages</div>
  }
  return (
    <>
      {options.map((page) => (
        <button
          key={page.id}
          type='button'
          role='option'
          className='block w-full cursor-pointer border-none bg-transparent px-3 py-1.5 text-left text-fg-primary text-sm hover:bg-surface-hover'
          onPointerDown={() => onPick({...page})}
        >
          {page.title}
        </button>
      ))}
    </>
  )
}
