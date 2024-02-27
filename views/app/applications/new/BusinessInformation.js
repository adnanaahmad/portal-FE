/* eslint-disable no-undef */
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  FormInputComponent,
  FormSelectComponent,
} from "../../../../components";
import {
  BUSINESSTYPES,
  OWNERTYPES,
  STATELIST,
} from "../../../../utils/Constant";
import Helper from "../../../../utils/Helper";
import InputMask from "react-input-mask";
import {
  handleMaskValueChange,
  datePattern,
  dateFormatChars,
} from "../../../../utils/InputMaskValidation";

const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    fillDemoData: state.global.fillDemoData,
    index: Helper.getIndex(state.global),
  };
};

class BusinessInformation extends Component {
  constructor(props) {
    super(props);
    //let data = Helper.fetchApplicantData(this.props, "business_information");
    let primary = Helper.fetchApplicant(0);
    let data;
    if (primary) {
      data = primary.business_information;
    }

    if (!data) {
      data = {
        business_type: "",
        owner_type: "",
        company: "",
        business_identity: "",
        phone: "",
        website: "",
        address: "",
        address_option: "",
        city: "",
        state: "",
        zip: "",
        federal_number_type: "",
        federal_number: "",
        ssn_number: "",
        date_established: "",
        registration_state: "",
        show_ssn: false,
        show_ein: false,
      };
    }
    this.state = data;
  }

  componentDidUpdate(prevProps) {
    const { fillDemoData, index } = this.props;
    if (index < 1 && !prevProps.fillDemoData && fillDemoData) this.initValues();
  }

  initValues() {
    this.setState(
      {
        business_type: "Association",
        owner_type: "Sole Proprietor",
        company: "AGREENBERG ONADOS AJO",
        business_identity: "A GREENBERG ONADOS AJOa",
        phone: "1111140446",
        website: "",
        address: "3252280 SVILLAGE SHIP Avenue E STE 3252280",
        address_option: "",
        city: "CLEVELAND",
        state: "OH",
        zip: "44114",
        federal_number_type: "ein",
        federal_number: "252013569",
        ssn_number: "",
        date_established: moment("11/19/2020").format("MM/DD/YYYY"),
        registration_state: "OH",
      },
      () => {
        this.setData();
      }
    );
  }

  inputField(e, key) {
    this.setState({ [key]: e.target.value }, () => {
      this.setData();
    });
  }

  setData() {
    const { onSetData } = this.props;
    const {
      business_type,
      owner_type,
      company,
      business_identity,
      phone,
      website,
      address,
      address_option,
      city,
      state,
      zip,
      federal_number_type,
      federal_number,
      ssn_number,
      date_established,
      registration_state,
    } = this.state;
    if (onSetData) {
      onSetData("business_information", {
        business_type,
        owner_type,
        company,
        business_identity,
        phone,
        website,
        address,
        address_option,
        city,
        state,
        zip,
        federal_number_type,
        federal_number: Helper.maskEIN(federal_number)[1],
        ssn_number: ssn_number ? Helper.maskSSN(ssn_number)[1] : "",
        date_established,
        registration_state,
      });
    }
  }

  getEIN() {
    const { federal_number } = this.state;
    const temp = Helper.maskEIN(federal_number);
    return temp[0];
  }

  getRawEIN() {
    const { federal_number } = this.state;
    const temp = Helper.maskEIN(federal_number);
    return temp[2];
  }

  getSSN() {
    const { ssn_number } = this.state;
    const temp = Helper.maskSSN(ssn_number);
    return temp[0];
  }

  getRawSSN() {
    const { ssn_number } = this.state;
    const temp = Helper.maskSSN(ssn_number);
    return temp[2];
  }

  setFederalNumberType(type) {
    let e = { target: { value: type } };
    this.setState({ federal_number: "" });
    this.inputField(e, "federal_number_type");
  }

  renderButtons() {
    const { styles, renderValidationMessage } = this.props;
    const { federal_number_type } = this.state;
    return (
      <div className={styles[0].cInlineButtons}>
        <FormInputComponent
          type="text"
          value={federal_number_type}
          hidden
        />
        {federal_number_type == "ein" ? (
          <a
            className={[
              "btn btn-primary btn-small",
              styles[0].btnCInlineButtons,
            ].join(" ")}
          >
            EIN
          </a>
        ) : (
          <a
            className={[
              "btn btn-primary-outline btn-small",
              styles[0].btnCInlineButtons,
            ].join(" ")}
            onClick={() => this.setFederalNumberType("ein")}
          >
            EIN
          </a>
        )}

        {federal_number_type == "ssn" ? (
          <a
            className={[
              "btn btn-primary btn-small",
              styles[0].btnCInlineButtons,
            ].join(" ")}
          >
            SSN
          </a>
        ) : (
          <a
            className={[
              "btn btn-primary-outline btn-small",
              styles[0].btnCInlineButtons,
            ].join(" ")}
            onClick={() => this.setFederalNumberType("ssn")}
          >
            SSN
          </a>
        )}
        {renderValidationMessage("business_information.federal_number_type")}
      </div>
    );
  }

