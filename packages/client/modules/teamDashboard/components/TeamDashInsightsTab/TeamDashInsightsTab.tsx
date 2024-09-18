import React from 'react'

interface Props {
  teamRef: string
}
// const TeamIntegrationsRoot = lazy(
//   () =>
//     import(
//       /* webpackChunkName: 'TeamIntegrationsRoot' */ '../../containers/TeamIntegrationsRoot/TeamIntegrationsRoot'
//     )
// )

const TeamDashInsightsTab = (props: Props) => {
  const {teamRef} = props
  return (
    <div className='flex w-full flex-wrap px-4'>
      <div className='m-0'>
        {/* <TeamIntegrationsRoot teamId={teamRef} /> */}
        {'heyy'}
      </div>
    </div>
  )
}
export default TeamDashInsightsTab
