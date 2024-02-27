import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { FormInputComponent, FormSelectComponent } from "../../../components";
import { showAlert, showCanvas, hideCanvas } from "../../../redux/actions";
import { BUILD_TYPE, COUNTRYLIST } from "../../../utils/Constant";
import Helper from "../../../utils/Helper";
import { cityRegex, streetAddressRegex, aptSuiteNumberRegex, nameRegex } from "../../../utils/Regex";
import { register } from "../../../utils/Thunk";

import formInputStyles from "../../../components/form-control/form-input/form-input.module.scss";
import styles from "./register.module.scss";

const mapStateToProps = (state) => {
  return {
    buildType: state.global.buildType,
  };
};

class Register extends Component {
  componentDidMount() {
    const companyNameField = document.getElementById("companyNameField");
    if (companyNameField) {
      companyNameField.focus();
    }

    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        this.clickOnDefaultButton();
      }
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      company_name: "",
      address: "",
      address2: "",
      city: "",
      country: "",
      state: "",
      zip: "",
      first_name: "",
      last_name: "",
      phone: "",
      ext: "",
      email: "",
      email_confirm: "",
      code: "",
      checked: false,
    };
  }

  getCountryOptions() {
    let options = {};
    COUNTRYLIST.forEach((item) => {
      options[item] = item;
    });
    return options;
  }

  inputField(e, key) {
    this.setState({ [key]: e.target.value });
  }

  setCheck = (e) => {
    const checked = e.target.checked;
    this.setState({ checked });
  };

  handleKeyDown = (e) => {
    // `Enter` key is pressed
    if (e.keyCode == 13) {
      e.preventDefault();
      this.clickOnDefaultButton();
    }
  };

  getRegisterButton() {
    return document.getElementById("registerButton");
  }

  clickOnDefaultButton() {
    const registerButton = this.getRegisterButton();
    if (registerButton) {
      registerButton.click();
    }
  }

  submit = (e) => {
    const registerButton = this.getRegisterButton();
    if (registerButton) {
      registerButton.disabled = true;
    }

    e.preventDefault();

    const {
      company_name,
      address,
      address2,
      city,
      country,
      state,
      zip,
      first_name,
      last_name,
      phone,
      ext,
      email,
      email_confirm,
      code,
      checked,
    } = this.state;

    if (!company_name.trim()) {
      this.props.dispatch(showAlert("Please input company name"));
      if (registerButton) {
        registerButton.disabled = false;
      }
      return;
    }

    if (!address.trim()) {
      this.props.dispatch(showAlert("Please input street address"));
      if (registerButton) {
        registerButton.disabled = false;
      }

      return;
    }

    if (!city.trim()) {
      this.props.dispatch(showAlert("Please input city"));
      if (registerButton) {
        registerButton.disabled = false;
      }

      return;
    }

    if (!country.trim()) {
      this.props.dispatch(showAlert("Please input country"));
      if (registerButton) {
        registerButton.disabled = false;
      }

      return;
    }

    if (!state.trim()) {
      this.props.dispatch(showAlert("Please input state"));
      if (registerButton) {
        registerButton.disabled = false;
      }
      return;
    }

    if (!zip.trim()) {
      this.props.dispatch(showAlert("Please input zip code"));
      if (registerButton) {
        registerButton.disabled = false;
      }

      return;
    }

    if (!first_name.trim()) {
      this.props.dispatch(showAlert("Please input first name"));
      if (registerButton) {
        registerButton.disabled = false;
      }

      return;
    }

    if (!last_name.trim()) {
      this.props.dispatch(showAlert("Please input last name"));
      if (registerButton) {
        registerButton.disabled = false;
      }

      return;
    }

    if (!phone.trim()) {
      this.props.dispatch(showAlert("Please input phone number"));
      if (registerButton) {
        registerButton.disabled = false;
      }

      return;
    }

    if (!email.trim() || !email_confirm.trim()) {
      this.props.dispatch(showAlert("Please input work email"));
      if (registerButton) {
        registerButton.disabled = false;
      }
      return;
    }

    if (email.trim() != email_confirm.trim()) {
      this.props.dispatch(showAlert("Please confirm work email"));
      if (registerButton) {
        registerButton.disabled = false;
      }

      return;
    }

    if (!Helper.validateEmail(email.trim())) {
      this.props.dispatch(showAlert("Please input valid email address"));
      if (registerButton) {
        registerButton.disabled = false;
      }

      return;
    }

    if (!code.trim()) {
      this.props.dispatch(showAlert("Please input invitation code"));
      if (registerButton) {
        registerButton.disabled = false;
      }

      return;
    }

    if (!checked) {
      this.props.dispatch(showAlert("Please accept the terms & conditions"));
      if (registerButton) {
        registerButton.disabled = false;
      }

      return;
    }

    const params = {
      company: company_name.trim(),
      address: address.trim(),
      address_option: address2.trim(),
      city: city.trim(),
      country: country.trim(),
      state: state.trim(),
      zip: zip.trim(),
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      phone: phone.trim(),
      ext: ext.trim(),
      email: email.trim(),
      code: code.trim(),
      // eslint-disable-next-line no-undef
      url: process.env.NEXT_PUBLIC_MAIN_URL,
    };

    this.props.dispatch(
      register(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            const { history } = this.props;
            history.push("/");
            this.props.dispatch(
              showAlert(
                "Please check your inbox and activate your account",
                "success"
              )
            );
          } else {
            if (registerButton) {
              registerButton.disabled = false;
            }
          }
        }
      )
    );
  };

  render() {
    const {
      company_name,
      address,
      address2,
      city,
      country,
      state,
      zip,
      first_name,
      last_name,
      phone,
      ext,
      email,
      email_confirm,
      code,
      checked,
    } = this.state;

    return (
      <div className={styles.registerPage}>
        <div className={["white-box", styles.whiteBox].join(" ")}>
          <form method="post" action="" onSubmit={this.submit}>
            <div className={styles.registerPage__header}>
              <Link to="/">
                <img src="/logo.svg" width="112" height="24" alt="" />
              </Link>
              <span></span>
              <h3>Register an Account</h3>
            </div>

            <h4 className="mt-4">Business Information</h4>
            <div className={styles.cFormRow}>
              <label>Company Name</label>
              <FormInputComponent
                id="companyNameField"
                type="text"
                required={true}
                value={company_name}
                onChange={(e) => this.inputField(e, "company_name")}
              />
            </div>
            <div className="row">
              <div className="col-md-8">
                <div className={styles.cFormRow}>
                  <label>Street Address</label>
                  <FormInputComponent
                    type="text"
                    required={true}
                    value={address}
                    onChange={(e) => this.inputField(e, "address")}
                    pattern={streetAddressRegex.source}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className={styles.cFormRow}>
                  <label>Suite, Unit, Floor, etc.</label>
                  <FormInputComponent
                    type="text"
                    value={address2}
                    onChange={(e) => this.inputField(e, "address2")}
                    pattern={aptSuiteNumberRegex.source}
                  />
                  <span>Optional</span>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-4">
                <div className={styles.cFormRow}>
                  <label>City</label>
                  <FormInputComponent
                    type="text"
                    required={true}
                    value={city}
                    onChange={(e) => this.inputField(e, "city")}
                    pattern={cityRegex.source}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className={styles.cFormRow}>
                  <label>Country</label>
                  <FormSelectComponent
                    value={country}
                    placeholder="Select..."
                    required={true}
                    onChange={(e) => this.inputField(e, "country")}
                    onKeyDown={this.handleKeyDown}
                    options={this.getCountryOptions()}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className={styles.cFormRow}>
                  <label>State</label>
                  <FormSelectComponent
                    required={true}
                    value={state}
                    onChange={(e) => this.inputField(e, "state")}
                    options={Helper.getStateOptions()}
                    placeholder="Select a State"
                  />
                </div>
              </div>
              <div className="col-md-2">
                <div className={styles.cFormRow}>
                  <label>ZIP Code</label>
                  <FormInputComponent
                    type="text"
                    required={true}
                    value={zip}
                    onChange={(e) => this.inputField(e, "zip")}
                    pattern="^[0-9]{5}$"
                  />
                </div>
              </div>
            </div>
            <div className="spacer my-4"></div>
            <h4>Account Information</h4>
            <div className="row">
              <div className="col-md-6">
                <div className={styles.cFormRow}>
                  <label>First Name</label>
                  <FormInputComponent
                    type="text"
                    required={true}
                    value={first_name}
                    onChange={(e) => this.inputField(e, "first_name")}
                    pattern={nameRegex.source}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className={styles.cFormRow}>
                  <label>Last Name</label>
                  <FormInputComponent
                    type="text"
                    required={true}
                    value={last_name}
                    onChange={(e) => this.inputField(e, "last_name")}
                    pattern={nameRegex.source}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className={styles.cFormRow}>
                  <label>Phone Number</label>
                  <FormInputComponent
                    type="text"
                    required={true}
                    value={phone}
                    onChange={(e) => this.inputField(e, "phone")}
                    pattern="^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$"
                  />
                </div>
              </div>
              <div className="col-md-3">
                <div className={styles.cFormRow}>
                  <label>Ext.</label>
                  <FormInputComponent
                    type="text"
                    value={ext}
                    onChange={(e) => this.inputField(e, "ext")}
                  />
                  <span>Optional</span>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className={styles.cFormRow}>
                  <label>Work Email</label>
                  <FormInputComponent
                    type="email"
                    required={true}
                    value={email}
                    onChange={(e) => this.inputField(e, "email")}
                  />
                  <small>You will use this to log into FortifID portal.</small>
                </div>
              </div>
              <div className="col-md-6">
                <div className={styles.cFormRow}>
                  <label>Confirm Email Address</label>
                  <FormInputComponent
                    type="email"
                    required={true}
                    value={email_confirm}
                    onChange={(e) => this.inputField(e, "email_confirm")}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className={styles.cFormRow}>
                  <label>Invitation Code</label>
                  <FormInputComponent
                    value={code}
                    required
                    type="text"
                    onChange={(e) => this.inputField(e, "code")}
                  />
                </div>
              </div>
            </div>
            <div className={styles.cFormRow}>
              <div
                className={[
                  "custom-form-control",
                  formInputStyles.customFormControl,
                  formInputStyles.customFormControlCheckbox,
                ].join(" ")}
              >
                <input
                  id="agree-box"
                  type="checkbox"
                  checked={checked}
                  onChange={this.setCheck}
                />
                <label htmlFor="agree-box">
                  I accept the{" "}
                  <a
                    href="https://www.fortifid.com/terms-and-conditions"
                    target="_blank"
                    rel="noreferrer"
                  >
                    terms &amp; conditions
                  </a>
                </label>
              </div>
            </div>
            <div className={styles.registerPage_button}>
              <p className="font-size-14">
                Already have an account? <Link to="/login">Login</Link>
              </p>
              <button
                id="registerButton"
                type="submit"
                className={["btn btn-primary", styles.btnRegisterPage].join(
                  " "
                )}
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Register));
