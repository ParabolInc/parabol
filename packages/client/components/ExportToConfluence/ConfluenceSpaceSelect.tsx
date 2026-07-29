import {useState} from 'react'
import {ConfluenceSpaceListRoot} from './ConfluenceSpaceListRoot'

export type SpaceOption = {id: string; name: string; isPersonal: boolean}

interface Props {
  teamId: string
  cloudId: string
  value: SpaceOption | null
  onChange: (space: SpaceOption) => void
}

export const ConfluenceSpaceSelect = (props: Props) => {
  const {teamId, cloudId, value, onChange} = props
  const [filter, setFilter] = useState('')
  const [isOpen, setIsOpen] = useState(false)

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
        placeholder='Search spaces'
        value={isOpen ? filter : (value?.name ?? '')}
        onFocus={() => setIsOpen(true)}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 150)}
        onChange={(e) => setFilter(e.target.value)}
      />
      {isOpen && (
        <div
          role='listbox'
          className='absolute top-full z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-hairline bg-surface-raised shadow-dialog'
        >
          <ConfluenceSpaceListRoot
            teamId={teamId}
            cloudId={cloudId}
            filter={filter}
            selectedId={value?.id ?? null}
            onPick={pick}
          />
        </div>
      )}
    </fieldset>
  )
}
