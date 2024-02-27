/* eslint-disable prettier/prettier */
import moment from "moment";
import {
  emailRegex,
  nameRegex,
  phoneRegex,
  ssnRegex,
  streetAddressRegex,
  cityRegex,
  zipRegex,
  jobTitleRegex,
  employerNameRegex,
  aptSuiteNumberRegex,
  bankNameRegex
} from "./Regex";
import { isDLNValidExt } from './dln-validator';
import Helper from "./Helper";

// validation json for all fields
const validationRequirements = [
  {
    section: { key: "loan_information", field: "request_amount" },
    validate: (value) => value > 500,
    error: "Minimum value is 500",
  },
  {
    section: { key: "loan_information", field: "purpose" },
  },
  {
    section: { key: "personal_information", field: "first_name" },
    regex: nameRegex,
    error: "Letters, dashes, apostrophe and space only",
  },
  {
    section: { key: "personal_information", field: "middle_name" },
    regex: nameRegex,
    error: "Letters, dashes, apostrophe and space only",
    optional: true
  },
  {
    section: { key: "personal_information", field: "last_name" },
    regex: nameRegex,
    error: "Letters, dashes, apostrophe and space only",
  },
  {
    section: { key: "personal_information", field: "phone" },
    regex: phoneRegex,
    error: "Phone format is not correct",
  },
  {
    section: { key: "personal_information", field: "email" },
    regex: emailRegex,
    error: "Email is not valid",
  },
  {
    section: { key: "personal_information", field: "ssn" },
    regex: ssnRegex,
    error: "SSN is not valid",
  },
  {
    section: { key: "personal_information", field: "dob" },
    validate: (value) => {
      const parsed = moment(value, "MM/DD/YYYY", true);
      const age = moment().diff(moment(parsed), "years");
      return parsed.isValid() && age >= 18 && age <= 100;
    },
    error: "DOB is not valid.",
  },
  {
    section: { key: "personal_information", field: "is_us_citizen" },
  },
  {
    section: { key: "personal_information", field: "dl_number" },
    validate: (value, state) => isDLNValidExt(value, state),
    error: "Driver Licence is not valid",
  },
  {
    section: { key: "personal_information", field: "state_issue" },
  },
  {
    section: { key: "personal_information", field: "exp_date" },
    validate: (value) => {
      const parsed = moment(value, "MM/DD/YYYY", true);
      return parsed.isValid();
    },
    error: "Expiry date is not valid",
  },
  {
    section: { key: "residential_address", field: "address" },
    regex: streetAddressRegex,
    error: "Address is not valid.",
  },
  {
    section: { key: "residential_address", field: "address_option" },
    regex: aptSuiteNumberRegex,
    error: "Apt Suite Number is not valid.",
    optional: true,
  },
  {
    section: { key: "residential_address", field: "city" },
    regex: cityRegex,
    error: "City is not valid.",
  },
  {
    section: { key: "residential_address", field: "state" },
  },
  {
    section: { key: "residential_address", field: "zip" },
    regex: zipRegex,
    error: "Zip is not valid.",
  },
  {
    section: { key: "residential_address", field: "year_live_period" },
  },
  {
    section: { key: "residential_address", field: "month_live_period" },
  },
  {
    section: { key: "residential_address", field: "property_use_type" },
  },
  {
    section: { key: "residential_address", field: "monthly_rent" },
    validate: (value) => value > 0,
    error: "Rent should be greater than 0.",
  },
  {
    section: { key: "residential_address", field: "mortgage" },
    validate: (value) => value > 0,
    error: "Mortgage should be greater than 0.",
  },
  {
    section: { key: "residential_address", field: "note" },
  },
  {
    section: { key: "former_address", field: "address" },
    regex: streetAddressRegex,
    error: "Address is not valid.",
  },
  {
    section: { key: "former_address", field: "address_option" },
    regex: aptSuiteNumberRegex,
    error: "Apt Suite Number is not valid.",
    optional: true,
  },
  {
    section: { key: "former_address", field: "city" },
    regex: cityRegex,
    error: "City is not valid.",
  },
  {
    section: { key: "former_address", field: "state" },
  },
  {
    section: { key: "former_address", field: "zip" },
    regex: zipRegex,
    error: "Zip is not valid.",
  },
  {
    section: { key: "former_address", field: "year_live_period" },
  },
  {
    section: { key: "former_address", field: "month_live_period" },
  },
  {
    section: { key: "employment_information", field: "status" },
  },
  {
    section: { key: "employment_information", field: "name" },
    regex: employerNameRegex,
    error: "Job title is not valid.",
  },
  {
    section: { key: "employment_information", field: "phone" },
    regex: phoneRegex,
    error: "Phone is not valid.",
  },
  {
    section: { key: "employment_information", field: "job_title" },
    regex: jobTitleRegex,
    error: "Field is required",
  },
  {
    section: { key: "employment_information", field: "year_length" },
  },
  {
    section: { key: "employment_information", field: "month_length" },
  },
  {
    section: { key: "employment_information", field: "address" },
    regex: streetAddressRegex,
    error: "Address is not valid.",
  },
  {
    section: { key: "employment_information", field: "address_option" },
    regex: aptSuiteNumberRegex,
    error: "Apt Suite Number is not valid.",
    optional: true,
  },
  {
    section: { key: "employment_information", field: "city" },
    regex: cityRegex,
    error: "City is not valid.",
  },
  {
    section: { key: "employment_information", field: "state" },
  },
  {
    section: { key: "employment_information", field: "zip" },
    regex: zipRegex,
    error: "Zip is not valid.",
  },
  {
    section: { key: "income_information", field: "income_type" },
  },
  {
    section: { key: "income_information", field: "annual_income" },
  },
  {
    section: { key: "income_information", field: "household_income" },
    validate: (value, annual_income) => Number(value) >= Number(annual_income),
    error: "Should be greater than or equal to Individual Gross Annual Income.",
  },
  {
    section: { key: "income_information", field: "net_income" },
  },
  {
    section: { key: "bank_information", field: "bank_name" },
    regex: bankNameRegex,
    error: "Bank name is not valid.",
  },
  {
    section: { key: "bank_information", field: "account_type" },
  },
  {
    section: { key: "bank_information", field: "cash_advance" },
  },
  {
    section: { key: "business_information", field: "business_type" },
  },
  {
    section: { key: "business_information", field: "owner_type" },
  },
  {
    section: { key: "business_information", field: "company" },
  },
  {
    section: { key: "business_information", field: "phone" },
    regex: phoneRegex,
    error: "Phone format is not correct",
  },
  {
    section: { key: "business_information", field: "address" },
    regex: streetAddressRegex,
    error: "Address is not valid.",
  },
  {
    section: { key: "business_information", field: "address_option" },
    regex: aptSuiteNumberRegex,
    error: "Apt Suite Number is not valid.",
    optional: true,
  },
  {
    section: { key: "business_information", field: "city" },
    regex: cityRegex,
    error: "City is not valid.",
  },
  {
    section: { key: "business_information", field: "state" },
  },
  {
    section: { key: "business_information", field: "zip" },
    regex: zipRegex,
    error: "Zip is not valid.",
  },
  {
    section: { key: "business_information", field: "federal_number_type" },
  },
  {
    section: { key: "business_information", field: "federal_number" },
    validate: (value) => value !== "",
    error: "Field is required",
  },
  {
    section: { key: "business_information", field: "date_established" },
    validate: (value) => {
      const from = moment("1900", "YYYY");
      const to = moment();
      const parsed = moment(value, "MM/DD/YYYY", true);
      const withinBounds = (from.diff(moment(parsed)) <= 0) && (to.diff(moment(parsed)) >= 0);
      return (parsed.isValid() && withinBounds)
    },
    error: "Date is not valid.",
  },
  {
    section: { key: "business_information", field: "registration_state" },
    validate: (value) => value !== "",
    error: "Field is required",
  },
];

