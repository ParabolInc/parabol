import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {TeamPromptResponseEmojis_response$key} from '~/__generated__/TeamPromptResponseEmojis_response.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import useMutationProps from '../../hooks/useMutationProps'
import AddReactjiToReactableMutation from '../../mutations/AddReactjiToReactableMutation'
import ReactjiId from '../../shared/gqlIds/ReactjiId'
import ReactjiSection from '../ReflectionCard/ReactjiSection'

interface Props {
  meetingId: string
  responseRef: TeamPromptResponseEmojis_response$key
}

export const TeamPromptResponseEmojis = (props: Props) => {
  const {responseRef, meetingId} = props

  const response = useFragment(
    graphql`
      fragment TeamPromptResponseEmojis_response on TeamPromptResponse {
        id
        reactjis {
          id
          count
          isViewerReactji
          ...ReactjiSection_reactjis
        }
      }
    `,
    responseRef
  )
  const {reactjis} = response
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitMutation, submitting} = useMutationProps()

  const onToggleReactji = (emojiId: string) => {
    if (submitting) return
    const isRemove = !!reactjis.find((reactji) => {
      return reactji.isViewerReactji && ReactjiId.split(reactji.id).name === emojiId
    })
    submitMutation()
    AddReactjiToReactableMutation(
      atmosphere,
      {
        reactableId: response?.id,
        reactableType: 'RESPONSE',
        isRemove,
        reactji: emojiId,
        meetingId
      },
      {onCompleted, onError}
    )
  }

  return <ReactjiSection className='pt-2 pr-2' reactjis={reactjis} onToggle={onToggleReactji} />
}
