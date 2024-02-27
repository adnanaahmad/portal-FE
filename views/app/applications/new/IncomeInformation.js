import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  FormInputComponent,
  FormSelectComponent,
} from "../../../../components";
import { INCOMETYPES } from "../../../../utils/Constant";
import Helper from "../../../../utils/Helper";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    fillDemoData: state.global.fillDemoData,
  };
};

class IncomeInformation extends Component {
  constructor(props) {
    super(props);
    let data = Helper.fetchApplicantData(this.props, "income_information");
    if (!data) {
      data = {
        income_type: "",
        annual_income: "",
        household_income: "",
        net_income: "",
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
        income_type: "Employed",
        annual_income: "120000",
        household_income: "120000",
        net_income: "10000",
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
    const { income_type, annual_income, household_income, net_income } =
      this.state;

    if (onSetData) {
      onSetData("income_information", {
        income_type,
        annual_income,
        household_income,
        net_income,
      });
    }
  }

  // Preview Content
  renderPreviewContent() {
    const { styles } = this.props;
    const { income_type, annual_income, household_income, net_income } =
      this.state;

    return (
      <Fragment>
        <div className={styles.cDataRow}>
          <label>Type of Income</label>
          <span>{income_type}</span>
        </div>
        <div
          style={{
            display:
              income_type !== INCOMETYPES.Unemployed && income_type !== ""
                ? "block"
                : "none",
          }}
        >
          <div className={styles.cDataRow}>
            <label>Individual Annual Income</label>
            <span>${Helper.formatNumber(annual_income)} per year</span>
          </div>
          <div className={styles.cDataRow}>
            <label>Total Household Income</label>
            <span>${Helper.formatNumber(household_income)} per year</span>
          </div>
          <div className={[styles.cDataRow, "mb-3"].join(" ")}>
            <label>Net Income</label>
            <span>${Helper.formatNumber(net_income)} per month</span>
          </div>
        </div>
      </Fragment>
    );
  }

  // Edit Content
  renderEditContent() {
    const { styles, renderErrorClass, renderValidationMessage, incomeRef } =
      this.props;
    const { income_type, annual_income, household_income, net_income } =
      this.state;
    return (
      <Fragment>
        <div className="row" ref={incomeRef}>
          <div className="col-md-8">
            <div className={styles.cFormRow}>
              <label>Type of Income</label>
              <FormSelectComponent
                value={income_type}
                onChange={(e) => this.inputField(e, "income_type")}
                onKeyDown={(e) => this.props.onOptionSelected(e)}
                options={INCOMETYPES}
                placeholder="Select a type of income"
                additionalClassName={renderErrorClass(
                  "income_information.income_type"
                )}
              />
              {renderValidationMessage("income_information.income_type")}
            </div>
          </div>
        </div>
        <div
          style={{
            display:
              income_type !== INCOMETYPES.Unemployed && income_type !== ""
                ? "block"
                : "none",
          }}
        >
          <div className={styles.cFormRow}>
            <label>Individual Annual Income</label>
            <div className={styles.cIncomeWrap}>
              <label>$</label>
              <FormInputComponent
                type="text"
                value={Helper.formatNumber2(annual_income)}
                onChange={(e) => this.inputFloatField(e, "annual_income")}
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "income_information.annual_income"
                )}
              />
              {renderValidationMessage("income_information.annual_income")}
              <label>per year</label>
            </div>
          </div>
          <div className={styles.cFormRow}>
            <label>Total Household Income</label>
            <div className={styles.cIncomeWrap}>
              <label>$</label>
              <FormInputComponent
                type="text"
                value={Helper.formatNumber2(household_income)}
                onChange={(e) => this.inputFloatField(e, "household_income")}
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "income_information.household_income"
                )}
              />
              {renderValidationMessage("income_information.household_income")}
              <label>per year</label>
            </div>
          </div>
          <div className={styles.cFormRow}>
            <label>Net Income</label>
            <div className={styles.cIncomeWrap}>
              <label>$</label>
              <FormInputComponent
                type="text"
                value={Helper.formatNumber2(net_income)}
                onChange={(e) => this.inputFloatField(e, "net_income")}
                disableAutoComplete
                additionalClassName={renderErrorClass(
                  "income_information.net_income"
                )}
              />
              {renderValidationMessage("income_information.net_income")}
              <label>per month</label>
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
          <label>Income Information</label>
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

export default connect(mapStateToProps)(withRouter(IncomeInformation));
