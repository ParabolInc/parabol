import styled from '@emotion/styled'
import {Person} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useEffect, useRef} from 'react'
import {useFragment} from 'react-relay'
import {NewBillingLeaderInput_organization$key} from '~/__generated__/NewBillingLeaderInput_organization.graphql'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import {PALETTE} from '~/styles/paletteV3'
import StyledError from '../../../../components/StyledError'
import useForm from '../../../../hooks/useForm'
import {PortalStatus} from '../../../../hooks/usePortal'
import {ElementWidth} from '../../../../types/constEnums'
import NewBillingLeaderMenu from './NewBillingLeaderMenu'

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
  paddingRight: 8,
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
      <Item>
        <StyledIcon />
        <Wrapper>
          <Form onSubmit={handleCreateNewLeader}>
            <NewLeaderInput
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
          newLeaderSearchQuery={newLeaderValue}
        />
      )}
    </>
  )
}

export default NewBillingLeaderInput
