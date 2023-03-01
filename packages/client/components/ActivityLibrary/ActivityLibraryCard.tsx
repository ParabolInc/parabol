import React from 'react'

interface Props {
  name: string
  type: string
}

const ActivityLibraryCard = (props: Props) => {
  const {type, name} = props
  return (
    <div className='m-2 border-solid p-2'>
      <div>{type}</div>
      <div className='text-lg font-bold'>{name}</div>
    </div>
  )
}

export default ActivityLibraryCard
