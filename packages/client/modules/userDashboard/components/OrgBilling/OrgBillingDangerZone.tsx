import Panel from '../../../../components/Panel/Panel'
import React from 'react'
import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV2'
import Icon from '../../../../components/Icon'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {Layout} from '../../../../types/constEnums'


const EnvelopeIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  marginLeft: 4
})

const PanelRow = styled('div')({
  borderTop: `1px solid ${PALETTE.BORDER_LIGHTER}`,
  padding: Layout.ROW_GUTTER,
  textAlign: 'center'
})

const Unsubscribe = styled('div')({
  alignItems: 'center',
  color: PALETTE.LINK_MAIN,
  display: 'flex',
  justifyContent: 'center',
  '& a': {
    alignItems: 'center',
    color: PALETTE.LINK_BLUE,
    display: 'flex',
    marginLeft: 8,
    '& > u': {
      textDecoration: 'none'
    },
    '&:hover > u, &:focus > u': {
      textDecoration: 'underline'
    }
  }
})

interface Props {
  isBillingLeader: boolean
}
const OrgBillingDangerZone = (props: Props) => {
  const {isBillingLeader} = props
  if (!isBillingLeader) return null
  return (
    <Panel label='Danger Zone'>
      <PanelRow>
        <Unsubscribe>
          <span>{'Need to cancel? It’s painless. '}</span>
          <a
            href='mailto:love@parabol.co?subject=Instant Unsubscribe from Pro'
            title='Instant Unsubscribe from Pro'
          >
            <u>{'Contact us'}</u>
            <EnvelopeIcon>email</EnvelopeIcon>
          </a>
        </Unsubscribe>
      </PanelRow>
    </Panel>
  )
}

export default OrgBillingDangerZone
