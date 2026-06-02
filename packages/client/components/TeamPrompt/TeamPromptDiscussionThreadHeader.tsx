import type {JSONContent} from '@tiptap/react'
import type {ReactjiSection_reactjis$key} from '~/__generated__/ReactjiSection_reactjis.graphql'
import Avatar from '../Avatar/Avatar'
import ReactjiSection from '../ReflectionCard/ReactjiSection'
import PromptResponseEditor from './PromptResponseEditor'
import TeamPromptLastUpdatedTime from './TeamPromptLastUpdatedTime'

interface Props {
  teamMember: {user: {picture: string; preferredName: string}} | null | undefined
  response:
    | {
        updatedAt: string
        createdAt: string
        reactjis: ReactjiSection_reactjis$key
      }
    | null
    | undefined
  contentJSON: JSONContent | null
  stageId: string | undefined
  onToggleReactji: (emojiId: string) => void
}

const TeamPromptDiscussionThreadHeader = ({
  teamMember,
  response,
  contentJSON,
  stageId,
  onToggleReactji
}: Props) => {
  return (
    <div className='self-start px-3 pt-4 pb-5'>
      {teamMember && (
        <div className='flex items-center px-0 pb-3'>
          <Avatar picture={teamMember.user.picture} className='h-12 w-12' />
          <h3 className='m-0 px-2'>
            {teamMember.user.preferredName}
            {response && (
              <TeamPromptLastUpdatedTime
                updatedAt={response.updatedAt}
                createdAt={response.createdAt}
              />
            )}
          </h3>
        </div>
      )}
      {contentJSON && (
        <>
          <PromptResponseEditor content={contentJSON} readOnly={true} teamId='' />
          <ReactjiSection
            className='pt-4'
            key={stageId}
            reactjis={response?.reactjis ?? []}
            onToggle={onToggleReactji}
          />
        </>
      )}
    </div>
  )
}

export default TeamPromptDiscussionThreadHeader
