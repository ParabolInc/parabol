import React from 'react'
import styled from 'react-emotion'
import RowInfoHeading from 'universal/components/Row/RowInfoHeading'
import Icon from 'universal/components/Icon'
import {PALETTE} from '../../../../styles/paletteV2'

interface Props {
  name: string
  userCount: number
  integrationCount: number
}

const ProviderMeta = styled('div')({
  color: PALETTE.TEXT.LIGHT,
  display: 'flex',
  fontSize: 16,
  fontWeight: 600,
  paddingLeft: 24
})

const ProviderMetaItem = styled('div')({
  alignItems: 'center',
  display: 'flex',
  marginRight: 16
})

const MetaIcon = styled(Icon)({
  alignItems: 'center',
  display: 'flex',
  fontSize: 18,
  fontWeight: 400,
  height: 24,
  marginRight: 2
})

const MetaNumber = styled('span')({
  fontSize: 13,
  lineHeight: '24px'
})

const ProviderName = styled(RowInfoHeading)({
  alignItems: 'center',
  display: 'flex',
  marginRight: 16,
  verticalAlign: 'middle'
})

const ProviderRowName = (props: Props) => {
  const {name, userCount, integrationCount} = props
  return (
    <ProviderName>
      {name}
      {integrationCount > 0 && (
        <ProviderMeta>
          <ProviderMetaItem>
            <MetaIcon>account_circle</MetaIcon>
            <MetaNumber>{userCount}</MetaNumber>
          </ProviderMetaItem>
          <ProviderMetaItem>
            <MetaIcon>extension</MetaIcon>
            <MetaNumber>{integrationCount}</MetaNumber>
          </ProviderMetaItem>
        </ProviderMeta>
      )}
    </ProviderName>
  )
}

export default ProviderRowName
