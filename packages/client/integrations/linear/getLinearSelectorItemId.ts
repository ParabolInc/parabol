const getLinearSelectorItemId = (item: {__typename: string; id: string}) =>
  `${item.__typename}:${item.id}`

export default getLinearSelectorItemId
