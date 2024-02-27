/* eslint-disable no-useless-escape */
const USER_KEY = "@fortifid_main_user";
const APPTYPE_KEY = "@fortifid_app_type";
const APPLICANTS_KEY = "@fortifid_applicants";

import { createApplication } from "../utils/Thunk";
import moment from "moment";
import { STATELIST } from "./Constant";

var ssnBuffer;
var einBuffer;

String.prototype.replaceAt = function (index, character) {
  return (
    this.substr(0, index) + character + this.substr(index + character.length)
  );
};

class Helper {
  // Generate Random Int
  static generateRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  static stripOrgId(appId, orgId) {
    if (!appId || typeof orgId === "undefined") {
      return appId;
    }
    try {
      let parts = appId.split(".");
      if (parts.length === 5) {
        parts.shift();
        return parts.join(".");
      }
    } catch (error) {
      //
    }
    return appId;

    // let org = (orgId + "").padStart(4, "0") + ".";

    // if (appId.startsWith(org)) {
    //   return appId.substr(5);
    // }
    // return appId;
  }

  static makeAppId(length) {
    let result = "";
    const characters =
      "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  static saveApplication(index, props, onComplete) {
    const applicant = this.fetchApplicant(index);
    if (!applicant) {
      if (onComplete) {
        onComplete();
        return;
      }
    }
    const {
      type,
      loan_information,
      personal_information,
      residential_address,
      former_address,
      employment_information,
      income_information,
      bank_information,
      business_information,
    } = applicant;

    const params = {
      type,
      loan_information,
      personal_information,
      residential_address,
      former_address,
      employment_information,
      income_information,
      bank_information,
      business_information,
      main_app_id: 0,
      app_index: index,
      app_status: 0,
    };

    if (this.fetchApplicants().length === 1) {
      delete params.main_app_id;
      delete params.app_status;
      delete params.app_index;
    } else {
      if (index > 0) {
        const temp = this.fetchApplicant(0);
        if (temp) {
          params.main_app_id = temp.id;
          params.type = temp.type;
          params.loan_information = temp.loan_information;
          params.business_information = temp.business_information;
        }
      }
    }

    props.dispatch(
      createApplication(
        params,
        () => {
          //props.dispatch(showCanvas());
        },
        (res) => {
          //props.dispatch(hideCanvas());
          if (onComplete) {
            onComplete(res);
          }
        }
      )
    );
  }

  // Get File Extension
  static getFileEXT(string) {
    const temp = string.split(".");
    const ext = temp[temp.length - 1].toLowerCase();
    return ext;
  }

