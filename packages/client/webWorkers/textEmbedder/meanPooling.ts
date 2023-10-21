import {Tensor, TypedTensor} from 'onnxruntime-web'

export const meanPooling = (lastHiddenState: TypedTensor<'float32'>, attentionMask: Tensor) => {
  let shape = [lastHiddenState.dims[0], lastHiddenState.dims[2]]
  let returnedData = new (lastHiddenState.data.constructor as Float32ArrayConstructor)(
    shape[0] * shape[1]
  )
  let [batchSize, seqLength, embedDim] = lastHiddenState.dims

  let outIndex = 0
  for (let i = 0; i < batchSize; ++i) {
    let offset = i * embedDim * seqLength

    for (let k = 0; k < embedDim; ++k) {
      let sum = 0
      let count = 0

      let attnMaskOffset = i * seqLength
      let offset2 = offset + k
      // Pool over all words in sequence
      for (let j = 0; j < seqLength; ++j) {
        // index into attention mask
        let attn = Number(attentionMask.data[attnMaskOffset + j])

        count += attn
        sum += lastHiddenState.data[offset2 + j * embedDim] * attn
      }

      let avg = sum / count
      returnedData[outIndex++] = avg
    }
  }
  return new Tensor(returnedData, shape)
}
