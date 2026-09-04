import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import type {NewBillingLeaderInput_organization$key} from '~/__generated__/NewBillingLeaderInput_organization.graphql'
import {Person} from '~/ui/icons'
import {Menu} from '~/ui/Menu/Menu'
import StyledError from '../../../../components/StyledError'
import useForm from '../../../../hooks/useForm'
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

  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    // radix moves focus to the menu on open & back to the trigger on close; the input keeps it
    const id = requestAnimationFrame(() => ref.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [isOpen])

  const handleCreateNewLeader = () => {
    if (!newLeaderValue.length) {
      removeInput()
    }
  }

  return (
    <div className='flex w-full cursor-pointer items-center bg-surface-well'>
      <Person className='h-11 w-11 text-accent' />
      <div className='flex w-full flex-col pl-4'>
        <form onSubmit={handleCreateNewLeader} className='flex w-full flex-col'>
          <input
            autoFocus
            autoComplete={'off'}
            onBlur={handleCreateNewLeader}
            onFocus={() => setIsOpen(true)}
            onChange={onChange}
            maxLength={255}
            name='newLeader'
            placeholder='Search for a new billing leader'
            ref={ref}
            type='text'
            className='m-0 w-full appearance-none border-none bg-transparent pr-2 text-[16px] text-fg-primary outline-none'
          />
          {/* the menu anchors to this strip so it lines up under the input */}
          <Menu
            open={isOpen}
            onOpenChange={setIsOpen}
            trigger={<button type='button' tabIndex={-1} className='w-[400px]' />}
          >
            <NewBillingLeaderMenu
              organizationRef={organization}
              newLeaderSearchQuery={newLeaderValue}
            />
          </Menu>
          {dirty && error && (
            <StyledError className='w-full text-left text-[13px]'>{error}</StyledError>
          )}
        </form>
      </div>
    </div>
  )
}

export default NewBillingLeaderInput
