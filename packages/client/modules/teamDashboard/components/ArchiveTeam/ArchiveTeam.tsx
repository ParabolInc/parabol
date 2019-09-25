import React from 'react'
import LinkButton from '../../../../components/LinkButton'
import IconLabel from '../../../../components/IconLabel'
import ArchiveTeamForm from './ArchiveTeamForm'
import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV2'

interface Props {
  teamName: string
  teamId: string
  handleFormBlur: () => any
  handleClick: () => any
  showConfirmationField: boolean
}

const Hint = styled('div')({
  color: PALETTE.TEXT_GRAY,
  fontSize: 13,
  marginTop: 8
})

const ArchiveTeam = ({
  handleClick,
  handleFormBlur,
  showConfirmationField,
  teamName,
  teamId
}: Props) => (
  <div>
    {!showConfirmationField ? (
      <div>
        <LinkButton
          aria-label='Click to permanently delete this team.'
          palette='red'
          onClick={handleClick}
        >
          <IconLabel icon='remove_circle' label='Delete Team' />
        </LinkButton>
        <Hint>
          <b>Note</b>: {'This can’t be undone.'}
        </Hint>
      </div>
    ) : (
      <ArchiveTeamForm handleFormBlur={handleFormBlur} teamName={teamName} teamId={teamId} />
    )}
  </div>
)

export default ArchiveTeam
