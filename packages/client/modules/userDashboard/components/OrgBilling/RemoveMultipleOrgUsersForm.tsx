import styled from '@emotion/styled'
import {useState} from 'react'
import IconLabel from '../../../../components/IconLabel'
import Panel from '../../../../components/Panel/Panel'
import PrimaryButton from '../../../../components/PrimaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import useRouter from '../../../../hooks/useRouter'
import RemoveMultipleOrgUsersMutation from '../../../../mutations/RemoveMultipleOrgUsersMutation'
import {PALETTE} from '../../../../styles/paletteV3'

const StyledPanel = styled(Panel)({
  margin: '1rem 0'
})

const FormWrapper = styled('div')({
  padding: '1rem'
})

const StyledLabel = styled('label')({
  color: PALETTE.SLATE_700,
  display: 'block',
  fontSize: 14,
  fontWeight: 600,
  marginBottom: '.5rem'
})

const StyledInput = styled('input')({
  appearance: 'none',
  background: 'white',
  border: `1px solid ${PALETTE.SLATE_400}`,
  borderRadius: 4,
  color: PALETTE.SLATE_700,
  fontSize: 14,
  lineHeight: '24px',
  padding: '.5rem',
  width: '100%',
  ':focus': {
    borderColor: PALETTE.SKY_500,
    outline: 'none',
    boxShadow: `0 0 0 2px ${PALETTE.SKY_300}`
  }
})

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem 0 0',
  background: PALETTE.ROSE_500,
  ':hover': {
    background: PALETTE.ROSE_500
  },
  ':disabled': {
    background: PALETTE.SLATE_400,
    cursor: 'not-allowed'
  }
})

interface Props {
  orgId: string
}

const RemoveMultipleOrgUsersForm = (props: Props) => {
  const {orgId} = props
  const [userIds, setUserIds] = useState('')
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const {onError, onCompleted, submitting, submitMutation} = useMutationProps()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting || !userIds.trim()) return
    submitMutation()
    const userIdList = userIds.split(',').map((id) => id.trim())
    RemoveMultipleOrgUsersMutation(
      atmosphere,
      {
        orgId,
        userIds: userIdList
      },
      {
        history,
        onError,
        onCompleted: (...args) => {
          setUserIds('')
          onCompleted(...args)
        }
      }
    )
  }

  const isDisabled = submitting || !userIds.trim()

  return (
    <StyledPanel label='Remove Multiple Users'>
      <FormWrapper>
        <form onSubmit={handleSubmit}>
          <div>
            <StyledLabel htmlFor='userIds'>User IDs (comma separated)</StyledLabel>
            <StyledInput
              id='userIds'
              value={userIds}
              onChange={(e) => setUserIds(e.target.value)}
              placeholder='user1,user2,user3'
            />
          </div>
          <StyledButton
            size='medium'
            onClick={handleSubmit}
            waiting={submitting}
            disabled={isDisabled}
          >
            <IconLabel
              icon='person_remove'
              iconAfter
              label={submitting ? 'Removing Users...' : 'Remove Users'}
            />
          </StyledButton>
        </form>
      </FormWrapper>
    </StyledPanel>
  )
}

export default RemoveMultipleOrgUsersForm
