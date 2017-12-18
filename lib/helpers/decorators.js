import _ from 'lodash';

export const permissions = allowedPermissions => (target, name, descriptor) => {
  const original = descriptor.value;
  if (typeof original === 'function') {
    // eslint-disable-next-line func-names, no-param-reassign
    descriptor.value = function (...args) {
      _.every(allowedPermissions.map(p => p(this.req.user)), Boolean);
      const result = original.apply(this, args);
      return result;
    };
  }
};

export const makeRootController = (db, Crud) => target =>
  class extends target {
    constructor(req) {
      super();
      this.req = req;
      this.user = req.user;
      this.crud = {};

      const models = Object.keys(db).filter(
        model => !['sequelize', 'Sequelize', 'op'].includes(model),
      );
      this.models = db;

      models.forEach((modelName) => {
        this[`${modelName}Crud`] = new Crud(modelName);
      });
    }
  };
