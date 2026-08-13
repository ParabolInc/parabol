import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {ArchiveOrganization_organization$key} from '~/__generated__/ArchiveOrganization_organization.graphql'
import {Button} from '~/ui/Button/Button'
import IconLabel from '../../../../components/IconLabel'
import ArchiveOrganizationForm from './ArchiveOrganizationForm'

interface Props {
  organization: ArchiveOrganization_organization$key
}

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
          <Button
            size='default'
            aria-label='Click to permanently delete this organization.'
            className='bg-transparent p-0 text-[14px] text-tomato-600 leading-5 shadow-none hover:text-tomato-800 focus:text-tomato-800 active:text-tomato-800'
            onClick={handleClick}
          >
            <IconLabel icon='remove_circle' label='Delete organization' />
          </Button>
          <div className='mt-2 text-[13px] text-fg-secondary'>
            <b>Note</b>: {'This can’t be undone.'}
          </div>
        </div>
      ) : (
        <ArchiveOrganizationForm handleFormBlur={handleFormBlur} organization={organization} />
      )}
    </div>
  )
}

export default ArchiveOrganization
