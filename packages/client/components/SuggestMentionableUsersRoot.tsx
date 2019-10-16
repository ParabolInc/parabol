import React from 'react'
import {cacheConfig} from '../utils/constants'
import QueryRenderer from './QueryRenderer/QueryRenderer'
import graphql from 'babel-plugin-relay/macro'
import renderQuery from '../utils/relay/renderQuery'
import useAtmosphere from '../hooks/useAtmosphere'
import SuggestMentionableUsers from './SuggestMentionableUsers'
import {DraftSuggestion} from './TaskEditor/useSuggestions'
import {BBox} from '../types/animations'

const query = graphql`
  query SuggestMentionableUsersRootQuery($teamId: ID!) {
    viewer {
      ...SuggestMentionableUsers_viewer
    }
  }
`

interface Props {
  active: number
  handleSelect: (idx: number) => (e: React.MouseEvent) => void
  suggestions: DraftSuggestion[]
  setSuggestions: (suggestions: DraftSuggestion[]) => void
  originCoords: BBox
  triggerWord: string
  teamId: string
}

const SuggestMentionableUsersRoot = (props: Props) => {
  const {
    active,
    handleSelect,
    originCoords,
    setSuggestions,
    suggestions,
    triggerWord,
    teamId
  } = props
  const atmosphere = useAtmosphere()

  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      variables={{teamId}}
      query={query}
      render={renderQuery(SuggestMentionableUsers, {
        props: {active, handleSelect, originCoords, setSuggestions, suggestions, triggerWord}
      })}
    />
  )
}

export default SuggestMentionableUsersRoot