  renderNumber() {
    const { federal_number_type, federal_number, ssn_number } = this.state;
    if (federal_number_type == "ein") return Helper.maskEIN(federal_number)[1];
  //  else return Helper.maskSSN(ssn_number)[1];
  }

  // Preview Content
  renderPreviewContent() {
    const { styles } = this.props;
    const {
      business_type,
      owner_type,
      company,
      business_identity,
      phone,
      website,
      address,
      address_option,
      city,
      state,
      zip,
      date_established,
      registration_state,
      federal_number_type,
    } = this.state;

    return (
      <Fragment>
        <div className={styles[0].cDataRow}>
          <label>Business Type</label>
          <span>{business_type}</span>
        </div>
        <div className={styles[0].cDataRow}>
          <label>Ownership Type</label>
          <span>{owner_type}</span>
        </div>
        <div className={styles[0].cDataRow}>
          <label>Company Name</label>
          <span>{company}</span>
        </div>
        <div className={styles[0].cDataRow}>
          <label>Doing Business As</label>
          <span>{business_identity}</span>
        </div>
        <div className={styles[0].cDataRow}>
          <label>Phone Number</label>
          <span>{phone}</span>
        </div>
        <div className={styles[0].cDataRow}>
          <label>Website</label>
          <span>{website}</span>
        </div>
        <div className={styles[0].cDataRow}>
          <label>Street Address</label>
          <span>{address}</span>
        </div>
        <div className={styles[0].cDataRow}>
          <label>Suite, Unit, Floor, etc.</label>
          <span>{address_option}</span>
        </div>
        <div className={styles[0].cDataRow}>
          <label>City</label>
          <span>{city}</span>
        </div>
        <div className={styles[0].cDataRow}>
          <label>State</label>
          <span>{state}</span>
        </div>
        <div className={styles[0].cDataRow}>
          <label>ZIP Code</label>
          <span>{zip}</span>
        </div>
        {federal_number_type != "ssn" ? (
          <div className={styles[0].cDataRow}>
            <label>Federal Tax Identification Number</label>
            <span>{this.renderNumber()}</span>
          </div>
        ) : null}
        <div className={styles[0].cDataRow}>
          <label>Date Established</label>
          <span>{moment(date_established).format("YYYY-MM-DD")}</span>
        </div>
        <div className={styles[0].cDataRow}>
          <label>Registration State</label>
          <span>{registration_state}</span>
        </div>
      </Fragment>
    );
  }

