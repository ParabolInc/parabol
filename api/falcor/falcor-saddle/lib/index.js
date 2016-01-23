import * as _ from 'lodash';
import * as jsonGraph from 'falcor-json-graph';
import validate from 'validate.js';

import serialize from './serialization';

const routeSuffixLength = '.length';
const routeSuffixRanges = '[{ranges:indexRanges}]';
const routeSuffixById = 'ById';
const routeSuffixByIdKeys = routeSuffixById + '[{keys:ids}]';
const routeSuffixCreate = '.create';
const routeSuffixDelete = '.delete';

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

/*
 * getLengthPromise = async () => count
 */

export function createGetLengthRoute(routeBasename, getLengthPromise) {
  return {
    route: routeBasename + routeSuffixLength,
    async get(pathSet) {
      const length = await getLengthPromise();
      return jsonGraph.pathValue(pathSet, length);
    }
  };
}

/*
 * getRangePromise = async (from, to) => [modelObject, ...]
 * from, to is range inclusive (i.e. from=0, to=0 is 1 element)
 *
 * modelIdGetter = (modelObject) => modelObject.id
 */

export function createGetRangesRoute(routeBasename, getRangePromise,
  modelIdGetter = defModelIdGetter) {
  const routeByIdBasename = routeBasename + routeSuffixById;

  return {
    route: routeBasename + routeSuffixRanges,
    async get(pathSet) {
      const responses = [];
      for (const { from, to } of pathSet.indexRanges) {
        const modelObjs = [];
        try {
          modelObjs.push(...await getRangePromise(from, to));
        } catch (err) {
          responses.push(jsonGraph.error(err));
        }
        for (let idx = 0; idx < modelObjs.length; idx++) {
          responses.push(
            jsonGraph.pathValue([routeBasename, from + idx],
              jsonGraph.ref([routeByIdBasename, modelIdGetter(modelObjs[idx])])
            )
          );
        }
      }
      return responses;
    }
  };
}

/*
 * getByIdPromise = async (id) => modelObject
 * modelKeyGetter = (modelObject, key) => modelObject[key]
 */

export function createGetByIdRoute(routeBasename, acceptedKeys, getByIdPromise,
  modelKeyGetter = defModelKeyGetter,
  modelIdKey = defModelIdKey) {
  const routeByIdBasename = routeBasename + routeSuffixById;
  const keysString = ('[' + acceptedKeys.map((key) => '"' + key + '"') + ']');

  return {
    route: routeBasename + routeSuffixByIdKeys + keysString,
    async get(pathSet) {
      const attributes = pathSet[2];
      const modelObjs = [];
      const responses = [];
      for (const id of pathSet[1]) {
        try {
          modelObjs.push(await getByIdPromise(id));
        } catch (err) {
          responses.push(jsonGraph.error(err));
        }
      }
      for (const modelObj of modelObjs) {
        for (const attribute of attributes) {
          responses.push(
            jsonGraph.pathValue(
              [routeByIdBasename, modelKeyGetter(modelObj, modelIdKey), attribute],
              serialize(modelKeyGetter(modelObj, attribute))
            )
          );
        }
      }
      return responses;
    }
  };
}

/*
 * getByIdPromise = async (id) => modelObject
 * updatePromise = async (oldObj, newObj) => newObj
 * modelKeyGetter = (modelObject, key) => modelObject[key]
 */

