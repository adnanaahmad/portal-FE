import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, Redirect, withRouter } from "react-router-dom";
import {
  saveUser,
  showAlert,
  showCanvas,
  hideCanvas,
} from "../../redux/actions";
import { BRAND, BUILD_TYPE } from "../../utils/Constant";
import Helper from "../../utils/Helper";
import { checkTwoFACode } from "../../utils/Thunk";

import styles from "./welcome.module.scss";

const mapStateToProps = (state) => {
  return {
    buildType: state.global.buildType,
  };
};

class Welcome extends Component {
  componentDidMount() {
    const code1 = document.getElementById("code1");
    if (code1) {
      code1.focus();
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      code1: "",
      code2: "",
      code3: "",
      code4: "",
      code5: "",
      code6: "",
    };

    this.pressBack = false;
  }

  inputKey(e, key) {
    const keyboard = e.keyCode || e.charCode;
    const letterNumber = /^[0-9a-zA-Z]+$/;
    const value = String.fromCharCode(e.keyCode);

    if (value && value.match(letterNumber)) {
      this.setState({ [key]: value.toUpperCase() });
      this.goToNext(key);
    } else this.setState({ [key]: "" });
    if (keyboard == 8 || keyboard == 46) {
      // BackSpace
      this.goToPrevious(key);
    }
  }

  goToNext(key) {
    switch (key) {
      case "code1":
        document.getElementById("code2").focus();
        break;
      case "code2":
        document.getElementById("code3").focus();
        break;
      case "code3":
        document.getElementById("code4").focus();
        break;
      case "code4":
        document.getElementById("code5").focus();
        break;
      case "code5":
        document.getElementById("code6").focus();
        break;
      default:
        this.submit();
        break;
    }
  }

  goToPrevious(key) {
    switch (key) {
      case "code2":
        document.getElementById("code1").focus();
        break;
      case "code3":
        document.getElementById("code2").focus();
        break;
      case "code4":
        document.getElementById("code3").focus();
        break;
      case "code5":
        document.getElementById("code4").focus();
        break;
      case "code6":
        document.getElementById("code5").focus();
        break;
      default:
        break;
    }
  }

  handlePaste = (event) => {
    const copiedCode = event.clipboardData.getData("Text");
    if (copiedCode) {
      const splittedCode = copiedCode.trim().split("");
      if (splittedCode.length == 6) {
        this.setState({ ["code1"]: splittedCode[0] });
        this.setState({ ["code2"]: splittedCode[1] });
        this.setState({ ["code3"]: splittedCode[2] });
        this.setState({ ["code4"]: splittedCode[3] });
        this.setState({ ["code5"]: splittedCode[4] });
        this.setState({ ["code6"]: splittedCode[5] });

        this.submit();
      }
    }
  };

  submit = () => {
    setTimeout(() => {
      const { code1, code2, code3, code4, code5, code6 } = this.state;
      const { auth: authUser, history } = this.props;

      if (
        !code1.trim() ||
        !code2.trim() ||
        !code3.trim() ||
        !code4.trim() ||
        !code5.trim() ||
        !code6.trim()
      ) {
        this.props.dispatch(
          showAlert("Please input two-factor authentication code")
        );
        return;
      }

      const code =
        code1.trim() +
        code2.trim() +
        code3.trim() +
        code4.trim() +
        code5.trim() +
        code6.trim();

      this.props.dispatch(
        checkTwoFACode(
          code,
          authUser.twoFA,
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            if (!res || !res.success) {
              Helper.storeUser({});
              this.props.dispatch(saveUser({}));
              this.setState({ leaving: true });
              setTimeout(() => {
                history.replace("/login");
              }, 500);
            }
          }
        )
      );
    }, 1);
  };

  clickSignIn = (e) => {
    e.preventDefault();
    Helper.storeUser({});
    this.props.dispatch(saveUser({}));
  };

  renderTwoFA() {
    const { code1, code2, code3, code4, code5, code6 } = this.state;
    return (
      <div className={styles.twoFaPage}>
        <div className={["white-box", styles.twoFaPageWhiteBox].join(" ")}>
          <Link to="/">
            <img src="/logo.svg" width="112" height="24" className="img-fluid" alt="" />
          </Link>
          <h2>2-Factor Authentication</h2>
          <form action="" method="POST">
            <label>Check your email for the 6-digit verification code</label>
            <ul onPaste={this.handlePaste}>
              <li>
                <input
                  type="text"
                  value={code1}
                  onChange={() => {}}
                  onKeyDown={(e) => this.inputKey(e, "code1")}
                  maxLength={1}
                  id="code1"
                  autoComplete="off"
                />
              </li>
              <li>
                <input
                  type="text"
                  value={code2}
                  onChange={() => {}}
                  onKeyDown={(e) => this.inputKey(e, "code2")}
                  maxLength={1}
                  id="code2"
                  autoComplete="off"
                />
              </li>
              <li>
                <input
                  type="text"
                  value={code3}
                  onChange={() => {}}
                  onKeyDown={(e) => this.inputKey(e, "code3")}
                  maxLength={1}
                  id="code3"
                  autoComplete="off"
                />
              </li>
              <li>
                <input
                  type="text"
                  value={code4}
                  onChange={() => {}}
                  onKeyDown={(e) => this.inputKey(e, "code4")}
                  maxLength={1}
                  id="code4"
                  autoComplete="off"
                />
              </li>
              <li>
                <input
                  type="text"
                  value={code5}
                  onChange={() => {}}
                  onKeyDown={(e) => this.inputKey(e, "code5")}
                  maxLength={1}
                  id="code5"
                  autoComplete="off"
                />
              </li>
              <li>
                <input
                  type="text"
                  value={code6}
                  onChange={() => {}}
                  onKeyDown={(e) => this.inputKey(e, "code6")}
                  maxLength={1}
                  id="code6"
                  autoComplete="off"
                />
              </li>
            </ul>
            <div className={styles.twoFaPage__buttons}>
              <a onClick={this.clickSignIn}>Back to Sign In Screen</a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  renderWelcome() {
    const { buildType } = this.props;
    return (
      <div className={styles.welcomePage}>
        <div className={["white-box", styles.welcomePageWhiteBox].join(" ")}>
          <Link to="/">
            <img
              src="/logo.svg"
              width="334"
              height="72"
              className="img-fluid"
              alt=""
            />
          </Link>
          <p className="mt-4 mb-4 text-center">Welcome to the {BRAND} portal</p>
          <div className={styles.welcomePage_buttons}>
            <Link
              className={["btn btn-primary", styles.btnWelcomePage].join(" ")}
              to="/login"
              custom-type="default"
            >
              Login
            </Link>
            {buildType !== BUILD_TYPE.FUTURE_FAMILY && (
              <Link
                className={["btn btn-light", styles.btnWelcomePage].join(" ")}
                to="/register"
              >
                Register
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { auth: authUser } = this.props;
    const { leaving } = this.state;

    if (leaving) {
      return null;
    }

    if (authUser && authUser.twoFA) {
      // Two FA Check
      return this.renderTwoFA();
    }

    // App View
    if (authUser && authUser.id) return <Redirect to="/app" />;

    // Welcome View
    return this.renderWelcome();
  }
}

export default connect(mapStateToProps)(withRouter(Welcome));
