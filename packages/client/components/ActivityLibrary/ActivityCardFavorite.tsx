import {Favorite} from '@mui/icons-material'
import React, {useState} from 'react'

const ActivityCardFavorite = () => {
  const [isSelected, setIsSelected] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsSelected((prev) => !prev)
  }
  return (
    <div className='absolute bottom-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white'>
      <button
        onClick={handleClick}
        className='flex h-10 w-10 cursor-pointer items-center justify-center bg-transparent'
      >
        <Favorite className={isSelected ? 'text-rose-600' : 'text-slate-600'} />
      </button>
    </div>
  )
}

export default ActivityCardFavorite