export function createSetByIdRoute(routeBasename, acceptedKeys, getByIdPromise, updatePromise,
  modelKeyGetter = defModelKeyGetter,
  modelIdKey = defModelIdKey) {
  const routeByIdBasename = routeBasename + routeSuffixById;
  const keysString = ('[' + acceptedKeys.map((key) => '"' + key + '"') + ']');
  return {
    route: routeBasename + routeSuffixByIdKeys + keysString,
    async set(jsonGraphArg) {
      const objsById = jsonGraphArg[routeByIdBasename];
      const ids = Object.keys(objsById);

      const responses = [ ];

      // iterate on ids, getting, updating, and creating responses.
      for (const id of ids) {
        let oldObj = null;
        let newObj = null;

        try {
          oldObj = await getByIdPromise(id);
        } catch (err) {
          responses.push(jsonGraph.error(err));
          continue;
        }
        try {
          newObj = await updatePromise(oldObj, objsById[id]);
        } catch (err) {
          responses.push(jsonGraph.error(err));
          continue;
        }
        for (const key of acceptedKeys) {
          if (!modelKeyGetter(newObj, key) ||
              !modelKeyGetter(newObj, modelIdKey)) {
            continue;
          }
          responses.push(
            jsonGraph.pathValue(
              [routeByIdBasename, modelKeyGetter(newObj, modelIdKey), key],
              serialize(modelKeyGetter(newObj, key))
            )
          );
        }
      }

      return responses;
    }
  };
}

/*
 * createPromise = async (modelParams) => [newModelObj, newCollectionLength]
 * getLengthPromise = async () => count
 * modelIdGetter = (modelObject) => modelObject.id
 */

export function createCallCreateRoute(routeBasename, acceptedKeys,
  createPromise, getLengthPromise,
  modelIdGetter = defModelIdGetter) {
  return {
    route: routeBasename + routeSuffixCreate,
    async call(callPath, args) { // eslint-disable-line no-unused-vars
      const objParams = _.pick(args[0], acceptedKeys);
      try {
        const newObj = await createPromise(objParams);
        const newLength = await getLengthPromise();

        return [
          jsonGraph.pathValue(
            ['meetings', newLength - 1],
            jsonGraph.ref([ 'meetingsById', modelIdGetter(newObj) ])
          ),
          jsonGraph.pathValue(['meetings', 'length' ], newLength)
        ];
      } catch (err) {
        return jsonGraph.error(err);
      }
    }
  };
}

/*
 * deleteByIdPromise = async (obj) => null;
 * getLengthPromise = async () => count
 */

export function createCallDeleteRoute(routeBasename,
  deleteByIdPromise, getLengthPromise) {
  const routeByIdBasename = routeBasename + routeSuffixById;
  return {
    route: routeByIdBasename + routeSuffixDelete,
    async call(callPath, args) { // eslint-disable-line no-unused-vars
      const responses = [];

      for (const id of args) {
        try {
          await deleteByIdPromise(id);
          responses.push(jsonGraph.pathInvalidation([routeByIdBasename, id]));
        } catch (err) {
          responses.push(jsonGraph.error(err));
        }
      }

      try {
        const newLength = await getLengthPromise();
        responses.push(
          jsonGraph.pathValue(
            [routeBasename, routeSuffixLength],
            newLength
          )
        );
      } catch (err) {
        responses.push(jsonGraph.error(err));
      }

      return responses;
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
    getLength: {
      presence: true,
      type: 'Function'
    },
    getRange: {
      presence: true,
      type: 'Function'
    },
    getById: {
      presence: true,
      type: 'Function'
    },
    update: {
      presence: true,
      type: 'Function'
    },
    create: {
      presence: true,
      type: 'Function'
    },
    delete: {
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
    modelIdGetter: defModelIdGetter,
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
    throw new Error(JSON.stringify(errors));
  }

  return [
    createGetLengthRoute(params.routeBasename, params.getLength),
    createGetRangesRoute(params.routeBasename, params.getRange,
      params.modelIdGetter),
    _.extend(
      createGetByIdRoute(params.routeBasename, params.acceptedKeys,
        params.getById, params.modelKeyGetter, params.modelIdKey),
      createSetByIdRoute(params.routeBasename, params.acceptedKeys,
        params.getById, params.update,
        params.modelKeyGetter, params.modelIdKey),
    ),
    createCallCreateRoute(params.routeBasename, params.acceptedKeys,
      params.create, params.getLength, params.modelIdGetter),
    createCallDeleteRoute(params.routeBasename,
      params.delete, params.getLength)
  ];
}
