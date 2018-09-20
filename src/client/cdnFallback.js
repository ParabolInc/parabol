/*eslint-disable*/
const original = __webpack_chunk_load__
__webpack_chunk_load__ = (id) => {
  const tryCDN = () => {
    return original(id).catch(() => {
      __webpack_public_path__ = '/static/'
      return tryCDN()
    })
  }
  return tryCDN()
}
