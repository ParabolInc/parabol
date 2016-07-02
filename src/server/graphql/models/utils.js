import {GraphQLNonNull, GraphQLInputObjectType} from 'graphql';

export const defaultResolveFn = (source, args, {fieldName}) => {
  const property = source[fieldName];
  return typeof property === 'function' ? property.call(source) : property;
};

export function resolveForAdmin(source, args, ref) {
  return ref.rootValue &&
  ref.rootValue.authToken &&
  ref.rootValue.authToken.isAdmin ? defaultResolveFn.apply(this, [source, args, ref]) : null;
}

// Stringify an object to handle multiple errors
// Wrap it in a new Error type to avoid sending it twice via the originalError field
export const errorObj = obj => new Error(JSON.stringify(obj));

// if the add & update schemas have different required fields, use this
export const nonnullifyInputThunk = (name, inputThunk, requiredFieldNames) => {
  return new GraphQLInputObjectType({
    name,
    fields: () => {
      const newFields = inputThunk();
      requiredFieldNames.forEach(fieldName => {
        newFields[fieldName].type = new GraphQLNonNull(newFields[fieldName].type);
      });
      return newFields;
    }
  });
};

export function getFields(context, astsParams = context.fieldASTs) {
  // for recursion...Fragments doesn't have many sets...
  const asts = Array.isArray(astsParams) ? astsParams : [astsParams];

  // get all selectionSets
  const selectionSets = asts.reduce((selections, source) => {
    selections.push(...source.selectionSet.selections);
    return selections;
  }, []);

  // return fields
  return selectionSets.reduce((list, ast) => {
    switch (ast.kind) {
      case 'Field' :
        // eslint-disable-next-line no-param-reassign
        list[ast.name.value] = true;
        return list;
      case 'InlineFragment':
        return {
          ...list,
          ...getFields(context, ast)
        };
      case 'FragmentSpread':
        return {
          ...list,
          ...getFields(context, context.fragments[ast.name.value])
        };
      default:
        throw new Error('Unsuported query selection');
    }
  }, {});
}

export function updatedOrOriginal(possiblyUpdatedResult, original) {
  /*
   * There will only be changes to return if there were changes made to the
   * DB. Therefore, we've got to check.
   */
  if (possiblyUpdatedResult.changes.length) {
    if (possiblyUpdatedResult.changes.length > 1) {
      console.warn('updatedOrOriginal() detects more than 1 change, returning 1st.');
    }
    return possiblyUpdatedResult.changes[0].new_val;
  }
  return original;
}
