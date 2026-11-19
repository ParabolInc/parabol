const toPossessive = (name: string) => (name.endsWith('s') ? `${name}’` : `${name}’s`)

export default toPossessive
