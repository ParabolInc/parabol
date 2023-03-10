import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import Avatar from '../../../../components/Avatar/Avatar'
import React from 'react'
import {BillingLeader_user$key} from '../../../../__generated__/BillingLeader_user.graphql'
import Row from '../../../../components/Row/Row'
import {ElementWidth} from '../../../../types/constEnums'
import RowInfoHeading from '../../../../components/Row/RowInfoHeading'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import RowActions from '../../../../components/Row/RowActions'
import FlatButton from '../../../../components/FlatButton'
import RowInfo from '../../../../components/Row/RowInfo'
import {useFragment} from 'react-relay'
import IconLabel from '../../../../components/IconLabel'

const StyledRow = styled(Row)<{isFirstRow: boolean}>(({isFirstRow}) => ({
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  border: isFirstRow ? 'none' : undefined
}))

const ActionsBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-end'
})

const MenuToggleBlock = styled('div')({
  width: 32
})

const StyledButton = styled(FlatButton)({
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

type Props = {
  billingLeaderRef: BillingLeader_user$key
  isFirstRow: boolean
}

const BillingLeader = (props: Props) => {
  const {billingLeaderRef, isFirstRow} = props
  const billingLeader = useFragment(
    graphql`
      fragment BillingLeader_user on User {
        preferredName
        picture
      }
    `,
    billingLeaderRef
  )
  const {preferredName, picture} = billingLeader

  return (
    <StyledRow isFirstRow={isFirstRow}>
      <Avatar hasBadge={false} picture={picture} size={ElementWidth.BILLING_AVATAR} />
      <RowInfo>
        <RowInfoHeader>
          <RowInfoHeading>{preferredName}</RowInfoHeading>
        </RowInfoHeader>
      </RowInfo>
      <RowActions>
        <ActionsBlock>
          <MenuToggleBlock>
            <StyledButton>
              <IconLabel icon='more_vert' />
            </StyledButton>
          </MenuToggleBlock>
        </ActionsBlock>
      </RowActions>
    </StyledRow>
  )
}

export default BillingLeader
