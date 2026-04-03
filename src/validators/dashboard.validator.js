import { z } from "zod";

import { queryNumber } from "./common.validator.js";

const recentActivityQuerySchema = z.object({
  limit: queryNumber("limit", 1, 100, 10),
});

export { recentActivityQuerySchema };
