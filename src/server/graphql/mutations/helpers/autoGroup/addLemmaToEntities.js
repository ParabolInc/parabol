const addLemmaToEntity = (entityName, tokens) => {
  const namePieces = entityName.toLowerCase().split(' ');
  const [firstPiece] = namePieces;
  for (let jj = 0; jj < tokens.length; jj++) {
    const token = tokens[jj];
    if (token.text.content === firstPiece) {
      let startIdxFound = true;
      // make sure the rest of the pieces match
      for (let kk = 1; kk < namePieces.length; kk++) {
        const nextPiece = namePieces[kk];
        const nextToken = tokens[jj + kk];
        if (nextPiece !== nextToken) {
          startIdxFound = false;
          break;
        }
      }
      if (!startIdxFound) continue;

    }
  }
}

const addLemmaToEntities = (entities, syntax) => {
  if (!entities || !syntax) return null;
  const [firstSyntax] = syntax;
  if (!firstSyntax) return null;
  const {tokens} = firstSyntax;
  if (!Array.isArray(tokens)) return null;
  const validEntities = [];
  return entities.map((entity) => ({
    ...entity,
    lemma: addLemmaToEntity(entity.name, tokens)
  }));
};

export default addLemmaToEntities;
