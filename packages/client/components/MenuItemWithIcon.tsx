import {Bookmark, Comment, Delete, Edit, Keyboard} from '~/ui/icons'

interface Props {
  //FIXME 6062: change to React.ComponentType
  icon: string
  label: string
  dataCy: string
}

const MenuItemWithIcon = (props: Props) => {
  const {icon, label, dataCy} = props
  return (
    <div className='flex w-full items-center px-2' data-cy={`${dataCy}`}>
      <div className='m-2 h-6 w-6 text-fg-secondary'>
        {
          {
            delete: <Delete />,
            bookmark: <Bookmark />,
            keyboard: <Keyboard />,
            comment: <Comment />,
            edit: <Edit />
          }[icon]
        }
      </div>
      <div className='text-fg-primary text-sm leading-8'>{label}</div>
    </div>
  )
}

export default MenuItemWithIcon
