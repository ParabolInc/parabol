import {Suspense} from 'react'
import useCanonical from '../../hooks/useCanonical'
import useMetaTagContent from '../../hooks/useMetaTagContent'
import AtmosphereProvider from '../AtmosphereProvider/AtmosphereProvider'
import TeamHealthDemoBanner from './TeamHealthDemoBanner'
import TeamHealthDemoRoot from './TeamHealthDemoRoot'

const CONTENT =
  'Try Parabol’s anonymous team health check, a free alternative to employee engagement pulse surveys. See scores for psychological safety, dependability, clarity, meaning and impact after 5 rounds, plus the discussion and action items that follow. Sample data, no account needed.'

const getTeamHealthDemoAtmosphere = () => {
  return import(
    /* webpackChunkName: 'TeamHealthDemoAtmosphere' */ '~/modules/demo/TeamHealthDemoAtmosphere'
  )
}

const TeamHealthDemoPage = () => {
  useMetaTagContent(CONTENT)
  useCanonical('team-health-demo')
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
