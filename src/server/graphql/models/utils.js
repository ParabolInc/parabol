import {GraphQLNonNull, GraphQLInputObjectType} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
// Stringify an object to handle multiple errors
// Wrap it in a new Error type to avoid sending it twice via the originalError field
export const errorObj = obj => new Error(JSON.stringify(obj));

export const handleSchemaErrors = (errors) => {
  if (Object.keys(errors).length > 0) {
    throw errorObj(errors);
  }
};

// VERY important, otherwise eg a user could "create" a new team with an existing teamId & force join that team
export const ensureUniqueId = async (table, id) => {
  const r = getRethink();
  const res = await r.table(table).get(id);
  if (res) {
    throw errorObj({type: 'unique id collision'});
  }
};

export const ensureUserInOrg = async (userId, orgId) => {
  const r = getRethink();
  const inOrg = await r.table('Organization').get(orgId)('members').contains(userId);
  if (!inOrg) {
    throw errorObj({type: `user ${userId} does not belong to org ${orgId}`});
  }
  return true;
};

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

function getFields(context, astsParams = context.fieldASTs) {
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

export function getRequestedFields(refs) {
  const fieldsObj = getFields(refs);
  return Object.keys(fieldsObj);
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
