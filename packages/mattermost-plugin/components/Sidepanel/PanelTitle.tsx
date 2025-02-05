import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels'
import {useSelector} from 'react-redux'
import styled from 'styled-components'

import {useConfig} from '../../hooks/useConfig'
import {getAssetsUrl} from '../../selectors'

const Panel = styled.div!`
  display: flex;
  align-items: center;
`

const TitleLink = styled.div!`
  font-size: 1.5rem;
  font-weight: bold;
  margin-left: 8px;
  color: #000;
  text-decoration: none;
` as any

const PanelTitle = () => {
  const channel = useSelector(getCurrentChannel)
  const {display_name: channelName} = channel
  const assetsPath = useSelector(getAssetsUrl)

  return (
    <Panel>
      <img width={24} height={24} src={`${assetsPath}/parabol.png`} />
      <TitleLink>
        Parabol{channelName && ` | ${channelName}`}
      </TitleLink>
    </Panel>
  )
}

export default PanelTitle
