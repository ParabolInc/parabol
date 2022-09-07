import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import {ArchiveOrganization_organization} from '~/__generated__/ArchiveOrganization_organization.graphql'
import IconLabel from '../../../../components/IconLabel'
import LinkButton from '../../../../components/LinkButton'
import {PALETTE} from '../../../../styles/paletteV3'
import ArchiveOrganizationForm from './ArchiveOrganizationForm'

interface Props {
  organization: ArchiveOrganization_organization
}

const Hint = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 13,
  marginTop: 8
})

const ArchiveOrganization = (props: Props) => {
  const {organization} = props

  //FIXME i18n: Click to permanently delete this organization.
  //FIXME i18n: Delete organization
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
            aria-label='Click to permanently delete this organization.'
            palette='red'
            onClick={handleClick}
          >
            <IconLabel icon='remove_circle' label='Delete organization' />
          </LinkButton>
          <Hint>
            <b>{t('ArchiveOrganization.Note')}</b>
            {t('ArchiveOrganization.')}
            {t('ArchiveOrganization.ThisCanTBeUndone')}
          </Hint>
        </div>
      ) : (
        <ArchiveOrganizationForm handleFormBlur={handleFormBlur} organization={organization} />
      )}
    </div>
  )
}

export default createFragmentContainer(ArchiveOrganization, {
  organization: graphql`
    fragment ArchiveOrganization_organization on Organization {
      ...ArchiveOrganizationForm_organization
    }
  `
})
