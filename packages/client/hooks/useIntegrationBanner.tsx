import {EditorState} from 'draft-js'
import React from 'react'
import linkify from '../utils/linkify'
import {Integration} from '../components/TaskEditor/IntegrationBanner'

const useIntegrationBanner = (editorState: EditorState, integrationProviders?: Integration[]) => {
  const [integration, setIntegration] = React.useState<Integration | undefined>()
  const plainTextValue = editorState.getCurrentContent().getPlainText()

  React.useEffect(() => {
    const links = linkify.match(plainTextValue)
    const url = links?.[0]?.url.trim()

    if (url && integrationProviders) {
      const matchingProvider = integrationProviders.find((provider) => provider.regex.test(url))
      if (matchingProvider) {
        setIntegration(matchingProvider)
        return
      }
    }

    setIntegration(undefined)
  }, [plainTextValue])

  return integration
}

export default useIntegrationBanner
