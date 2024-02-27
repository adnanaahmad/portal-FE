import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  FormInputComponent,
  FormSelectComponent,
} from "../../../../components";
import { DEMODATA } from "../../../../utils/Constant";
import Helper from "../../../../utils/Helper";
import InputMask from "react-input-mask";
import {
  handleMaskValueChange,
  datePattern,
  dateFormatChars,
} from "../../../../utils/InputMaskValidation";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    fillDemoData: state.global.fillDemoData,
  };
};

class PersonalInformation extends Component {
  constructor(props) {
    super(props);
    let data = Helper.fetchApplicantData(this.props, "personal_information");

    if (!data) {
      data = {
        first_name: "",
        middle_name: "",
        last_name: "",
        phone: "",
        email: "",
        ssn: "",
        dob: "",
        is_us_citizen: "",
        dl_number: "",
        state_issue: "",
        exp_date: "",
        show_ssn: false,
      };
    }

    this.state = data;
  }

  componentDidMount() {
    const firstNameField = document.getElementById("firstNameField");
    if (firstNameField) {
      firstNameField.focus();
    }
  }

  componentDidUpdate(prevProps) {
    const { fillDemoData } = this.props;
    if (!prevProps.fillDemoData && fillDemoData) {
      this.initValues();
    }
  }

  initValues() {
    const { fillDemoData } = this.props;
    const data = DEMODATA[fillDemoData] || {};
    this.setState(
      {
        first_name: data.first_name || "",
        middle_name: data.middle_name || "",
        last_name: data.last_name || "",
        phone: data.phone || "",
        email: data.email || "",
        ssn: data.ssn || "",
        dob: data.dob ? moment(data.dob).format("MM/DD/YYYY") : "",
        is_us_citizen: "yes",
        dl_number: data.dl_number || "",
        state_issue: data.state_issue || "",
        exp_date: data.exp_date
          ? moment(data.exp_date).format("MM/DD/YYYY")
          : "",
      },
      () => {
        this.setData();
      }
    );
  }

  setData() {
    const { onSetData } = this.props;
    const {
      first_name,
      middle_name,
      last_name,
      phone,
      email,
      ssn,
      dob,
      is_us_citizen,
      dl_number,
      state_issue,
      exp_date,
    } = this.state;
    if (onSetData) {
      onSetData("personal_information", {
        first_name,
        middle_name,
        last_name,
        phone,
        email,
        ssn: Helper.maskSSN(ssn)[2],
        dob,
        is_us_citizen,
        dl_number,
        state_issue,
        exp_date,
      });
    }
  }

  inputField(e, key) {
    let value = e.target.value;
    if (key === "dl_number" && value.charAt(0) === "-") {
      value = value.substring(1);
    }
    this.setState({ [key]: value }, () => {
      this.setData();
    });
  }

  setUSCitizen(is_us_citizen) {
    this.setState({ is_us_citizen }, () => {
      this.setData();
    });
  }

  getSSN() {
    const { ssn } = this.state;
    const temp = Helper.maskSSN(ssn);
    return temp[0];
  }

  getRawSSN() {
    const { ssn } = this.state;
    const temp = Helper.maskSSN(ssn);
    return temp[2];
  }

  renderDateOfBirth() {
    const { styles, renderErrorClass, renderValidationMessage } = this.props;
    const { dob } = this.state;

    return (
      <div className={styles[0].cFormRow}>
        {/* <FormInputComponent
          type="text"
          value={dob == "mm/dd/yyyy" ? "" : dob}
          required={true}
          height={0.1}
          hidden
        /> */}
        <InputMask
          className={`${styles[1].customFormControl} ${renderErrorClass(
            "personal_information.dob"
          )}`}
          alwaysShowMask={false}
          beforeMaskedStateChange={(value) =>
            handleMaskValueChange(value, "less")
          }
          mask={dob && datePattern}
          value={dob}
          onChange={(e) =>
            this.setState({ dob: e.target.value }, () => {
              this.setData();
            })
          }
          formatChars={dateFormatChars}
        />
        {renderValidationMessage("personal_information.dob", "mm/dd/yyyy")}
      </div>
    );
  }

  renderExpirationDate() {
    const { styles, renderErrorClass, renderValidationMessage } = this.props;
    const { exp_date } = this.state;

    return (
      <div className={styles[0].cFormRow}>
        {/* <FormInputComponent
          type="text"
          value={exp_date == "mm/dd/yyyy" ? "" : exp_date}
          required={true}
          height={0.1}
          hidden
        /> */}
        <InputMask
          className={`${styles[1].customFormControl} ${renderErrorClass(
            "personal_information.exp_date"
          )}`}
          alwaysShowMask={false}
          beforeMaskedStateChange={(value) => handleMaskValueChange(value)}
          mask={exp_date && datePattern}
          value={exp_date}
          onChange={(e) =>
            this.setState({ exp_date: e.target.value }, () => {
              this.setData();
            })
          }
          formatChars={dateFormatChars}
        />
        {renderValidationMessage("personal_information.exp_date", "mm/dd/yyyy")}
      </div>
    );
  }

