import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import ApplicationInformationView from "./ApplicationInformation";
import FormControl from "@material-ui/core/FormControl";
import Helper from "../../../../utils/Helper";
import IdentifierView from "./Identifier";
import LoanInformationView from "./LoanInformation";
import PersonalInformationView from "./PersonalInformation";
import ResidentialAddressView from "./ResidentialAddress";
import FormerAddressView from "./FormerAddress";
import EmploymentInformationView from "./EmploymentInformation";
import IncomeInformationView from "./IncomeInformation";
import BankInformationView from "./BankInformation";
import BusinessInformationView from "./BusinessInformation";
import { removeActiveModal, setTXModalApp } from "../../../../redux/actions";

import {
  setActiveModal,
  showAlert,
  showCanvas,
  hideCanvas,
} from "../../../../redux/actions";
import { createApplication } from "../../../../utils/Thunk";
import {
  checkValidationErrors,
  getClasses,
} from "../../../../utils/ApplicationFormValidation";

import formInputStyles from "../../../../components/form-control/form-input/form-input.module.scss";
import styles from "./new-application.module.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    index: Helper.getIndex(state.global),
  };
};

class NewApplication extends Component {
  constructor(props) {
    super(props);
    const applicants = Helper.fetchApplicants();
    // if (applicants.length > 0 && Helper.getIndex(this.props) === -1) {
    //   this.props.history.replace("/app/applications");
    //   return;
    // }

    let index = Helper.getParamIndex(this.props);

    const count = applicants.length;
    let data;
    if (index > -1) {
      data = Helper.fetchApplicant(index);
      data.index = index;
      data.preview = false;
      data.checked = false;
    } else {
      index = Helper.getIndex(this.props);
      data = {
        type: "Credit Card",
        identifier: {},
        loan_information: {},
        personal_information: {},
        residential_address: {},
        employment_information: {},
        income_information: {},
        bank_information: {},
        business_information: {},
        preview: false,
        checked: false,
        app_type_open: false,
        is_coapplicant: Helper.fetchApplicants().length > 0 ? "yes" : "no",
        errors: {},
      };

      if (count > 0) {
        let primary = applicants[0];
        data.loan_information = primary.loan_information;
        data.is_coapplicant = "yes";
      }
    }
    this.state = data;
    this.loanInformationRef = React.createRef();
    this.personalInformationRef = React.createRef();
    this.residentialInformationRef = React.createRef();
    this.employmentInformationRef = React.createRef();
    this.incomeInformationRef = React.createRef();
    this.bankInformationRef = React.createRef();
    this.formerInformationRef = React.createRef();
    this.businessInformationRef = React.createRef();
  }

