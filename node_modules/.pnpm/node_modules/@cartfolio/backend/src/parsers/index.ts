import type { Order } from "../../../../shared/types/index.js";
import type { RawEmail } from "./types.js";
import { isAmazonEmail, parseAmazonEmail } from "./amazon.js";
import { isFlipkartEmail, parseFlipkartEmail } from "./flipkart.js";
import { isZomatoEmail, parseZomatoEmail } from "./zomato.js";
import { isBlinkitEmail, parseBlinkitEmail } from "./blinkit.js";

/**
 * Dispatch an incoming email to the correct vendor parser.
 * Returns a structured Order, or null if vendor is not recognised.
 */
export function parseEmail(email: RawEmail): Order | null {
  if (isAmazonEmail(email)) return parseAmazonEmail(email);
  if (isFlipkartEmail(email)) return parseFlipkartEmail(email);
  if (isZomatoEmail(email)) return parseZomatoEmail(email);
  if (isBlinkitEmail(email)) return parseBlinkitEmail(email);
  return null;
}

export { isAmazonEmail, parseAmazonEmail } from "./amazon.js";
export { isFlipkartEmail, parseFlipkartEmail } from "./flipkart.js";
export { isZomatoEmail, parseZomatoEmail } from "./zomato.js";
export { isBlinkitEmail, parseBlinkitEmail } from "./blinkit.js";
