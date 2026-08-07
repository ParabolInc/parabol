import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ConfluenceSpaceListQuery} from '../../__generated__/ConfluenceSpaceListQuery.graphql'
import type {SpaceOption} from './ConfluenceSpaceSelect'

const query = graphql`
  query ConfluenceSpaceListQuery($teamId: ID!, $cloudId: ID!) {
    viewer {
      teamMember(teamId: $teamId) {
        integrations {
          atlassian {
            confluenceSpaces(cloudId: $cloudId) {
              id
              name
              isPersonal
            }
          }
        }
      }
    }
  }
`

export interface ConfluenceSpaceListProps {
  queryRef: PreloadedQuery<ConfluenceSpaceListQuery>
  teamId: string
  cloudId: string
  filter: string
  selectedId: string | null
  onPick: (space: SpaceOption) => void
}

export const ConfluenceSpaceList = (props: ConfluenceSpaceListProps) => {
  const {queryRef, filter, selectedId, onPick} = props
  const data = usePreloadedQuery<ConfluenceSpaceListQuery>(query, queryRef)
  const spaces = data.viewer.teamMember?.integrations.atlassian?.confluenceSpaces ?? []

  const normalizedFilter = filter.trim().toLowerCase()
  const filtered = normalizedFilter
    ? spaces.filter(({name}) => name.toLowerCase().includes(normalizedFilter))
    : spaces
  const globalSpaces = filtered.filter(({isPersonal}) => !isPersonal).slice(0, 30)
  const personalSpaces = filtered.filter(({isPersonal}) => isPersonal).slice(0, 10)

  return (
    <>
      {[
        {label: 'Spaces', options: globalSpaces},
        {label: 'Personal', options: personalSpaces}
      ].map(
        ({label, options}) =>
          options.length > 0 && (
            <div key={label}>
              <div className='px-3 py-1 font-semibold text-fg-muted text-xs uppercase'>{label}</div>
              {options.map((space) => (
                <button
                  key={space.id}
                  type='button'
                  role='option'
                  aria-selected={space.id === selectedId}
                  className='block w-full cursor-pointer border-none bg-transparent px-3 py-1.5 text-left text-fg-primary text-sm hover:bg-surface-hover'
                  onPointerDown={() => onPick({...space})}
                >
                  {space.name}
                </button>
              ))}
            </div>
          )
      )}
      {filtered.length === 0 && (
        <div className='px-3 py-2 text-fg-muted text-sm'>No matching spaces</div>
      )}
    </>
  )
}
