import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import {OrgAuthenticationMetadata_samlInfo$key} from '~/__generated__/OrgAuthenticationMetadata_samlInfo.graphql'
import UpdateSAMLMutation from '~/mutations/UpdateSAMLMutation'
import DialogTitle from '../../../../components/DialogTitle'
import BasicTextArea from '../../../../components/InputField/BasicTextArea'
import SecondaryButton from '../../../../components/SecondaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import {PALETTE} from '../../../../styles/paletteV3'
import {CompletedHandler} from '../../../../types/relayMutations'

const Section = styled('div')({
  padding: '24px 16px 8px 28px'
})

const InputSection = styled('div')({
  display: 'flex',
  padding: '0 16px 8px 16px'
})

const SubTitle = styled(DialogTitle)<{disabled: boolean}>(({disabled}) => ({
  color: disabled ? PALETTE.SLATE_600 : PALETTE.SLATE_700,
  fontSize: '16px',
  padding: 0
}))

const Label = styled('div')<{disabled: boolean}>(({disabled}) => ({
  color: disabled ? PALETTE.SLATE_600 : PALETTE.SLATE_700,
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center'
}))

const Container = styled('div')({
  marginBottom: '16px'
})

const ButtonSection = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '0px 16px 0px 16px',
  backgroundColor: PALETTE.WHITE
})

const ErrorLabel = styled('div')({
  color: PALETTE.TOMATO_500,
  fontSize: 14,
  paddingLeft: '16px'
})

interface Props {
  disabled: boolean
  orgId: string
  retry: () => void
  samlInfo: OrgAuthenticationMetadata_samlInfo$key | null
}

const OrgAuthenticationMetadata = (props: Props) => {
  const [metadata, setMetadata] = useState('')
  const {disabled, orgId, samlInfo: samlInfoRef, retry} = props
  const {error,onError, submitMutation, submitting, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()

  const samlInfo = useFragment(
    graphql`
      fragment OrgAuthenticationMetadata_samlInfo on  SAMLInfo {
        id
        domains
      }
    `,
    samlInfoRef
  )

  const isOSSDisabled = Boolean(disabled || !samlInfo?.domains?.length)

  const submitMetadata = (e: React.FocusEvent | React.FormEvent) => {
     e.preventDefault()
    if (submitting) return
    submitMutation()
    const handleCompleted: CompletedHandler = (response) => {
      const {error, success} = response.updateSAML
      if (success) {
        onCompleted()
        retry()
      }else {
        onError(
          new Error(
            `${error.message}`
          )
        )
      }
    }
    UpdateSAMLMutation(
      atmosphere,
      {
        metadata: metadata.length ? metadata : null,
        orgId
      },
      {onError, onCompleted: handleCompleted}
    )
  }

  return (
    <Container>
      <Section>
        <SubTitle disabled={isOSSDisabled}>Metadata</SubTitle>
        <Label disabled={disabled}>Paste metadata from your identity provider</Label>
      </Section>
      <form onSubmit={submitMetadata}>
        <InputSection>
          <BasicTextArea
            disabled={isOSSDisabled}
            name='metadata'
            placeholder='Paste your metadata here'
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
          />
        </InputSection>
        {error && <ErrorLabel>{error.message}</ErrorLabel>}
        <ButtonSection>
          <SecondaryButton waiting={submitting} disabled={isOSSDisabled} size='medium'>
            Update Metadata
          </SecondaryButton>
        </ButtonSection>
      </form>
    </Container>
  )
}

export default OrgAuthenticationMetadata