  // Edit Content
  renderEditContent() {
    const {
      styles,
      renderErrorClass,
      renderValidationMessage,
      businessRef,
      errors,
    } = this.props;
    const {
      business_type,
      owner_type,
      company,
      business_identity,
      phone,
      website,
      address,
      address_option,
      city,
      state,
      zip,
      federal_number_type,
      date_established,
      registration_state,
      show_ein,
    } = this.state;

    return (
      <Fragment>
        <div className="row" ref={businessRef}>
          <div className="col-md-8">
            <div className={styles[0].cFormRow}>
              <label>Business Type</label>
              <FormSelectComponent
                value={business_type}
                onChange={(e) => this.inputField(e, "business_type")}
                onKeyDown={(e) => this.props.onOptionSelected(e)}
                options={BUSINESSTYPES}
                placeholder="Select a type of business"
                additionalClassName={renderErrorClass(
                  "business_information.business_type"
                )}
              />
              {renderValidationMessage("business_information.business_type")}
            </div>
          </div>
          <div className="col-md-4">
            <div className={styles[0].cFormRow}>
              <label>Ownership Type</label>
              <FormSelectComponent
                value={owner_type}
                onChange={(e) => this.inputField(e, "owner_type")}
                onKeyDown={(e) => this.props.onOptionSelected(e)}
                options={OWNERTYPES}
                placeholder="Select One"
                additionalClassName={renderErrorClass(
                  "business_information.owner_type"
                )}
              />
              {renderValidationMessage("business_information.owner_type")}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">
            <div className={styles[0].cFormRow}>
              <label>Company Name</label>
              <FormInputComponent
                type="text"
                value={company}
                onChange={(e) => this.inputField(e, "company")}
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "business_information.company"
                )}
              />
              {renderValidationMessage("business_information.company")}
            </div>
          </div>
          <div className="col-md-4">
            <div className={styles[0].cFormRow}>
              <label>Doing Business As</label>
              <FormInputComponent
                type="text"
                value={business_identity}
                onChange={(e) => this.inputField(e, "business_identity")}
                disableAutoComplete
                additionalClassName={renderErrorClass("business_identity")}
              />
              {renderValidationMessage("business_identity", "Optional")}
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
                  "business_information.phone"
                )}
              />
              {errors &&
              errors.business_information &&
              errors.business_information.phone ? (
                <p
                  className={styles[0].errorMessage}
                >{`${errors.business_information.phone}`}</p>
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
              <label>Website</label>
              <FormInputComponent
                type="text"
                value={website}
                onChange={(e) => this.inputField(e, "website")}
                disableAutoComplete
              />
              <span>Optional</span>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-8">
            <div className={styles[0].cFormRow}>
              <label>Street Address</label>
              <FormInputComponent
                type="text"
                value={address}
                onChange={(e) => this.inputField(e, "address")}
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "business_information.address"
                )}
              />
              {renderValidationMessage("business_information.address")}
            </div>
          </div>
          <div className="col-md-3">
            <div className={styles[0].cFormRow}>
              <label>Suite, Unit, Floor, etc.</label>
              <FormInputComponent
                type="text"
                value={address_option}
                onChange={(e) => this.inputField(e, "address_option")}
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "business_information.address_option"
                )}
              />
              {renderValidationMessage(
                "business_information.address_option",
                "Optional"
              )}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <div className={styles[0].cFormRow}>
              <label>City</label>
              <FormInputComponent
                type="text"
                value={city}
                onChange={(e) => this.inputField(e, "city")}
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "business_information.city"
                )}
              />
              {renderValidationMessage("business_information.city")}
            </div>
          </div>
          <div className="col-md-4">
            <div className={styles[0].cFormRow}>
              <label>State</label>
              <FormSelectComponent
                value={state}
                onChange={(e) => this.inputField(e, "state")}
                onKeyDown={(e) => this.props.onOptionSelected(e)}
                options={Helper.getStateOptions()}
                placeholder="Select a State"
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "business_information.state"
                )}
              />
              {renderValidationMessage("business_information.state")}
            </div>
          </div>
          <div className="col-md-3">
            <div className={styles[0].cFormRow}>
              <label>ZIP Code</label>
              <FormInputComponent
                type="text"
                value={zip}
                onChange={(e) => this.inputField(e, "zip")}
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "business_information.zip"
                )}
              />
              {renderValidationMessage("business_information.zip")}
            </div>
          </div>
        </div>
        <div className={styles[0].cFormRow}>
          <label>Federal Employer Identification Number</label>
          {this.renderButtons()}
        </div>
        {federal_number_type != "ssn" ? (
          <div className={styles[0].cGreyWrap}>
            <label>Federal Tax Identification Number</label>
            <div>
              <FormInputComponent
                type="text"
                value={show_ein ? this.getRawEIN() : this.getEIN()}
                onChange={(e) => this.inputField(e, "federal_number")}
                disableAutoComplete
                additionalClassName={renderErrorClass("business_information.federal_number")}
              />
              <a
                className={["ml-1", styles[0].cGreyWrapLink].join(" ")}
                onClick={() => this.setState({ show_ein: !show_ein })}
              >
                <img
                  src={`/${show_ein ? "eye-visible" : "eye-invisible"}.png`}
                  alt="visibility"
                  width={20}
                  height={20}
                />
              </a>
            </div>
            {renderValidationMessage("business_information.federal_number")}
          </div>
        ) : null}
        <div className="row">
          <div className="col-md-4">
            <div className={styles[0].cFormRow}>
              <label>Date Established</label>
              <InputMask
                className={`${styles[1].customFormControl} ${renderErrorClass(
                  "business_information.dob"
                )}`}
                alwaysShowMask={false}
                beforeMaskedStateChange={(value) =>
                  handleMaskValueChange(value, false)
                }
                mask={date_established && datePattern}
                value={date_established}
                onChange={(e) =>
                  this.setState({ date_established: e.target.value }, () =>
                    this.setData()
                  )
                }
                formatChars={dateFormatChars}
              />
              {renderValidationMessage(
                "business_information.date_established",
                "mm/dd/yyyy"
              )}
            </div>
          </div>
          <div className="col-md-4">
            <div className={styles[0].cFormRow}>
              <label>Registration State</label>
              <FormSelectComponent
                value={registration_state}
                onChange={(e) => this.inputField(e, "registration_state")}
                onKeyDown={(e) => this.props.onOptionSelected(e)}
                options={Helper.getStateOptions()}
                placeholder="Select a State"
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "business_information.registration_state"
                )}
              />
              {renderValidationMessage(
                "business_information.registration_state"
              )}
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

  render() {
    const { preview, index, styles } = this.props;

    return (
      <Fragment>
        <div className={styles[0].cRow}>
          <div className={styles[0].cRowLabel}></div>
          <div className={styles[0].cRowContent}>
            <div className="spacer"></div>
          </div>
        </div>
        <div className={styles[0].cRow}>
          <div className={styles[0].cRowLabel}>
            <label>Business Information</label>
          </div>
          {/* .c-row-label */}
          <div className={styles[0].cRowContent}>
            {preview || index > 0
              ? this.renderPreviewContent()
              : this.renderEditContent()}
          </div>
        </div>
      </Fragment>
    );
  }
}

export default connect(mapStateToProps)(withRouter(BusinessInformation));
