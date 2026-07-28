import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import type {ConfluenceParentPageSearchQuery} from '../../__generated__/ConfluenceParentPageSearchQuery.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'

const searchQuery = graphql`
  query ConfluenceParentPageSearchQuery($cloudId: ID!, $spaceId: ID!, $query: String!) {
    viewer {
      atlassianConnection {
        confluencePageSearch(cloudId: $cloudId, spaceId: $spaceId, query: $query) {
          id
          title
        }
      }
    }
  }
`

interface Props {
  cloudId: string
  spaceId: string | null
  value: {id: string; title: string} | null
  onChange: (page: {id: string; title: string} | null) => void
}

export const ConfluenceParentPageSearch = (props: Props) => {
  const {cloudId, spaceId, value, onChange} = props
  const atmosphere = useAtmosphere()
  const [input, setInput] = useState('')
  const [options, setOptions] = useState<{id: string; title: string}[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!spaceId || !isOpen) return
    let stale = false
    const timeout = window.setTimeout(() => {
      atmosphere
        .fetchQuery<ConfluenceParentPageSearchQuery>(searchQuery, {
          cloudId,
          spaceId,
          query: input.trim()
        })
        .then((res) => {
          if (stale || res instanceof Error) return
          setOptions(
            (res.viewer.atlassianConnection?.confluencePageSearch ?? []).map((page) => ({...page}))
          )
        })
    }, 300)
    return () => {
      stale = true
      window.clearTimeout(timeout)
    }
  }, [cloudId, spaceId, input, isOpen])

  if (!spaceId) return null
  return (
    <fieldset className='relative m-0 flex flex-col gap-1 border-none p-0'>
      <label className='font-semibold text-fg-primary text-sm'>
        Parent page <span className='font-normal text-fg-muted'>(optional)</span>
      </label>
      <input
        className='rounded-md border border-hairline-field bg-surface-input p-2 text-fg-primary text-sm'
        placeholder='Space root'
        value={isOpen ? input : (value?.title ?? '')}
        onFocus={() => setIsOpen(true)}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 150)}
        onChange={(e) => {
          setInput(e.target.value)
          if (!e.target.value) onChange(null)
        }}
      />
      {isOpen && options.length > 0 && (
        <div
          role='listbox'
          className='absolute top-full z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-hairline bg-surface-raised shadow-dialog'
        >
          {options.map((page) => (
            <button
              key={page.id}
              type='button'
              role='option'
              aria-selected={page.id === value?.id}
              className='block w-full cursor-pointer border-none bg-transparent px-3 py-1.5 text-left text-fg-primary text-sm hover:bg-surface-hover'
              onPointerDown={() => {
                onChange(page)
                setInput('')
                setIsOpen(false)
              }}
            >
              {page.title}
            </button>
          ))}
        </div>
      )}
    </fieldset>
  )
}
