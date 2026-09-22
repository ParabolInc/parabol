import {Suspense} from 'react'
import useMetaTagContent from '../../hooks/useMetaTagContent'
import AtmosphereProvider from '../AtmosphereProvider/AtmosphereProvider'
import TeamHealthDemoBanner from './TeamHealthDemoBanner'
import TeamHealthDemoRoot from './TeamHealthDemoRoot'

const CONTENT =
  'See what a Parabol Team Health check looks like after 5 rounds: scores per topic, trends, spread and the discussion that follows. Sample data, no account needed.'

const getTeamHealthDemoAtmosphere = () => {
  return import(
    /* webpackChunkName: 'TeamHealthDemoAtmosphere' */ '~/modules/demo/TeamHealthDemoAtmosphere'
  )
}

const TeamHealthDemoPage = () => {
  useMetaTagContent(CONTENT)
  return (
    <AtmosphereProvider getLocalAtmosphere={getTeamHealthDemoAtmosphere}>
      <div className='flex h-full flex-col'>
        <TeamHealthDemoBanner />
        <div className='min-h-0 flex-1'>
          <Suspense fallback={''}>
            <TeamHealthDemoRoot />
          </Suspense>
        </div>
      </div>
    </AtmosphereProvider>
  )
}

export default TeamHealthDemoPage