// main validation function
export const checkValidationErrors = (state, singleField = false) => {
  const errorsList = {};
  let section = "";
  let checkValue = "";

  for (const requirement of validationRequirements) {
    const key = requirement.section.key;
    const field = requirement.section.field;
    let value = state[key] && state[key][field];
    if(singleField && singleField != key) {
      continue;
    }    

    const coAppCount = Helper.fetchApplicants().length;
    // if section is loan information and loan type is credit card or we are filling co-applicant
    // form then we wont iterate loan information errors.
    if (key === 'loan_information' && ((state.type === "Credit Card") || (state.is_coapplicant === "yes" && coAppCount > 0))) {
      continue;
    }
    // if employment status is set and is employed then we will iterate employment errors
    if (key === 'employment_information' &&
      field != "status" &&
      (state.employment_information.status === undefined ||
        state.employment_information.status === "Unemployed")) {
      continue;
    }
    // if income type is set and is employed then we will iterate income errors
    if (key === 'income_information' &&
      field != "income_type" &&
      (state.income_information.income_type === undefined ||
        state.income_information.income_type === "Unemployed")) {
      continue;
    }
    // if in residential address live period is set and is less than 24 months
    // then we will iterate employment errors
    if (key === 'former_address') {
      if (state.residential_address.live_period === "" ||
        state.residential_address.live_period === undefined) {
        continue;
      }
      const livePeriod = Number(state.residential_address.live_period);
      if (!isNaN(livePeriod) && livePeriod >= 24) {
        continue;
      }
    }

    // Residential info rent validation for own and note
    if (key === 'residential_address') {
      const propertyUseType = state.residential_address.property_use_type;
      if (field === "monthly_rent" && (propertyUseType === "own" || propertyUseType === "other")) {
        continue;
      } else if (field === "mortgage" && ((propertyUseType === "rent" || propertyUseType === "other") || (state.residential_address.is_fully_own && propertyUseType === "own"))) {
        continue;
      } else if (field === "note" && (propertyUseType === "own" || propertyUseType === "rent")) {
        continue;
      }
    }

    // if its a business application 
    // and federal number type is ssn then we wont validate federal number field
    // and if we are filling co-applicant form then we wont iterate business errors.
    if (key === 'business_information') {
      if (state.type !== "Small Business Loan" ||
      (field === "federal_number" && state.business_information.federal_number_type === "ssn")) {
        continue;
      }
      if (state.is_coapplicant === "yes" && coAppCount > 0) {
        continue;
      }
    }
    // check value variable is defined to pass a second variable to validate function
    // to validate driver licence we need state same for house hold income 
    // annual income is required
    if (key === 'income_information' &&
      field === "household_income") {
      checkValue = state.income_information.annual_income
    } else if (key === 'personal_information' &&
      field === "dl_number") {
      checkValue = state.personal_information.state_issue
    }
    // if optional field is empty then we wont validate it
    if (requirement.optional && (value === "" || value === null || value === undefined)) {
      continue;
    }
    // check for empty or undefined errors
    if (value === "" || value === null || value === undefined) {
      errorsList[key] = { ...errorsList[key], ...{ [field]: "Field is required." } };
      if (section === "") section = key;
      // check for regex based errors
    } else if ("regex" in requirement && !requirement.regex.test(value)) {
      errorsList[key] = { ...errorsList[key], ...{ [field]: requirement.error } };
      if (section === "") section = key;
      // check for validate functional errors
    } else if ("validate" in requirement && !requirement.validate(value, checkValue)) {
      errorsList[key] = { ...errorsList[key], ...{ [field]: requirement.error } };
      if (section === "") section = key;
    }
  }
  return { errorsList, ref: getReference(section) };
};

