import React, {Suspense} from 'react'
import useAtmosphere from '../../hooks/useAtmosphere'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import teamPromptWorkDrawerQuery, {
  TeamPromptWorkDrawerQuery
} from '../../__generated__/TeamPromptWorkDrawerQuery.graphql'
import ErrorBoundary from '../ErrorBoundary'
import TeamPromptWorkDrawer from './TeamPromptWorkDrawer'
import {renderLoader} from '~/utils/relay/renderLoader'

interface Props {
  onToggleDrawer: () => void
}

const TeamPromptWorkDrawerRoot = (props: Props) => {
  const {onToggleDrawer} = props
  const atmosphere = useAtmosphere()
  const queryRef = useQueryLoaderNow<TeamPromptWorkDrawerQuery>(teamPromptWorkDrawerQuery, {
    userIds: [atmosphere.viewerId]
  })
  return (
    <ErrorBoundary>
      <Suspense fallback={renderLoader()}>
        {queryRef && <TeamPromptWorkDrawer queryRef={queryRef} onToggleDrawer={onToggleDrawer} />}
      </Suspense>
    </ErrorBoundary>
  )
}

export default TeamPromptWorkDrawerRoot
