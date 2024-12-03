import React, {useCallback} from 'react'

import styled from 'styled-components'

//import LinkedTeams from './LinkedTeams'
import {useSelector} from 'react-redux'
import ActiveMeetings from './ActiveMeetings'
import {getPluginServerRoute} from '../../selectors'
import {Client4} from 'mattermost-redux/client'
import useAtmosphere from '../../hooks/useAtmosphere'

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 16px 8px;
`

const SidePanelRoot = () => {
  const [selectedTab, setSelectedTab] = React.useState('linked-teams')
  const pluginServerRoute = useSelector(getPluginServerRoute)
  const serverUrl = `${pluginServerRoute}/login`
  const atmosphere = useAtmosphere()

  const login = useCallback(async () => {
    const response = await fetch(serverUrl, Client4.getOptions({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }));
    const body = await response.json()
    console.log('GEORG response', body)
    atmosphere.state.authToken = body.authToken
    
  }, [serverUrl])

  return (
    <Panel>
      <button onClick={login}>Login</button>
      {/*
      <LinkedTeams/>
        */}
      {atmosphere.state.authToken &&
        <ActiveMeetings/>
      }
    </Panel>
  )
}

export default SidePanelRoot