  renderCitizenButtons() {
    const { styles, renderValidationMessage } = this.props;
    const { is_us_citizen } = this.state;

    return (
      <div className={styles[0].cInlineButtons}>
        <FormInputComponent
          type="text"
          value={is_us_citizen}
          hidden
        />
        {is_us_citizen == "yes" ? (
          <Fragment>
            <a
              className={[
                "btn btn-primary btn-small",
                styles[0].btnCInlineButtons,
              ].join(" ")}
            >
              Yes
            </a>
            <a
              className={[
                "btn btn-primary-outline btn-small",
                styles[0].btnCInlineButtons,
              ].join(" ")}
              onClick={() => this.setUSCitizen("no")}
            >
              No
            </a>
          </Fragment>
        ) : is_us_citizen == "no" ? (
          <Fragment>
            <a
              className={[
                "btn btn-primary-outline btn-small",
                styles[0].btnCInlineButtons,
              ].join(" ")}
              onClick={() => this.setUSCitizen("yes")}
            >
              Yes
            </a>
            <a
              className={[
                "btn btn-primary btn-small",
                styles[0].btnCInlineButtons,
              ].join(" ")}
            >
              No
            </a>
          </Fragment>
        ) : (
          <Fragment>
            <a
              className={[
                "btn btn-primary-outline btn-small",
                styles[0].btnCInlineButtons,
              ].join(" ")}
              onClick={() => this.setUSCitizen("yes")}
            >
              Yes
            </a>
            <a
              className={[
                "btn btn-primary-outline btn-small",
                styles[0].btnCInlineButtons,
              ].join(" ")}
              onClick={() => this.setUSCitizen("no")}
            >
              No
            </a>
          </Fragment>
        )}
        {renderValidationMessage("personal_information.is_us_citizen")}
      </div>
    );
  }

  // Preview Content
  renderPreviewContent() {
    const { styles } = this.props;
    const {
      first_name,
      middle_name,
      last_name,
      phone,
      email,
      dob,
      dl_number,
      state_issue,
      exp_date,
      is_us_citizen,
      ssn,
      show_ssn,
    } = this.state;

    return (
      <Fragment>
        <div className={styles[0].cDataRow}>
          <label>First Name</label>
          <span>{first_name}</span>
        </div>
        <div className={styles[0].cDataRow}>
          <label>Middle Name</label>
          <span>{middle_name}</span>
        </div>
        <div className={styles[0].cDataRow}>
          <label>Last Name</label>
          <span>{last_name}</span>
        </div>
        <div className={styles[0].cDataRow}>
          <label>Phone Number</label>
          <span>{phone}</span>
        </div>
        <div className={[styles[0].cDataRow, "mb-3"].join(" ")}>
          <label>Email Address</label>
          <span>{email}</span>
        </div>
        <div className="spacer mb-3"></div>
        <div className={[styles[0].cDataRow, "align-items-center"].join(" ")}>
          <label>Social Security Number</label>
          <span>
            {show_ssn ? Helper.maskSSN(ssn)[2] : Helper.maskSSN(ssn)[1]}
          </span>
          <a
            className={["ml-4", styles[0].cDataRowLink].join(" ")}
            onMouseDown={() => this.setState({ show_ssn: true })}
            onMouseUp={() => this.setState({ show_ssn: false })}
          >
            <img
              src={`/${show_ssn ? "eye-visible" : "eye-invisible"}.png`}
              alt="visibility"
              width={20}
              height={20}
            />
          </a>
        </div>
        <div className={styles[0].cDataRow}>
          <label>Date of Birth</label>
          <span>{moment(dob).format("YYYY-MM-DD")}</span>
        </div>
        <div className={styles[0].cDataRow}>
          <label>Are you a U.S. citizen?</label>
          <span>{is_us_citizen == "yes" ? "Yes" : "No"}</span>
        </div>
        <div className={styles[0].cDataRow}>
          <label>Driver’s License Number</label>
          <span>{dl_number}</span>
        </div>
        <div className={styles[0].cDataRow}>
          <label>State of Issue</label>
          <span>{state_issue}</span>
        </div>
        <div className={[styles[0].cDataRow, "mb-3"].join(" ")}>
          <label>Expiration Date</label>
          <span>{moment(exp_date).format("YYYY-MM-DD")}</span>
        </div>
      </Fragment>
    );
  }

