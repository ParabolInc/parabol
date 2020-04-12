import React, {useState} from 'react'
import LinkButton from '../../../../components/LinkButton'
import IconLabel from '../../../../components/IconLabel'
import ArchiveOrganizationForm from './ArchiveOrganizationForm'
import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV2'
import {ArchiveOrganization_organization} from 'parabol-client/src/__generated__/ArchiveOrganization_organization.graphql'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'

interface Props {
  organization: ArchiveOrganization_organization
}

const Hint = styled('div')({
  color: PALETTE.TEXT_GRAY,
  fontSize: 13,
  marginTop: 8
})

const ArchiveOrganization = (props: Props) => {
  const {organization} = props
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
            <b>Note</b>: {'This can’t be undone.'}
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
