import graphql from 'babel-plugin-relay/macro'
import {fetchQuery} from 'relay-runtime'
import {getDemoEntitiesQuery} from '~/__generated__/getDemoEntitiesQuery.graphql'
import Atmosphere from '../../Atmosphere'

const BOT_GROUP_TITLES: Record<string, string> = {
  botGroup1: 'Empower Junior Staff',
  botGroup2: 'Documentation Practices',
  botGroup4: 'Chat Communication Issues',
  botGroup5: 'Unproductive Discussions',
  botGroup6: 'Meeting Overload'
}

export const getDemoGroupTitle = (groupId: string, firstReflectionContent?: string) => {
  return BOT_GROUP_TITLES[groupId] ?? firstReflectionContent ?? 'New Group'
}

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

  const TEST_REFLECTIONS = {
    'Writing things down': [
      {
        lemma: 'thing',
        name: 'things',
        salience: 1
      }
    ],
    'Documenting things in Notion': [
      {
        lemma: 'thing',
        name: 'things',
        salience: 0.8
      },
      {
        lemma: 'notion',
        name: 'notion',
        salience: 0.2
      }
    ]
  }
  const cachedEntities = TEST_REFLECTIONS[text as keyof typeof TEST_REFLECTIONS]
  if (cachedEntities) return cachedEntities
  const res = await fetchQuery<getDemoEntitiesQuery>(remoteAtmosphere, query, {text}).toPromise()
  return res?.getDemoEntities?.entities ?? []
}

export default getDemoEntities
