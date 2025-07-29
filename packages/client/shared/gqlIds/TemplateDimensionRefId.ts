const TemplateDimensionRefId = {
  join: (meetingId: string, dimensionRefIdx: number) =>
    `dimensionRef:${meetingId}:${dimensionRefIdx}`,
  split: (id: string) => {
    const [, meetingId, dimensionRefIdx] = id.split(':')
    return {meetingId, dimensionRefIdx}
  }
}

export default TemplateDimensionRefId
