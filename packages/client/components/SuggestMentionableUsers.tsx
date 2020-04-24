import graphql from 'babel-plugin-relay/macro'
import React, {useEffect} from 'react'
import {createFragmentContainer} from 'react-relay'
import stringScore from 'string-score'
import {SuggestMentionableUsers_viewer} from '~/__generated__/SuggestMentionableUsers_viewer.graphql'
import {BBox} from '../types/animations'
import EditorSuggestions from './EditorSuggestions/EditorSuggestions'
import {DraftSuggestion} from './TaskEditor/useSuggestions'

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
  handleSelect: (idx: number) => (e: React.MouseEvent) => void
  suggestions: DraftSuggestion[]
  setSuggestions: (suggestions: DraftSuggestion[]) => void
  originCoords: BBox
  triggerWord: string
  viewer: SuggestMentionableUsers_viewer
}

const SuggestMentionableUsers = (props: Props) => {
  const {
    active,
    handleSelect,
    originCoords,
    suggestions,
    setSuggestions,
    triggerWord,
    viewer
  } = props
  const {team} = viewer
  const teamMembers = team ? team.teamMembers : null
  useEffect(() => {
    setSuggestions(makeSuggestions(triggerWord, teamMembers))
  }, [triggerWord, teamMembers])
  if (!team) return null
  return (
    <EditorSuggestions
      active={active}
      handleSelect={handleSelect}
      originCoords={originCoords}
      suggestions={suggestions}
      suggestionType={'mention'}
    />
  )
}

export default createFragmentContainer(SuggestMentionableUsers, {
  viewer: graphql`
    fragment SuggestMentionableUsers_viewer on User {
      team(teamId: $teamId) {
        teamMembers(sortBy: "preferredName") {
          id
          picture
          preferredName
        }
      }
    }
  `
})
