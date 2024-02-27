import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  FormInputComponent,
  FormSelectComponent,
  FormCheckComponent,
  FormTextareaComponent,
} from "../../../../components";
import { STATELIST } from "../../../../utils/Constant";
import Helper from "../../../../utils/Helper";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    fillDemoData: state.global.fillDemoData,
  };
};

class ResidentialAddress extends Component {
  constructor(props) {
    super(props);
    let data = Helper.fetchApplicantData(this.props, "residential_address");
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
        property_use_type: "",
        monthly_rent: "",
        show_alert: false,
        is_fully_own: false,
        mortgage: "",
        note: "",
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
        property_use_type: "rent",
        monthly_rent: "1000",
        show_alert: false,
        is_fully_own: false,
        mortgage: 1000,
        note: "",
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

    if (total < 24) {
      this.props.checkFormerAddressValidation();
    }

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

  inputFloatField(e, key) {
    let value = e.target.value;
    value = Helper.unformatNumber(value);

    if (isNaN(value)) value = "";
    value = Helper.adjustNumericString(value, 2);
    if (key === "monthly_rent" && value.charAt(0) === "-") {
      value = value.substring(1);
    }
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
      property_use_type,
      monthly_rent,
      show_alert,
      is_fully_own,
      mortgage,
      note,
    } = this.state;
    if (onSetData) {
      onSetData("residential_address", {
        address,
        address_option,
        city,
        state,
        zip,
        year_live_period,
        month_live_period,
        live_period,
        property_use_type,
        monthly_rent,
        show_alert,
        is_fully_own,
        mortgage,
        note,
      });
    }
  }

  setPropertyUseType = (type) => {
    this.setState({ property_use_type: type }, () => {
      this.setData();
    });
  };

  handleIsFullyOwn = (e) => {
    const { mortgage, is_fully_own } = this.state;
    this.setState(
      {
        is_fully_own: !is_fully_own,
        mortgage: e.target.checked ? "" : mortgage,
        monthly_rent: e.target.checked ? "" : mortgage,
      },
      () => {
        this.setData();
      }
    );
  };

  renderButtons() {
    const { styles, renderValidationMessage } = this.props;
    const { property_use_type } = this.state;
    return (
      <div className={styles.cInlineButtons}>
        <FormInputComponent type="text" value={property_use_type} hidden />
        {property_use_type == "rent" ? (
          <a
            className={[
              "btn btn-primary btn-small",
              styles.btnCInlineButtons,
            ].join(" ")}
          >
            Rent
          </a>
        ) : (
          <a
            className={[
              "btn btn-primary-outline btn-small",
              styles.btnCInlineButtons,
            ].join(" ")}
            onClick={() => this.setPropertyUseType("rent")}
          >
            Rent
          </a>
        )}

        {property_use_type == "own" ? (
          <a
            className={[
              "btn btn-primary btn-small",
              styles.btnCInlineButtons,
            ].join(" ")}
          >
            Own
          </a>
        ) : (
          <a
            className={[
              "btn btn-primary-outline btn-small",
              styles.btnCInlineButtons,
            ].join(" ")}
            onClick={() => this.setPropertyUseType("own")}
          >
            Own
          </a>
        )}

        {property_use_type == "other" ? (
          <a
            className={[
              "btn btn-primary btn-small",
              styles.btnCInlineButtons,
            ].join(" ")}
          >
            Other
          </a>
        ) : (
          <a
            className={[
              "btn btn-primary-outline btn-small",
              styles.btnCInlineButtons,
            ].join(" ")}
            onClick={() => this.setPropertyUseType("other")}
          >
            Other
          </a>
        )}
        {renderValidationMessage("residential_address.property_use_type")}
      </div>
    );
  }

