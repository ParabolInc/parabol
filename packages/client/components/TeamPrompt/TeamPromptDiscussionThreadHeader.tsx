import styled from '@emotion/styled'
import type {JSONContent} from '@tiptap/react'
import type {ReactjiSection_reactjis$key} from '~/__generated__/ReactjiSection_reactjis.graphql'
import Avatar from '../Avatar/Avatar'
import ReactjiSection from '../ReflectionCard/ReactjiSection'
import PromptResponseEditor from './PromptResponseEditor'
import TeamPromptLastUpdatedTime from './TeamPromptLastUpdatedTime'

const Wrapper = styled('div')({
  padding: '16px 12px 20px 12px'
})

const StyledReactjis = styled(ReactjiSection)({
  paddingTop: '16px'
})

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
    <Wrapper>
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
      <PromptResponseEditor content={contentJSON} readOnly={true} teamId='' />
      <StyledReactjis
        key={stageId}
        reactjis={response?.reactjis ?? []}
        onToggle={onToggleReactji}
      />
    </Wrapper>
  )
}

export default TeamPromptDiscussionThreadHeader
