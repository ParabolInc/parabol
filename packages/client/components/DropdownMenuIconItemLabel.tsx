import {Business, Group, Public} from '~/ui/icons'

interface Props {
  //FIXME 6062: change to React.ComponentType
  icon: string
  label: string
}

const DropdownMenuIconItemLabel = (props: Props) => {
  const {icon, label} = props
  return (
    <span className='flex w-full items-center px-3 text-[15px] text-fg-primary leading-8'>
      <div className='mr-3 h-6 w-6 text-fg-secondary'>
        {
          {
            group: <Group />,
            business: <Business />,
            public: <Public />
          }[icon]
        }
      </div>
      {label}
    </span>
  )
}
export default DropdownMenuIconItemLabel
