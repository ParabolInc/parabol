import styled from '@emotion/styled'
import {Person} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {ChangeEvent, FormEvent, useEffect, useRef} from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import {PALETTE} from '~/styles/paletteV3'
import {NewBillingLeaderInput_organization$key} from '~/__generated__/NewBillingLeaderInput_organization.graphql'
import StyledError from '../../../../components/StyledError'
import Legitity from '../../../../validation/Legitity'
import useForm from '../../../../hooks/useForm'
import {PortalStatus} from '../../../../hooks/usePortal'
import NewBillingLeaderMenu from './NewBillingLeaderMenu'
import {ElementWidth} from '../../../../types/constEnums'

const StyledIcon = styled(Person)({
  color: PALETTE.SKY_500,
  width: ElementWidth.BILLING_AVATAR,
  height: ElementWidth.BILLING_AVATAR
})

const Form = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%'
})

const Item = styled('div')({
  backgroundColor: PALETTE.SLATE_200,
  cursor: 'pointer',
  display: 'flex',
  // paddingLeft: 16,
  // paddingTop: 8,
  // paddingBottom: 8,
  alignItems: 'center',
  width: '100%'
})

const Wrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: 16,
  width: '100%'
})

const DropdownWrapper = styled('button')({
  width: 400
})

const NewLeaderInput = styled('input')({
  appearance: 'none',
  background: 'transparent',
  border: 'none',
  color: PALETTE.SLATE_700,
  fontSize: 16,
  margin: 0,
  padding: '0px 8px 0px 0px',
  outline: 0,
  width: '100%'
})

const Error = styled(StyledError)({
  fontSize: 13,
  textAlign: 'left',
  width: '100%'
})

interface Props {
  organizationRef: NewBillingLeaderInput_organization$key
  removeInput: () => void
}

const validateIssue = (issue: string) => {
  return new Legitity(issue).trim().min(2, `C’mon, you call that an issue?`)
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
  const {fields, onChange, validateField} = useForm({
    newLeader: {
      getDefault: () => '',
      validate: validateIssue
    }
  })
  const {dirty, error, value: newLeaderSearchQuery} = fields.newLeader
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

  const handleCreateNewLeader = (e: FormEvent) => {
    e.preventDefault()
    const {newLeader: newLeaderRes} = validateField()
    const {value: newLeaderTitle} = newLeaderRes
    if (!newLeaderTitle.length) {
      removeInput()
    }
  }

  const handleFocus = () => {
    togglePortal()
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e)
  }

  return (
    <>
      <Item>
        <StyledIcon />
        <Wrapper>
          <Form onSubmit={handleCreateNewLeader}>
            <NewLeaderInput
              autoFocus
              autoComplete={'off'}
              onBlur={handleCreateNewLeader}
              onFocus={handleFocus}
              onChange={handleChange}
              maxLength={255}
              name='newLeader'
              placeholder='Search for a new billing leader'
              ref={ref}
              type='text'
            />
            <DropdownWrapper ref={originRef} />
            {dirty && error && <Error>{error}</Error>}
          </Form>
        </Wrapper>
      </Item>
      {menuPortal(
        <NewBillingLeaderMenu
          menuProps={menuProps}
          organizationRef={organization}
          newLeaderSearchQuery={newLeaderSearchQuery}
        />
      )}
    </>
  )
}

export default NewBillingLeaderInput
