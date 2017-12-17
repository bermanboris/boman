export default db =>
  class Crud {
    constructor(model) {
      this.model = db[model];
    }
    create(data) {
      return this.model.create(data, { raw: true });
    }
    getSingle(id) {
      return this.model.findOne({ where: { id }, raw: true });
    }
    getAll(ownerId) {
      const query = ownerId ? { where: { userId: ownerId } } : {};
      return this.model.findAll(query, { raw: true });
    }
    async update(id, data) {
      const [result] = await this.model.update(data, { where: { id } });
      return result;
    }
  };
