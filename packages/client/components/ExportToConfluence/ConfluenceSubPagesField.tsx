import {useState} from 'react'
import {Checkbox} from '../../ui/Checkbox/Checkbox'

interface Props {
  subPages: readonly {readonly id: string; readonly title: string | null | undefined}[]
  includeSubPages: boolean
  onToggle: () => void
}

export const ConfluenceSubPagesField = (props: Props) => {
  const {subPages, includeSubPages, onToggle} = props
  const [expanded, setExpanded] = useState(false)
  if (subPages.length === 0) return null
  const overTen = subPages.length > 10
  const countLabel = overTen ? '10+' : String(subPages.length)

  return (
    <div className='flex flex-col gap-1'>
      <div className='flex cursor-pointer flex-row items-center gap-2 p-1' onClick={onToggle}>
        <Checkbox checked={includeSubPages} />
        <span className='text-fg-primary text-sm'>
          Include {countLabel} sub-page{subPages.length === 1 ? '' : 's'}
          <span className='text-fg-muted'> (includes nested pages)</span>
        </span>
      </div>
      {!overTen && (
        <button
          type='button'
          className='cursor-pointer self-start border-none bg-transparent p-0 text-fg-muted text-xs hover:text-fg-secondary'
          onClick={() => setExpanded((val) => !val)}
        >
          {expanded ? 'Hide sub-pages' : 'Show sub-pages'}
        </button>
      )}
      {expanded && !overTen && (
        <ul className='m-0 list-none p-0 pl-7 text-fg-secondary text-sm'>
          {subPages.map(({id, title}) => (
            <li key={id} className='py-0.5'>
              {title || 'Untitled'}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
