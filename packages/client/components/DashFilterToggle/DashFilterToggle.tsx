import {FilterList, Group, Person} from '@mui/icons-material'
import {forwardRef, type Ref} from 'react'
import {cn} from '../../ui/cn'
import LinkButton from '../LinkButton'

interface Props {
  className?: string
  label: string
  value: string
  //FIXME 6062: change to React.ComponentType
  iconText?: string
  dataCy?: string
  onClick: () => void
  onMouseEnter: () => void
}

const DashFilterToggle = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {className, label, value, iconText, onClick, onMouseEnter, dataCy} = props
  return (
    <LinkButton
      aria-label={`Filter by ${label}`}
      className={cn(
        'shrink-0 font-semibold text-fg-secondary hover:text-fg-primary focus:text-fg-primary active:text-fg-primary',
        className
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      ref={ref}
      dataCy={dataCy}
    >
      <div className='mr-2 h-6 w-6'>
        {
          {
            person: <Person />,
            group: <Group />
          }[iconText!]
        }
        {!iconText && <FilterList />}
      </div>
      {value}
    </LinkButton>
  )
})

export default DashFilterToggle
