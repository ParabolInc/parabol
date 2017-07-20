const toGlobalId = (type, id) => btoa(`${type}:${id}`);

export default toGlobalId;
