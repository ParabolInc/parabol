import {useState} from 'react'
import {Add} from '~/ui/icons'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useAddTeamHealthQuestionMutation from '../../../mutations/useAddTeamHealthQuestionMutation'
import {Button} from '../../../ui/Button/Button'

interface Props {
  templateId: string
  isEditing: boolean
  onEditHint: () => void
}

const AddTeamHealthQuestion = (props: Props) => {
  const {templateId, isEditing, onEditHint} = props
  const atmosphere = useAtmosphere()
  const [addQuestion, submitting] = useAddTeamHealthQuestionMutation(templateId)
  const [isAdding, setIsAdding] = useState(false)
  const [value, setValue] = useState('')

  const onError = (err: Error) => {
    atmosphere.eventEmitter.emit('addSnackbar', {
      message: err.message,
      autoDismiss: 5,
      key: 'addTeamHealthQuestionError'
    })
  }

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || submitting) {
      if (!trimmed) setIsAdding(false)
      return
    }
    addQuestion({
      variables: {question: trimmed},
      onError,
      onCompleted: () => {
        setValue('')
        setIsAdding(false)
      }
    })
  }

  if (!isAdding) {
    return (
      <Button
        variant='flat'
        className='flex items-center gap-1 px-2 py-1 font-semibold text-sky-500 text-sm hover:text-sky-600 focus:text-sky-600 active:text-sky-600'
        onClick={() => (isEditing ? setIsAdding(true) : onEditHint())}
      >
        <Add className='size-4' />
        Add a custom question
      </Button>
    )
  }

  return (
    <input
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={submit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') submit()
        else if (e.key === 'Escape') {
          setValue('')
          setIsAdding(false)
        }
      }}
      placeholder='Type a question and press Enter…'
      className='w-full rounded-sm border border-accent border-solid bg-surface-input px-2 py-1 text-fg-primary text-sm outline-none placeholder:text-fg-muted'
    />
  )
}

export default AddTeamHealthQuestion
