import * as _ from 'lodash';
import validate from 'validate.js';

const routeSuffixLength = '.length';
const routeSuffixRanges = '[{ranges:indexRanges}]';
const routeSuffixById = 'ById';
const routeSuffixByIdKeys = routeSuffixById + '[{keys:ids}]';
const routeSuffixCreate = '.create';

const defModelIdKey = 'id';
const defModelKeyGetter = (model, key) => model[key];
const defModelIdGetter = (model) => defModelKeyGetter(model, defModelIdKey);

/*
 * From: https://github.com/ansman/validate.js/issues/80
 * by (@Screeze)[https://github.com/Screeze]
 */
validate.validators.type = (value, options) => {
  // allow empty values by default (needs to be checked by "presence" check)
  if (value === null || typeof value === 'undefined') {
    return null;
  }

  if (!validate.validators.type.checks[options]) {
    throw new Error('Could not find validator for type ' + options);
  }
  return validate.validators.type.checks[options](value) ? null : ' is not of type "' + options + '"';
};

validate.validators.type.checks = {
  Object: (value) => {
    return validate.isObject(value) && !validate.isArray(value);
  },
  Array: validate.isArray,
  Function: validate.isFunction,
  Integer: validate.isInteger,
  Number: validate.isNumber,
  String: validate.isString,
  Date: validate.isDate,
  Boolean: (value) => {
    return typeof value === 'boolean';
  }
};

export function createGetLengthRoute(routeBasename, modelPromise) {
  return {
    route: routeBasename + routeSuffixLength,
    async get(pathSet) {
      const length = await modelPromise();
      return {
        path: pathSet,
        value: length
      };
    }
  };
}

/*
 * modelPromise = async (from, to) => [modelObject, ...]
 * from, to is range inclusive (i.e. from=0, to=0 is 1 element)
 *
 * modelIdGetter = (modelObject) => modelObject.id
 */

export function createGetRangesRoute(routeBasename, modelPromise,
  modelIdGetter = defModelIdGetter) {
  const routeByIdBasename = routeBasename + routeSuffixById;

  return {
    route: routeBasename + routeSuffixRanges,
    async get(pathSet) {
      const responses = [];
      for (const { from, to } of pathSet.indexRanges) {
        const modelObjs = await modelPromise(from, to);
        for (let idx = 0; idx < modelObjs.length; idx++) {
          const response = {
            path: [routeBasename, from + idx],
            value: {
              $type: 'ref',
              value: [routeByIdBasename, modelIdGetter(modelObjs[idx])]
            }
          };
          responses.push(response);
        }
      }
      return responses;
    }
  };
}

/*
 * modelPromise = async ([id, ...]) => [modelObject, ...]
 * modelKeyGetter = (modelObject, key) => modelObject[key]
 */

export function createGetByIdRoute(routeBasename, acceptedKeys, modelPromise,
  modelKeyGetter = defModelKeyGetter,
  modelIdKey = defModelIdKey) {
  const routeByIdBasename = routeBasename + routeSuffixById;
  const keysString = ('[' + acceptedKeys.map((key) => '"' + key + '"') + ']');

  return {
    route: routeBasename + routeSuffixByIdKeys + keysString,
    async get(pathSet) {
      const attributes = pathSet[2];
      const modelObjs = await modelPromise(pathSet[1]);
      const responses = [];
      for (const modelObj of modelObjs) {
        for (const attribute of attributes) {
          const response = {
            path: [routeByIdBasename, modelKeyGetter(modelObj, modelIdKey), attribute],
            value: JSON.stringify(modelKeyGetter(modelObj, attribute))
          };
          responses.push(response);
        }
      }

      return responses;
    }
  };
}

/*
 * modelPromise = async (modelParams) => [newModelObj, newCollectionLength]
 * modelIdGetter = (modelObject) => modelObject.id
 */

export function createCallCreateRoute(routeBasename, acceptedKeys, modelPromise,
  modelIdGetter = defModelIdGetter) {
  return {
    route: routeBasename + routeSuffixCreate,
    async call(callPath, args) { // eslint-disable-line no-unused-vars
      const objParams = _.pick(args[0], acceptedKeys);
      const [newObj, newLength] = await modelPromise(objParams);

      return [
        {
          path: ['meetings', newLength - 1],
          value: {
            $type: 'ref',
            value: [ 'meetingsById', modelIdGetter(newObj) ]
          }
        },
        {
          path: ['meetings', 'length' ],
          value: newLength
        }
      ];
    }
  };
}

export function createRoutes(options) {
  const constraints = {
    routeBasename: {
      presence: true,
      type: 'String'
    },
    acceptedKeys: {
      presence: true,
      type: 'Array'
    },
    getLengthModelPromise: {
      presence: true,
      type: 'Function'
    },
    getRangeModelPromise: {
      presence: true,
      type: 'Function'
    },
    getByIdsModelPromise: {
      presence: true,
      type: 'Function'
    },
    callCreateModelPromise: {
      presence: true,
      type: 'Function'
    },
    modelKeyGetter: {
      type: 'Function'
    },
    modelIdKey: {
      type: 'String'
    }
  };
  // Optional parameters:
  const optionalParams = {
    modelKeyGetter: defModelKeyGetter,
    modelIdKey: defModelIdKey,
  };

  // Check for unknown params:
  const unknownParams = _.difference(Object.keys(options),
                          Object.keys(constraints));
  if (unknownParams.length > 0) {
    throw new Error('unknown paramters: ' + JSON.stringify(unknownParams));
  }

  // Merge default parameters into params:
  const params = _.defaults(options, optionalParams);

  // Perform final parameter validation:
  const errors = validate(params, constraints);
  if (errors) {
    throw new Error(errors);
  }

  console.error('params: ', JSON.stringify(params));

  return [
    createGetLengthRoute(params.routeBasename, params.getLengthModelPromise),
    createGetRangesRoute(params.routeBasename, params.getRangeModelPromise,
      params.modelIdGetter),
    createGetByIdRoute(params.routeBasename, params.acceptedKeys,
      params.getByIdsModelPromise, params.modelKeyGetter, params.modelIdKey),
    createCallCreateRoute(params.routeBasename, params.acceptedKeys,
      params.callCreateModelPromise, params.modelIdGetter)
  ];
}
