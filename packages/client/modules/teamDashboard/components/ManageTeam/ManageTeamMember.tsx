import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ManageTeamMember_teamMember} from '~/__generated__/ManageTeamMember_teamMember.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import Row from '../../../../components/Row/Row'
import RowInfoHeader from '../../../../components/Row/RowInfoHeader'
import Icon from '../../../../components/Icon'
import {PALETTE} from '../../../../styles/paletteV3'
import FlatButton from '../../../../components/FlatButton'
import {ICON_SIZE} from '../../../../styles/typographyV2'

const StyledRow = styled(Row)({
  borderTop: 0,
  padding: `8px 8px 8px 16px`
})

const StyledButton = styled(FlatButton)({
  color: PALETTE.GRAPE_700,
  fontSize: ICON_SIZE.MD18,
  userSelect: 'none',
  padding: 0
})

const Name = styled('div')({
  fontSize: 14,
  fontWeight: 400,
  color: PALETTE.SLATE_700,
  lineHeight: '20px'
})

const StyledHeader = styled(RowInfoHeader)({
  padding: '0px 16px'
})

const RowInner = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexWrap: 'wrap'
})

const StyledIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18
})

interface Props {
  teamMember: ManageTeamMember_teamMember
}

const ManageTeamMember = (props: Props) => {
  const {teamMember} = props
  const {preferredName, picture} = teamMember

  return (
    <StyledRow>
      <Avatar size={24} picture={picture} />
      <RowInner>
        <StyledHeader>
          <Name>{preferredName}</Name>
        </StyledHeader>
      </RowInner>
      <StyledButton>
        <StyledIcon>more_vert</StyledIcon>
      </StyledButton>
    </StyledRow>
  )
}

export default createFragmentContainer(ManageTeamMember, {
  teamMember: graphql`
    fragment ManageTeamMember_teamMember on TeamMember {
      preferredName
      picture
    }
  `
})
