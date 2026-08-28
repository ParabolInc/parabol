interface RotationMember {
  userId: string
  isNotRemoved: boolean | null
  facilitatorOrder: number | null
  createdAt: Date
}

const byTenure = (a: RotationMember, b: RotationMember) =>
  a.createdAt.getTime() - b.createdAt.getTime()

/**
 * The facilitator queue. The head is whoever facilitated most recently, so the rest of the list
 * reads as the order they come up in. A null facilitatorOrder means the member joined since the
 * last rotation: they slot in right behind the head so they are next up rather than last in line.
 */
const getRotationOrder = (teamMembers: readonly RotationMember[]) => {
  const activeMembers = teamMembers.filter(({isNotRemoved}) => isNotRemoved)
  const [head, ...queued] = activeMembers
    .filter(({facilitatorOrder}) => facilitatorOrder !== null)
    .sort((a, b) => a.facilitatorOrder! - b.facilitatorOrder! || byTenure(a, b))
    .map(({userId}) => userId)
  const newcomers = activeMembers
    .filter(({facilitatorOrder}) => facilitatorOrder === null)
    .sort(byTenure)
    .map(({userId}) => userId)
  return head ? [head, ...newcomers, ...queued] : newcomers
}

export default getRotationOrder
