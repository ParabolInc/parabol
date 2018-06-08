// @flow

import React from 'react'
import Button from 'universal/components/Button'
import Type from 'universal/components/Type/Type'

import ArchiveTeamForm from './ArchiveTeamForm'

type Props = {
  teamName: string,
  handleFormBlur: () => any,
  handleFormSubmit: () => any,
  handleClick: () => any,
  showConfirmationField: boolean
}

const ArchiveTeam = ({
  handleClick,
  handleFormBlur,
  handleFormSubmit,
  showConfirmationField,
  teamName
}: Props) => (
  <div>
    {!showConfirmationField ? (
      <div>
        <Button
          aria-label='Click to permanently delete this team.'
          buttonSize='small'
          buttonStyle='link'
          colorPalette='red'
          icon='minus-circle'
          label='Delete Team'
          onClick={handleClick}
        />
        <Type width='auto' marginTop='.5rem' scale='s2'>
          <b>Note</b>: {'This can’t be undone.'}
        </Type>
      </div>
    ) : (
      <ArchiveTeamForm
        handleFormBlur={handleFormBlur}
        handleFormSubmit={handleFormSubmit}
        teamName={teamName}
      />
    )}
  </div>
)

export default ArchiveTeam
