import React from 'react'

interface Props {
  name: string
  type: string
  teamName: string
}

const ActivityLibraryCard = (props: Props) => {
  const {type, name, teamName} = props
  return (
    <div className='m-2 border-solid p-2'>
      <div>
        {type} on team {teamName}
      </div>
      <div className='text-lg font-bold'>{name}</div>
    </div>
  )
}

export default ActivityLibraryCard
