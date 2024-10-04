import AddIcon from '@mui/icons-material/Add'
import React from 'react'
import insightsEmptyStateImg from '../../../../../../static/images/illustrations/insights-empty-state.png'
import plural from '../../../../utils/plural'

interface Props {
  meetingsCount: number
}

const TeamInsightEmptyState = (props: Props) => {
  const {meetingsCount} = props
  return (
    <div className='flex flex-col items-center text-center'>
      <img src={insightsEmptyStateImg} alt='Empty state' width={300} height={300} />
      <div className='space-y-0'>
        <p className='mt-4 text-lg leading-tight'>
          Your team has completed <strong>{meetingsCount}</strong>{' '}
          {plural(meetingsCount, 'meeting')}.
        </p>
        {meetingsCount > 0 ? (
          <p className='text-lg leading-tight'>
            This should be{' '}
            <strong>
              <em>good fodder</em>
            </strong>{' '}
            for some interesting insights!
          </p>
        ) : (
          <p className='text-lg leading-tight'>
            Create more meetings to start generating insights for your team.
          </p>
        )}
      </div>
      {meetingsCount > 0 && (
        <button className='mt-6 flex items-center rounded-full bg-grape-500 py-2 px-6 font-bold text-white transition-all duration-200 ease-in-out hover:scale-105 hover:bg-grape-600 hover:shadow-lg'>
          <AddIcon className='mr-2 h-6 w-6' />
          Generate Insights
        </button>
      )}
    </div>
  )
}

export default TeamInsightEmptyState
