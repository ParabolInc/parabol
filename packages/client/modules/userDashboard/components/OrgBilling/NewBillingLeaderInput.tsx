import {Person} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef} from 'react'
import {useFragment} from 'react-relay'
import type {NewBillingLeaderInput_organization$key} from '~/__generated__/NewBillingLeaderInput_organization.graphql'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import StyledError from '../../../../components/StyledError'
import useForm from '../../../../hooks/useForm'
import {PortalStatus} from '../../../../hooks/usePortal'
import NewBillingLeaderMenu from './NewBillingLeaderMenu'

interface Props {
  organizationRef: NewBillingLeaderInput_organization$key
  removeInput: () => void
}

const NewBillingLeaderInput = (props: Props) => {
  const {removeInput, organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment NewBillingLeaderInput_organization on Organization {
        ...NewBillingLeaderMenu_organization
      }
    `,
    organizationRef
  )
  const {fields, onChange} = useForm({
    newLeader: {
      getDefault: () => ''
    }
  })
  const {dirty, error, value: newLeaderValue} = fields.newLeader
  const ref = useRef<HTMLInputElement>(null)

  const {originRef, menuPortal, menuProps, togglePortal, portalStatus} = useMenu(
    MenuPosition.UPPER_CENTER,
    {isDropdown: true}
  )
  useEffect(() => {
    if (portalStatus === PortalStatus.Exited) {
      ref.current?.focus()
    }
  }, [portalStatus])

  const handleCreateNewLeader = () => {
    if (!newLeaderValue.length) {
      removeInput()
    }
  }

  const handleFocus = () => {
    togglePortal()
  }

  return (
    <>
      <div className='flex w-full cursor-pointer items-center bg-surface-well'>
        <Person className='h-11 w-11 text-accent' />
        <div className='flex w-full flex-col pl-4'>
          <form onSubmit={handleCreateNewLeader} className='flex w-full flex-col'>
            <input
              autoFocus
              autoComplete={'off'}
              onBlur={handleCreateNewLeader}
              onFocus={handleFocus}
              onChange={onChange}
              maxLength={255}
              name='newLeader'
              placeholder='Search for a new billing leader'
              ref={ref}
              type='text'
              className='m-0 w-full appearance-none border-none bg-transparent pr-2 text-[16px] text-fg-primary outline-none'
            />
            <button ref={originRef} className='w-[400px]' />
            {dirty && error && (
              <StyledError className='w-full text-left text-[13px]'>{error}</StyledError>
            )}
          </form>
        </div>
      </div>
      {menuPortal(
        <NewBillingLeaderMenu
          menuProps={menuProps}
          organizationRef={organization}
          newLeaderSearchQuery={newLeaderValue}
        />
      )}
    </>
  )
}

export default NewBillingLeaderInput
