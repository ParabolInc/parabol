import {_XLinearIssueSearchResultResolvers} from '../resolverTypes'
const _xLinearIssueSearchResult: _XLinearIssueSearchResultResolvers = {
  /**
   * Custom ID resolver for Linear issue search results.
   * Ensures the generated Node ID is distinct from the ID generated for
   * the full _xLinearIssue type, preventing client-side Relay collisions.
   */
  id: (parent, _args, _context, _info) => {
    const nativeId = parent.id

    if (!nativeId || typeof nativeId !== 'string') {
      console.error(
        'Could not resolve raw Linear ID for _xLinearIssueSearchResult. Parent:',
        parent
      )
      return '_xLinearIssueSearchResult:INVALID_ID'
    }

    // 2. Encode the Node ID using the specific type name and the raw ID.
    // This creates a unique ID like 'XExpbmVhcklzc3VlU2VhcmNoUmVzdWx0OjEyMy...'
    // distinct from the ID for _xLinearIssue ('XExpbmVhcklzc3VlOjEyMy...')
    return `_xLinearIssueSearchResult:${nativeId}`
  }
}

export default _xLinearIssueSearchResult
