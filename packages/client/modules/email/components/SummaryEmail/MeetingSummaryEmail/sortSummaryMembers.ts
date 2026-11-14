interface SummaryMember {
  userId: string
  user: {preferredName: string}
}

const sortSummaryMembers = <T extends SummaryMember>(members: readonly T[], viewerId: string) =>
  members.toSorted(
    (a, b) =>
      Number(b.userId === viewerId) - Number(a.userId === viewerId) ||
      a.user.preferredName.localeCompare(b.user.preferredName)
  )

export default sortSummaryMembers
