import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FormInputComponent } from "../../components";
import {
  setBlockAlertData,
  removeActiveModal,
  showAlert,
  showCanvas,
  hideCanvas,
} from "../../redux/actions";
import Helper from "../../utils/Helper";
import { changePassword } from "../../utils/Thunk";

import styles from "./change-password.module.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class ChangePassword extends Component {
  componentDidMount() {
    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const changePasswordButton = this.getChangePasswordButton();
        if (changePasswordButton) {
          changePasswordButton.click();
        }
      }
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      current_password: "",
      password: "",
      password_confirm: "",
    };
  }

  getChangePasswordButton() {
    return document.getElementById("changePasswordButton");
  }

  submit = (e) => {
    const changePasswordButton = this.getChangePasswordButton();
    if (changePasswordButton) {
      changePasswordButton.disabled = true;
    }

    e.preventDefault();
    const { current_password, password, password_confirm } = this.state;

    if (!current_password || !password || !password_confirm) {
      this.props.dispatch(showAlert("Please input all the fields"));
      if (changePasswordButton) {
        changePasswordButton.disabled = false;
      }
      return;
    }

    if (password != password_confirm) {
      this.props.dispatch(showAlert("New password does not match"));
      if (changePasswordButton) {
        changePasswordButton.disabled = false;
      }
      return;
    }

    if (!Helper.checkPassword(password)) {
      this.props.dispatch(
        showAlert(
          `A minimum 8 characters password contains a combination of uppercase and lowercase letter and number and symbol are required.`
        )
      );
      if (changePasswordButton) {
        changePasswordButton.disabled = false;
      }
      return;
    }

    const params = {
      current_password,
      new_password: password,
    };

    this.props.dispatch(
      changePassword(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.props.dispatch(
              setBlockAlertData({
                message: `Password has been changed`,
                color: "success",
                type: "profile",
              })
            );
            this.props.dispatch(removeActiveModal());
          } else {
            if (changePasswordButton) {
              changePasswordButton.disabled = false;
            }
          }
        }
      )
    );
  };

  componentWillUnmount() {
    this.props.dispatch(setBlockAlertData({}));
  }

  close = (e) => {
    e.preventDefault();
    this.props.dispatch(removeActiveModal());
  };

  inputField(e, key) {
    this.setState({ [key]: e.target.value });
  }

  render() {
    const { current_password, password, password_confirm } = this.state;
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;

    return (
      <div className={styles.changePasswordModal}>
        <h3 className="mb-3">Change Your Password</h3>
        <p className="font-size-13">Your password must have the following:</p>
        <ul>
          <li>{`8 character minimum`}</li>
          <li>{`1 uppercase letter`}</li>
          <li>{`1 number`}</li>
          <li>{`1 special character`}</li>
        </ul>

        <div className={styles.cFormRow}>
          <label>Current Password</label>
          <FormInputComponent
            value={current_password}
            type="password"
            onChange={(e) => this.inputField(e, "current_password")}
            height="40px"
          />
        </div>

        <div className={styles.cFormRow}>
          <label>New Password</label>
          <FormInputComponent
            value={password}
            type="password"
            onChange={(e) => this.inputField(e, "password")}
            height="40px"
          />
        </div>

        <div className={styles.cFormRow}>
          <label>Confirm New Password</label>
          <FormInputComponent
            value={password_confirm}
            type="password"
            onChange={(e) => this.inputField(e, "password_confirm")}
            height="40px"
          />
        </div>
        <div className={styles.changePasswordModal__buttons}>
          <button
            id="changePasswordButton"
            className={["btn btn-primary", styles.btnChangePasswordModal].join(
              " "
            )}
            onClick={this.submit}
          >
            Change Password
          </button>
          <a
            className={["btn btn-light", styles.btnChangePasswordModal].join(
              " "
            )}
            onClick={this.close}
          >
            Close
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ChangePassword));
