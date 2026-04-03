import { z } from "zod";

import { queryNumber, optionalDateString } from "./common.validator.js";

const topSpendingQuerySchema = z.object({
  limit: queryNumber("limit", 1, 20, 5),
});

const dateRangeSummaryQuerySchema = z.object({
  startDate: optionalDateString("startDate"),
  endDate: optionalDateString("endDate"),
});

const trendMonthsQuerySchema = z.object({
  months: queryNumber("months", 1, 24, 12),
});

export {
  topSpendingQuerySchema,
  dateRangeSummaryQuerySchema,
  trendMonthsQuerySchema,
};
