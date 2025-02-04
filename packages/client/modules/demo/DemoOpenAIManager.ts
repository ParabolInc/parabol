class DemoOpenAIManager {
  async generateGroupTitle(reflections: {plaintextContent: string}[]): Promise<string | null> {
    try {
      const response = await fetch('/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `
            mutation GenerateGroupTitle($reflections: [String!]!) {
              demoOpenAI(reflections: $reflections) {
                ... on DemoOpenAISuccess {
                  title
                }
                ... on ErrorPayload {
                  message
                }
              }
            }
          `,
          variables: {
            reflections: reflections.map((ref) => ref.plaintextContent)
          }
        })
      })
      const {data} = await response.json()
      if (data?.demoOpenAI?.__typename === 'DemoOpenAISuccess') {
        return data.demoOpenAI.title
      } else {
        // Optionally, log the error or fallback
        console.error('Error from demoOpenAI mutation:', data?.demoOpenAI)
        return null
      }
    } catch (e) {
      console.error('Error generating group title with OpenAI:', e)
      return null
    }
  }
}

export default DemoOpenAIManager
