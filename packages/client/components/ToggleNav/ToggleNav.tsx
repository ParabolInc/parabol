import {CreditCard, Extension, Group, Key} from '@mui/icons-material'
import {cn} from '../../ui/cn'

//    TODO:
//  • Add themes, not just mid/purple (TA)
//  • Make icons optional (TA)
//  • Add disabled styles (TA)

const Icons = {
  group: <Group />,
  extension: <Extension />,
  credit_card: <CreditCard />,
  key: <Key />
} as const

export interface Item {
  label: string
  icon: keyof typeof Icons
  isActive: boolean
  onClick?: () => void
}

interface Props {
  items: Item[]
}

const ToggleNav = (props: Props) => {
  const {items} = props

  return (
    <div className='flex w-full'>
      {items.map((item, index) => {
        const {isActive} = item
        return (
          <div
            key={item.label}
            onClick={item.onClick}
            title={item.label}
            className={cn(
              'flex flex-1 items-center justify-center border border-grape-700 border-l-0 px-2 text-center font-semibold text-sm leading-[26px] no-underline hover:no-underline focus:no-underline',
              isActive
                ? 'cursor-default bg-grape-700 text-white hover:bg-grape-700 hover:text-white focus:bg-grape-700 focus:text-white'
                : 'cursor-pointer text-grape-700 hover:bg-surface-hover hover:text-grape-800 focus:bg-surface-hover focus:text-grape-800',
              index === 0 && 'rounded-l-[2px] border-l',
              index === items.length - 1 && 'rounded-r-[2px]'
            )}
          >
            <div className='mr-1 h-[18px] w-[18px] align-middle [&_svg]:text-[18px]'>
              {Icons[item.icon]}
            </div>
            {item.label}
          </div>
        )
      })}
    </div>
  )
}

export default ToggleNav
