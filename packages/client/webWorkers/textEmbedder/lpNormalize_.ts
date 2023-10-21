import {Tensor, TypedTensor} from 'onnxruntime-web'

function safeIndex(index: number, size: number, dimension = null) {
  if (index < -size || index >= size) {
    throw new Error(
      `IndexError: index ${index} is out of bounds for dimension${
        dimension === null ? '' : ' ' + dimension
      } with size ${size}`
    )
  }

  if (index < 0) {
    // Negative indexing, ensuring positive index
    index = ((index % size) + size) % size
  }
  return index
}

function norm(tensor: Tensor, p: number | 'fro' = 'fro', dim = null, keepdim = false) {
  if (p === 'fro') {
    // NOTE: Since we only support integer dims, Frobenius norm produces the same result as p=2.
    p = 2
  } else if (typeof p === 'string') {
    throw Error(`Unsupported norm: ${p}`)
  }

  if (dim === null) {
    // @ts-ignore
    let val = tensor.data.reduce((a, b) => a + b ** p, 0) ** (1 / p)
    return new Tensor(tensor.type, [val], [])
  }

  // Negative indexing
  dim = safeIndex(dim, tensor.dims.length)

  // Calculate the shape of the resulting array after summation
  const resultDims = tensor.dims.slice() // Copy the original dimensions
  resultDims[dim] = 1 // Remove the specified axis

  // Create a new array to store the accumulated values
  const result = new tensor.data.constructor(tensor.data.length / tensor.dims[dim])

  // Iterate over the data array
  for (let i = 0; i < tensor.data.length; ++i) {
    // Calculate the index in the resulting array
    let resultIndex = 0

    for (let j = tensor.dims.length - 1, num = i, resultMultiplier = 1; j >= 0; --j) {
      const size = tensor.dims[j]
      if (j !== dim) {
        const index = num % size
        resultIndex += index * resultMultiplier
        resultMultiplier *= resultDims[j]
      }
      num = Math.floor(num / size)
    }

    // Accumulate the value at the current index
    result[resultIndex] += tensor.data[i] ** p
  }

  if (p !== 1) {
    for (let i = 0; i < result.length; ++i) {
      result[i] = result[i] ** (1 / p)
    }
  }

  if (!keepdim) {
    resultDims.splice(dim, 1)
  }

  return new Tensor(tensor.type, result, resultDims)
}

export const lpNormalize_ = <T extends TypedTensor<any>>(tensor: T, p: number, _dim: number) => {
  const dim = safeIndex(_dim, tensor.dims.length)

  const normTensor = norm(tensor, p, dim, true)

  for (let i = 0; i < tensor.data.length; ++i) {
    // Calculate the index in the resulting array
    let resultIndex = 0

    for (let j = tensor.dims.length - 1, num = i, resultMultiplier = 1; j >= 0; --j) {
      const size = tensor.dims[j]
      if (j !== dim) {
        const index = num % size
        resultIndex += index * resultMultiplier
        resultMultiplier *= tensor.dims[j]
      }
      num = Math.floor(num / size)
    }

    // Divide by normalized value
    tensor.data[i] /= normTensor.data[resultIndex]
  }

  return tensor
}