  static getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Validate Email
  static validateEmail(value) {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value.toLowerCase());
  }

  // Valdiate Phone
  static validatePhoneNumber(value) {
    const regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return regex.test(value);
  }

  // Please use a password with at least 8 characters including at least one number, one letter and one symbol
  static checkPassword(password) {
    if (password.length < 8) return false;

    let re = /[0-9]/;
    if (!re.test(password)) return false;

    re = /[A-Z]/;
    if (!re.test(password)) return false;

    re = /[a-z]/;
    if (!re.test(password)) return false;

    re = /(?=.*[.,=+;:\_\-?()\[\]<>{}!@#$%^&*])^[^'"]*$/;

    if (!re.test(password)) return false;

    return true;
  }

  static getIndex(props) {
    let index = props.index;
    if (typeof index === "number") {
      return index;
    }
    return -1;
  }

  // Store User
  static storeUser(userData) {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }

  // Remove User
  static removeUser() {
    localStorage.removeItem(USER_KEY);
  }

  // Fetch User
  static fetchUser() {
    const jsonData = localStorage.getItem(USER_KEY);
    if (jsonData) return JSON.parse(jsonData);
    return {};
  }

  //TODO: Maybe session storage or props or ?
  static storeApplicants(applicants) {
    if (!applicants || !Array.isArray(applicants)) {
      applicants = [];
    }
    sessionStorage.setItem(APPLICANTS_KEY, JSON.stringify(applicants));
  }

  static removeApplicants() {
    sessionStorage.removeItem(APPLICANTS_KEY);
  }

  static fetchApplicants() {
    try {
      const jsonData = sessionStorage.getItem(APPLICANTS_KEY);

      if (jsonData) return JSON.parse(jsonData);
    } catch (error) {
      //
    }
    return [];
  }

  static fetchApplicant(index) {
    try {
      const applicants = this.fetchApplicants();
      if (index < applicants.length) return applicants[index];
    } catch (error) {
      //
    }
  }

  static getParamIndex(props) {
    const {
      match: { params },
    } = props;

    let index = params.index;

    if (typeof index !== "undefined") {
      return parseInt(index);
    }
    return -1;
  }

  static fetchApplicantData(props, section) {
    let index = this.getParamIndex(props);
    if (index > -1) {
      let temp = Helper.fetchApplicant(index);
      if (temp) {
        let data = temp[section];
        if (data) {
          data.index = index;
          return data;
        }
      }
    }
  }

  static updateApplicant(applicant, index) {
    const applicants = this.fetchApplicants();
    if (index > -1) {
      applicants[index] = applicant;
    } else {
      applicants.push(applicant);
    }
    this.storeApplicants(applicants);
  }

  static removeApplicant(index) {
    const applicants = this.fetchApplicants();
    if (typeof index !== "undefined" && !isNaN(index) && index > -1) {
      applicants.splice(index, 1);
      this.storeApplicants(applicants);
    }
  }

  // Store Application Type
  static storeAppType(type) {
    localStorage.setItem(APPTYPE_KEY, type);
  }

  static removeAppType() {
    localStorage.removeItem(APPTYPE_KEY);
  }

  // Fetch Application Type
  static fetchAppType() {
    const type = localStorage.getItem(APPTYPE_KEY);
    return type || "Credit Card";
  }

  // Adjust Numeric String
  static adjustNumericString(string, digit = 0) {
    if (isNaN(string) || string.trim() == "") return "";
    const temp = string.split(".");
    if (temp.length > 1) {
      const suffix = temp[1].substr(0, digit);
      return `${temp[0]}.${suffix}`;
    } else return string;
  }

  // Validate IP Address
  static validateIPAddress(ipAddress) {
    if (
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
        ipAddress
      )
    )
      return true;
    return false;
  }

  // Format String to Float String
  static formatNumber(string) {
    if (typeof string === "undefined") {
      return "";
    }
    string = string.toString().replaceAll(",", "");
    if (isNaN(string) || string.trim() == "") return "";
    const temp = string.split(".");
    if (temp.length > 1)
      return (
        new Intl.NumberFormat("en-US").format(parseInt(temp[0])) + "." + temp[1]
      );
    return new Intl.NumberFormat("en-US").format(parseInt(string));
  }

  // Formatting String to Remove Decimal
  static formatNumber2(string) {
    string = string.toString().replaceAll(",", "");
    if (isNaN(string) || string.trim() == "") return "";
    const temp = string.split(".");
    if (temp.length > 1)
      return new Intl.NumberFormat("en-US").format(parseInt(temp[0]));
    return new Intl.NumberFormat("en-US").format(parseInt(string));
  }

  // Unformat Float String
  static unformatNumber(string) {
    return string.toString().replaceAll(",", "");
  }

  // Mask EIN
  static maskEIN(res) {
    const transformDisplay = (val) => {
      // Strip all non numbers
      if (typeof val !== "string") {
        return val;
      }

      let displayVal = val.replace(/[^0-9|\\*]/g, "");
      displayVal = displayVal.substr(0, 9);

      // Inject dashes
      if (displayVal.length >= 3)
        displayVal = displayVal.slice(0, 2) + "-" + displayVal.slice(2);

      // Replace all numbers with astericks
      //displayVal = displayVal.replace(/[0-9]/g, "*");
      if (displayVal.length > 0 && displayVal.length < 10) {
        displayVal = `${displayVal
          .slice(0, -1)
          .replace(/[0-9]/g, "*")}${displayVal.slice(-1)}`;
      } else {
        displayVal = displayVal.replace(/[0-9]/g, "*");
      }

      return displayVal;
    };

    const transformValue = (val) => {
      if (typeof einBuffer !== "string") einBuffer = "";
      if (!val) {
        einBuffer = null;
        return;
      }

      let cleanVal = val.replace(/[^0-9|\\*]/g, "");
      cleanVal = cleanVal.substr(0, 9);

      for (let i = 0, l = cleanVal.length; i < l; i++) {
        if (/[0-9]/g.exec(cleanVal[i])) {
          einBuffer = einBuffer.replaceAt(i, cleanVal[i]);
        }
      }

      einBuffer = einBuffer.substr(0, cleanVal.length);
    };

    const displayVal = transformDisplay(res);
    transformValue(res);

    let formatedEIN = einBuffer;

    // Inject dashes
    if (formatedEIN?.length >= 3)
      formatedEIN = formatedEIN.slice(0, 2) + "-" + formatedEIN.slice(2);

    return [displayVal, einBuffer, formatedEIN];
  }

  // Mask SSN
  static maskSSN(res) {
    const transformDisplay = (val) => {
      if (typeof val !== "string") {
        return val;
      }

      // Strip all non numbers
      let displayVal = val.replace(/[^0-9|\\*]/g, "");
      displayVal = displayVal.substr(0, 9);

      // Replace all numbers with astericks
      if (displayVal.length > 0 && displayVal.length < 9) {
        displayVal = `${displayVal
          .slice(0, -1)
          .replace(/[0-9]/g, "*")}${displayVal.slice(-1)}`;
      } else {
        displayVal = displayVal.replace(/[0-9]/g, "*");
      }

      displayVal = this.formateSSN(displayVal);
      return displayVal;
    };

    const transformValue = (val) => {
      if (typeof ssnBuffer !== "string") ssnBuffer = "";
      if (!val) {
        ssnBuffer = null;
        return;
      }

      let cleanVal = val.replace(/[^0-9|\\*]/g, "");
      cleanVal = cleanVal.substr(0, 9);

      for (let i = 0, l = cleanVal.length; i < l; i++) {
        if (/[0-9]/g.exec(cleanVal[i])) {
          ssnBuffer = ssnBuffer.replaceAt(i, cleanVal[i]);
        }
      }

      ssnBuffer = ssnBuffer.substr(0, cleanVal.length);
    };

    const displayVal = transformDisplay(res);
    transformValue(res);

    // replace last 4 digits with asterisk
    let ssnBufferMask = ssnBuffer;
    if (ssnBuffer?.length >= 9) {
      ssnBufferMask = `${ssnBuffer
        .slice(0, ssnBuffer.length - 4)
        .replace(/[0-9]/g, "*")}${ssnBuffer.slice(ssnBuffer.length - 4)}`;
    }

    const formatedSSN = this.formateSSN(ssnBuffer);

    return [displayVal, ssnBufferMask, formatedSSN];
  }

  // mask dob
  static maskDOB(res) {
    let formattedDOB = moment(res).format("MM/DD/YYYY");
    let maskedDOB = formattedDOB.replace(/\d{2}\/\d{2}\/\d{4}/g, "**/**/****");
    return [res, maskedDOB, formattedDOB];
  }

  static formateSSN(res) {
    let formatedSSN = res;
    if (formatedSSN?.length >= 4)
      formatedSSN = formatedSSN.slice(0, 3) + "-" + formatedSSN.slice(3);

    if (formatedSSN?.length >= 7)
      formatedSSN = formatedSSN.slice(0, 6) + "-" + formatedSSN.slice(6);

    return formatedSSN;
  }

  // Consumer Insights
  static getConsumerInsightsStatus(application) {
    const { consumer_insights, mfa, doc_verify } = application;
    let action = "required";

    let consumer_insights_result = "Action Required";
    let mfa_result = "Action Required";
    let doc_verify_result = "Action Required";
    if (consumer_insights && consumer_insights.result) {
      if (["Not-Verified", "Error"].includes(consumer_insights.result)) {
        consumer_insights_result = "Not Verified";
      } else if (
        ["Needs-Review", "Insufficent-Info"].includes(consumer_insights.result)
      ) {
        consumer_insights_result = "Needs Review";
      } else {
        consumer_insights_result = "Verified";
      }
    }

    if (mfa && mfa.result) {
      if (mfa.result == "Authenticated") mfa_result = "Verified";
      else mfa_result = "Not Verified";
    }

    if (doc_verify && doc_verify.result) {
      if (doc_verify.result == "Authenticated") doc_verify_result = "Verified";
      else doc_verify_result = "Not Verified";
    }

    if (
      consumer_insights_result == "Verified" &&
      mfa_result == "Verified" &&
      doc_verify_result == "Verified"
    ) {
      action = "verified";
    } else if (consumer_insights_result == "Needs Review") {
      action = "needs review";
    } else if (
      consumer_insights_result == "Not Verified" ||
      mfa_result == "Not Verified" ||
      doc_verify_result == "Not Verified"
    ) {
      action = "not verified";
    }

    if (action === "required" && application.purged_at !== null) {
      action = "expired";
    }

    return action;
  }

  // Income Insights
  static getIncomeInsightsStatus(application) {
    const { income_insights } = application;
    let action = "required";
    //if (this.getConsumerInsightsStatus(application) != "not verified") {
    if (income_insights && income_insights.result) {
      if (income_insights.result == "Verified") {
        action = "verified";
      } else if (
        ["Not Verified", "Not-Verified"].includes(income_insights.result)
      ) {
        action = "not verified";
      } else if (
        ["Insufficient-Info", "Needs-Review"].includes(income_insights.result)
      ) {
        action = "needs review";
      }
    }
    //} else {
    //action = "-";
    //}

    if (action === "required" && application.purged_at !== null) {
      action = "expired";
    }

    return action;
  }

  // Business Insights
  static getBusinessInsightsStatus(application) {
    if (application.type != "Small Business Loan") return "-";
    const { business_insights } = application;
    let action = "required";
    //TODO!
    // if (
    //   this.getIncomeInsightsStatus(application) != "not verified" &&
    //   this.getConsumerInsightsStatus(application) != "not verified"
    // ) {
    if (business_insights && business_insights.result) {
      if (business_insights.result == "Verified") {
        action = "verified";
      } else if (
        ["Not Verified", "Not-Verified"].includes(business_insights.result)
      ) {
        action = "not verified";
      } else if (
        ["Insufficient-Info", "Needs-Review"].includes(business_insights.result)
      ) {
        action = "needs review";
      }
    }
    // } else {
    //   action = "-";
    // }
    if (action === "required" && application.purged_at !== null) {
      action = "expired";
    }

    return action;
  }

  static mapObject(obj, fn) {

    const result = {};
    for (const prop in obj) {
      result[prop] = fn(obj[prop], prop);
    }
    return result;

  }

  static getStateOptions() {
    const options = {};
    STATELIST.forEach((state) => {
      options[state] = state;
    });
    return options;
  }

  static camelCaseToSpaces(str) {
    var spacedStr = str.replace(/([a-z])([A-Z])/g, "$1 $2");
    return spacedStr;
  }

  static formatString(inputString) {
    var formattedString = inputString
      .replace(/[^\w\s]|_/g, " ")
      .replace(/\s+/g, " ");
    formattedString =
      formattedString.charAt(0).toUpperCase() + formattedString.slice(1);
    return formattedString;
  }
}

export default Helper;
