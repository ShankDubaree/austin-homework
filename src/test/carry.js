// One-off for Wed 21 Oct 2026: the sums changed mid-week. Nights Austin already finished with
// last week's sums (16 Oct, saved with the old sums-included signature) are carried over so their
// ticks and scores stay. From now on the signature leaves the sums out, so this isn't needed again.
import { planNights, nightSignature } from "./nights.js";
import { parseSums } from "../sums.js";
import * as done from "./done.js";

export const SUMS_BEFORE = ["21+6","34+5","47+2","63+4","72+3","49-7","58-3","67-5","86-4","95-2"];

// content: the same object main.js gives planNights (with this week's sums).
export function carryTicks(content) {
  const before = planNights({ ...content, maths: parseSums(SUMS_BEFORE) });
  const now = planNights(content);
  return now.map((plan, n) => done.carryOver(n, nightSignature(before[n], { withMaths: true }), nightSignature(plan)));
}
