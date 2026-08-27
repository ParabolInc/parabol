import type {
  GraphQLResponseWithData,
  GraphQLSingularResponse,
  PayloadData,
  PayloadError
} from 'relay-runtime'

interface WireResponse {
  data?: PayloadData | null
  errors?: PayloadError[]
  extensions?: GraphQLResponseWithData['extensions']
  label?: string
  path?: Array<string | number>
}

export interface IncrementalFrame extends WireResponse {
  hasNext?: boolean
  incremental?: WireResponse[]
}

const isGraphQLResponse = (response: WireResponse): response is GraphQLSingularResponse =>
  'data' in response || 'errors' in response || 'extensions' in response

// relay-runtime reads top-level {data, path, label}; it does not understand the spec's {incremental: [...], hasNext} envelope
const flattenIncrementalResponse = (frame: IncrementalFrame): GraphQLSingularResponse[] => {
  const {incremental = [], hasNext: _hasNext, ...initial} = frame
  return [initial, ...incremental].filter(isGraphQLResponse)
}

export default flattenIncrementalResponse
