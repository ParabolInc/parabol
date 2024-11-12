import {lazy} from 'react'

interface Props {
  teamId: string
}

const TeamInsightsRoot = lazy(
  () => import(/* webpackChunkName: 'InsightsRoot' */ './TeamInsightsRoot')
)

const TeamDashInsightsTab = (props: Props) => {
  const {teamId} = props
  return (
    <div className='flex w-full flex-wrap px-4'>
      <div className='m-0'>
        <TeamInsightsRoot teamId={teamId} />
      </div>
    </div>
  )
}
export default TeamDashInsightsTab
