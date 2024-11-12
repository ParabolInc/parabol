import AddIcon from '@mui/icons-material/Add'
import insightsEmptyStateImg from '../../../../../../static/images/illustrations/insights-empty-state.png'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import GenerateInsightMutation from '../../../../mutations/GenerateInsightMutation'
import plural from '../../../../utils/plural'

interface Props {
  meetingsCount?: number
  teamId?: string
}

const TeamInsightEmptyState = (props: Props) => {
  const {meetingsCount, teamId} = props
  const atmosphere = useAtmosphere()
  const {onError, error, onCompleted, submitMutation, submitting} = useMutationProps()

  if (meetingsCount === undefined || !teamId) return null

  const canGenerateInsight = meetingsCount > 1

  const handleGenerateInsight = () => {
    if (submitting) return
    submitMutation()
    const now = new Date()
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
    GenerateInsightMutation(
      atmosphere,
      {
        teamId,
        startDate: threeMonthsAgo.toISOString(), // TODO: let users choose date range
        endDate: now.toISOString()
      },
      {onError, onCompleted}
    )
  }

  return (
    <div className='flex flex-col items-center text-center'>
      <img src={insightsEmptyStateImg} alt='Empty state' width={300} height={300} />
      <div className='space-y-1'>
        <p className='mt-4 text-lg leading-tight'>
          Your team has completed <strong>{meetingsCount}</strong>{' '}
          {plural(meetingsCount, 'meeting')}.
        </p>
        {canGenerateInsight ? (
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
      {canGenerateInsight && (
        <button
          className='mt-6 flex items-center rounded-full bg-grape-500 px-6 py-2 font-bold text-white transition-all duration-200 ease-in-out hover:cursor-pointer hover:bg-grape-600 hover:shadow-md disabled:opacity-50'
          onClick={handleGenerateInsight}
          disabled={submitting}
        >
          <AddIcon className='mr-2 h-5 w-5' />
          {submitting ? 'Generating...' : 'Generate Insights'}
        </button>
      )}
      {error && (
        <div className='mt-2 pr-4 text-xs font-semibold text-tomato-500'>{error.message}</div>
      )}
    </div>
  )
}

export default TeamInsightEmptyState
