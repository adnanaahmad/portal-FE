import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FormInputComponent } from "../../../../components";
import { STATELIST } from "../../../../utils/Constant";
import Helper from "../../../../utils/Helper";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    fillDemoData: state.global.fillDemoData,
  };
};

class BankInformation extends Component {
  constructor(props) {
    super(props);

    let data = Helper.fetchApplicantData(this.props, "bank_information");
    if (!data) {
      data = {
        bank_name: "",
        account_type: "",
        cash_advance: "",
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
        bank_name: "DID Demo",
        account_type: "checking",
        // address: "123 POST RD",
        // address_option: "",
        // city: "JACKSONVILLE",
        // state: "FL",
        // zip: "32277",
        cash_advance: "0",
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
      bank_name,
      account_type,
      // address,
      // address_option,
      // city,
      // state,
      // zip,
      cash_advance,
    } = this.state;

    if (onSetData) {
      onSetData("bank_information", {
        bank_name,
        account_type,
        // address,
        // address_option,
        // city,
        // state,
        // zip,
        cash_advance,
      });
    }
  }

  getStateOptions() {
    const options = {};
    STATELIST.forEach((state) => {
      options[state] = state;
    });
    return options;
  }

  setAccountType = (type) => {
    this.setState({ account_type: type }, () => {
      this.setData();
    });
  };

  renderAccountTypeButtons() {
    const { styles, renderValidationMessage } = this.props;
    const { account_type } = this.state;
    return (
      <div className={styles.cInlineButtons}>
        <FormInputComponent
          type="text"
          value={account_type}
          hidden
        />
        {account_type == "checking" ? (
          <a
            className={[
              "btn btn-primary btn-small",
              styles.btnCInlineButtons,
            ].join(" ")}
          >
            Checking
          </a>
        ) : (
          <a
            className={[
              "btn btn-primary-outline btn-small",
              styles.btnCInlineButtons,
            ].join(" ")}
            onClick={() => this.setAccountType("checking")}
          >
            Checking
          </a>
        )}

        {account_type == "savings" ? (
          <a
            className={[
              "btn btn-primary btn-small",
              styles.btnCInlineButtons,
            ].join(" ")}
          >
            Savings
          </a>
        ) : (
          <a
            className={[
              "btn btn-primary-outline btn-small",
              styles.btnCInlineButtons,
            ].join(" ")}
            onClick={() => this.setAccountType("savings")}
          >
            Savings
          </a>
        )}

        {account_type == "both" ? (
          <a
            className={[
              "btn btn-primary btn-small",
              styles.btnCInlineButtons,
            ].join(" ")}
            style={{ width: 90 }}
          >
            Both
          </a>
        ) : (
          <a
            className={[
              "btn btn-primary-outline btn-small",
              styles.btnCInlineButtons,
              styles.cInlineButtonsLink,
            ].join(" ")}
            onClick={() => this.setAccountType("both")}
          >
            Both
          </a>
        )}
        {renderValidationMessage("bank_information.account_type")}
      </div>
    );
  }

  setCashAdvance = (value) => {
    this.setState({ cash_advance: value }, () => {
      this.setData();
    });
  };

  renderCashButtons() {
    const { styles, renderValidationMessage } = this.props;
    const { cash_advance } = this.state;
    return (
      <div className={styles.cInlineButtons}>
        <FormInputComponent
          type="text"
          value={cash_advance}
          hidden
        />
        {cash_advance == "0" ? (
          <a
            className={[
              "btn btn-primary btn-small",
              styles.btnCInlineButtons,
            ].join(" ")}
          >
            0
          </a>
        ) : (
          <a
            className={[
              "btn btn-primary-outline btn-small",
              styles.btnCInlineButtons,
            ].join(" ")}
            onClick={() => this.setCashAdvance("0")}
          >
            0
          </a>
        )}

        {cash_advance == "1-2" ? (
          <a
            className={[
              "btn btn-primary btn-small",
              styles.btnCInlineButtons,
            ].join(" ")}
          >
            1-2
          </a>
        ) : (
          <a
            className={[
              "btn btn-primary-outline btn-small",
              styles.btnCInlineButtons,
            ].join(" ")}
            onClick={() => this.setCashAdvance("1-2")}
          >
            1-2
          </a>
        )}

        {cash_advance == "3+" ? (
          <a
            className={[
              "btn btn-primary btn-small",
              styles.btnCInlineButtons,
            ].join(" ")}
          >
            3 or more
          </a>
        ) : (
          <a
            className={[
              "btn btn-primary-outline btn-small",
              styles.btnCInlineButtons,
            ].join(" ")}
            onClick={() => this.setCashAdvance("3+")}
          >
            3 or more
          </a>
        )}
        {renderValidationMessage("bank_information.cash_advance")}
      </div>
    );
  }

  // Preview Content
  renderPreviewContent() {
    const { styles } = this.props;
    const {
      bank_name,
      account_type,
      // address,
      // address_option,
      // city,
      // state,
      // zip,
      cash_advance,
    } = this.state;

    var selected_account_type;
    if (account_type == "checking") {
      selected_account_type = "Checking";
    } else if (account_type == "savings") {
      selected_account_type = "Savings";
    } else {
      selected_account_type = "Both";
    }

    return (
      <Fragment>
        <div className={styles.cDataRow}>
          <label>Checking/Savings Bank Name</label>
          <span>{bank_name}</span>
        </div>
        <div className={styles.cDataRow}>
          <label>Bank Account Type</label>
          <span>{selected_account_type}</span>
        </div>

        {/* <div className="c-data-row">
          <label>Street Address</label>
          <span>{address}</span>
        </div>
        <div className="c-data-row">
          <label>Suite, Unit, Floor, etc.</label>
          <span>{address_option}</span>
        </div>
        <div className="c-data-row">
          <label>City</label>
          <span>{city}</span>
        </div>
        <div className="c-data-row">
          <label>State</label>
          <span>{state}</span>
        </div>
        <div className="c-data-row">
          <label>ZIP Code</label>
          <span>{zip}</span>
        </div> */}

        <div className={[styles.cDataRow, "mb-3"].join(" ")}>
          <label>Have you taken a cash advance in the last 6 months?</label>
          <span>{cash_advance}</span>
        </div>
      </Fragment>
    );
  }

  // Edit Content
  renderEditContent() {
    const { styles, renderErrorClass, renderValidationMessage, bankRef } = this.props;
    // const { bank_name, address, address_option, city, state, zip } = this.state;
    const { bank_name } = this.state;
    return (
      <Fragment>
        <div className="row" ref={bankRef}>
          <div className="col-md-4">
            <div className={styles.cFormRow}>
              <label>Checking/Savings Bank Name</label>
              <FormInputComponent
                type="text"
                value={bank_name}
                onChange={(e) => this.inputField(e, "bank_name")}
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "bank_information.bank_name"
                )}
              />
              {renderValidationMessage("bank_information.bank_name")}
            </div>
          </div>
          <div className="col-md-8">
            <div className={styles.cFormRow}>
              <label>Bank Account Type</label>
              {this.renderAccountTypeButtons()}
            </div>
          </div>
        </div>

        {/* <div className="row">
          <div className="col-md-8">
            <div className="c-form-row">
              <label>Street Address</label>
              <FormInputComponent
                type="text"
                value={address}
                onChange={(e) => this.inputField(e, "address")}
                required={true}
                disableAutoComplete
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="c-form-row">
              <label>Suite, Unit, Floor, etc.</label>
              <FormInputComponent
                type="text"
                value={address_option}
                onChange={(e) => this.inputField(e, "address_option")}
                disableAutoComplete
              />
              <span>Optional</span>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <div className="c-form-row">
              <label>City</label>
              <FormInputComponent
                type="text"
                value={city}
                onChange={(e) => this.inputField(e, "city")}
                required={true}
                disableAutoComplete
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="c-form-row">
              <label>State</label>
              <FormSelectComponent
                value={state}
                onChange={(e) => this.inputField(e, "state")}
                required={true}
                options={this.getStateOptions()}
                placeholder="Select a State"
                disableAutoComplete
              />
            </div>
          </div>
          <div className="col-md-3">
            <div className="c-form-row">
              <label>ZIP Code</label>
              <FormInputComponent
                type="text"
                value={zip}
                onChange={(e) => this.inputField(e, "zip")}
                required={true}
                disableAutoComplete
                pattern="^[0-9]{5}$"
              />
            </div>
          </div>
        </div> */}

        <div className={styles.cFormRow}>
          <label>Have you taken a cash advance in the last 6 months?</label>
          {this.renderCashButtons()}
        </div>
      </Fragment>
    );
  }

  render() {
    const { preview, styles } = this.props;
    return (
      <div className={styles.cRow} style={{ marginBottom: 0 }}>
        <div className={styles.cRowLabel}>
          <label>Bank Information</label>
        </div>
        {/* .c-row-label */}
        <div className={styles.cRowContent}>
          {preview ? this.renderPreviewContent() : this.renderEditContent()}
        </div>
        {/* .c-row-content */}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(BankInformation));
