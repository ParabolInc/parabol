import React, {useCallback} from 'react'

import styled from 'styled-components'

//import LinkedTeams from './LinkedTeams'
import ActiveMeetings from './ActiveMeetings'
import useAtmosphere from '../../hooks/useAtmosphere'

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 16px 8px;
`

const SidePanelRoot = () => {
  const [selectedTab, setSelectedTab] = React.useState('linked-teams')
  const atmosphere = useAtmosphere()

  return (
    <Panel>
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