  // Preview Content
  renderPreviewContent() {
    const { styles } = this.props;
    const {
      address,
      address_option,
      city,
      state,
      zip,
      live_period,
      property_use_type,
      monthly_rent,
      mortgage,
      note,
      is_fully_own,
    } = this.state;

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
          <label>How long have you been living at this address?</label>
          <span>
            {live_period}{" "}
            {live_period !== 0 ? (live_period === 1 ? "month" : "months") : ""}
          </span>
        </div>
        <div className={styles.cDataRow}>
          <label>Do you rent or own this property?</label>
          <span>
            {property_use_type == "rent"
              ? "Rent"
              : property_use_type == "own"
              ? "Own"
              : "Other"}
          </span>
        </div>
        <div className={[styles.cDataRow, "mb-3"].join(" ")}>
          <label>
            {property_use_type == "rent"
              ? "Monthly Rent"
              : property_use_type == "own"
              ? "Mortgage Payment"
              : "Other"}
          </label>
          <span>
            {property_use_type == "rent"
              ? `$${Helper.formatNumber(monthly_rent)}`
              : property_use_type == "own"
              ? is_fully_own
                ? "Is Fully Own"
                : `$${Helper.formatNumber(mortgage)}`
              : `${note}`}
          </span>
        </div>
      </Fragment>
    );
  }

  // Edit Content
  renderEditContent() {
    const { styles, renderValidationMessage, renderErrorClass, addressRef } =
      this.props;
    const {
      address,
      address_option,
      city,
      state,
      zip,
      year_live_period,
      month_live_period,
      monthly_rent,
      property_use_type,
      show_alert,
      is_fully_own,
      mortgage,
      note,
    } = this.state;

    return (
      <Fragment>
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
                  "residential_address.address"
                )}
              />
              {renderValidationMessage("residential_address.address")}
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
                  "residential_address.address_option"
                )}
              />
              {renderValidationMessage(
                "residential_address.address_option",
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
                  "residential_address.city"
                )}
              />
              {renderValidationMessage("residential_address.city")}
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
                  "residential_address.state"
                )}
              />
              {renderValidationMessage("residential_address.state")}
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
                  "residential_address.zip"
                )}
              />
              {renderValidationMessage("residential_address.zip")}
            </div>
          </div>
        </div>
        <div className="row" ref={addressRef}>
          <div className="col-md-12">
            <div className={styles.cFormRow}>
              <label>How long have you been living at this address?</label>
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
                        "residential_address.year_live_period"
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
                        "residential_address.month_live_period"
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
                    Please input how long you have been living at current
                    address!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className={styles.cFormRow}>
              <label>Do you rent or own this property?</label>
              {this.renderButtons()}
            </div>
          </div>
        </div>
        <div className={styles.cGreyWrap}>
          <label>
            {property_use_type === "rent"
              ? "Monthly Rent"
              : property_use_type === "own"
              ? "Mortgage Payment"
              : property_use_type === "other"
              ? "Details"
              : "Monthly Rent"}
          </label>
          {(property_use_type === "" ||
            property_use_type === undefined ||
            property_use_type === "rent") && (
            <>
              <div>
                <label>$</label>
                <FormInputComponent
                  type="text"
                  value={Helper.formatNumber(monthly_rent)}
                  onChange={(e) => this.inputFloatField(e, "monthly_rent")}
                  disableAutoComplete
                  additionalClassName={renderErrorClass(
                    "residential_address.monthly_rent"
                  )}
                />
              </div>
              {renderValidationMessage("residential_address.monthly_rent")}
            </>
          )}
          {property_use_type === "own" && (
            <>
              <div>
                <label>$</label>
                <FormInputComponent
                  type="text"
                  value={Helper.formatNumber(mortgage)}
                  onChange={(e) => this.inputFloatField(e, "mortgage")}
                  disableAutoComplete
                  disabled={is_fully_own}
                  additionalClassName={renderErrorClass(
                    "residential_address.mortgage"
                  )}
                />
              </div>
              {renderValidationMessage("residential_address.mortgage")}
              <FormCheckComponent
                checked={is_fully_own}
                text={"Fully owned, no mortgage"}
                id="is_fully_own"
                value={note}
                onChange={(e) => this.handleIsFullyOwn(e)}
                additionalClassName="pl12"
              />
            </>
          )}
          {property_use_type === "other" && (
            <>
              <div>
                <label>{property_use_type != "other" && "$"}</label>
                <FormTextareaComponent
                  value={note}
                  onChange={(e) => this.inputField(e, "note")}
                  disableAutoComplete
                  rows={3}
                  additionalClassName={renderErrorClass(
                    "residential_address.monthly_rent"
                  )}
                />
              </div>
              {renderValidationMessage("residential_address.note")}
            </>
          )}
        </div>
      </Fragment>
    );
  }

  render() {
    const { preview, styles } = this.props;

    return (
      <div className={styles.cRow}>
        <div className={styles.cRowLabel}>
          <label>
            Residential Address <span>PO Box is not allowed</span>
          </label>
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

export default connect(mapStateToProps)(withRouter(ResidentialAddress));
