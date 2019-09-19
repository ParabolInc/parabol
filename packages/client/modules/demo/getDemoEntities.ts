import {IGoogleAnalyzedEntity} from '../../types/graphql'

type Response = IGoogleAnalyzedEntity[][]
const getDemoEntities = async (text: string) => {
  if (!text) return []
  const res = await window.fetch('/get-demo-entities', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({texts: [text]})
  })
  if (res.status === 200) {
    const resJSON = await res.json() as Response
    return resJSON[0] || []
  }
  return []
}

export default getDemoEntities
