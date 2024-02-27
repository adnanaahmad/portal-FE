import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FormInputComponent, HiddenFieldComponent } from "../../../components";
import { showCanvas, hideCanvas, showAlert } from "../../../redux/actions";
import Helper from "../../../utils/Helper";
import { finishInvitation, getInvitationData } from "../../../utils/Thunk";

import styles from "./invitation.module.scss";

const mapStateToProps = () => {
  return {};
};

class Invitation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: "",
      user: {},
      password: "",
      password_confirm: "",
    };
  }

  componentDidMount() {
    const {
      match: { params },
      history,
    } = this.props;

    const code = params.code;
    this.props.dispatch(
      getInvitationData(
        code,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.user) {
            this.setState({
              user: res.user,
              code,
            });
          } else {
            setTimeout(() => {
              history.push("/");
            }, 500);
          }
        }
      )
    );

    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const completeButton = this.getCompleteButton();
        if (completeButton) {
          completeButton.click();
        }
      }
    });
  }

  inputField(e, key) {
    this.setState({ [key]: e.target.value });
  }

  getCompleteButton() {
    return document.getElementById("completeButton");
  }

  submit = (e) => {
    const completeButton = this.getCompleteButton();
    if (completeButton) {
      completeButton.disabled = true;
    }

    e.preventDefault();

    const { password, password_confirm, user, code } = this.state;

    if (!password || !password_confirm) {
      this.props.dispatch(showAlert("Please input password"));
      if (completeButton) {
        completeButton.disabled = false;
      }
      return;
    }

    if (password != password_confirm) {
      this.props.dispatch(showAlert("Password doesn't match"));
      if (completeButton) {
        completeButton.disabled = false;
      }
      return;
    }

    if (!Helper.checkPassword(password)) {
      this.props.dispatch(
        showAlert(
          "Please use a password with at least 8 characters including at least one number, one letter and one symbol"
        )
      );
      if (completeButton) {
        completeButton.disabled = false;
      }
      return;
    }

    const params = {
      userId: user.id,
      code,
      password,
    };

    this.props.dispatch(
      finishInvitation(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success == false) {
            if (completeButton) {
              completeButton.disabled = false;
            }
          }
        }
      )
    );
  };

  render() {
    const { user, password, password_confirm } = this.state;
    if (!user || !user.id) return null;

    return (
      <div className={styles.invitationPage}>
        <div className="container">
          <div className="row">
            <div className="col-md-6 offset-md-3">
              <div className={["white-box", styles.whiteBox].join(" ")}>
                <form method="post" action="" onSubmit={this.submit}>
                  <HiddenFieldComponent type="text" />
                  <HiddenFieldComponent type="password" />
                  <h2 className="text-center">{`You're Invited`}</h2>
                  <h3 className="text-center mt-4 mb-3">
                    {user.first_name} {user.last_name} {user.profile.company}
                  </h3>
                  <p className="text-center font-size-14 mb-4">
                    Set up a password to complete your registration. Password
                    must be at least 8 characters long, and contain at least one
                    uppercase, one lowercase, a digit, and a special character.
                  </p>
                  <div className={styles.cFormRow}>
                    <FormInputComponent
                      type="password"
                      required={true}
                      placeholder="Password *"
                      value={password}
                      onChange={(e) => this.inputField(e, "password")}
                      height="40px"
                    />
                  </div>
                  <div className={styles.cFormRow}>
                    <FormInputComponent
                      type="password"
                      required={true}
                      placeholder="Confirm Password *"
                      value={password_confirm}
                      onChange={(e) => this.inputField(e, "password_confirm")}
                      height="40px"
                    />
                  </div>
                  <button
                    id="completeButton"
                    type="submit"
                    className={["btn btn-primary", styles.btnWhiteBox].join(
                      " "
                    )}
                  >
                    Complete
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Invitation));
