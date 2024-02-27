import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  BlockAlertComponent,
  FormInputComponent,
  FormSelectComponent,
} from "../../../components";
import {
  setBlockAlertData,
  showAlert,
  showCanvas,
  hideCanvas,
  setActiveModal,
  setCustomConfirmModalData,
} from "../../../redux/actions";
import { TIMEZONES } from "../../../utils/Constant";
import { nameRegex } from "../../../utils/Regex";
import { updateProfile } from "../../../utils/Thunk";

import styles from "./profile.module.scss";

const mapStateToProps = (state) => {
  return {
    blockAlertData: state.global.blockAlertData,
    authUser: state.global.authUser,
  };
};

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      first_name: "",
      last_name: "",
      email: "",
      timezone: "",
      twoFA_login: false,
      editable: false,
    };
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  componentDidMount() {
    this.initValues();

    document.addEventListener("keypress", this.handleKeyPress);
  }

  componentDidUpdate(prevProps) {
    const { authUser } = this.props;
    if (JSON.stringify(prevProps.authUser) != JSON.stringify(authUser))
      this.initValues();
  }

  componentWillUnmount() {
    this.props.dispatch(setBlockAlertData({}));
    document.removeEventListener("keypress", this.handleKeyPress);
  }

  initValues() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return;

    this.setState({
      first_name: authUser.first_name,
      last_name: authUser.last_name,
      email: authUser.email,
      timezone: authUser.profile.timezone,
      twoFA_login: authUser.profile.twoFA_login ? true : false,
    });
  }

  handleKeyPress(e) {
    const isModalOpen =
    document.getElementsByClassName("custom-modals").length > 0 ? 1 : 0;

    // `Enter` key is pressed
    if (e.keyCode == 13 && !isModalOpen) {
      this.clickOnDefaultButton();
    }
  }

  inputField(e, key) {
    this.setState({ [key]: e.target.value });
  }

  toggleEdit = (e) => {
    e.preventDefault();
    const { editable } = this.state;
    if (editable) {
      this.initValues();
    }
    this.setState({ editable: !editable });
  };

  disableUpdateInfoButton() {
    const updateInfoButton = this.getUpdateInfoButton();
    if (updateInfoButton) {
      updateInfoButton.disabled = true;
    }
  }

  enableUpdateInfoButton() {
    const updateInfoButton = this.getUpdateInfoButton();
    if (updateInfoButton) {
      updateInfoButton.disabled = false;
    }
  }

  showPasswordForm = (e) => {
    e.preventDefault();
    this.props.dispatch(setActiveModal("change-password"));
  };

  updateProfile = (e) => {
    this.disableUpdateInfoButton();

    e.preventDefault();

    const { first_name, last_name, email, timezone } = this.state;

    if (!first_name.trim()) {
      this.props.dispatch(showAlert("Please input first name"));
      this.enableUpdateInfoButton();
      return;
    }

    if (!last_name.trim()) {
      this.props.dispatch(showAlert("Please input last name"));
      this.enableUpdateInfoButton();
      return;
    }

    if (!email.trim()) {
      this.props.dispatch(showAlert("Please input email"));
      this.enableUpdateInfoButton();
      return;
    }

    if (!timezone.trim()) {
      this.props.dispatch(showAlert("Please input timezone"));
      this.enableUpdateInfoButton();
      return;
    }

    const params = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim(),
      timezone: timezone.trim(),
    };

    this.props.dispatch(
      updateProfile(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.props.dispatch(
              setBlockAlertData({
                message: `Profile has been updated`,
                color: "success",
                type: "profile",
              })
            );
            this.enableUpdateInfoButton();
          } else {
            this.enableUpdateInfoButton();
          }
        }
      )
    );
  };

  turnOn = (e) => {
    e.preventDefault();
    this.props.dispatch(
      setCustomConfirmModalData({
        title: "Turn On Two-Factor Authentication",
        body: "Are you sure you want to turn on Two-Factor Authentication?",
        action: "enable-twoFA",
      })
    );
    this.props.dispatch(setActiveModal("custom-confirm"));
  };

  turnOff = (e) => {
    e.preventDefault();
    this.props.dispatch(
      setCustomConfirmModalData({
        title: "Turn Off Two-Factor Authentication",
        body: "Are you sure you want to turn off Two-Factor Authentication?",
        buttonColor: "danger",
        action: "disable-twoFA",
      })
    );
    this.props.dispatch(setActiveModal("custom-confirm"));
  };

  handleKeyDown = (e) => {
    // `Enter` key is pressed
    if (e.keyCode == 13) {
      e.preventDefault();
      this.clickOnDefaultButton();
    }
  };

  renderAlert() {
    const { blockAlertData } = this.props;
    if (blockAlertData && blockAlertData.type == "profile")
      return <BlockAlertComponent data={blockAlertData} />;

    return null;
  }

  clickOnDefaultButton() {
    const toggleEditButton = this.getToggleEditButton();
    if (toggleEditButton) {
      toggleEditButton.click();
    } else {
      const updateInfoButton = this.getUpdateInfoButton();
      if (updateInfoButton) {
        updateInfoButton.click();
      }
    }
  }

  getToggleEditButton() {
    return document.getElementById("toggleEditButton");
  }

  getUpdateInfoButton() {
    return document.getElementById("updateInfoButton");
  }

  render() {
    const { first_name, last_name, email, timezone, twoFA_login, editable } =
      this.state;
    return (
      <div className={styles.appProfilePage}>
        <div className="c-container small">
          {this.renderAlert()}
          <h2 className="mb-4">Your Profile</h2>
          <form action="" method="POST" onSubmit={this.updateProfile}>
            <div className="row">
              <div className="col-md-6">
                <div className={styles.cFormRow}>
                  <label>First name</label>
                  {editable ? (
                    <FormInputComponent
                      value={first_name}
                      onChange={(e) => this.inputField(e, "first_name")}
                      type="text"
                      height="40px"
                      required={true}
                      pattern={nameRegex.source}
                    />
                  ) : (
                    <span className="word-break-all">{first_name}</span>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className={styles.cFormRow}>
                  <label>Last name</label>
                  {editable ? (
                    <FormInputComponent
                      value={last_name}
                      onChange={(e) => this.inputField(e, "last_name")}
                      type="text"
                      height="40px"
                      required={true}
                      pattern={nameRegex.source}
                    />
                  ) : (
                    <span className="word-break-all">{last_name}</span>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.cFormRow}>
              <label>Work Email</label>
              {editable ? (
                <FormInputComponent
                  value={email}
                  onChange={(e) => this.inputField(e, "email")}
                  type="email"
                  height="40px"
                  required={true}
                  disabled={true}
                />
              ) : (
                <span>{email}</span>
              )}
            </div>
            <div className="row">
              <div className="col-md-10">
                <div className={styles.cFormRow}>
                  <label>Time Zone</label>
                  {editable ? (
                    <Fragment>
                      <FormSelectComponent
                        value={timezone}
                        options={TIMEZONES}
                        onChange={(e) => this.inputField(e, "timezone")}
                        onKeyDown={this.handleKeyDown}
                        height="40px"
                        required={true}
                        placeholder="Select a timezone..."
                      />
                      <small>{`Select the time zone for your current  location. This will be displayed wherever time and date is displayed in the application.`}</small>
                    </Fragment>
                  ) : (
                    <span>{TIMEZONES[timezone]}</span>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.appProfilePage__buttons}>
              {editable ? (
                <Fragment>
                  <button
                    id="updateInfoButton"
                    type="submit"
                    className={[
                      "btn btn-primary",
                      styles.btnAppProfilePage,
                    ].join(" ")}
                  >
                    Update Info
                  </button>
                  <a
                    className={["btn btn-light", styles.btnAppProfilePage].join(
                      " "
                    )}
                    onClick={this.toggleEdit}
                  >
                    Cancel
                  </a>
                </Fragment>
              ) : (
                <a
                  id="toggleEditButton"
                  className={["btn btn-primary", styles.btnAppProfilePage].join(
                    " "
                  )}
                  onClick={this.toggleEdit}
                >
                  Edit
                </a>
              )}
            </div>
          </form>
          <div className="spacer mt-4 mb-4"></div>
          <h2 className="mb-4">Your Password</h2>
          <a className="btn btn-primary" onClick={this.showPasswordForm}>
            Change Password
          </a>
          <div className="spacer mt-4 mb-4"></div>
          <h2 className={styles.twoFATitle}>
            Two-Factor Authentication
            {twoFA_login ? (
              <span className={styles.twoFAStatusOn}>On</span>
            ) : (
              <span className={styles.twoFAStatusOff}>Off</span>
            )}
          </h2>
          <p className="mt-1 mb-3">
            Two factor authentication uses a code sent to your email address to
            verify your logins.
          </p>
          {twoFA_login ? (
            <a className="btn btn-light" onClick={this.turnOff}>
              Turn Off
            </a>
          ) : (
            <a className="btn btn-primary" onClick={this.turnOn}>
              Turn On
            </a>
          )}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Profile));
