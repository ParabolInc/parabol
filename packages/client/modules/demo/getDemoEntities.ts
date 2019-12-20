import Atmosphere from '../../Atmosphere'
import graphql from 'babel-plugin-relay/macro'
import {fetchQuery} from 'relay-runtime'
import {IGoogleAnalyzedEntity} from '../../types/graphql'

type Response = IGoogleAnalyzedEntity[][]

const query = graphql`
  query getDemoEntitiesQuery($texts: [String!]!) {
    getDemoEntities(texts: $texts) {
      entities {
        lemma
        name
        salience
      }
    }
  }
`

const getDemoEntities = async (text: string) => {
  if (!text || text.length <= 2) return []
  const remoteAtmosphere = new Atmosphere()
  const texts = [text]
  const res = await fetchQuery<any>(remoteAtmosphere, query, {texts})
  if (res.status === 200) {
    const resJSON = (await res.json()) as Response
    return resJSON[0] || []
  }
  return []
}

export default getDemoEntities
