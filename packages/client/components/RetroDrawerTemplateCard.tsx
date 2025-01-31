import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {RetroDrawerTemplateCard_template$key} from '~/__generated__/RetroDrawerTemplateCard_template.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UpdateMeetingTemplateMutation from '../mutations/UpdateMeetingTemplateMutation'
import {CATEGORY_THEMES, CategoryID} from '././ActivityLibrary/Categories'
import {ActivityCard, ActivityCardImage} from './ActivityLibrary/ActivityCard'
import {ActivityLibraryCardDescription} from './ActivityLibrary/ActivityLibraryCardDescription'

interface Props {
  templateRef: RetroDrawerTemplateCard_template$key
  meetingId: string
  handleCloseDrawer: () => void
}

const RetroDrawerTemplateCard = (props: Props) => {
  const {templateRef, meetingId, handleCloseDrawer} = props
  const {onError, onCompleted} = useMutationProps()
  const atmosphere = useAtmosphere()
  const template = useFragment(
    graphql`
      fragment RetroDrawerTemplateCard_template on MeetingTemplate {
        ...ActivityLibraryCardDescription_template
        id
        name
        category
        illustrationUrl
      }
    `,
    templateRef
  )

  const handleClick = () => {
    UpdateMeetingTemplateMutation(
      atmosphere,
      {
        meetingId: meetingId,
        templateId: template.id
      },
      {onError, onCompleted}
    )
    handleCloseDrawer()
  }

  return (
    <form className='px-4 py-2' onClick={handleClick}>
      <div className='flex hover:rounded-2xl hover:bg-slate-100 focus:rounded-2xl focus:outline-sky-500'>
        <ActivityCard
          className='group aspect-256/160 flex-1 hover:cursor-pointer'
          theme={CATEGORY_THEMES[template.category as CategoryID]}
          title={template.name}
          type='retrospective'
        >
          <ActivityCardImage
            className='group-hover/card:hidden'
            src={template.illustrationUrl}
            category='retrospective'
          />
          <ActivityLibraryCardDescription
            className='hidden group-hover/card:flex'
            templateRef={template}
          />
        </ActivityCard>
      </div>
    </form>
  )
}
export default RetroDrawerTemplateCard
