import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import {ArchiveOrganization_organization$key} from '~/__generated__/ArchiveOrganization_organization.graphql'
import IconLabel from '../../../../components/IconLabel'
import LinkButton from '../../../../components/LinkButton'
import {PALETTE} from '../../../../styles/paletteV3'
import ArchiveOrganizationForm from './ArchiveOrganizationForm'

interface Props {
  organization: ArchiveOrganization_organization$key
}

const Hint = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 13,
  marginTop: 8
})

const ArchiveOrganization = (props: Props) => {
  const {organization: organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment ArchiveOrganization_organization on Organization {
        ...ArchiveOrganizationForm_organization
      }
    `,
    organizationRef
  )
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

export default ArchiveOrganization
