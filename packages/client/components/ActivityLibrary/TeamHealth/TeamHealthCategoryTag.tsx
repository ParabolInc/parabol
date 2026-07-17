import {useState} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useUpsertTeamHealthQuestionCategoryMutation from '../../../mutations/useUpsertTeamHealthQuestionCategoryMutation'
import {cn} from '../../../ui/cn'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../ui/Menu/MenuItem'
import {getTeamHealthCategoryColor} from './getTeamHealthCategoryColor'

interface Props {
  questionId: string
  category: {id: string; name: string}
  canEdit: boolean
  categories: ReadonlyArray<{id: string; name: string}>
}

const TeamHealthCategoryTag = (props: Props) => {
  const {questionId, category, canEdit, categories} = props
  const atmosphere = useAtmosphere()
  const [upsertCategory] = useUpsertTeamHealthQuestionCategoryMutation()
  const [open, setOpen] = useState(false)
  const [newCategory, setNewCategory] = useState('')

  const orderedCategoryIds = categories.map((c) => c.id)
  const colorClass = getTeamHealthCategoryColor(category.id, orderedCategoryIds)
  const tag = (
    <span
      className={cn('whitespace-nowrap rounded-full px-2 py-0.5 font-semibold text-xs', colorClass)}
    >
      {category.name}
    </span>
  )

  if (!canEdit) return tag

  const onError = (err: Error) => {
    atmosphere.eventEmitter.emit('addSnackbar', {
      message: err.message,
      autoDismiss: 5,
      key: 'teamHealthCategoryError'
    })
  }

  const pickCategory = (name: string) => {
    setOpen(false)
    if (name === category.name) return
    upsertCategory({variables: {questionId, category: name}, onError})
  }

  const submitNew = () => {
    const trimmed = newCategory.trim()
    if (!trimmed) return
    setNewCategory('')
    pickCategory(trimmed)
  }

  return (
    <Menu
      open={open}
      onOpenChange={setOpen}
      trigger={
        <button type='button' className='cursor-pointer'>
          {tag}
        </button>
      }
    >
      <MenuContent align='end'>
        {categories.map((c) => (
          <MenuItem key={c.id} onClick={() => pickCategory(c.name)}>
            <span
              className={cn(
                'mr-2 rounded-full px-2 py-0.5 font-semibold text-xs',
                getTeamHealthCategoryColor(c.id, orderedCategoryIds)
              )}
            >
              {c.name}
            </span>
          </MenuItem>
        ))}
        <div className='mx-1 mt-1 border-slate-200 border-t px-3 pt-2 pb-1'>
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') submitNew()
            }}
            placeholder='Add a category…'
            className='w-full rounded-xs border border-slate-300 border-solid px-2 py-1 text-slate-700 text-xs outline-none focus:border-sky-500'
          />
        </div>
      </MenuContent>
    </Menu>
  )
}

export default TeamHealthCategoryTag
