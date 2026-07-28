import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef, useState} from 'react'
import type {ConfluenceSpaceSelectQuery} from '../../__generated__/ConfluenceSpaceSelectQuery.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'

export type SpaceOption = {id: string; key: string; name: string; isPersonal: boolean}

const spacesQuery = graphql`
  query ConfluenceSpaceSelectQuery($cloudId: ID!) {
    viewer {
      atlassianConnection {
        confluenceSpaces(cloudId: $cloudId) {
          id
          key
          name
          isPersonal
        }
      }
    }
  }
`

interface Props {
  cloudId: string
  value: SpaceOption | null
  onChange: (space: SpaceOption) => void
  preferredSpaceId: string | null
}

export const ConfluenceSpaceSelect = (props: Props) => {
  const {cloudId, value, onChange, preferredSpaceId} = props
  const atmosphere = useAtmosphere()
  const [spaces, setSpaces] = useState<SpaceOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const preselected = useRef(false)

  useEffect(() => {
    let stale = false
    setIsLoading(true)
    atmosphere.fetchQuery<ConfluenceSpaceSelectQuery>(spacesQuery, {cloudId}).then((res) => {
      if (stale || res instanceof Error) return
      const nextSpaces = (res.viewer.atlassianConnection?.confluenceSpaces ?? []).map((space) => ({
        ...space
      }))
      setSpaces(nextSpaces)
      setIsLoading(false)
      if (!preselected.current && preferredSpaceId) {
        preselected.current = true
        const preferred = nextSpaces.find(({id}) => id === preferredSpaceId)
        if (preferred) onChange(preferred)
      }
    })
    return () => {
      stale = true
    }
  }, [cloudId])

  const normalizedFilter = filter.trim().toLowerCase()
  const filtered = normalizedFilter
    ? spaces.filter(({name}) => name.toLowerCase().includes(normalizedFilter))
    : spaces
  const globalSpaces = filtered.filter(({isPersonal}) => !isPersonal).slice(0, 30)
  const personalSpaces = filtered.filter(({isPersonal}) => isPersonal).slice(0, 10)

  const pick = (space: SpaceOption) => {
    onChange(space)
    setFilter('')
    setIsOpen(false)
  }

  return (
    <fieldset className='relative m-0 flex flex-col gap-1 border-none p-0'>
      <label className='font-semibold text-fg-primary text-sm'>Space</label>
      <input
        className='rounded-md border border-hairline-field bg-surface-input p-2 text-fg-primary text-sm'
        placeholder={isLoading ? 'Loading spaces…' : 'Search spaces'}
        value={isOpen ? filter : (value?.name ?? '')}
        disabled={isLoading}
        onFocus={() => setIsOpen(true)}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 150)}
        onChange={(e) => setFilter(e.target.value)}
      />
      {isOpen && !isLoading && (
        <div
          role='listbox'
          className='absolute top-full z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-hairline bg-surface-raised shadow-dialog'
        >
          {[
            {label: 'Spaces', options: globalSpaces},
            {label: 'Personal', options: personalSpaces}
          ].map(
            ({label, options}) =>
              options.length > 0 && (
                <div key={label}>
                  <div className='px-3 py-1 font-semibold text-fg-muted text-xs uppercase'>
                    {label}
                  </div>
                  {options.map((space) => (
                    <button
                      key={space.id}
                      type='button'
                      role='option'
                      aria-selected={space.id === value?.id}
                      className='block w-full cursor-pointer border-none bg-transparent px-3 py-1.5 text-left text-fg-primary text-sm hover:bg-surface-hover'
                      onPointerDown={() => pick(space)}
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
        </div>
      )}
    </fieldset>
  )
}
