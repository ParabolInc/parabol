import {InferenceSession, Tensor} from 'onnxruntime-web'
import {lpNormalize_} from './lpNormalize_'
import {meanPooling} from './meanPooling'

export const getEmbedding = async (docTokens: number[], session: InferenceSession) => {
  const dims = [1, docTokens.length]

  const inputIds = new Tensor(BigInt64Array.from(docTokens.map((n) => BigInt(n))), dims)
  const attentionMask = new Tensor(new BigInt64Array(docTokens.length).fill(1n), dims)
  const tokenTypeIds = new Tensor(new BigInt64Array(docTokens.length).fill(0n), dims)
  const sessionInput = {
    input_ids: inputIds,
    attention_mask: attentionMask,
    token_type_ids: tokenTypeIds
  }
  const {last_hidden_state: lastHiddenState} = await session.run(sessionInput)
  const meanPooledResult = meanPooling(lastHiddenState as any, attentionMask as any)
  const normalizedResult = lpNormalize_(meanPooledResult, 2, -1)
  return normalizedResult.data
}
