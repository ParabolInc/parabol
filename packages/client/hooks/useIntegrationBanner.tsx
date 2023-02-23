import {EditorState} from 'draft-js'
import React from 'react'
import linkify from '../utils/linkify'
import {Integration} from './useIntegrationProviders'

const useIntegrationBanner = (editorState: EditorState, integrationProviders?: Integration[]) => {
  const [integration, setIntegration] = React.useState<Integration | undefined>()

  React.useEffect(() => {
    const text = editorState.getCurrentContent().getPlainText()
    const links = linkify.match(text)
    const url = links?.[0]?.url.trim()

    if (url && integrationProviders) {
      const matchingProvider = integrationProviders.find((provider) => provider.regex.test(url))
      if (matchingProvider) {
        setIntegration(matchingProvider)
        return
      }
    }

    setIntegration(undefined)
  }, [editorState.getCurrentContent().getPlainText(), integrationProviders])

  return integration
}

export default useIntegrationBanner
