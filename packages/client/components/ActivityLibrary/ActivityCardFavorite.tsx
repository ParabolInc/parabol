import {Favorite} from '@mui/icons-material'
import clsx from 'clsx'
import React, {useState} from 'react'

type Props = {
  className?: string
}

const ActivityCardFavorite = (props: Props) => {
  const {className} = props
  const [isSelected, setIsSelected] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsSelected((prev) => !prev)
  }
  return (
    <div
      className={clsx(
        className,
        `z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white`
      )}
    >
      <button
        onClick={handleClick}
        className='flex h-full w-full cursor-pointer items-center justify-center bg-transparent'
      >
        <Favorite className={isSelected ? 'text-rose-600' : 'text-slate-600'} />
      </button>
    </div>
  )
}

export default ActivityCardFavorite
