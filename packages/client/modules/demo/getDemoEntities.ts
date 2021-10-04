import graphql from 'babel-plugin-relay/macro'
import {fetchQuery} from 'relay-runtime'
import {getDemoEntitiesQuery} from '~/__generated__/getDemoEntitiesQuery.graphql'
import Atmosphere from '../../Atmosphere'

const query = graphql`
  query getDemoEntitiesQuery($text: String!) {
    getDemoEntities(text: $text) {
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
  const res = await fetchQuery<getDemoEntitiesQuery>(remoteAtmosphere, query, {text}).toPromise()
  return res?.getDemoEntities?.entities ?? []
}

export default getDemoEntities
