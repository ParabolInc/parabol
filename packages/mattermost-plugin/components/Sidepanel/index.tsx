import styled from 'styled-components'

import useAtmosphere from '../../hooks/useAtmosphere'
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

  return (
    <Panel>
      <LinkedTeams />
      {atmosphere.state.authToken && <ActiveMeetings />}
    </Panel>
  )
}

export default SidePanelRoot