  componentDidMount() {
    //TODO: Improve this
    const type = Helper.fetchAppType();
    if (type) this.setState({ type });
    window.addEventListener("beforeunload", this.closeModal());
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = this._backConfirm;

    document.addEventListener("keypress", (e) => {
      const isModalOpen =
        document.getElementsByClassName("custom-modals").length > 0 ? 1 : 0;

      // `Enter` key is pressed
      if (e.keyCode == 13 && !isModalOpen) {
        this.clickOnDefaultButton();
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.closeModal());
    window.onpopstate = () => {};
  }

  // Close Modal
  closeModal() {
    this.props.dispatch(setTXModalApp({}));
    this.props.dispatch(removeActiveModal());
  }

  inputField(e, key) {
    this.setState({ [key]: e.target.value });
    if (key == "type") Helper.storeAppType(e.target.value);
  }

  // Cancel
  clickCancel = (e) => {
    e.preventDefault();
    let index = Helper.getIndex(this.props);
    if (index > -1) {
      const applicant = Helper.fetchApplicant(index);
      if (!applicant) {
        index = -1;
      }
    }

    if (index === -1) {
      this.props.dispatch(setActiveModal("cancel-new-application"));
    } else {
      this.props.history.replace("/app/applicants");
    }
  };

  // Start Over
  clickStartOver = (e) => {
    e.preventDefault();
    this.props.dispatch(setActiveModal("start-over-new-application"));
  };

  setData = (key, value) => {
    this.setState({ [key]: value }, () => {
      this.handleErrors(key);
    });
  };

  checkFormerAddressValidation = () => {
    this.handleErrors("former_address");
  };
  // this function check for the errors after the data is set to the state.
  handleErrors = (key) => {
    // if initially errors object is empty it will return.
    if (!Object.keys(this.state.errors).length) {
      return;
    }
    let { errorsList: validationErrors } = checkValidationErrors(
      this.state,
      key
    );
    // in errors object given section (key) is destructured and
    // replaced section (key) retrived from check validation errors function
    // and errors in state object is updated.
    const updatedErrorsObject = {
      ...this.state.errors,
      [key]: { ...validationErrors[key] },
    };
    // errors state is updated with updated errors object.
    this.setState({
      errors: { ...updatedErrorsObject },
    });
  };

  // Submit Application
  submitApp = (e) => {
    const finalSubmitButton = this.getFinalSubmitButton();
    if (finalSubmitButton) {
      finalSubmitButton.disabled = true;
    }

    e.preventDefault();
    // Validation
    const {
      type,
      identifier,
      loan_information,
      personal_information,
      residential_address,
      former_address,
      employment_information,
      income_information,
      bank_information,
      business_information,
      is_coapplicant,
      index,
    } = this.state;

    if (!type) {
      this.props.dispatch(showAlert("Please select application type"));
      if (finalSubmitButton) {
        finalSubmitButton.disabled = false;
      }
      return;
    }

    const app_id = identifier && identifier.app_id ? identifier.app_id : "";

    const params = {
      type,
      app_id,
      loan_information,
      personal_information,
      residential_address,
      former_address,
      employment_information,
      income_information,
      bank_information,
      business_information,
    };

    if (is_coapplicant === "yes") {
      Helper.updateApplicant(this.state, index);
      const { history } = this.props;
      //history.push("/app/applications");
      history.replace("/app/applicants");
      return;
    }

    Helper.removeApplicants();

    this.props.dispatch(
      createApplication(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success && res.application) {
            const { history } = this.props;
            history.push(`/app/application/${res.application.app_id}`);
          } else {
            if (finalSubmitButton) {
              finalSubmitButton.disabled = false;
            }
          }
        }
      )
    );
  };

  // Submit for Preview
  submit = (e) => {
    e.preventDefault();
    //const { account_type } = this.state;
    // Need Validation Here

    // if (!account_type) {
    //   this.props.dispatch(showAlert("Please select bank account type"));
    //   return;
    // }
    //Check for validation errors
    let { errorsList: validationErrors, ref } = checkValidationErrors(
      this.state
    );
    if (Object.keys(validationErrors).length) {
      this.setState({
        errors: { ...validationErrors },
      });
      // scroll to the possible errors section
      this[ref].current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      validationErrors = {};
      return;
    }
    this.setState({ errors: {} });
    // Enable Preview
    this.enablePreview();
  };

  // Enable Preview
  enablePreview() {
    this.setState({ preview: true });
  }

  // Disable Preview
  disablePreview() {
    this.setState({ preview: false });
  }

  handleKeyDown = (e) => {
    // `Enter` key is pressed
    if (e.keyCode == 13) {
      this.handleAppTypeClose();
      e.preventDefault();
      this.clickOnDefaultButton();
    }
  };

  getFinalSubmitButton() {
    return document.getElementById("finalSubmitButton");
  }

  clickOnDefaultButton() {
    const initSubmitButton = document.getElementById("initSubmitButton");
    if (initSubmitButton) {
      initSubmitButton.click();
    } else {
      const finalSubmitButton = this.getFinalSubmitButton();
      if (finalSubmitButton) {
        finalSubmitButton.click();
      }
    }
  }

  handleAppTypeOpen = () => {
    this.setState({ app_type_open: true });
  };

  handleAppTypeClose = () => {
    this.setState({ app_type_open: false });
  };

  // this function check if error exist in errors object the retrieve its message and return.
  renderValidationMessage = (field, subText) => {
    const { errors } = this.state;
    const [keyPrefix, fieldName] = field.split(".");
    let section = keyPrefix;
    let classes = getClasses(fieldName, styles);
    return errors && errors[section] && errors[section][fieldName] ? (
      <p className={`${classes}`}>{`${errors[section][fieldName]}`}</p>
    ) : (
      <span>{subText}</span>
    );
  };

  // this function check if field error exist in array then style class is returned
  renderErrorClass = (field) => {
    const [keyPrefix, fieldName] = field.split(".");
    let section = keyPrefix;
    const { errors } = this.state;
    return errors && errors[section] && errors[section][fieldName]
      ? styles.inputError
      : "";
  };

  // it removes all errors and set state to empty
  resetErrors = () => {
    this.setState({ errors: {} });
  };

