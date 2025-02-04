import graphql from 'babel-plugin-relay/macro'
import {fetchQuery} from 'relay-runtime'
import {getDemoTitlesQuery} from '~/__generated__/getDemoTitlesQuery.graphql'
import Atmosphere from '../../Atmosphere'

const query = graphql`
  query getDemoTitlesQuery($reflections: [String!]!) {
    demoOpenAI(reflections: $reflections) {
      title
    }
  }
`

const getDemoTitles = async (reflections: string[]) => {
  if (!reflections || reflections.length === 0) return null
  const remoteAtmosphere = new Atmosphere()
  const res = await fetchQuery<getDemoTitlesQuery>(remoteAtmosphere, query, {
    reflections
  }).toPromise()
  return res?.demoOpenAI?.title ?? reflections[0] ?? null
}

export default getDemoTitles
