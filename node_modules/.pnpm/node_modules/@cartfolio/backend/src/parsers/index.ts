import type { Order } from "@cartfolio/shared";
import type { RawEmail } from "./types";
import { isAmazonEmail, parseAmazonEmail } from "./amazon";
import { isFlipkartEmail, parseFlipkartEmail } from "./flipkart";
import { isZomatoEmail, parseZomatoEmail } from "./zomato";
import { isBlinkitEmail, parseBlinkitEmail } from "./blinkit";

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

export { isAmazonEmail, parseAmazonEmail } from "./amazon";
export { isFlipkartEmail, parseFlipkartEmail } from "./flipkart";
export { isZomatoEmail, parseZomatoEmail } from "./zomato";
export { isBlinkitEmail, parseBlinkitEmail } from "./blinkit";
