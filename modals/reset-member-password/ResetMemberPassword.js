import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FormInputComponent } from "../../components";
import {
  hideCanvas,
  removeActiveModal,
  setBlockAlertData,
  setResetPasswordMemberData,
  showAlert,
  showCanvas,
} from "../../redux/actions";
import Helper from "../../utils/Helper";
import { resetMemberPassword } from "../../utils/Thunk";

import styles from "./reset-member-password.module.scss";

const mapStateToProps = (state) => {
  return {
    resetPasswordMemberData: state.modal.resetPasswordMemberData,
  };
};

class ResetMemberPassword extends Component {
  componentDidMount() {
    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const resetPasswordButton = this.getResetPasswordButton();
        if (resetPasswordButton) {
          resetPasswordButton.click();
        }
      }
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      password: "",
      password_confirm: "",
    };
  }

  getResetPasswordButton() {
    return document.getElementById("resetPasswordButton");
  }

  resetPassword = (e) => {
    const resetPasswordButton = this.getResetPasswordButton();
    if (resetPasswordButton) {
      resetPasswordButton.disabled = true;
    }

    e.preventDefault();
    const { resetPasswordMemberData, history } = this.props;
    const { password, password_confirm } = this.state;
    if (!resetPasswordMemberData || !resetPasswordMemberData.id) return;

    if (!password || !password_confirm) {
      this.props.dispatch(showAlert("Please input password"));
      if (resetPasswordButton) {
        resetPasswordButton.disabled = false;
      }
      return;
    }

    if (password != password_confirm) {
      this.props.dispatch(showAlert("Password does not match"));
      if (resetPasswordButton) {
        resetPasswordButton.disabled = false;
      }
      return;
    }

    if (!Helper.checkPassword(password)) {
      this.props.dispatch(
        showAlert(
          "A minimum 8 characters password contains a combination of uppercase and lowercase letter and number and symbol are required."
        )
      );
      if (resetPasswordButton) {
        resetPasswordButton.disabled = false;
      }
      return;
    }

    this.props.dispatch(
      resetMemberPassword(
        resetPasswordMemberData.id,
        { password },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(removeActiveModal());
            this.props.dispatch(setResetPasswordMemberData({}));
            history.push("/app/members");
            this.props.dispatch(
              setBlockAlertData({
                message: `Password has been changed.`,
                color: "success",
                type: "member",
              })
            );
          } else {
            if (resetPasswordButton) {
              resetPasswordButton.disabled = false;
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
    this.props.dispatch(setResetPasswordMemberData({}));
  };

  render() {
    const { resetPasswordMemberData } = this.props;
    const { password, password_confirm } = this.state;
    if (!resetPasswordMemberData || !resetPasswordMemberData.id) return null;

    return (
      <div className={styles.resetMemberPasswordModal}>
        <h3>{`Reset "${resetPasswordMemberData.first_name} ${resetPasswordMemberData.last_name}" Password`}</h3>
        <label className="mt-4 mb-3 d-block font-size-13">
          Your password must have the following:
        </label>
        <ul>
          <li className="font-size-13">8 character minimum</li>
          <li className="font-size-13">1 uppercase letter</li>
          <li className="font-size-13">1 number</li>
          <li className="font-size-13">1 special character</li>
        </ul>

        <label className="mt-4 d-block">New Password</label>
        <FormInputComponent
          value={password}
          onChange={(e) => this.setState({ password: e.target.value })}
          type="password"
          height="40px"
        />

        <label className="mt-4 d-block">Confirm New Password</label>
        <FormInputComponent
          value={password_confirm}
          onChange={(e) => this.setState({ password_confirm: e.target.value })}
          type="password"
          height="40px"
        />
        <div className={styles.resetMemberPasswordModal__buttons}>
          <button
            id="resetPasswordButton"
            className={[
              "btn btn-primary",
              styles.btnResetMemberPasswordModal,
            ].join(" ")}
            onClick={this.resetPassword}
          >
            Reset Password
          </button>
          <a
            className={[
              "btn btn-light",
              styles.btnResetMemberPasswordModal,
            ].join(" ")}
            onClick={this.close}
          >
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ResetMemberPassword));
