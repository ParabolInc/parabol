import {InferenceSession, env} from 'onnxruntime-web'
import {
  EmbedToWorkerEvent,
  SimilarityToWorkerEvent,
  TextEmbedderFromWorkerEvent,
  TextEmbedderToWorkerEvent
} from './TextEmbedder.d'
import {calculateCosineSimilarity} from './calculateCosineSimilarity'
import {fetchStoreOrNetwork} from './fetchStoreOrNetwork'
import {getEmbedding} from './getEmbedding'
import {WordPieceDecoder} from './transformers/Decoder'
import {BertNormalizer} from './transformers/Normalizer'
import {TemplateProcessing} from './transformers/PostProcessor'
import {BertPreTokenizer} from './transformers/PreTokenizer'
import {BertTokenizer, Tokenizer} from './transformers/Tokenizer'
import {WordPieceTokenizer} from './transformers/TokenizerModel'
import {ModelConfigJSON} from './transformers/modelConfigJSON'
import {TokenizerConfigJSON} from './transformers/tokenizerConfigJSON'
import {TokenizerJSON} from './transformers/tokenizerJSON'

// Force calls to postMessage to conform to typings
declare let self: WorkerGlobalScope
declare global {
  interface WorkerGlobalScope {
    postMessage(message: TextEmbedderFromWorkerEvent): void
  }
}

interface EmbeddingsValue {
  tokenIds: Float32Array
  vector: Float32Array
  singleTokenEmbeddings: {
    tokenId: number
    vector: Float32Array
  }[]
}

const embeddings: Record<string, EmbeddingsValue> = {}

type TTokenizer = BertTokenizer<
  BertNormalizer,
  BertPreTokenizer,
  WordPieceTokenizer,
  TemplateProcessing,
  WordPieceDecoder
>

class TextEmbedderWorker {
  session: InferenceSession
  tokenizer: TTokenizer
  myTokenizer: any

  constructor() {
    self.addEventListener('message', this.handleMessage)
  }

  async loadTokenizer() {
    const TOKEN_URL = 'https://huggingface.co/TaylorAI/bge-micro-v2/resolve/main/onnx/model.onnx'
  }
  async loadModel() {
    const MODEL = 'https://huggingface.co/TaylorAI/bge-micro-v2/resolve/main'
    const MODEL_URL = `${MODEL}/onnx/model.onnx`
    const CONFIG_URL = `${MODEL}/config.json`
    const TOKENIZER_URL = `${MODEL}/tokenizer.json`
    const TOKENIZER__CONFIG_URL = `${MODEL}/tokenizer_config.json`
    const [modelBuffer, config, tokinizerJSON, tokenizerConfigJSON] = await Promise.all([
      fetchStoreOrNetwork<Uint8Array>(MODEL_URL, (progress) => {
        self.postMessage({type: 'download', data: {status: 'progress', ...progress}})
      }),
      fetchStoreOrNetwork<ModelConfigJSON>(CONFIG_URL),
      fetchStoreOrNetwork<TokenizerJSON>(TOKENIZER_URL),
      fetchStoreOrNetwork<TokenizerConfigJSON>(TOKENIZER__CONFIG_URL)
    ])
    env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.1/dist/'
    this.session = await InferenceSession.create(new Uint8Array(modelBuffer), {
      executionProviders: ['wasm']
    })

    this.tokenizer = Tokenizer.fromConfig<TTokenizer>(tokinizerJSON, tokenizerConfigJSON)
    self.postMessage({type: 'ready'})
  }

  async embedCorpus(data: EmbedToWorkerEvent) {
    const {docs, id} = data
    // TODO parallelize

    await Promise.all(
      docs.map(async (doc) => {
        const cachedResult = embeddings[doc]
        if (cachedResult) return cachedResult
        const embeddingDict = (embeddings[doc] = {
          tokenIds: new Float32Array(),
          vector: new Float32Array(),
          singleTokenEmbeddings: []
        } as EmbeddingsValue)
        const tokenizedDocArr = this.tokenizer.encode(doc)
        const decoded = this.tokenizer.decode(tokenizedDocArr, {skip_special_tokens: true})
        tokenizedDocArr.forEach((val) => {
          const decoded1 = this.tokenizer.decode([val], {skip_special_tokens: true})
        })
        const embedding = await getEmbedding(tokenizedDocArr, this.session)
        const singleTokenEmbeddings = await Promise.all(
          tokenizedDocArr.map(async (tokenId) => {
            const vector = await getEmbedding([tokenId], this.session)
            return {tokenId, vector}
          })
        )
        embeddingDict.vector = embedding
        embeddingDict.singleTokenEmbeddings = singleTokenEmbeddings
      })
    )
    self.postMessage({type: 'jobComplete', id})
  }

  async searchSimilarity(data: SimilarityToWorkerEvent) {
    const {query, id, k} = data
    if (!query) {
      self.postMessage({type: 'jobComplete', id, data: []})
      return
    }
    const tokenizedDocArr = this.tokenizer.encode(data.query)
    const embedding = await getEmbedding(tokenizedDocArr, this.session)
    const results = Object.entries(embeddings)
      .map(([text, corpusEmbedding]) => {
        return {
          text,
          score: calculateCosineSimilarity(embedding, corpusEmbedding.vector),
          singleTokenEmbeddings: corpusEmbedding.singleTokenEmbeddings
        }
      })
      .sort((a, b) => (a.score > b.score ? -1 : 1))
      .slice(0, k)
      .map((res) => ({
        text: res.text,
        score: res.score,
        word: this.getSalientWords(embedding, res.singleTokenEmbeddings)
      }))
    self.postMessage({type: 'jobComplete', id, data: results})
  }
  handleMessage = async (event: MessageEvent<TextEmbedderToWorkerEvent>) => {
    const {data} = event
    const {type} = data

    switch (type) {
      case 'load':
        this.loadModel()
        break
      case 'embedCorpus':
        this.embedCorpus(data)
        break
      case 'similarity':
        this.searchSimilarity(data)
    }
  }
  getSalientWords(
    queryVector: Float32Array,
    singleTokenEmbeddings: {tokenId: number; vector: Float32Array}[]
  ) {
    // for each token, compute the similarity to each item in the queryVector

    const similarities = singleTokenEmbeddings.map((singleTokenEmbedding) => {
      return calculateCosineSimilarity(queryVector, singleTokenEmbedding.vector)
    })

    const maxSalientIdx = similarities.indexOf(Math.max(...similarities))
    const maxSalient = singleTokenEmbeddings[maxSalientIdx]
    const maxSalientWord = this.tokenizer.decode([maxSalient.tokenId], {skip_special_tokens: true})
    return maxSalientWord
  }
}

new TextEmbedderWorker()
