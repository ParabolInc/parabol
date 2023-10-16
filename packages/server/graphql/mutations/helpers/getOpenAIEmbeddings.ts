import {OpenAIEmbeddings} from 'langchain/embeddings/openai'
import {RecursiveCharacterTextSplitter} from 'langchain/text_splitter'

export const getOpenAIEmbeddings = async (plaintextContent: string) => {
  if (!plaintextContent) return null
  const embeddings = new OpenAIEmbeddings(
    {openAIApiKey: 'X'},
    {baseURL: 'http://localhost:3002/v1'}
  )
  const splitter = new RecursiveCharacterTextSplitter({chunkSize: 1000, chunkOverlap: 200})
  const splitText = await splitter.splitText(plaintextContent)
  const start = performance.now()
  const contentEmbedding = await embeddings.embedDocuments(splitText)
  const end = performance.now()
  console.log('duration', end - start)
  return `[${contentEmbedding.join(',')}]`
}

export default getOpenAIEmbeddings
