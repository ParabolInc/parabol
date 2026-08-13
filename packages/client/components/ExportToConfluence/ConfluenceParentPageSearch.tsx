import {useEffect, useState} from 'react'
import {ConfluenceParentPageListRoot} from './ConfluenceParentPageListRoot'

interface Props {
  teamId: string
  cloudId: string
  spaceId: string | null
  value: {id: string; title: string} | null
  onChange: (page: {id: string; title: string} | null) => void
}

export const ConfluenceParentPageSearch = (props: Props) => {
  const {teamId, cloudId, spaceId, value, onChange} = props
  const [input, setInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedQuery(input.trim()), 300)
    return () => window.clearTimeout(timeoutId)
  }, [input])

  if (!spaceId) return null

  const pick = (page: {id: string; title: string}) => {
    onChange(page)
    setInput('')
    setIsOpen(false)
  }

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
          if (e.target.value === '') onChange(null)
        }}
      />
      {isOpen && (
        <div
          role='listbox'
          className='absolute top-full z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-hairline bg-surface-raised shadow-dialog'
        >
          <ConfluenceParentPageListRoot
            teamId={teamId}
            cloudId={cloudId}
            spaceId={spaceId}
            query={debouncedQuery}
            onPick={pick}
          />
        </div>
      )}
    </fieldset>
  )
}