// return the reference to get the error section
const getReference = (key) => {
  if (key === "loan_information") {
    return "loanInformationRef";
  } else if (key === "personal_information") {
    return "personalInformationRef";
  } else if (key === "residential_address") {
    return "residentialInformationRef";
  } else if (key === "former_address") {
    return "formerInformationRef";
  } else if (key === "employment_information") {
    return "employmentInformationRef";
  } else if (key === "income_information") {
    return "incomeInformationRef";
  } else if (key === "bank_information") {
    return "bankInformationRef";
  } else if (key === "business_information") {
    return "bankInformationRef";
  }
};

// return class for error section
export const getClasses = (field, styles) => {
  let classes;
  if (
    [
      "request_amount",
      "annual_income",
      "household_income",
      "net_income",
    ].includes(field)
  ) {
    classes = `${styles.errorMessage} ${styles.pl18}`;
  } else if (field === "monthly_rent" || field === "mortgage") {
    classes = `${styles.errorMessageWrap} ${styles.pl18}`;
  } else if (field === "federal_number") {
    classes = `${styles.errorMessageWrap}`;
  } else if (field === "note") {
    classes = `${styles.errorMessageWrap} ${styles.pl7}`;
  } else {
    classes = `${styles.errorMessage}`;
  }
  return classes;
}
