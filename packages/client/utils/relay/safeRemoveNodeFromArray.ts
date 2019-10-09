import {Variables} from 'relay-runtime'

interface Options {
  storageKeyArgs?: Variables
}

const safeRemoveNodeFromArray = (
  nodeId: string | null | undefined,
  parent,
  arrayName: string,
  options: Options = {}
) => {
  if (!nodeId || !parent) return
  const {storageKeyArgs} = options
  const arr = parent.getLinkedRecords(arrayName, storageKeyArgs)
  if (!arr) return
  const matchingNodeIdx = arr.findIndex((node) => node && node.getValue('id') === nodeId)
  if (matchingNodeIdx === -1) return
  const newArr = [...arr.slice(0, matchingNodeIdx), ...arr.slice(matchingNodeIdx + 1)]
  parent.setLinkedRecords(newArr, arrayName, storageKeyArgs)
}

export default safeRemoveNodeFromArray
