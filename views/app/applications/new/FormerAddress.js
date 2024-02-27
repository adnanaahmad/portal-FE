import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  FormInputComponent,
  FormSelectComponent,
} from "../../../../components";
import { STATELIST } from "../../../../utils/Constant";
import Helper from "../../../../utils/Helper";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    fillDemoData: state.global.fillDemoData,
  };
};

class FormerAddress extends Component {
  constructor(props) {
    super(props);
    let data = Helper.fetchApplicantData(this.props, "former_address");
    if (!data) {
      data = {
        address: "",
        address_option: "",
        city: "",
        state: "",
        zip: "",
        year_live_period: "",
        month_live_period: "",
        live_period: "",
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
        address: "3255 ABBEYFIELD LN",
        address_option: "",
        city: "JACKSONVILLE",
        state: "FL",
        zip: "32277",
        year_live_period: "2",
        month_live_period: "4",
        live_period: "28",
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

    this.setTotalLivePeriod(key, value);
  }

  setTotalLivePeriod(period_key, value) {
    let intValue = value == "" ? 0 : parseInt(value);
    let intYearLivePeriod =
      this.state.year_live_period == ""
        ? 0
        : parseInt(this.state.year_live_period);
    let intMonthLivePeriod =
      this.state.month_live_period == ""
        ? 0
        : parseInt(this.state.month_live_period);
    let total =
      period_key == "year_live_period"
        ? intValue * 12 + intMonthLivePeriod
        : intYearLivePeriod * 12 + intValue;

    this.setState({ ["live_period"]: total }, () => {
      this.setData();
    });
  }

  inputFloatField(e, key) {
    let value = e.target.value;
    value = Helper.unformatNumber(value);

    if (isNaN(value)) value = "";
    value = Helper.adjustNumericString(value, 2);

    this.setState({ [key]: value }, () => {
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
      address,
      address_option,
      city,
      state,
      zip,
      year_live_period,
      month_live_period,
      live_period,
    } = this.state;
    if (onSetData) {
      onSetData("former_address", {
        address,
        address_option,
        city,
        state,
        zip,
        year_live_period,
        month_live_period,
        live_period,
      });
    }
  }

  // Preview Content
  renderPreviewContent() {
    const { styles } = this.props;
    const { address, address_option, city, state, zip, live_period } =
      this.state;

    return (
      <Fragment>
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
        <div className={styles.cDataRow}>
          <label>ZIP Code</label>
          <span>{zip}</span>
        </div>
        <div className={styles.cDataRow}>
          <label>How long did you live at this address?</label>
          <span>{live_period} {live_period !== 0 ? (live_period === 1 ? 'month' : 'months') : ''}</span>
        </div>
      </Fragment>
    );
  }

  // Edit Content
  renderEditContent() {
    const { styles, renderErrorClass, renderValidationMessage, formerRef } = this.props;
    const {
      address,
      address_option,
      city,
      state,
      zip,
      year_live_period,
      month_live_period,
    } = this.state;
    const { required } = this.props;
    if (!required) return null;
    return (
      <Fragment>
        <div className="row" ref={formerRef}>
          <div className="col-md-8">
            <div className={styles.cFormRow}>
              <label>Street Address</label>
              <FormInputComponent
                type="text"
                value={address}
                onChange={(e) => this.inputField(e, "address")}
                disableAutoComplete
                additionalClassName={renderErrorClass("former_address.address")}
              />
              {renderValidationMessage("former_address.address")}
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
                  "former_address.address_option"
                )}
              />
              {renderValidationMessage(
                "former_address.address_option",
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
                additionalClassName={renderErrorClass("former_address.city")}
              />
              {renderValidationMessage("former_address.city")}
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
                additionalClassName={renderErrorClass("former_address.state")}
              />
              {renderValidationMessage("former_address.state")}
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
                additionalClassName={renderErrorClass("former_address.zip")}
              />
              {renderValidationMessage("former_address.zip")}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className={styles.cFormRow}>
              <label>How long did you live at this address?</label>
              <div className="row">
                <div className="col-md-2">
                  <div className={styles.cLengthWrap}>
                    <FormInputComponent
                      type="number"
                      value={year_live_period}
                      onChange={(e) =>
                        this.inputIntField(e, "year_live_period")
                      }
                      min="0"
                      max="100"
                      disableAutoComplete
                      additionalClassName={renderErrorClass(
                        "former_address.year_live_period"
                      )}
                    />
                    <label>Years</label>
                  </div>
                </div>
                <div className="col-md-2">
                  <div className={styles.cLengthWrap}>
                    <FormInputComponent
                      type="number"
                      value={month_live_period}
                      onChange={(e) =>
                        this.inputIntField(e, "month_live_period")
                      }
                      min="0"
                      max="11"
                      disableAutoComplete
                      additionalClassName={renderErrorClass(
                        "former_address.month_live_period"
                      )}
                    />
                    <label>Months</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

  render() {
    const { preview, required, styles } = this.props;
    if (!required) return null;
    return (
      <div className={styles.cRow}>
        <div className={styles.cRowLabel}>
          <label>
            Former Address <span>PO Box is not allowed</span>
          </label>
          <br />
          <label>
            <span>
              Former address is required if total number of months at current
              address is less than than 24
            </span>
          </label>
        </div>
        {/* .c-row-label */}
        <div className={styles.cRowContent}>
          {preview ? this.renderPreviewContent() : this.renderEditContent()}
          <div className="spacer"></div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(FormerAddress));
