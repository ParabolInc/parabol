import {GraphQLNonNull, GraphQLInputObjectType} from 'graphql';
import jsonEqual from 'universal/utils/jsonEqual';

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

const handleRethinkAdd = newVal => {
  return {
    type: 'add',
    fields: newVal
  };
};

const handleRethinkRemove = id => {
  return {
    type: 'remove',
    id
  };
};

const handleRethinkUpdate = doc => {
  const oldVals = doc.old_val;
  const newVals = doc.new_val;
  const changeKeys = [...Object.keys(oldVals), ...Object.keys(newVals)];
  const removeKeys = [];
  const diff = {};
  for (let i = 0; i < changeKeys.length; i++) {
    const key = changeKeys[i];

    // flag keys to remove
    if (!newVals.hasOwnProperty(key)) {
      removeKeys.push(key);
      continue;
    }

    // explicit check to ensure we send down falsy values
    if (!oldVals.hasOwnProperty(key)) {
      diff[key] = newVals[key];
      continue;
    }
    const oldVal = oldVals[key];
    const newVal = newVals[key];

    // don't send down unchanged values
    if (oldVal === newVal || jsonEqual(oldVal, newVal)) {
      continue;
    }
    diff[key] = newVals[key];
  }
  return {
    type: 'update',
    fields: diff,
    removeKeys
  };
};

export function handleRethinkChangefeed(doc) {
  if (Object.keys(doc.old_val).length === 0) {
    return handleRethinkAdd(doc.new_val);
  } else if (Object.keys(doc.new_val).length === 0) {
    return handleRethinkRemove(doc.old_val.id);
  }
  return handleRethinkUpdate(doc);
}
