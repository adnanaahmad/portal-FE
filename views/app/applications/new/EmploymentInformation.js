import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  FormInputComponent,
  FormSelectComponent,
} from "../../../../components";
import { STATELIST, INCOMETYPES } from "../../../../utils/Constant";
import Helper from "../../../../utils/Helper";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    fillDemoData: state.global.fillDemoData,
  };
};

class EmploymentInformation extends Component {
  constructor(props) {
    super(props);
    let data = Helper.fetchApplicantData(this.props, "employment_information");
    if (!data) {
      data = {
        status: "",
        name: "",
        phone: "",
        job_title: "",
        year_length: "",
        month_length: "",
        length: "",
        address: "",
        address_option: "",
        city: "",
        state: "",
        zip: "",
        show_alert: false,
      };
    }
    this.state = data;
  }

  componentDidUpdate(prevProps) {
    const { fillDemoData } = this.props;
    if (!prevProps.fillDemoData && fillDemoData) this.initValues();
  }

  initValues() {
    this.setState(
      {
        status: "Employed",
        type: "Full-Time",
        name: "ABC Company",
        phone: "8019992130",
        job_title: "Engineer",
        year_length: "5",
        month_length: "0",
        length: "60",
        address: "688 Main Street",
        address_option: "",
        city: "Jacksonville",
        state: "FL",
        zip: "32277",
        show_alert: false,
      },
      () => {
        this.setData();
      }
    );
  }

  inputIntField(e, key) {
    let value = e.target.value;
    this.setState({ [key]: value }, () => {
      this.setData();
    });

    this.setTotalLength(key, value);
  }

  setTotalLength(period_key, value) {
    let intValue = value == "" ? 0 : parseInt(value);
    let intYearLength =
      this.state.year_length == "" ? 0 : parseInt(this.state.year_length);
    let intMonthLength =
      this.state.month_length == "" ? 0 : parseInt(this.state.month_length);
    let total =
      period_key == "year_length"
        ? intValue * 12 + intMonthLength
        : intYearLength * 12 + intValue;

    this.setState({ ["length"]: total }, () => {
      this.setData();
    });

    if (total > 0) {
      this.showAlert(false);
    } else {
      this.showAlert(true);
    }
  }

  showAlert(show_alert) {
    this.setState({ ["show_alert"]: show_alert }, () => {
      this.setData();
    });
  }

  inputField(e, key) {
    this.setState({ [key]: e.target.value }, () => {
      this.setData();
    });
  }

  setData() {
    const { onSetData } = this.props;
    const {
      status,
      type,
      name,
      phone,
      job_title,
      year_length,
      month_length,
      length,
      address,
      address_option,
      city,
      state,
      zip,
      show_alert,
    } = this.state;
    if (onSetData) {
      onSetData("employment_information", {
        status,
        type,
        name,
        phone,
        job_title,
        year_length,
        month_length,
        length,
        address,
        address_option,
        city,
        state,
        zip,
        show_alert,
      });
    }
  }

