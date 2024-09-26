import {ChevronRight} from '@mui/icons-material'
import React from 'react'
import plural from '../../../../utils/plural'

type Props = {
  hiddenTeamCount: number
}

const TeaserOrgTeamsRow = (props: Props) => {
  const {hiddenTeamCount} = props
  return (
    <div className='flex cursor-not-allowed items-center bg-slate-100 p-4 pb-0 opacity-50'>
      <div className='flex flex-1 flex-col py-1 '>
        <div className='text-gray-700 flex items-center text-lg font-bold'>
          {hiddenTeamCount} {plural(hiddenTeamCount, 'Hidden Team')}
        </div>
      </div>
      <div className='flex items-center justify-center'>
        <ChevronRight />
      </div>
    </div>
  )
}

export default TeaserOrgTeamsRow
