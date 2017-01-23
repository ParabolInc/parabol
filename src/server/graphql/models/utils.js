import {GraphQLNonNull, GraphQLInputObjectType} from 'graphql';
import getRethink from 'server/database/rethinkDriver';
import mime from 'mime-types';
import {
  APP_CDN_USER_ASSET_SUBDIR,
  APP_MAX_AVATAR_FILE_SIZE
} from 'universal/utils/constants';
import protocolRelativeUrl from 'server/utils/protocolRelativeUrl';
import {s3SignPutObject} from 'server/utils/s3';
import path from 'path';

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
  const inOrg = await r.table('User').get(userId)('orgs').contains(orgId);
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

function getFields(context, astsParams = context.fieldNodes) {
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

export function firstChange(possiblyUpdatedResult) {
  if (possiblyUpdatedResult.changes.length) {
    if (possiblyUpdatedResult.changes.length > 1) {
      console.warn('firstChange() detects more than 1 change, returning 1st.');
    }
    return possiblyUpdatedResult.changes[0];
  }
  return { new_val: undefined, old_val: undefined };
}

export function updatedOrOriginal(possiblyUpdatedResult, original) {
  /*
   * There will only be changes to return if there were changes made to the
   * DB. Therefore, we've got to check.
   */
  return firstChange(possiblyUpdatedResult).new_val || original;
}

export function getOldVal(possiblyUpdatedResult) {
  return firstChange(possiblyUpdatedResult).old_val;
}

export function getNewVal(resultWithReturnChanges) {
  return firstChange(resultWithReturnChanges).new_val;
}

export function makeEnumValues(constArr) {
  return constArr.reduce((values, constant) => {
    values[constant] = {value: constant};
    return values;
  }, {})
}

export function validateAvatarUpload(contentType, contentLength) {
  if (typeof process.env.CDN_BASE_URL === 'undefined') {
    throw errorObj({_error: 'CDN_BASE_URL environment variable is not defined'});
  }
  if (!contentType || !contentType.startsWith('image/')) {
    throw errorObj({_error: 'file must be an image'});
  }
  const ext = mime.extension(contentType);
  if (!ext) {
    throw errorObj({_error: `unable to determine extension for ${contentType}`});
  }
  if (contentLength > APP_MAX_AVATAR_FILE_SIZE) {
    throw errorObj({_error: 'avatar image is too large'});
  }
  return ext;
}

export function getS3PutUrl(contentType, contentLength, partialPath) {
  const parsedUrl = protocolRelativeUrl.parse(process.env.CDN_BASE_URL);
  const pathname = path.join(parsedUrl.pathname,
    APP_CDN_USER_ASSET_SUBDIR,
    partialPath
  );
  return s3SignPutObject(
    pathname,
    contentType,
    contentLength,
    'public-read'
  );
}
