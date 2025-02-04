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
  console.log('in get demo..... ', reflections)
  if (!reflections || reflections.length === 0) return null
  const remoteAtmosphere = new Atmosphere()

  const TEST_TITLES = {
    botGroup1: 'Communication Challenges',
    botGroup8: 'Process Issues'
  }

  console.log('about to try....')
  const res = await fetchQuery<getDemoTitlesQuery>(remoteAtmosphere, query, {
    // const res = await fetchQuery<any>(remoteAtmosphere, query, {
    reflections
  }).toPromise()
  console.log('🚀 ~ res)))):', res)
  return res?.demoOpenAI?.title ?? reflections[0] ?? null
}

export default getDemoTitles
