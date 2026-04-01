import mongoose from "mongoose";

import buildBaseSchema from "./baseModel.js";
import { RECORD_TYPE_VALUES } from "../constants/recordTypes.js";

const { ObjectId } = mongoose.Schema.Types;

const financialRecordDefinition = {
  user: {
    type: ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    default: "USD",
  },
  type: {
    type: String,
    enum: RECORD_TYPE_VALUES,
    required: true,
    index: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1024,
  },
  occurredAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  metadata: {
    type: Map,
    of: String,
    default: {},
  },
};

const FinancialRecordSchema = buildBaseSchema(financialRecordDefinition, {
  collection: "financial_records",
});

// Support dashboard filters and aggregations without scanning entire collection
FinancialRecordSchema.index({ user: 1, occurredAt: -1 });
FinancialRecordSchema.index({ user: 1, category: 1, occurredAt: -1 });
FinancialRecordSchema.index({ user: 1, type: 1, occurredAt: -1 });

const FinancialRecord =
  mongoose.models.FinancialRecord ||
  mongoose.model("FinancialRecord", FinancialRecordSchema);

export default FinancialRecord;
