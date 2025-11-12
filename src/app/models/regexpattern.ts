export const NAME_MAX = 60;
export const CITY_MAX = 60;
export const ADDRESS1_MAX = 120;
export const ADDRESS2_MAX = 80;
export const COMPANY_NAME_MAX = 150;
export const DESC_MAX = 255;
export const COUNTRY_MAX = 100;

export const COUNTRY_MIN = 5;
export const CITY_MIN = 5;          // e.g., “Eek”, “Yreka” → ok; blocks 1-char
export const ADDRESS1_MIN = 5;      // e.g., “5 Elm”, “12 Main St” → ok
export const ADDRESS2_MIN = 2;      // only if provided; “Apt 2”, “Unit B” → ok

export const COUNTRY_PATTERN = /^[A-Za-z\s.'\-&]+$/;
export const NAME_PATTERN = /^[A-Za-z]+( [A-Za-z]+)*$/;    
export const ADDRESS_PATTERN = /^[\p{L}\p{N}\s.'#\-/,]+$/u;               // words with single spaces
export const CITY_COUNTRY_PATTERN = /^[\p{L}\s.'\-]+$/u;          // letters + spaces, not empty
export const STATE_PATTERN = /^[A-Za-z]{2}$/;                             // e.g. TX, CA
export const ZIP5_PATTERN = /^[0-9]{5}$/;
export const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const US_PHONE_PATTERN = /^\(\d{3}\) \d{3}-\d{4}$/;                // (123) 456-7890
export const SSN_ITIN_PATTERN = /^[0-9]{3}-[0-9]{2}-[0-9]{4}$/;
export const EIN_PATTERN = /^\d{2}-\d{7}$/;
export const COMPANY_NAME_PATTERN = /^[A-Za-z0-9\s\-.'&,]+$/;             // letters/numbers/spaces/-.'&,
export const OTP_LENGTH = 6;

export const TRANSACTIONCODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{6,28}[A-Za-z0-9]$/;
export const AMOUNT_PATTERN = /^(?:(?:0|[1-9]\d*)(?:\.\d{1,2})?|(?:[1-9]\d{0,2}(?:,\d{3})+)(?:\.\d{1,2})?)$/;
export const TRADE_NAME = /^[A-Za-z0-9&.,' -]{2,100}$/;

