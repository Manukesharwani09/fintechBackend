import mongoose from "mongoose";

import softDeletePlugin from "./plugins/softDelete.plugin.js";

const buildBaseSchema = (definition, options = {}) => {
  const schema = new mongoose.Schema(definition, {
    timestamps: true,
    versionKey: false,
    ...options,
  });

  schema.plugin(softDeletePlugin);

  return schema;
};

export default buildBaseSchema;
