import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  FormInputComponent,
  FormSelectComponent,
} from "../../../../components";
import Helper from "../../../../utils/Helper";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    fillDemoData: state.global.fillDemoData,
    index: Helper.getIndex(state.global),
  };
};

class LoanInformation extends Component {
  constructor(props) {
    super(props);

    let primary = Helper.fetchApplicant(0);
    let data;
    if (primary) {
      data = primary.loan_information;
    }
    //let data = Helper.fetchApplicantData(this.props, "loan_information");
    if (!data) {
      data = {
        request_amount: "",
        purpose: "",
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
        request_amount: "10000",
        purpose: "Business financing",
      },
      () => {
        this.setData();
      }
    );
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
    const { request_amount, purpose } = this.state;
    if (onSetData) {
      onSetData("loan_information", {
        request_amount,
        purpose,
      });
    }
  }

  getOptions(appType) {
    let optionList = {
      "Business financing": "Business financing",
      "Consolidate debt": "Consolidate debt",
      "Foster green initiative": "Foster green initiative",
      "Funeral expense": "Funeral expense",
      "Improve home": "Improve home",
      "Medical expense": "Medical expense",
      "Purchase home": "Purchase home",
      "Pursue education": "Pursue education",
      "Refinance car": "Refinance car",
      "Refinance credit cards": "Refinance credit cards",
      "Relocation expense": "Relocation expense",
      "Special purchase": "Special purchase",
      "Take a vacation": "Take a vacation",
      "Unexpected expense": "Unexpected expense",
      "Wedding expense": "Wedding expense",
    };
    if ("Credit Card" != appType) optionList["Vehicle Loan"] = "Vehicle Loan";
    optionList["Other"] = "Other";
    if ("Small Business Loan" == appType)
      optionList = {
        "Business financing": "Business Financing",
        "Consolidate debt": "Consolidate Debt",
        "Equipment Purchase": "Equipment Purchase",
        "Foster green initiative": "Foster Green Initiative",
        "Inventory Purchase": "Inventory Purchase",
        "Line of Credit": "Line of Credit",
        Other: "Other",
        "Real Estate Purchase": "Real Estate Purchase",
        "Refinance credit cards": "Refinance Credit Cards",
        "Relocation expense": "Relocation Expense",
        "Special purchase": "Special Purchase",
        "Unexpected expense": "Unexpected Expense",
      };
    return optionList;
  }

  renderRequestAmount() {
    const { styles, renderValidationMessage, renderErrorClass } = this.props;
    const { request_amount } = this.state;
    return (
      <div className={styles.cFormRowRequestAmount}>
        <FormInputComponent
          type="number"
          value={request_amount}
          height={0.1}
          hidden
        />
        <label>Request Amount</label>
        <div className={styles.cRequestAmountWrap}>
          <label>$</label>
          <FormInputComponent
            type="text"
            value={Helper.formatNumber(request_amount)}
            onChange={(e) => this.inputFloatField(e, "request_amount")}
            disableAutoComplete
            additionalClassName={renderErrorClass(
              "loan_information.request_amount"
            )}
          />
        </div>
        <div className={styles.cFormRequestAmountSpan}>
          {renderValidationMessage(
            "loan_information.request_amount",
            "Min $500"
          )}
        </div>
      </div>
    );
  }

  // Preview Content
  renderPreviewContent() {
    const { styles } = this.props;
    const { request_amount, purpose } = this.state;
    return (
      <Fragment>
        <div className={styles.cDataRow}>
          <label>Request Amount</label>
          <span>{request_amount}</span>
        </div>
        <div className={[styles.cDataRow, "mb-3"].join(" ")}>
          <label>Purpose</label>
          <span>{purpose}</span>
        </div>
      </Fragment>
    );
  }

  renderApplicantContent() {
    const { styles } = this.props;
    const { request_amount, purpose } = this.state;
    return (
      <div className="row">
        <div className="col-md-3">
          <div className={styles.cFormRowRequestAmount}>
            <label>Loan Amount</label>${Helper.formatNumber(request_amount)}
          </div>
        </div>
        <div className="col-md-8">
          <div className={styles.cFormRow}>
            <label>Purpose</label>
            {purpose}
          </div>
        </div>
      </div>
    );
  }

  // Edit Content
  renderEditContent() {
    const { purpose } = this.state;
    const {
      appType,
      styles,
      loanRef,
      renderValidationMessage,
      renderErrorClass,
    } = this.props;

    return (
      <div className="row" ref={loanRef}>
        <div className="col-md-3">{this.renderRequestAmount()}</div>
        <div className="col-md-8">
          <div className={styles.cFormRow}>
            <label>Purpose</label>
            <FormSelectComponent
              value={purpose}
              onChange={(e) => this.inputField(e, "purpose")}
              onKeyDown={(e) => this.props.onOptionSelected(e)}
              options={this.getOptions(appType)}
              placeholder="Select a purpose for the loan"
              additionalClassName={renderErrorClass("loan_information.purpose")}
            />
            {renderValidationMessage("loan_information.purpose")}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { preview, index, styles } = this.props;

    return (
      <div className={styles.cRow}>
        <div className={styles.cRowLabel}>
          <label>Loan Information</label>
        </div>
        {/* .c-row-label */}
        <div className={styles.cRowContent}>
          {index > 0
            ? this.renderApplicantContent()
            : preview
            ? this.renderPreviewContent()
            : this.renderEditContent()}
          <div className="spacer"></div>
        </div>
        {/* .c-row-content */}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(LoanInformation));
