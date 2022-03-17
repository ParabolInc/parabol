import styled from '@emotion/styled'
import React from 'react'
import DashNavControl from '../../../../components/DashNavControl/DashNavControl'
import Icon from '../../../../components/Icon'
import useRouter from '../../../../hooks/useRouter'
import {PALETTE} from '../../../../styles/paletteV3'
import {ICON_SIZE} from '../../../../styles/typographyV2'

const RootBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: '16px 0',
  width: '100%'
})

const HeadingBlock = styled('div')({
  alignItems: 'center',
  display: 'flex',
  margin: '0 32px 0 0',
  whiteSpace: 'nowrap'
})

const Heading = styled('div')({
  fontSize: 18,
  lineHeight: '32px'
})

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD24,
  marginRight: 8
})

interface Props {
  teamId: string
}

const TeamArchiveHeader = (props: Props) => {
  const {teamId} = props
  const {history} = useRouter()
  const goToTeamDash = () => history.push(`/team/${teamId}/`)
  return (
    <RootBlock>
      <HeadingBlock>
        <StyledIcon>archive</StyledIcon>
        <Heading>Archived Tasks</Heading>
      </HeadingBlock>
      <DashNavControl icon='arrow_back' label='Back to Team Tasks' onClick={goToTeamDash} />
    </RootBlock>
  )
}

export default TeamArchiveHeader
