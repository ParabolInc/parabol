import {lazy} from 'react'

interface Props {
  teamRef: string
}
const TeamIntegrationsRoot = lazy(
  () =>
    import(
      /* webpackChunkName: 'TeamIntegrationsRoot' */ '../../containers/TeamIntegrationsRoot/TeamIntegrationsRoot'
    )
)

const TeamDashIntegrationsTab = (props: Props) => {
  const {teamRef} = props
  return (
    <div className='flex w-full flex-wrap px-4'>
      <div className='m-0'>
        <TeamIntegrationsRoot teamId={teamRef} />
      </div>
    </div>
  )
}
export default TeamDashIntegrationsTab