  // Edit Content
  renderEditContent() {
    const {
      styles,
      renderValidationMessage,
      renderErrorClass,
      personalRef,
      errors,
    } = this.props;
    const {
      first_name,
      middle_name,
      last_name,
      phone,
      email,
      dl_number,
      state_issue,
      show_ssn,
    } = this.state;

    return (
      <Fragment>
        <div className="row" ref={personalRef}>
          <div className="col-md-4">
            <div className={styles[0].cFormRow}>
              <label>First Name</label>
              <FormInputComponent
                id="firstNameField"
                type="text"
                value={first_name}
                onChange={(e) => this.inputField(e, "first_name")}
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "personal_information.first_name"
                )}
              />
              {renderValidationMessage("personal_information.first_name")}
            </div>
          </div>
          <div className="col-md-4">
            <div className={styles[0].cFormRow}>
              <label>Middle Name</label>
              <FormInputComponent
                type="text"
                value={middle_name}
                onChange={(e) => this.inputField(e, "middle_name")}
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "personal_information.middle_name"
                )}
              />
              {renderValidationMessage(
                "personal_information.middle_name",
                "Optional"
              )}
            </div>
          </div>
          <div className="col-md-4">
            <div className={styles[0].cFormRow}>
              <label>Last Name</label>
              <FormInputComponent
                type="text"
                value={last_name}
                onChange={(e) => this.inputField(e, "last_name")}
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "personal_information.last_name"
                )}
              />
              {renderValidationMessage("personal_information.last_name")}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <div className={styles[0].cFormRow}>
              <label>Phone Number</label>
              <FormInputComponent
                type="text"
                value={phone}
                onChange={(e) => this.inputField(e, "phone")}
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "personal_information.phone"
                )}
              />
              {errors &&
              errors.personal_information &&
              errors.personal_information.phone ? (
                <p
                  className={styles[0].errorMessage}
                >{`${errors.personal_information.phone}`}</p>
              ) : (
                <span>
                  <span className="small">(</span>xxx
                  <span className="small">)</span> xxx-xxxx
                </span>
              )}
            </div>
          </div>
          <div className="col-md-8">
            <div className={styles[0].cFormRow}>
              <label>Email Address</label>
              <FormInputComponent
                type="text"
                value={email}
                onChange={(e) => this.inputField(e, "email")}
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "personal_information.email"
                )}
              />
              {renderValidationMessage("personal_information.email")}
            </div>
          </div>
        </div>
        <div className="spacer mb-4"></div>
        <div className="row">
          <div className="col-md-4">
            <div className={styles[0].cFormRow}>
              <label>Social Security Number</label>
              <div className="d-flex">
                <FormInputComponent
                  type="text"
                  value={show_ssn ? this.getRawSSN() : this.getSSN()}
                  onChange={(e) => this.inputField(e, "ssn")}
                  disableAutoComplete
                  icon=""
                  additionalClassName={renderErrorClass(
                    "personal_information.ssn"
                  )}
                />
                <a
                  className={["ml-1", styles[0].cFormRowLink].join(" ")}
                  onClick={() => this.setState({ show_ssn: !show_ssn })}
                >
                  <img
                    src={`/${show_ssn ? "eye-visible" : "eye-invisible"}.png`}
                    alt="visibility"
                    width={20}
                    height={20}
                  />
                </a>
                {renderValidationMessage("personal_information.ssn")}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className={styles[0].cFormRow}>
              <label>Date of Birth</label>
              {this.renderDateOfBirth()}
            </div>
          </div>
          <div className="col-md-4">
            <div className={styles[0].cFormRow}>
              <label>Are you a U.S. citizen?</label>
              {this.renderCitizenButtons()}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <div className={styles[0].cFormRow}>
              <label>Driver’s License Number</label>
              <FormInputComponent
                type="text"
                value={dl_number}
                onChange={(e) => this.inputField(e, "dl_number")}
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "personal_information.dl_number"
                )}
              />
              {renderValidationMessage("personal_information.dl_number")}
            </div>
          </div>
          <div className="col-md-4">
            <div className={styles[0].cFormRow}>
              <label>State of Issue</label>
              <FormSelectComponent
                value={state_issue}
                onChange={(e) => this.inputField(e, "state_issue")}
                onKeyDown={(e) => this.props.onOptionSelected(e)}
                options={Helper.getStateOptions()}
                placeholder="Select a State"
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "personal_information.state_issue"
                )}
              />
              {renderValidationMessage("personal_information.state_issue")}
            </div>
          </div>
          <div className="col-md-3">
            <div className={styles[0].cFormRow}>
              <label>Expiration Date</label>
              {this.renderExpirationDate()}
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

  render() {
    const { styles } = this.props;
    const { preview } = this.props;

    return (
      <div className={styles[0].cRow}>
        <div className={styles[0].cRowLabel}>
          <label>Personal Information</label>
        </div>
        {/* .c-row-label */}
        <div className={styles[0].cRowContent}>
          {preview ? this.renderPreviewContent() : this.renderEditContent()}
          <div className="spacer"></div>
        </div>
        {/* .c-row-content */}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(PersonalInformation));
