import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import Tooltip from "@material-ui/core/Tooltip";
import {
  showAlert,
  showCanvas,
  hideCanvas,
  setActiveModal,
  setActiveChildModal,
  setCustomGeneralModalData,
  setOTPModalData,
} from "../../../../../../redux/actions";
import {
  cancelMFAEmail,
  checkMFAEmail,
  runMFAEmail,
} from "../../../../../../utils/Thunk";
import { Fragment } from "react";
import {
  VerificationItem,
  FormInputComponent,
} from "../../../../../../components";
import { BUILD_TYPE, ROLES } from "../../../../../../utils/Constant";
import { emailRegex } from "../../../../../../utils/Regex";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    customGeneralModalData: state.modal.customGeneralModalData,
    buildType: state.global.buildType,
  };
};

class MFAEmail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phone: "",
      email: "",
      checked: false,
    };

    this.mounted = false;
    this.stop = false;
    this.timer = null;
  }

  componentDidMount() {
    this.mounted = true;

    const { application, buildType } = this.props;
    const { mfa } = application;

    // Default Phone
    if (buildType !== BUILD_TYPE.FUTURE_FAMILY) {
      if (mfa && mfa.id) {
        this.setState({ phone: mfa.phone });
        if (mfa.status == "In Progress") this.checkMFA();
      } else this.setState({ phone: application.personal_information.phone });
    }
  }

  componentDidUpdate(prevProps) {
    const { application, customGeneralModalData } = this.props;
    const {
      application: applicationPrev,
      customGeneralModalData: customGeneralModalDataPrev,
    } = prevProps;

    // Default Phone
    if (
      application &&
      application.id &&
      applicationPrev &&
      applicationPrev.id
    ) {
      const { mfa_email: mfa } = application;
      const { mfa_email: mfaPrev } = applicationPrev;

      if (JSON.stringify(mfaPrev) != JSON.stringify(mfa) && mfa && mfa.id) {
        this.setState({ phone: mfa.phone });
      } else {
        if (
          application.id !== applicationPrev.id &&
          application.personal_information
        ) {
          this.setState({ phone: application.personal_information.phone });
        }
      }

      if (
        (!mfaPrev || !mfaPrev.id || mfaPrev.status != "In Progress") &&
        mfa &&
        mfa.id &&
        mfa.status == "In Progress"
      )
        this.checkMFA();
    }

    // Custom General Modal Data
    if (
      customGeneralModalDataPrev &&
      customGeneralModalDataPrev.action &&
      customGeneralModalData &&
      customGeneralModalData.action == "update-phone"
    ) {
      if (
        (!customGeneralModalDataPrev.returnData ||
          !customGeneralModalDataPrev.returnData.phone) &&
        customGeneralModalData.returnData &&
        customGeneralModalData.returnData.phone
      ) {
        this.setState({ phone: customGeneralModalData.returnData.phone });
      }
    }
  }

  componentWillUnmount() {
    this.mounted = false;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  clickCancel = (e) => {
    e.preventDefault();
    const { application, onRefresh } = this.props;

    // Stop Check
    this.stop = true;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.props.dispatch(
      cancelMFAEmail(
        application.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.application && onRefresh) onRefresh(res.application);
        }
      )
    );
  };

  checkMFA() {
    const { application, onRefresh } = this.props;

    if (this.stop) return;

    this.props.dispatch(
      checkMFAEmail(application.id, null, (res) => {
        if (res && res.success) {
          if (res.application && onRefresh) onRefresh(res.application);
          else if (!res.application || !res.application.id) {
            if (this.mounted && !this.stop) {
              this.timer = setTimeout(() => {
                this.checkMFA();
              }, 5000);
            }
          }
        } else if (!this.stop) this.props.dispatch(showAlert(res.message));
      })
    );
  }

  clickChangePhone = async (e) => {
    e.preventDefault();
    const { phone } = this.state;
    const { buildType } = this.props;

    await this.props.dispatch(
      setCustomGeneralModalData({
        title: "Change Phone Number",
        body: "This phone number must be able to recieve SMS text messages.",
        action: "update-phone",
        data: {
          phone,
        },
      })
    );
    if (buildType === BUILD_TYPE.FUTURE_FAMILY) {
      await this.props.dispatch(setActiveChildModal("custom-general"));
    } else {
      await this.props.dispatch(setActiveModal("custom-general"));
    }
  };

  submit = (e) => {
    e.preventDefault();
    const { email } = this.state;
    const { application, onRefresh } = this.props;
    let params;

    if (!email) {
      this.props.dispatch(showAlert("Please input email address"));
      return;
    }

    const validateEmail = email.match(emailRegex);
    if (!validateEmail) {
      this.props.dispatch(showAlert("Please input correct email address"));
      return;
    }
    params = { email };

    this.stop = false;

    this.props.dispatch(
      runMFAEmail(
        application.id,
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          this.setState({ checked: false });
          if (res && res.application && onRefresh) onRefresh(res.application);
          if (res && res.application) {
            this.props.dispatch(setOTPModalData({ id: application.id }));
            this.props.dispatch(setActiveChildModal("otp-mfa"));
          }
        }
      )
    );
  };

  renderButton() {
    const { application, styles, buildType } = this.props;
    const { mfa_email: mfa } = application;

    let disabled = false;
    // if (!consumer_insights || !consumer_insights.id) disabled = true;
    // else if (
    //   consumer_insights.result != "Verified" &&
    //   consumer_insights.result != "Insufficient-Info" &&
    //   consumer_insights.result != "Needs-Review"
    // )
    //   disabled = true;

    if (!mfa || !mfa.id) {
      if (disabled) {
        return (
          <Tooltip
            title={
              <p className="font-size-14">
                {`Phone verification is disabled for user who are not verified`}
              </p>
            }
            placement="top-start"
          >
            <a className="btn btn-primary btn-small mt-4 disabled clickable">
              Send SMS
            </a>
          </Tooltip>
        );
      }
      return (
        <button type="submit" className="btn btn-primary btn-small mt-4">
          Send {buildType === BUILD_TYPE.FUTURE_FAMILY ? "" : "SMS"}
        </button>
      );
    }

    if (mfa.status == "In Progress") {
      return (
        <Fragment>
          <div className={styles[0].mfaVerifyingTag}>
            <ClipLoader size={16} color="#0376BC" />
            <label>
              Verifying .. Please do not refresh or close your browser
            </label>
          </div>
          <a
            onClick={this.clickCancel}
            className="btn btn-danger btn-small mt-3"
          >
            Cancel Request
          </a>
        </Fragment>
      );
    }

    return (
      <button type="submit" className="btn btn-primary btn-small mt-4">
        Resend {buildType === BUILD_TYPE.FUTURE_FAMILY ? "" : "SMS"}
      </button>
    );
  }

  renderStatus() {
    const { application, buildType } = this.props;
    const { mfa_email: mfa } = application;

    // // Check Consumer Insights Verification
    // let disabled = false;
    // if (!consumer_insights || !consumer_insights.id) disabled = true;
    // else if (
    //   consumer_insights.result != "Verified" &&
    //   consumer_insights.result != "Insufficient-Info" &&
    //   consumer_insights.result != "Needs-Review"
    // )
    //   disabled = true;

    // if (disabled) return null;

    if (!mfa || !mfa.id) {
      if (application.purged_at !== null) {
        return <span className="app-status message">Expired</span>;
      }
      return (
        <div>
          <img src="/warning.png" alt="" />
          <label className="font-size-13">
            Action{" "}
            {buildType === BUILD_TYPE.FUTURE_FAMILY ? "Suggested" : "Required"}
          </label>
        </div>
      );
    }
    if (mfa.result == "Authenticated")
      return <span className="app-status success">Authenticated</span>;
    else if (mfa.status != "In Progress")
      return <span className="app-status fail">Not Authenticated</span>;
    return null;
  }

  renderLabel() {
    const { application, buildType } = this.props;
    const { mfa_email: mfa } = application;
    if (!mfa || !mfa.id) {
      if (application.purged_at !== null)
        return <label className="font-size-13">Not Completed</label>;

      return <label className="font-size-13">Not Submitted</label>;
    }

    if (mfa.result && mfa.status != "In Progress") {
      if (mfa.result == "Expired")
        return <label className="font-size-13">Expired</label>;
      else
        return buildType === BUILD_TYPE.FUTURE_FAMILY ? (
          <label className="font-size-13">
            {application.verification_attempts &&
            JSON.parse(application.verification_attempts).includes("mfaEmail")
              ? "Completed"
              : ""}
          </label>
        ) : (
          <label className="font-size-13">Completed</label>
        );
    }
    return null;
  }

  renderForm() {
    const { application, styles, authUser, buildType } = this.props;
    const { phone, checked, email } = this.state;
    const { mfa_email: mfa } = application;

    if (application.purged_at !== null) {
      return null;
    }

    if (
      application.decision !== "No Action" &&
      application.decision_reason !== ""
    ) {
      return null;
    }

    if (application.main_app_id !== 0 && application.main_app_decision) {
      return null;
    }

    // Hide the change button if the loan application wasn't created by a supervisor
    const hideChangeButton =
      authUser.role === ROLES.supervisor && authUser.id !== application.user_id;
    const shouldShowChangeButton =
      !hideChangeButton && (!mfa || mfa.status !== "In Progress");

    return (
      <div>
        {buildType !== BUILD_TYPE.FUTURE_FAMILY && (
          <React.Fragment>
            <label className="d-block font-size-14 mt-3">Phone Number</label>
            <div className={styles[0].consumerInsightsSectionMFA__phone}>
              <span className="font-size-14 font-weight-600">{phone}</span>
              {shouldShowChangeButton ? (
                <a
                  className="color-primary font-size-13"
                  onClick={this.clickChangePhone}
                >
                  Change
                </a>
              ) : null}
            </div>
          </React.Fragment>
        )}
        {buildType === BUILD_TYPE.FUTURE_FAMILY && (
          <React.Fragment>
            <div className={styles[0].verificationMethod}>
              <label className="d-block mt-4 mb-1">Email Address</label>
              <FormInputComponent
                type="text"
                value={email}
                onChange={(e) => this.setState({ email: e.target.value })}
              />
            </div>
          </React.Fragment>
        )}
        <form action="" method="POST" onSubmit={this.submit}>
          {!mfa || mfa.status != "In Progress" ? (
            <div
              className={[
                styles[1].customFormControl,
                styles[1].customFormControlCheckbox,
                "mt-4",
              ].join(" ")}
            >
              <input
                checked={checked}
                required
                id="confirm-mfa-email"
                type="checkbox"
                onChange={(e) => this.setState({ checked: e.target.checked })}
              />
              <label
                className="font-size-13"
                htmlFor="confirm-mfa-email"
              >{`I am a loan officer with full permission from the consumer to run this application as the consumer's proxy`}</label>
            </div>
          ) : null}

          {this.renderButton()}
        </form>{" "}
      </div>
    );
  }

  renderContent() {
    const { application, styles } = this.props;
    const { mfa_email: mfa } = application;

    let content;

    if (application.purged_at && (!mfa || mfa.status === "In Progress")) {
      return (
        <p className="font-size-13 mt-2">
          Multi-factor Authentication was not completed prior to the expiration
          of this application. Decline this application and submit a new
          application to complete this step.
        </p>
      );
    }

    if (mfa && mfa.status !== "In Progress") {
      if (mfa.result === "Authenticated") {
        content = {
          status: "success",
          message: "Passed",
        };
      } else {
        content = {
          status: "fail",
          message: "Not Verified",
        };
      }
    }

    return (
      <div className={styles[0].consumerInsightsSectionMFA__body}>
        {content && (
          <div className={["mt-3", styles[0].verificationItemsGroup].join(" ")}>
            <VerificationItem title="OTP Report" content={content} />
          </div>
        )}
        {this.renderForm()}
      </div>
    );
  }

  render() {
    const { styles } = this.props;
    return (
      <div className={styles[0].consumerInsightsSectionMFA}>
        <div
          className={[
            styles[0].consumerInsightsSectionHeader,
            "mt-4 mb-2 row",
          ].join(" ")}
        >
          <div className="col-md-4">
            <h3>Email OTP</h3>
          </div>
          <div className="col-md-3">{this.renderStatus()}</div>
          <div className="col-md-5">{this.renderLabel()}</div>
        </div>
        {this.renderContent()}
        <div className="spacer mt-4"></div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(MFAEmail));