  // Preview Content
  renderPreviewContent() {
    const { styles } = this.props;
    const {
      status,
      name,
      phone,
      job_title,
      length,
      address,
      address_option,
      city,
      state,
      zip,
    } = this.state;

    return (
      <Fragment>
        <div className={styles.cDataRow}>
          <label>Employment Status</label>
          <span>{status}</span>
        </div>
        <div
          style={{
            display:
              status !== INCOMETYPES.Unemployed && status !== ""
                ? "block"
                : "none",
          }}
        >
          <div className={styles.cDataRow}>
            <label>Employer Name</label>
            <span>{name}</span>
          </div>
          <div className={styles.cDataRow}>
            <label>Employer Phone Number</label>
            <span>{phone}</span>
          </div>
          <div className={styles.cDataRow}>
            <label>Job Title</label>
            <span>{job_title}</span>
          </div>
          <div className={styles.cDataRow}>
            <label>Length of Employment</label>
            <span>{length} {length !== 0 ? (length === 1 ? 'month' : 'months') : ''}</span>
          </div>
          <div className={styles.cDataRow}>
            <label>Street Address</label>
            <span>{address}</span>
          </div>
          <div className={styles.cDataRow}>
            <label>Suite, Unit, Floor, etc.</label>
            <span>{address_option}</span>
          </div>
          <div className={styles.cDataRow}>
            <label>City</label>
            <span>{city}</span>
          </div>
          <div className={styles.cDataRow}>
            <label>State</label>
            <span>{state}</span>
          </div>
          <div className={[styles.cDataRow, "mb-3"].join(" ")}>
            <label>ZIP Code</label>
            <span>{zip}</span>
          </div>
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
      employmentRef,
      errors,
    } = this.props;
    const {
      status,
      name,
      phone,
      job_title,
      year_length,
      month_length,
      address,
      address_option,
      city,
      state,
      zip,
      show_alert,
    } = this.state;

    return (
      <Fragment>
        <div className="row" ref={employmentRef}>
          <div className="col-md-4">
            <div className={styles.cFormRow}>
              <label>Employment Status</label>
              <FormSelectComponent
                value={status}
                onChange={(e) => this.inputField(e, "status")}
                onKeyDown={(e) => this.props.onOptionSelected(e)}
                options={INCOMETYPES}
                placeholder="Select employment status"
                additionalClassName={renderErrorClass(
                  "employment_information.status"
                )}
              />
              {renderValidationMessage("employment_information.status")}
            </div>
          </div>
        </div>
        <div
          style={{
            display:
              status !== INCOMETYPES.Unemployed && status !== ""
                ? "block"
                : "none",
          }}
        >
          <div className="row">
            <div className="col-md-8">
              <div className={styles.cFormRow}>
                <label>Employer Name</label>
                <FormInputComponent
                  type="text"
                  value={name}
                  onChange={(e) => this.inputField(e, "name")}
                  disableAutoComplete
                  additionalClassName={renderErrorClass(
                    "employment_information.name"
                  )}
                />
                {renderValidationMessage("employment_information.name")}
              </div>
            </div>
            <div className="col-md-4">
              <div className={styles.cFormRow}>
                <label>Employer Phone Number</label>
                <FormInputComponent
                  type="text"
                  value={phone}
                  onChange={(e) => this.inputField(e, "phone")}
                  disableAutoComplete
                  additionalClassName={renderErrorClass(
                    "employment_information.phone"
                  )}
                />
                {errors &&
                errors.employment_information &&
                errors.employment_information.phone ? (
                  <p
                    className={styles.errorMessage}
                  >{`${errors.employment_information.phone}`}</p>
                ) : (
                  <span>
                    <span className="small">(</span>xxx
                    <span className="small">)</span> xxx-xxxx
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">
              <div className={styles.cFormRow}>
                <label>Job Title</label>
                <FormInputComponent
                  type="text"
                  value={job_title}
                  onChange={(e) => this.inputField(e, "job_title")}
                  disableAutoComplete
                  additionalClassName={renderErrorClass(
                    "employment_information.job_title"
                  )}
                />
                {renderValidationMessage("employment_information.job_title")}
              </div>
            </div>
            <div className="col-md-12">
              <div className={styles.cFormRow}>
                <label>Length of Employment</label>
                <div className="row">
                  <div className="col-md-2">
                    <div className={styles.cLengthWrap}>
                      <FormInputComponent
                        type="number"
                        value={year_length}
                        onChange={(e) => this.inputIntField(e, "year_length")}
                        min="0"
                        max="100"
                        disableAutoComplete
                        additionalClassName={renderErrorClass(
                          "employment_information.year_length"
                        )}
                      />
                      <label>Years</label>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className={styles.cLengthWrap}>
                      <FormInputComponent
                        type="number"
                        value={month_length}
                        onChange={(e) => this.inputIntField(e, "month_length")}
                        min="0"
                        max="11"
                        disableAutoComplete
                        additionalClassName={renderErrorClass(
                          "employment_information.month_length"
                        )}
                      />
                      <label>Months</label>
                    </div>
                  </div>
                  <div
                    className="col-md-8"
                    style={{ display: show_alert ? "block" : "none" }}
                  >
                    <div className="alert alert-danger" role="alert">
                      Please input your lenght of employment!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-8">
              <div className={styles.cFormRow}>
                <label>Street Address</label>
                <FormInputComponent
                  type="text"
                  value={address}
                  onChange={(e) => this.inputField(e, "address")}
                  disableAutoComplete
                  additionalClassName={renderErrorClass(
                    "employment_information.address"
                  )}
                />
                {renderValidationMessage("employment_information.address")}
              </div>
            </div>
            <div className="col-md-3">
              <div className={styles.cFormRow}>
                <label>Suite, Unit, Floor, etc.</label>
                <FormInputComponent
                  type="text"
                  value={address_option}
                  onChange={(e) => this.inputField(e, "address_option")}
                  disableAutoComplete
                  additionalClassName={renderErrorClass(
                    "employment_information.address_option"
                  )}
                />
                {renderValidationMessage(
                  "employment_information.address_option",
                  "Optional"
                )}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className={styles.cFormRow}>
                <label>City</label>
                <FormInputComponent
                  type="text"
                  value={city}
                  onChange={(e) => this.inputField(e, "city")}
                  disableAutoComplete
                  additionalClassName={renderErrorClass(
                    "employment_information.city"
                  )}
                />
                {renderValidationMessage("employment_information.city")}
              </div>
            </div>
            <div className="col-md-4">
              <div className={styles.cFormRow}>
                <label>State</label>
                <FormSelectComponent
                  value={state}
                  onChange={(e) => this.inputField(e, "state")}
                  onKeyDown={(e) => this.props.onOptionSelected(e)}
                  options={Helper.getStateOptions()}
                  placeholder="Select a State"
                  disableAutoComplete
                  additionalClassName={renderErrorClass(
                    "employment_information.state"
                  )}
                />
                {renderValidationMessage("employment_information.state")}
              </div>
            </div>
            <div className="col-md-3">
              <div className={styles.cFormRow}>
                <label>ZIP Code</label>
                <FormInputComponent
                  type="text"
                  value={zip}
                  onChange={(e) => this.inputField(e, "zip")}
                  disableAutoComplete
                  additionalClassName={renderErrorClass(
                    "employment_information.zip"
                  )}
                />
                {renderValidationMessage("employment_information.zip")}
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

  render() {
    const { preview, styles } = this.props;

    return (
      <div className={styles.cRow}>
        <div className={styles.cRowLabel}>
          <label>Employment Information</label>
        </div>
        {/* .c-row-label */}
        <div className={styles.cRowContent}>
          {preview ? this.renderPreviewContent() : this.renderEditContent()}
          <div className="spacer"></div>
        </div>
        {/* .c-row-content */}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(EmploymentInformation));
