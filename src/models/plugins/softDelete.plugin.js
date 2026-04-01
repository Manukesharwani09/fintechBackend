const SOFT_DELETE_FILTER_KEY = "includeDeleted";

const markOptionsProcessed = (query) => {
  const options = query.getOptions();
  if (options && options[SOFT_DELETE_FILTER_KEY]) {
    delete options[SOFT_DELETE_FILTER_KEY];
    query.setOptions(options);
  }
};

const applySoftDeleteFilter = function applySoftDeleteFilter(next) {
  const options = this.getOptions() || {};
  if (!options[SOFT_DELETE_FILTER_KEY]) {
    this.where({ isDeleted: { $ne: true } });
  }
  markOptionsProcessed(this);
  next();
};

const softDeletePlugin = (schema) => {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  schema.query.withDeleted = function withDeleted() {
    return this.setOptions({ [SOFT_DELETE_FILTER_KEY]: true });
  };

  schema.methods.softDelete = async function softDelete() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  };

  schema.methods.restore = async function restore() {
    this.isDeleted = false;
    this.deletedAt = null;
    return this.save();
  };

  schema.statics.softDeleteById = function softDeleteById(id, options = {}) {
    return this.updateOne(
      { _id: id },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      options,
    );
  };

  schema.statics.restoreById = function restoreById(id, options = {}) {
    return this.updateOne(
      { _id: id },
      { $set: { isDeleted: false, deletedAt: null } },
      options,
    );
  };

  [
    "count",
    "countDocuments",
    "find",
    "findOne",
    "findOneAndUpdate",
    "updateMany",
    "updateOne",
  ].forEach((hook) => {
    schema.pre(hook, applySoftDeleteFilter);
  });
};

export default softDeletePlugin;
