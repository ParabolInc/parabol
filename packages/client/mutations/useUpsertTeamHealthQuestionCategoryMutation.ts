import graphql from 'babel-plugin-relay/macro'
import {type UseMutationConfig, useMutation} from 'react-relay'
import type {useUpsertTeamHealthQuestionCategoryMutation as TUpsertTeamHealthQuestionCategoryMutation} from '../__generated__/useUpsertTeamHealthQuestionCategoryMutation.graphql'

const mutation = graphql`
  mutation useUpsertTeamHealthQuestionCategoryMutation($questionId: ID!, $category: String!) {
    upsertTeamHealthQuestionCategory(questionId: $questionId, category: $category) {
      question {
        id
        category {
          id
          name
          createdAt
        }
      }
    }
  }
`

const useUpsertTeamHealthQuestionCategoryMutation = () => {
  const [commit, submitting] = useMutation<TUpsertTeamHealthQuestionCategoryMutation>(mutation)
  const execute = (config: UseMutationConfig<TUpsertTeamHealthQuestionCategoryMutation>) => {
    // the returned question.category is normalized by id, so Relay updates the tag automatically
    return commit({...config})
  }
  return [execute, submitting] as const
}

export default useUpsertTeamHealthQuestionCategoryMutation
