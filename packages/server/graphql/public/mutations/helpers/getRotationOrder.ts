interface RotationMember {
  userId: string
  isNotRemoved: boolean | null
  facilitatorOrder: number | null
  createdAt: Date
}

/**
 * The facilitator queue, soonest first. A null facilitatorOrder means the member joined since the
 * last rotation, which puts them at the top of the line.
 */
const getRotationOrder = (teamMembers: readonly RotationMember[]) =>
  teamMembers
    .filter(({isNotRemoved}) => isNotRemoved)
    .sort((a, b) => {
      if (a.facilitatorOrder === b.facilitatorOrder) {
        return a.createdAt.getTime() - b.createdAt.getTime()
      }
      if (a.facilitatorOrder === null) return -1
      if (b.facilitatorOrder === null) return 1
      return a.facilitatorOrder - b.facilitatorOrder
    })
    .map(({userId}) => userId)

export default getRotationOrder
