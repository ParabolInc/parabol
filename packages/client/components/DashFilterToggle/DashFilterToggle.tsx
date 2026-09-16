import {type ComponentPropsWithoutRef, forwardRef, type ReactNode, type Ref} from 'react'
import {FilterList, Group, Person} from '~/ui/icons'
import {Button} from '../../ui/Button/Button'
import {cn} from '../../ui/cn'

interface Props extends Omit<ComponentPropsWithoutRef<'button'>, 'value'> {
  className?: string
  label: string
  value: ReactNode
  //FIXME 6062: change to React.ComponentType
  iconText?: string
  dataCy?: string
}

const DashFilterToggle = forwardRef((props: Props, ref: Ref<HTMLButtonElement>) => {
  const {className, label, value, iconText, dataCy, ...rest} = props
  return (
    <Button
      aria-label={`Filter by ${label}`}
      size='default'
      className={cn(
        'bg-transparent p-0 text-[14px] text-fg-primary leading-5 shadow-none hover:text-accent focus:text-accent active:text-accent',
        'shrink-0 font-semibold text-fg-secondary hover:text-fg-primary focus:text-fg-primary active:text-fg-primary',
        className
      )}
      ref={ref}
      data-cy={dataCy}
      {...rest}
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
    </Button>
  )
})

export default DashFilterToggle
