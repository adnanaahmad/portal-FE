import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, Link } from "react-router-dom";
import { FormInputComponent } from "../../../components";
import { hideCanvas, showAlert, showCanvas } from "../../../redux/actions";
import Helper from "../../../utils/Helper";
import { resetPassword } from "../../../utils/Thunk";

import styles from "./reset-password.module.scss";

const mapStateToProps = () => {
  return {};
};

class ResetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      password_confirmation: "",
    };

    this.token = null;
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;
    const urlParams = new URLSearchParams(window.location.search);

    this.token = params.token || null;
    const email = urlParams.get("email");

    if (email) {
      this.setState({
        email,
      });
    }

    const emailField = document.getElementById("emailField");
    if (emailField) {
      emailField.focus();
    }

    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const submitButton = this.getSubmitButton();
        if (submitButton) {
          submitButton.click();
        }
      }
    });
  }

  getSubmitButton() {
    return document.getElementById("submitButton");
  }

  submit = (e) => {
    const submitButton = this.getSubmitButton();
    if (submitButton) {
      submitButton.disabled = true;
    }

    e.preventDefault();

    const { email, password, password_confirmation } = this.state;

    if (!email || !Helper.validateEmail(email)) {
      this.props.dispatch(showAlert("Input valid email address"));
      if (submitButton) {
        submitButton.disabled = false;
      }
      return;
    }

    if (!password || !password_confirmation) {
      this.props.dispatch(showAlert("Input password"));
      if (submitButton) {
        submitButton.disabled = false;
      }
      return;
    }

    if (password != password_confirmation) {
      this.props.dispatch(showAlert("Password doesn't match"));
      if (submitButton) {
        submitButton.disabled = false;
      }
      return;
    }

    if (!Helper.checkPassword(password)) {
      this.props.dispatch(showAlert("Input valid password"));
      if (submitButton) {
        submitButton.disabled = false;
      }
      return;
    }

    this.props.dispatch(
      resetPassword(
        {
          email,
          password,
          password_confirmation,
          token: this.token,
        },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            const { history } = this.props;
            history.push("/login");
          } else {
            if (submitButton) {
              submitButton.disabled = false;
            }
          }
        }
      )
    );
  };

  inputField = (e, key) => {
    this.setState({ [key]: e.target.value });
  };

  render() {
    const { password, password_confirmation } = this.state;
    return (
      <div className={styles.resetPasswordPage}>
        <div className={["white-box", styles.whiteBox].join(" ")}>
          <form action="" method="POST" onSubmit={this.submit}>
            <Link to="/" id="reset-password-page__logo">
              <img src="/logo.svg" width="112" height="24" alt="" />
            </Link>
            <h2>Reset Password</h2>
            <div className={styles.cFormRow}>
              <label>Password</label>
              <FormInputComponent
                type="password"
                value={password}
                onChange={(e) => this.inputField(e, "password")}
                required={true}
                height="3rem"
                disableAutoComplete
              />
            </div>
            <div className={styles.cFormRow}>
              <label>Confirm Password</label>
              <FormInputComponent
                type="password"
                value={password_confirmation}
                onChange={(e) => this.inputField(e, "password_confirmation")}
                required={true}
                height="3rem"
                disableAutoComplete
              />
            </div>
            <div className={styles.resetPasswordPage__button}>
              <button
                id="submitButton"
                type="submit"
                className={[
                  "btn btn-primary",
                  styles.btnResetPasswordPage,
                ].join(" ")}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ResetPassword));
