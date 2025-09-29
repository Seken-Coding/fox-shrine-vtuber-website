const createMockRequest = (overrides = {}) => {
  const request = {
    inputs: {},
    input: jest.fn(function (name, _type, value) {
      request.inputs[name] = value;
      return request;
    }),
    query: jest.fn(async (sql) => {
      if (overrides.query) {
        return overrides.query(sql, request.inputs);
      }
      return { recordset: [] };
    }),
    execute: jest.fn(async (proc) => {
      if (overrides.execute) {
        return overrides.execute(proc, request.inputs);
      }
      return { recordset: [] };
    }),
  };
  return request;
};

const createMockPool = (overrides = {}) => {
  return {
    request: jest.fn(() => createMockRequest(overrides)),
  };
};

module.exports = {
  createMockPool,
};
