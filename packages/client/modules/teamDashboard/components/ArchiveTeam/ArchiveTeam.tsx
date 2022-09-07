import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import {ArchiveTeam_team} from '~/__generated__/ArchiveTeam_team.graphql'
import IconLabel from '../../../../components/IconLabel'
import LinkButton from '../../../../components/LinkButton'
import {PALETTE} from '../../../../styles/paletteV3'
import ArchiveTeamForm from './ArchiveTeamForm'

interface Props {
  team: ArchiveTeam_team
}

const Hint = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 13,
  marginTop: 8
})

const ArchiveTeam = (props: Props) => {
  const {team} = props

  //FIXME i18n: Click to permanently delete this team.
  //FIXME i18n: Delete Team
  const {t} = useTranslation()

  const [showConfirmationField, setShowConfirmationField] = useState(false)
  const handleClick = () => {
    setShowConfirmationField(true)
  }
  const handleFormBlur = () => {
    setShowConfirmationField(false)
  }
  return (
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
            <b>{t('ArchiveTeam.Note')}</b>: {t('ArchiveTeam.ThisCanTBeUndone')}
          </Hint>
        </div>
      ) : (
        <ArchiveTeamForm handleFormBlur={handleFormBlur} team={team} />
      )}
    </div>
  )
}

export default createFragmentContainer(ArchiveTeam, {
  team: graphql`
    fragment ArchiveTeam_team on Team {
      ...ArchiveTeamForm_team
    }
  `
})
