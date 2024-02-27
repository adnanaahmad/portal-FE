import { isValid, getMatches } from "driver-license-validator";

const dlnExtValidators = {
  AS: /^[A-Z]{2}\d{6}$/,
  GU: /^[A-Z]{1}\d{14}$/,
  MP: /^\d{9}$/,
  PR: /(^\d{9}$)|(^\d{5,7}$)/,
  VI: /(^[A-Z]{3}\d{7}$)|(^\d{10}$)/,
};

export const isDLNValidExt = (value, state) => {
  return state && state !== "UM"
    ? state in dlnExtValidators
      ? dlnExtValidators[state].test(value)
      : getMatches(value, { states: state })
    : isValid(value) ||
        Object.values(dlnExtValidators).some((r) => r.test(value));
};