  // Header Buttons
  renderHeaderButtons() {
    const { preview } = this.state;
    return (
      <div className={styles.appNewApplicationPageHeader__buttons}>
        {preview ? (
          <a
            className={[
              "btn btn-transparent",
              styles.btnAppNewApplicationPageHeader,
            ].join(" ")}
            onClick={() => this.disablePreview()}
          >
            Edit
          </a>
        ) : null}
        <a
          className={[
            "btn btn-light",
            styles.btnAppNewApplicationPageHeader,
          ].join(" ")}
          onClick={this.clickCancel}
        >
          Cancel
        </a>
        {!preview ? (
          <a
            className={[
              "btn btn-primary-outline",
              styles.btnAppNewApplicationPageHeader,
            ].join(" ")}
            onClick={this.clickStartOver}
          >
            Start Over
          </a>
        ) : null}
      </div>
    );
  }

  // Footer Buttons
  renderFooterButtons() {
    const {
      preview,
      residential_address,
      employment_information,
      is_coapplicant,
    } = this.state;

    return (
      <div className={styles.appNewApplicationPage__buttons}>
        {!preview ? (
          <a
            className={[
              "btn btn-primary-outline",
              styles.btnAppNewApplicationPage,
            ].join(" ")}
            onClick={this.clickStartOver}
          >
            Start Over
          </a>
        ) : null}

        <a
          className={["btn btn-light", styles.btnAppNewApplicationPage].join(
            " "
          )}
          onClick={this.clickCancel}
        >
          Cancel
        </a>

        {preview ? (
          <a
            className={[
              "btn btn-transparent",
              styles.btnAppNewApplicationPage,
            ].join(" ")}
            onClick={() => this.disablePreview()}
          >
            Edit
          </a>
        ) : null}

        {!preview ? (
          <button
            id="initSubmitButton"
            type="submit"
            className={[
              "btn btn-primary",
              styles.btnAppNewApplicationPage,
            ].join(" ")}
            disabled={
              residential_address.show_alert ||
              employment_information.show_alert
            }
          >
            {is_coapplicant === "yes"
              ? "Continue"
              : "Continue to Submit Application"}
          </button>
        ) : (
          <a
            id="finalSubmitButton"
            className={[
              "btn btn-primary",
              styles.btnAppNewApplicationPage,
            ].join(" ")}
            onClick={this.submitApp}
          >
            {is_coapplicant === "yes" ? "Continue" : "Submit Application"}
          </a>
        )}
      </div>
    );
  }

  setCoApplicant(value) {
    this.setState({ is_coapplicant: value });
  }

  rendApplicationInformationView() {
    const { type, preview, do_coapplicant, is_coapplicant } = this.state;

    return (
      <div className={styles.appNewApplicationPageHeader__buttons}>
        {do_coapplicant != "yes" ? (
          <ApplicationInformationView
            styles={styles}
            appType={type}
            onSetData={this.setData}
            preview={preview}
            do_coapplicant={do_coapplicant}
            is_coapplicant={is_coapplicant}
            sendCoapplicant={this.setCoApplicant.bind(this)}
          />
        ) : null}
      </div>
    );
  }

