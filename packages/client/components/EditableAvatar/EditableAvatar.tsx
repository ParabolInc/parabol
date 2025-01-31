import {Edit as EditIcon} from '@mui/icons-material'
import clsx from 'clsx'
import Avatar from '../Avatar/Avatar'

interface Props {
  onClick?: () => void
  picture: string
  className?: string
}

const EditableAvatar = (props: Props) => {
  const {onClick, picture, className} = props
  return (
    <div className='relative cursor-pointer' onClick={onClick} aria-label='click to update photo'>
      <Avatar
        picture={picture}
        className={clsx(`h-16 w-16 border-4 border-solid border-slate-200`, className)}
      />
      <div className='absolute top-0 left-0 flex h-full w-full items-center justify-center rounded-full bg-slate-400 text-sm font-semibold text-slate-800 opacity-0 transition-opacity duration-300 hover:opacity-75'>
        EDIT
      </div>
      <div
        aria-hidden
        className='icon-wrapper absolute top-0 right-0 z-10 rounded-full bg-slate-200 px-1.5 hover:bg-slate-200'
      >
        <EditIcon className='mb-[-2px] w-3.5 pt-0.5' />
      </div>
    </div>
  )
}

export default EditableAvatar
