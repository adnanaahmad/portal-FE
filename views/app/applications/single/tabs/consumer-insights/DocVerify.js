import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import Tooltip from "@material-ui/core/Tooltip";
import {
  setActiveModal,
  setActiveChildModal,
  setCustomGeneralModalData,
  showAlert,
  showCanvas,
  hideCanvas,
} from "../../../../../../redux/actions";
import {
  runDocVerify,
  checkDocVerify,
  cancelDocVerify,
} from "../../../../../../utils/Thunk";
import { Fragment } from "react";
import {
  VerificationItem,
  FormInputComponent,
} from "../../../../../../components";
import { BUILD_TYPE, ROLES } from "../../../../../../utils/Constant";
import { emailRegex, phoneRegex } from "../../../../../../utils/Regex";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    customGeneralModalData: state.modal.customGeneralModalData,
    buildType: state.global.buildType,
  };
};

class DocVerify extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phone: "",
      email: "",
      checked: false,
      method: "",
    };

    this.mounted = false;
    this.stop = false;
    this.timer = null;
  }

  componentDidMount() {
    this.mounted = true;

    const { application, buildType } = this.props;
    const { doc_verify, mfa } = application;

    // Default Phone
    if (buildType !== BUILD_TYPE.FUTURE_FAMILY) {
      if (doc_verify && doc_verify.id) {
        this.setState({ phone: doc_verify.phone });
        if (doc_verify.status == "In Progress") this.checkDocVerify();
      } else if (mfa && mfa.id) this.setState({ phone: mfa.phone });
      else this.setState({ phone: application.personal_information.phone });
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
      const { doc_verify, mfa } = application;
      const { doc_verify: doc_verify_prev, mfa: mfaPrev } = applicationPrev;
      let success = false;

      if (
        JSON.stringify(doc_verify_prev) != JSON.stringify(doc_verify) &&
        doc_verify &&
        doc_verify.id
      ) {
        this.setState({ phone: doc_verify.phone });
        success = true;
      } else if (!doc_verify || !doc_verify.id) {
        // No Doc Verify
        if (JSON.stringify(mfaPrev) != JSON.stringify(mfa) && mfa && mfa.id) {
          this.setState({ phone: mfa.phone });
          success = true;
        }
      }

      if (!success) {
        if (
          application.id !== applicationPrev.id &&
          application.personal_information
        ) {
          this.setState({ phone: application.personal_information.phone });
        }
      }

      if (
        (!doc_verify_prev ||
          !doc_verify_prev.id ||
          doc_verify_prev.status != "In Progress") &&
        doc_verify &&
        doc_verify.id &&
        doc_verify.status == "In Progress"
      )
        this.checkDocVerify();
    }

    // Custom General Modal Data
    if (
      customGeneralModalDataPrev &&
      customGeneralModalDataPrev.action &&
      customGeneralModalData &&
      customGeneralModalData.action == "update-doc-phone"
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
      cancelDocVerify(
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

  checkDocVerify() {
    const { application, onRefresh } = this.props;

    if (this.stop) return;

    this.props.dispatch(
      checkDocVerify(application.id, null, (res) => {
        if (res && res.success) {
          if (res.application && onRefresh) onRefresh(res.application);
          else if (!res.application || !res.application.id) {
            if (this.mounted && !this.stop) {
              this.timer = setTimeout(() => {
                this.checkDocVerify();
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
        action: "update-doc-phone",
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
    const { phone, email, method } = this.state;
    const { application, onRefresh, buildType } = this.props;
    let params;

    if (buildType !== BUILD_TYPE.FUTURE_FAMILY) {
      if (!phone) {
        this.props.dispatch(showAlert("Please input phone number"));
        return;
      }

      params = { phone };
    } else {
      if (method === "phone" && !phone) {
        this.props.dispatch(showAlert("Please input phone number"));
        return;
      } else if (method === "email" && !email) {
        this.props.dispatch(showAlert("Please input email address"));
        return;
      } else if (method === "") {
        this.props.dispatch(showAlert("Please select preferred method"));
        return;
      }
      if (method === "phone") {
        const validatePhone = phone.match(phoneRegex);
        if (!validatePhone) {
          this.props.dispatch(showAlert("Please input correct phone number"));
          return;
        }
        params = { phone };
      } else if (method === "email") {
        const validateEmail = email.match(emailRegex);
        if (!validateEmail) {
          this.props.dispatch(showAlert("Please input correct email address"));
          return;
        }
        params = { email };
      }
    }

    this.stop = false;

    this.props.dispatch(
      runDocVerify(
        application.id,
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          this.setState({ checked: false });
          if (res && res.application && onRefresh) onRefresh(res.application);
        }
      )
    );
  };

  renderButton() {
    const { application, styles, buildType } = this.props;
    const { doc_verify } = application;

    let disabled = false;
    // if (!consumer_insights || !consumer_insights.id) disabled = true;
    // else if (
    //   consumer_insights.result != "Verified" &&
    //   consumer_insights.result != "Insufficient-Info" &&
    //   consumer_insights.result != "Needs-Review"
    // )
    //   disabled = true;

    if (!doc_verify || !doc_verify.id) {
      if (disabled) {
        return (
          <Tooltip
            title={
              <p className="font-size-14">
                {`Document verification is disabled for user who are not verified`}
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

    if (doc_verify.status == "In Progress") {
      return (
        <Fragment>
          <div className={styles[0].docVerifyingTag}>
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
    const { doc_verify } = application;

    // Check Consumer Insights Verification
    //let disabled = false;
    // if (!consumer_insights || !consumer_insights.id) disabled = true;
    // else if (
    //   consumer_insights.result != "Verified" &&
    //   consumer_insights.result != "Insufficient-Info" &&
    //   consumer_insights.result != "Needs-Review"
    // )
    //   disabled = true;

    //if (disabled) return null;

    if (!doc_verify || !doc_verify.id) {
      if (application.purged_at !== null) {
        return <span className="app-status message">Expired</span>;
      }

      // Action Required
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
    if (doc_verify.result == "Authenticated")
      return <span className="app-status success">Authenticated</span>;
    else if (doc_verify.status != "In Progress")
      return <span className="app-status fail">Not Authenticated</span>;
    return null;
  }

  renderLabel() {
    const { application, buildType } = this.props;
    const { doc_verify } = application;

    if (!doc_verify || !doc_verify.id) {
      if (application.purged_at !== null)
        return <label className="font-size-13">Not Completed</label>;

      return <label className="font-size-13">Not Submitted</label>;
    }

    if (doc_verify.result && doc_verify.status != "In Progress") {
      if (doc_verify.result == "Expired")
        return <label className="font-size-13">Expired</label>;
      else
        return buildType === BUILD_TYPE.FUTURE_FAMILY ? (
          <label className="font-size-13">
            {application.verification_attempts &&
            JSON.parse(application.verification_attempts).includes("doc_verify")
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
    const { phone, checked, email, method } = this.state;
    const { doc_verify } = application;

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
      !hideChangeButton && (!doc_verify || doc_verify.status !== "In Progress");

    return (
      <div>
        <label className="font-size-13">
          {`We recommend using Driver's License or State ID. Military ID is not
    supported at this point.`}
        </label>
        {buildType !== BUILD_TYPE.FUTURE_FAMILY && (
          <React.Fragment>
            <label className="d-block font-size-14 mt-3">Phone Number</label>
            <div className={styles[0].consumerInsightsSectionDocVerify__phone}>
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
            <p className="font-size-13 mt-3">{`Select the preferred method of verification`}</p>
            <div className={styles[0].methodButtonsWrap}>
              <a
                className={[
                  method == "phone"
                    ? "btn btn-primary btn-small"
                    : "btn btn-primary-outline btn-small",
                  styles[0].btnMethodButtonsWrap,
                ].join(" ")}
                onClick={() => this.setState({ method: "phone" })}
              >
                Text/SMS
              </a>
              <a
                className={[
                  method == "email"
                    ? "btn btn-primary btn-small"
                    : "btn btn-primary-outline btn-small",
                  styles[0].btnMethodButtonsWrap,
                ].join(" ")}
                onClick={() => this.setState({ method: "email" })}
              >
                Email
              </a>
            </div>
            {method === "phone" && (
              <div className={styles[0].verificationMethod}>
                <label className="d-block mt-4 mb-1">Phone Number</label>
                <FormInputComponent
                  type="text"
                  value={phone}
                  onChange={(e) => this.setState({ phone: e.target.value })}
                  pattern="^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$"
                  placeholder="(xxx) xxx-xxxx"
                />
              </div>
            )}
            {method === "email" && (
              <div className={styles[0].verificationMethod}>
                <label className="d-block mt-4 mb-1">Email Address</label>
                <FormInputComponent
                  type="text"
                  value={email}
                  onChange={(e) => this.setState({ email: e.target.value })}
                />
              </div>
            )}
          </React.Fragment>
        )}
        <form action="" method="POST" onSubmit={this.submit}>
          {!doc_verify || doc_verify.status != "In Progress" ? (
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
                id="confirm-doc-verify"
                type="checkbox"
                onChange={(e) => this.setState({ checked: e.target.checked })}
              />
              <label
                className="font-size-13"
                htmlFor="confirm-doc-verify"
              >{`I am a loan officer with full permission from the consumer to run this application as the consumer's proxy`}</label>
            </div>
          ) : null}
          {this.renderButton()}
        </form>
      </div>
    );
  }

  renderContent() {
    const { application, styles } = this.props;
    const { doc_verify } = application;

    let content;

    if (
      application.purged_at &&
      (!doc_verify || doc_verify.status === "In Progress")
    ) {
      return (
        <p className="font-size-13 mt-2">
          Document Verification was not completed prior to the expiration of
          this application. Decline this application and submit a new
          application to complete this step.
        </p>
      );
    }

    if (doc_verify && doc_verify.status !== "In Progress") {
      if (doc_verify.result === "Authenticated") {
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
      <div className={styles[0].consumerInsightsSectionDocVerify__body}>
        {content && (
          <div className={["mt-3", styles[0].verificationItemsGroup].join(" ")}>
            <VerificationItem title="Veriff Report" content={content} />
          </div>
        )}
        {this.renderForm()}
      </div>
    );
  }

  render() {
    const { styles } = this.props;
    return (
      <div className={styles[0].consumerInsightsSectionDocVerify}>
        <div
          className={[
            styles[0].consumerInsightsSectionHeader,
            "mt-4 mb-2 row",
          ].join(" ")}
        >
          <div className="col-md-4">
            <h3>Document Verification</h3>
          </div>
          <div className="col-md-3">{this.renderStatus()}</div>
          <div className="col-md-5">{this.renderLabel()}</div>
        </div>
        {this.renderContent()}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(DocVerify));
