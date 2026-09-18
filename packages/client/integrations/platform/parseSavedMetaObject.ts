const parseSavedMetaObject = (meta: string): Record<string, unknown> => {
  try {
    const parsed: unknown = JSON.parse(meta)
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? {...parsed}
      : {}
  } catch {
    return {}
  }
}

export default parseSavedMetaObject
