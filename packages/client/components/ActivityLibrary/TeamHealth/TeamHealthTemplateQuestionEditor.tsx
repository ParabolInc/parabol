import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthTemplateQuestionEditor_template$key} from '../../../__generated__/TeamHealthTemplateQuestionEditor_template.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import AddTeamHealthQuestion from './AddTeamHealthQuestion'
import TeamHealthQuestionPackSection from './TeamHealthQuestionPackSection'

interface Props {
  templateRef: TeamHealthTemplateQuestionEditor_template$key
  isEditing: boolean
  onEditHint: () => void
}

const TeamHealthTemplateQuestionEditor = (props: Props) => {
  const {templateRef, isEditing, onEditHint} = props
  const template = useFragment(
    graphql`
      fragment TeamHealthTemplateQuestionEditor_template on TeamHealthTemplate {
        id
        questions {
          id
        }
        availableQuestionPacks {
          id
          userId
          questions {
            category {
              id
              name
              createdAt
            }
          }
          ...TeamHealthQuestionPackSection_pack
        }
      }
    `,
    templateRef
  )
  const {id: templateId, questions, availableQuestionPacks} = template
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const selectedIds = new Set(questions.map((q) => q.id))

  // the category menu offers every category already in use across the packs (built-in + this org's)
  const categoryMap = new Map<string, {id: string; name: string; createdAt: string}>()
  availableQuestionPacks.forEach((pack) =>
    pack.questions.forEach((q) => {
      if (q.category) categoryMap.set(q.category.id, q.category)
    })
  )
  // sort by createdAt, then name, so round-robin color assignment is stable and deterministic
  const categories = Array.from(categoryMap.values()).sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt) || a.name.localeCompare(b.name)
  )

  // the viewer's own pack sorts above the built-in aGhostUser packs; sort is stable, so server order
  // (created-at within each group) is preserved
  const sortedPacks = [...availableQuestionPacks].sort((a, b) => {
    const aGhost = a.userId === 'aGhostUser'
    const bGhost = b.userId === 'aGhostUser'
    return aGhost === bGhost ? 0 : aGhost ? 1 : -1
  })

  // the "Add a custom question" control lives at the bottom of the viewer's own pack; when that pack
  // doesn't exist yet (no custom questions), it gets its own section so the first one can be added
  const myPackId = sortedPacks.find((pack) => pack.userId === viewerId)?.id
  const addQuestion = (
    <AddTeamHealthQuestion templateId={templateId} isEditing={isEditing} onEditHint={onEditHint} />
  )

  return (
    <div className='pt-4'>
      {/* bound the list to the viewport so expanding a pack scrolls internally instead of growing the page */}
      <div className='max-h-[calc(100vh-320px)] overflow-y-auto'>
        {!myPackId && isEditing && (
          <div className='border-slate-200 border-b pb-2'>
            <div className='py-2 font-semibold text-slate-700 text-sm'>My Questions</div>
            <div className='px-1'>{addQuestion}</div>
          </div>
        )}
        {sortedPacks.map((pack) => (
          <TeamHealthQuestionPackSection
            key={pack.id}
            packRef={pack}
            templateId={templateId}
            viewerId={viewerId}
            selectedIds={selectedIds}
            categories={categories}
            isEditing={isEditing}
            onEditHint={onEditHint}
            defaultOpen={pack.userId !== 'aGhostUser'}
            title={pack.id === myPackId ? 'My Questions' : undefined}
            footer={pack.id === myPackId && isEditing ? addQuestion : undefined}
          />
        ))}
      </div>
    </div>
  )
}

export default TeamHealthTemplateQuestionEditor
