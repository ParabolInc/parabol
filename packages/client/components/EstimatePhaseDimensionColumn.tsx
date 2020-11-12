import React, {useState} from 'react'
import styled from '@emotion/styled'
import PokerActiveVoting from './PokerActiveVoting'
import PokerDiscussVoting from './PokerDiscussVoting'
import LinkButton from './LinkButton'
import useHotkey from '~/hooks/useHotkey'

const ColumnInner = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'auto',
  width: '100%'
})

const DimensionHeader = styled('div')({
  display: 'flex',
  padding: '8px 16px'
})

const DimensionName = styled('div')({
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px',
  marginRight: 'auto'
})

const StyledLinkButton = styled(LinkButton)({
  fontSize: 12,
  fontWeight: 600
})

interface Props {
  estimateStage: any
  setVotedUserEl: (userId: string, el: HTMLDivElement) => void
}

const EstimatePhaseDimensionColumn = (props: Props) => {
  const {setVotedUserEl} = props
  const {dimensionName, scores, selectedScale, teamMembers} = props.estimateStage

  const [isVoting, setIsVoting] = useState(false)
  useHotkey('a', () => {
    setIsVoting(!isVoting)
  })

  return (
    <ColumnInner>
      <DimensionHeader>
        <DimensionName>{dimensionName}</DimensionName>
        {isVoting ? null : <StyledLinkButton palette={'blue'}>{'Team Revote'}</StyledLinkButton>}
      </DimensionHeader>

      {teamMembers.map((teamMember) => {
        return <div ref={(el: HTMLDivElement) => {
          setVotedUserEl(teamMember.userId, el)
        }} />
      })}

      {isVoting
        ? <PokerActiveVoting scores={scores} teamMembers={teamMembers} />
        : <PokerDiscussVoting selectedScale={selectedScale} scores={scores} teamMembers={teamMembers} />}
    </ColumnInner>
  )
}

export default EstimatePhaseDimensionColumn