  render() {
    const { authUser, index } = this.props;
    if (!authUser || !authUser.id) return null;
    if (authUser.role == "admin") return <Redirect to="/app" />;
    const count = Helper.fetchApplicants().length;

    const { type, preview, checked, residential_address, app_type_open } =
      this.state;
    //TODO: Delete this later
    return (
      <div className={styles.appNewApplicationPage}>
        <div className="c-container">
          <div
            className={["row", styles.appNewApplicationPageHeader].join(" ")}
          >
            <div className="col-md-8">
              <h2>
                {index && index > 0
                  ? `Co-Applicant ${index}`
                  : count > 0
                  ? "Primary Applicant"
                  : "New Application"}
              </h2>
              <FormControl variant="outlined" onKeyDown={this.handleKeyDown}>
                <Select
                  value={type}
                  onChange={(e) => this.inputField(e, "type")}
                  open={app_type_open}
                  onClose={this.handleAppTypeClose}
                  onOpen={this.handleAppTypeOpen}
                  disabled={preview || index > 0}
                >
                  <MenuItem value="Credit Card">Credit Card</MenuItem>
                  <MenuItem value="Personal Loan">Personal Loan</MenuItem>
                  <MenuItem value="Small Business Loan">
                    Small Business Loan
                  </MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="col-md-4">{this.renderHeaderButtons()}</div>
          </div>
          <div className="spacer mt-4 mb-4"></div>
          <form action="" method="POST" onSubmit={this.submit}>
            <IdentifierView
              styles={styles}
              onSetData={this.setData}
              onOptionSelected={this.handleKeyDown}
              preview={preview}
              onResetErrors={this.resetErrors}
            />
            {type !== "Credit Card" ? (
              <div>{this.rendApplicationInformationView()}</div>
            ) : null}
            {type != "Credit Card" && (index < 1 || !preview) ? (
              <LoanInformationView
                styles={styles}
                appType={type}
                onSetData={this.setData}
                onOptionSelected={this.handleKeyDown}
                preview={preview}
                errors={this.state.errors}
                loanRef={this.loanInformationRef}
                renderValidationMessage={this.renderValidationMessage}
                renderErrorClass={this.renderErrorClass}
              />
            ) : null}
            <PersonalInformationView
              styles={[styles, formInputStyles]}
              onSetData={this.setData}
              onOptionSelected={this.handleKeyDown}
              preview={preview}
              errors={this.state.errors}
              personalRef={this.personalInformationRef}
              renderValidationMessage={this.renderValidationMessage}
              renderErrorClass={this.renderErrorClass}
            />
            <ResidentialAddressView
              styles={styles}
              onSetData={this.setData}
              onOptionSelected={this.handleKeyDown}
              preview={preview}
              errors={this.state.errors}
              addressRef={this.residentialInformationRef}
              renderValidationMessage={this.renderValidationMessage}
              renderErrorClass={this.renderErrorClass}
              checkFormerAddressValidation={this.checkFormerAddressValidation}
            />
            <FormerAddressView
              styles={styles}
              onSetData={this.setData}
              onOptionSelected={this.handleKeyDown}
              preview={preview}
              required={parseInt(residential_address.live_period, 10) < 24}
              errors={this.state.errors}
              formerRef={this.formerInformationRef}
              renderValidationMessage={this.renderValidationMessage}
              renderErrorClass={this.renderErrorClass}
            />
            <EmploymentInformationView
              styles={styles}
              onSetData={this.setData}
              onOptionSelected={this.handleKeyDown}
              preview={preview}
              errors={this.state.errors}
              employmentRef={this.employmentInformationRef}
              renderValidationMessage={this.renderValidationMessage}
              renderErrorClass={this.renderErrorClass}
            />
            <IncomeInformationView
              styles={styles}
              onSetData={this.setData}
              onOptionSelected={this.handleKeyDown}
              preview={preview}
              errors={this.state.errors}
              incomeRef={this.incomeInformationRef}
              renderValidationMessage={this.renderValidationMessage}
              renderErrorClass={this.renderErrorClass}
            />
            <BankInformationView
              styles={styles}
              onSetData={this.setData}
              preview={preview}
              errors={this.state.errors}
              bankRef={this.bankInformationRef}
              renderValidationMessage={this.renderValidationMessage}
              renderErrorClass={this.renderErrorClass}
            />
            {type == "Small Business Loan" && (index < 1 || !preview) ? (
              <BusinessInformationView
                styles={[styles, formInputStyles]}
                onSetData={this.setData}
                onOptionSelected={this.handleKeyDown}
                preview={preview}
                errors={this.state.errors}
                businessRef={this.businessInformationRef}
                renderValidationMessage={this.renderValidationMessage}
                renderErrorClass={this.renderErrorClass}
              />
            ) : null}

            <div className="spacer mt-4 mb-4"></div>
            {!preview ? (
              <div className={styles.cRow}>
                <div className={styles.cRowLabel}></div>
                <div className={styles.cRowContent}>
                  <div
                    className={[
                      formInputStyles.customFormControl,
                      formInputStyles.customFormControlCheckbox,
                      "mb-4",
                    ].join(" ")}
                  >
                    <input
                      checked={checked}
                      required
                      id="confirm-app"
                      type="checkbox"
                      onChange={(e) =>
                        this.setState({ checked: e.target.checked })
                      }
                    />
                    <label
                      className="font-size-13"
                      htmlFor="confirm-app"
                    >{`I am a loan officer with full permission from the consumer to run this application as the consumer's proxy`}</label>
                  </div>
                </div>
              </div>
            ) : null}
            {this.renderFooterButtons()}
          </form>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(NewApplication));
