const getDemoEntities = async (texts: string[]) => {
  if (texts.length === 0) return []
  const res = await window.fetch('/get-demo-entities', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({texts})
  })
  if (res.status === 200) return res.json()
  return texts.map(() => [])
}

export default getDemoEntities
