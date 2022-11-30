import styled from '@emotion/styled'
import {Archive} from '@mui/icons-material'
import React from 'react'
import DashNavControl from '../../../../components/DashNavControl/DashNavControl'
import useRouter from '../../../../hooks/useRouter'
import {PALETTE} from '../../../../styles/paletteV3'

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

const StyledIcon = styled(Archive)({
  color: PALETTE.SLATE_600,
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
        <StyledIcon />
        <Heading>Archived Tasks</Heading>
      </HeadingBlock>
      <DashNavControl icon='arrow_back' label='Back to Team Tasks' onClick={goToTeamDash} />
    </RootBlock>
  )
}

export default TeamArchiveHeader
