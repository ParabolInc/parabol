import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {TeamHealthTemplateQuestionEditor_template$key} from '../../../__generated__/TeamHealthTemplateQuestionEditor_template.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import AddTeamHealthQuestion from './AddTeamHealthQuestion'
import {getOrderedTeamHealthCategories} from './getTeamHealthCategoryColor'
import TeamHealthMeetingPreview from './TeamHealthMeetingPreview'
import TeamHealthQuestionPackSection from './TeamHealthQuestionPackSection'
import TeamHealthSurveyFlowAnimation from './TeamHealthSurveyFlowAnimation'
import useChangedFirstMeetingQuestionIds from './useChangedFirstMeetingQuestionIds'
import useTeamHealthMeetingPreviews from './useTeamHealthMeetingPreviews'

interface Props {
  templateRef: TeamHealthTemplateQuestionEditor_template$key
  isEditing: boolean
  // absent when the viewer can't edit this template
  onEdit?: () => void
}

const TeamHealthTemplateQuestionEditor = (props: Props) => {
  const {templateRef, isEditing, onEdit} = props
  const template = useFragment(
    graphql`
      fragment TeamHealthTemplateQuestionEditor_template on TeamHealthTemplate {
        id
        questions {
          id
          category {
            id
          }
        }
        availableQuestionPacks {
          id
          userId
          questions {
            id
            category {
              id
              name
              createdAt
            }
          }
          ...TeamHealthQuestionPackSection_pack
        }
        ...TeamHealthMeetingPreview_template
      }
    `,
    templateRef
  )
  const {id: templateId, questions, availableQuestionPacks} = template
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere

  const meetingPreviews = useTeamHealthMeetingPreviews(questions)
  const changedQuestionIds = useChangedFirstMeetingQuestionIds(isEditing, meetingPreviews[0] ?? [])

  const selectedIds = new Set(questions.map((q) => q.id))

  // the category menu offers every category already in use across the packs (built-in + this org's),
  // ordered so round-robin color assignment is stable and matches every other place categories render
  const categories = getOrderedTeamHealthCategories(availableQuestionPacks)

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
  const addQuestion = <AddTeamHealthQuestion templateId={templateId} />

  // the list grows freely; from lg up ActivityDetails gives this pane its own scroll
  return (
    <div className='pt-4'>
      <TeamHealthSurveyFlowAnimation className='mx-auto mb-4' />
      {isEditing ? (
        // from xl the illustration card sits to the left with nothing beneath it; pull the bank out
        // under it, flush with its left edge, so questions get the full row before they wrap
        <div className='xl:-ml-96'>
          <h2 className='mb-2 font-semibold text-fg-primary text-sm'>Question Bank</h2>
          {!myPackId && (
            <div className='border-hairline border-b pb-2'>
              <div className='py-2 font-semibold text-fg-primary text-sm'>My Questions</div>
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
              defaultOpen={pack.userId !== 'aGhostUser'}
              title={pack.id === myPackId ? 'My Questions' : undefined}
              footer={pack.id === myPackId ? addQuestion : undefined}
            />
          ))}
        </div>
      ) : (
        <TeamHealthMeetingPreview
          templateRef={template}
          orderedCategoryIds={categories.map((category) => category.id)}
          meetingPreviews={meetingPreviews}
          changedQuestionIds={changedQuestionIds}
          onEdit={onEdit}
        />
      )}
    </div>
  )
}

export default TeamHealthTemplateQuestionEditor
