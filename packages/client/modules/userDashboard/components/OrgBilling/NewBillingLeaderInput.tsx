import styled from '@emotion/styled'
import {ExpandMore, Person, PersonPin, PersonPinCircle} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {FormEvent, useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import useMutationProps from '~/hooks/useMutationProps'
import {PALETTE} from '~/styles/paletteV3'
import getNonNullEdges from '~/utils/getNonNullEdges'
import {NewBillingLeaderInput_organization$key} from '~/__generated__/NewBillingLeaderInput_organization.graphql'
// import useForm from '../hooks/useForm'
// import {PortalStatus} from '../hooks/usePortal'
// import CreateTaskMutation from '../mutations/CreateTaskMutation'
// import UpdatePokerScopeMutation from '../mutations/UpdatePokerScopeMutation'
// import {CompletedHandler} from '../types/relayMutations'
// import convertToTaskContent from '../utils/draftjs/convertToTaskContent'
// // import Legitity from '../validation/Legitity'
// import {CreateTaskMutation as TCreateTaskMutation} from '../__generated__/CreateTaskMutation.graphql'
// // import Checkbox from './Checkbox'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import StyledError from '../../../../components/StyledError'
import Legitity from '../../../../validation/Legitity'
import useForm from '../../../../hooks/useForm'
import {PortalStatus} from '../../../../hooks/usePortal'
import Checkbox from '../../../../components/Checkbox'
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

// const StyledIcon = styled(ExpandMore)({
//   color: PALETTE.SKY_500,
//   height: 20,
//   width: 20,
//   padding: 0,
//   alignContent: 'center'
// })

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
  console.log('🚀 ~ organization....:', organization)

  const {fields, onChange, validateField, setDirtyField} = useForm({
    newLeader: {
      getDefault: () => '',
      validate: validateIssue
    }
  })
  const {originRef, menuPortal, menuProps, togglePortal, portalStatus} = useMenu(
    MenuPosition.UPPER_LEFT,
    {isDropdown: true}
  )
  // const ref = useRef<HTMLInputElement>(null)
  const {dirty, error} = fields.newLeader
  useEffect(() => {
    if (portalStatus === PortalStatus.Exited) {
      originRef.current?.focus()
    }
  }, [portalStatus])

  const handleFocus = () => {
    togglePortal()
  }

  const handleCreateNewLeader = (e: FormEvent) => {
    e.preventDefault()
    // if (portalStatus !== PortalStatus.Exited || !selectedFullPath) return
    const {newLeader: newLeaderRes} = validateField()
    const {value: newLeaderTitle, error} = newLeaderRes
    if (!newLeaderTitle.length) {
      removeInput()
    }
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
              onBlur={handleCreateNewLeader}
              onFocus={handleFocus}
              onChange={onChange}
              maxLength={255}
              name='newIssue'
              placeholder='New issue title'
              // ref={ref}
              ref={originRef}
              type='text'
            />
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
        />
      )}
    </>
  )
}

export default NewBillingLeaderInput
