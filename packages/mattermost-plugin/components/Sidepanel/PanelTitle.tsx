import React from 'react'

import {useSelector} from 'react-redux'
import styled from 'styled-components'
import {getCurrentChannel} from 'mattermost-redux/selectors/entities/channels'

import {getAssetsUrl} from '../../selectors'
//import {useConfigQuery} from '../../api'

const Panel = styled.div`
  display: flex;
  align-items: center;
`

const TitleLink = styled.a`
  font-size: 1.5rem;
  font-weight: bold;
  margin-left: 8px;
  color: #000;
  text-decoration: none;
`

const PanelTitle = () => {
  const channel = useSelector(getCurrentChannel)
  const {display_name: channelName} = channel
  const assetsPath = useSelector(getAssetsUrl)
  //const {data: config} = useConfigQuery()

  return (
    <Panel>
      <img
        width={24}
        height={24}
        src={`${assetsPath}/parabol.png`}
      />
      <TitleLink
        href={undefined/*config?.parabolURL*/}
        target='_blank'
      >Parabol{channelName && ` | ${channelName}`}</TitleLink>
    </Panel>
  )
}

export default PanelTitle

