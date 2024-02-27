import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import { FormInputComponent } from "../../../components";
import { showCanvas, hideCanvas } from "../../../redux/actions";
import { login } from "../../../utils/Thunk";

import styles from "./login.module.scss";
import { BUILD_TYPE } from "../../../utils/Constant";

const mapStateToProps = (state) => {
  return {
    buildType: state.global.buildType,
  };
};

class Login extends Component {
  componentDidMount() {
    const emailField = document.getElementById("emailField");
    if (emailField) {
      emailField.focus();
    }

    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const loginButton = this.getSignInButton();
        if (loginButton) {
          loginButton.click();
        }
      }
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
    };
  }

  inputField(e, key) {
    this.setState({ [key]: e.target.value });
  }

  getSignInButton() {
    return document.getElementById("loginButton");
  }

  submit = (e) => {
    const { buildType } = this.props;
    const loginButton = this.getSignInButton();
    if (loginButton) {
      loginButton.disabled = true;
    }

    e.preventDefault();
    const { email, password } = this.state;
    if (!email || !password) return;
    let loginFrom = "";
    if (buildType === BUILD_TYPE.FUTURE_FAMILY) {
      loginFrom = "futurefamily";
    }

    this.props.dispatch(
      login(
        email,
        password,
        loginFrom,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success == false) {
            if (loginButton) {
              loginButton.disabled = false;
            }
          }
        }
      )
    );
  };

  render() {
    const { email, password } = this.state;
    const { buildType } = this.props;
    return (
      <div className={styles.loginPage}>
        <div className={["white-box", styles.whiteBox].join(" ")}>
          <form action="" method="POST" onSubmit={this.submit}>
            <Link to="/" id="login-page__logo">
              <img src="/logo.svg" width="112" height="24" alt="" />
            </Link>
            <h2>Sign In</h2>
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
            <div className={styles.cFormRow}>
              <label>Password</label>
              <FormInputComponent
                type="password"
                value={password}
                onChange={(e) => this.inputField(e, "password")}
                required={true}
                height="3rem"
              />
            </div>
            <div className={styles.loginPage__button}>
              <div>
                <p className="font-size-14">
                  <Link to="/forgot-password">Forgot Password?</Link>
                </p>
                {buildType !== BUILD_TYPE.FUTURE_FAMILY && (
                  <p className="font-size-14">
                    {`Don't have an account?`}{" "}
                    <Link to="/register">Register</Link>
                  </p>
                )}
              </div>
              <button
                id="loginButton"
                type="submit"
                className={["btn btn-primary", styles.btnLoginPage].join(" ")}
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Login));
