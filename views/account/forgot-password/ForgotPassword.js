import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { FormInputComponent } from "../../../components";
import { hideCanvas, showCanvas } from "../../../redux/actions";
import { sendResetEmail } from "../../../utils/Thunk";
import styles from "./forgot-password.module.scss";

const mapStateToProps = () => {
  return {};
};

class ForgotPassword extends Component {
  componentDidMount() {
    const emailField = document.getElementById("emailField");
    if (emailField) {
      emailField.focus();
    }

    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const continueButton = this.getContinueButton();
        if (continueButton) {
          continueButton.click();
        }
      }
    });
  }

  getContinueButton() {
    return document.getElementById("continueButton");
  }

  constructor(props) {
    super(props);
    this.state = {
      email: "",
    };
  }

  inputField(e, key) {
    this.setState({ [key]: e.target.value });
  }

  submit = (e) => {
    const continueButton = this.getContinueButton();
    if (continueButton) {
      continueButton.disabled = true;
    }

    e.preventDefault();
    const { email } = this.state;
    if (!email) return;

    this.props.dispatch(
      sendResetEmail(
        email,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.success) {
            this.setState({ email: "" });
            if (continueButton) {
              continueButton.disabled = false;
            }
          } else {
            if (continueButton) {
              continueButton.disabled = false;
            }
          }
        }
      )
    );
  };

  render() {
    const { email } = this.state;
    return (
      <div className={styles.forgotPasswordPage}>
        <div className={["white-box", styles.whiteBox].join(" ")}>
          <form action="" method="POST" onSubmit={this.submit}>
            <Link to="/" id="forgot-password-page__logo">
              <img src="/logo.svg" width="112" height="24" alt="" />
            </Link>
            <h2>Forgot Password?</h2>
            <div className={styles.cFormRow}>
              <label>Email</label>
              <FormInputComponent
                id="emailField"
                type="email"
                value={email}
                onChange={(e) => this.inputField(e, "email")}
                required={true}
                height="3rem"
              />
            </div>
            <div className={styles.forgotPasswordPage__button}>
              <button
                id="continueButton"
                type="submit"
                className={[
                  "btn btn-primary",
                  styles.btnForgotPasswordPage,
                ].join(" ")}
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ForgotPassword));
