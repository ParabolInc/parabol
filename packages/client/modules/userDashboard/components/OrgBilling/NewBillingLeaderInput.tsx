import styled from '@emotion/styled'
import {ExpandMore, Person, PersonPin, PersonPinCircle} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {ChangeEvent, FormEvent, useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import useMutationProps from '~/hooks/useMutationProps'
import {PALETTE} from '~/styles/paletteV3'
import {NewBillingLeaderInput_organization$key} from '~/__generated__/NewBillingLeaderInput_organization.graphql'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import StyledError from '../../../../components/StyledError'
import Legitity from '../../../../validation/Legitity'
import useForm from '../../../../hooks/useForm'
import {PortalStatus} from '../../../../hooks/usePortal'
import NewBillingLeaderMenu from './NewBillingLeaderMenu'

const StyledButton = styled(PlainButton)({
  alignItems: 'center',
  backgroundColor: 'transparent',
  display: 'flex',
  height: '20px',
  justifyContent: 'flex-start',
  margin: 0,
  opacity: 1,
  width: 'fit-content',
  ':hover, :focus': {
    backgroundColor: 'transparent'
  }
})

const StyledLink = styled('a')({
  color: PALETTE.SKY_500,
  display: 'block',
  fontSize: 12,
  lineHeight: '20px',
  textDecoration: 'none',
  '&:hover,:focus': {
    textDecoration: 'underline'
  }
})

const StyledIcon = styled(Person)({
  color: PALETTE.SKY_500,
  width: 48,
  height: 48
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
  paddingLeft: 16,
  paddingTop: 8,
  paddingBottom: 8,
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
  const {fields, onChange, validateField, setDirtyField} = useForm({
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
    // if (portalStatus !== PortalStatus.Exited || !selectedFullPath) return
    const {newLeader: newLeaderRes} = validateField()
    const {value: newLeaderTitle, error} = newLeaderRes
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

  // if (!isEditing) return null
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
          // gitlabProjects={gitlabProjects}
          // handleSelectFullPath={setSelectedFullPath}
          menuProps={menuProps}
          organizationRef={organization}
          newLeaderSearchQuery={newLeaderSearchQuery}
        />
      )}
    </>
  )
}

export default NewBillingLeaderInput
