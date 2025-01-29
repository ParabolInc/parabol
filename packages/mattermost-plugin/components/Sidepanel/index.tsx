import styled from 'styled-components'

import {useSelector} from 'react-redux'
import useAtmosphere from '../../hooks/useAtmosphere'
import {getPluginServerRoute, isAuthorized} from '../../selectors'
import ActiveMeetings from './ActiveMeetings'
import LinkedTeams from './LinkedTeams'

const Panel = styled.div!`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 16px 8px;
  overflow-y: auto;
`

const SidePanelRoot = () => {
  const atmosphere = useAtmosphere()
  const loggedIn = useSelector(isAuthorized)
  const pluginServerRoute = useSelector(getPluginServerRoute)

  return (
    <Panel>
      {loggedIn ? (
        <>
          <LinkedTeams />
          <ActiveMeetings />
        </>
      ) : (
        <div>
          <p>
            You are not logged in to{' '}
            <a href={`${pluginServerRoute}/parabol/create-account`}>Parabol</a>
          </p>
          <button onClick={atmosphere.login}>Login</button>
        </div>
      )}
    </Panel>
  )
}

export default SidePanelRoot
