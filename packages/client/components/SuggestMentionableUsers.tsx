import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import stringScore from 'string-score'
import {BBox} from '../types/animations'
import {SuggestMentionableUsersQuery} from '../__generated__/SuggestMentionableUsersQuery.graphql'
import EditorSuggestions from './EditorSuggestions/EditorSuggestions'
import {MentionSuggestion} from './TaskEditor/useSuggestions'

const makeSuggestions = (triggerWord, teamMembers) => {
  if (!triggerWord) {
    return teamMembers.slice(0, 6)
  }
  return (
    teamMembers
      .map((teamMember) => {
        const score = stringScore(teamMember.preferredName, triggerWord)
        return {
          ...teamMember,
          score
        }
      })
      .sort((a, b) => (a.score < b.score ? 1 : -1))
      .slice(0, 6)
      // If you type "Foo" and the options are "Foo" and "Giraffe", remove "Giraffe"
      .filter((obj, _idx, arr) => obj.score > 0 && arr[0].score - obj.score < 0.3)
  )
}

interface Props {
  active: number
  handleSelect: (item: MentionSuggestion) => void
  suggestions: MentionSuggestion[]
  setSuggestions: (suggestions: MentionSuggestion[]) => void
  originCoords: BBox
  triggerWord: string
  queryRef: PreloadedQuery<SuggestMentionableUsersQuery>
}

const query = graphql`
  query SuggestMentionableUsersQuery($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        teamMembers(sortBy: "preferredName") {
          id
          picture
          preferredName
        }
      }
    }
  }
`

const SuggestMentionableUsers = (props: Props) => {
  const {active, handleSelect, originCoords, suggestions, setSuggestions, triggerWord, queryRef} =
    props
  const data = usePreloadedQuery<SuggestMentionableUsersQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  const {team} = viewer
  const teamMembers = team ? team.teamMembers : null
  useEffect(() => {
    setSuggestions(makeSuggestions(triggerWord, teamMembers))
  }, [triggerWord, teamMembers])
  if (!team) return null
  return (
    <EditorSuggestions
      active={active}
      handleSelect={(item) => handleSelect(item as MentionSuggestion)}
      originCoords={originCoords}
      suggestions={suggestions}
      suggestionType={'mention'}
    />
  )
}

export default SuggestMentionableUsers
