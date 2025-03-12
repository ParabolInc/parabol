import graphql from 'babel-plugin-relay/macro'
import {fetchQuery} from 'relay-runtime'
import {getDemoTitlesQuery} from '~/__generated__/getDemoTitlesQuery.graphql'
import Atmosphere from '../../Atmosphere'

const query = graphql`
  query getDemoTitlesQuery($reflectionsContent: [String!]!) {
    getDemoGroupTitle(reflectionsContent: $reflectionsContent) {
      ... on GetDemoGroupTitleSuccess {
        title
      }
    }
  }
`

const getDemoTitles = async (reflectionsContent: string[]) => {
  if (!reflectionsContent || reflectionsContent.length === 0) return null
  const remoteAtmosphere = new Atmosphere()
  const res = await fetchQuery<getDemoTitlesQuery>(remoteAtmosphere, query, {
    reflectionsContent
  }).toPromise()
  return res?.getDemoGroupTitle?.title ?? reflectionsContent[0] ?? null
}

export default getDemoTitles
