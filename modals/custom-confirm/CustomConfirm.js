/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FormInputComponent } from "../../components";
import {
  removeActiveModal,
  setBlockAlertData,
  setCustomConfirmModalData,
  showCanvas,
  hideCanvas,
  showAlert,
} from "../../redux/actions";
import {
  enableTwoFA,
  disableTwoFA,
  restoreMember,
  resendInviteMember,
  updateAppDecision,
} from "../../utils/Thunk";

import formInputStyles from "../../components/form-control/form-input/form-input.module.scss";
import styles from "./custom-confirm.module.scss";
import { BUILD_TYPE } from "../../utils/Constant";

const mapStateToProps = (state) => {
  return {
    customConfirmModalData: state.modal.customConfirmModalData,
    buildType: state.global.buildType,
  };
};

class CustomConfirm extends Component {
  componentDidMount() {
    const decisionField = document.getElementById("decisionField");
    if (decisionField) {
      decisionField.focus();
    }

    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const okButton = this.getOkButton();
        if (okButton) {
          okButton.click();
        }
      }
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      checked: false,
      decision_reason: "",
    };
  }

  getOkButton() {
    return document.getElementById("okButton");
  }

  enableOkButton() {
    const okButton = this.getOkButton();
    if (okButton) {
      okButton.disabled = false;
    }
  }

  clickOK = (e) => {
    const okButton = this.getOkButton();
    if (okButton) {
      okButton.disabled = true;
    }

    e.preventDefault();
    const { customConfirmModalData } = this.props;
    const action = customConfirmModalData.action || "";
    const data = customConfirmModalData.data || {};

    if (action == "enable-twoFA") {
      this.props.dispatch(
        enableTwoFA(
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            if (res.success) {
              this.props.dispatch(
                setBlockAlertData({
                  message: `Two-Factor Authentication has been turned on`,
                  color: "success",
                  type: "profile",
                })
              );
              this.closeModal();
            } else {
              this.enableOkButton();
            }
          }
        )
      );
    } else if (action == "disable-twoFA") {
      this.props.dispatch(
        disableTwoFA(
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            if (res.success) {
              this.props.dispatch(
                setBlockAlertData({
                  message: `Two-Factor Authentication has been turned off`,
                  color: "success",
                  type: "profile",
                })
              );
              this.closeModal();
            } else {
              this.enableOkButton();
            }
          }
        )
      );
    } else if (action == "resend-invitation" && data && data.id) {
      this.props.dispatch(
        resendInviteMember(
          data.id,
          {
            url: process.env.NEXT_PUBLIC_MAIN_URL,
          },
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            if (res.success) {
              const { history } = this.props;
              history.push("/app/members");
              this.closeModal();
              this.props.dispatch(
                setBlockAlertData({
                  message: `"${data.first_name} ${data.last_name}" has been invited again.`,
                  color: "success",
                  type: "member",
                })
              );
            } else {
              this.enableOkButton();
            }
          }
        )
      );
    } else if (action == "restore" && data && data.id) {
      this.props.dispatch(
        restoreMember(
          data.id,
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            if (res.success) {
              const { history } = this.props;
              history.push("/app/members");
              this.closeModal();
              this.props.dispatch(
                setBlockAlertData({
                  message: `"${data.first_name} ${data.last_name}" access has been restored.`,
                  color: "success",
                  type: "member",
                })
              );
            } else {
              this.enableOkButton();
            }
          }
        )
      );
    } else if (action == "update-decision" && data && data.app) {
      const { buildType } = this.props;
      const { checked, decision_reason } = this.state;
      if (!checked || !decision_reason || decision_reason.trim().length < 1) {
        this.props.dispatch(
          showAlert(
            "You must enter a reason and check the checkbox to continue",
            "error",
            "center"
          )
        );
        this.enableOkButton();
        return;
      }
      const params = {
        decision: data.decision,
        decision_reason,
      };
      this.props.dispatch(
        updateAppDecision(
          data.app.app_id,
          params,
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            if (res.success) {
              //const { history } = this.props;
              this.props.dispatch(
                setBlockAlertData({
                  message: `application ${
                    buildType === BUILD_TYPE.FUTURE_FAMILY
                      ? data.app.consumer_insights?.m_request_id
                      : data.app.app_id
                  } decision updated to ${data.decision}`,
                  color: "success",
                  type: "application",
                })
              );
              // history.push("/app");
              // history.replace("/app/applications");
              customConfirmModalData.updateApplication(res.application);
              this.closeModal();
            } else {
              this.enableOkButton();
            }
          }
        )
      );
    } else this.closeModal();
  };

  closeModal() {
    this.props.dispatch(setCustomConfirmModalData({}));
    this.props.dispatch(removeActiveModal());
  }

  clickClose = (e) => {
    e.preventDefault();
    this.closeModal();
  };

  omponentWillUnmount() {
    this.props.dispatch(setBlockAlertData({}));
  }

  render() {
    const { customConfirmModalData } = this.props;
    if (JSON.stringify(customConfirmModalData) == "{}") return null;
    const { checked } = this.state;

    return (
      <div className={styles.customConfirmModal}>
        {customConfirmModalData.title ? (
          <h3>{customConfirmModalData.title}</h3>
        ) : null}
        {customConfirmModalData.body ? (
          <p className="mt-4">{customConfirmModalData.body}</p>
        ) : null}
        {customConfirmModalData.action === "update-decision" && (
          //customConfirmModalData.data.app.status !== "Verified" && (
          //customConfirmModalData.data.decision !== "Approve" && (
          <>
            <label className="mt-4 d-block font-size-13">
              Type the reason for decision (required):
            </label>
            <FormInputComponent
              id="decisionField"
              value={this.state.decision_reason}
              onChange={(e) =>
                this.setState({ decision_reason: e.target.value })
              }
              type="text"
              height="40px"
            />
            <br />
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
                id="confirm-decision"
                type="checkbox"
                onChange={(e) => this.setState({ checked: e.target.checked })}
              />
              <label
                className="font-size-13"
                htmlFor="confirm-decision"
              >{`I am a loan officer with permission to ${customConfirmModalData.data.decision.toLowerCase()} this application`}</label>
            </div>
          </>
        )}

        <div className={styles.customConfirmModal__buttons}>
          <button
            id="okButton"
            className={[
              `btn btn-${
                customConfirmModalData.data &&
                customConfirmModalData.data.decision == "Approve"
                  ? "success"
                  : customConfirmModalData.data &&
                    customConfirmModalData.data.decision == "Decline"
                  ? "danger"
                  : "primary"
              }`,
              styles.btnCustomConfirmModal,
            ].join(" ")}
            onClick={this.clickOK}
          >
            {(customConfirmModalData.data &&
              customConfirmModalData.data.decision) ||
              "OK"}
          </button>
          <a
            className={["btn btn-light", styles.btnCustomConfirmModal].join(
              " "
            )}
            onClick={this.clickClose}
          >
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(CustomConfirm));
