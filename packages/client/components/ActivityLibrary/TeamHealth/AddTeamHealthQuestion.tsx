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

  const cancel = () => {
    setValue('')
    setIsAdding(false)
  }

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed) return cancel()
    if (submitting) return
    addQuestion({
      variables: {question: trimmed},
      onError,
      onCompleted: cancel
    })
  }

  if (!isAdding) {
    return (
      <Button
        variant='flat'
        className='flex items-center gap-1 px-2 py-1 font-semibold text-accent text-sm'
        onClick={() => (isEditing ? setIsAdding(true) : onEditHint())}
      >
        <Add className='size-4' />
        Add a custom question
      </Button>
    )
  }

  return (
    <form
      className='flex items-center gap-2'
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          if (!value.trim()) cancel()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') cancel()
        }}
        placeholder='Type a question and press Enter…'
        className='min-w-0 flex-1 rounded-sm border border-accent border-solid bg-surface-input px-2 py-1 text-fg-primary text-sm outline-none placeholder:text-fg-muted'
      />
      <Button type='submit' variant='secondary' size='sm' disabled={submitting}>
        Add
      </Button>
    </form>
  )
}

export default AddTeamHealthQuestion
