import React, { Component } from "react";
import { Fragment } from "react";
import { connect } from "react-redux";
import ClipLoader from "react-spinners/ClipLoader";
import { VerificationItem } from "../../../../../../components";
import {
  showCanvas,
  hideCanvas,
  setActiveModal,
  setCustomGeneralModalData,
  showAlert,
} from "../../../../../../redux/actions";
import Helper from "../../../../../../utils/Helper";
import {
  doDirectID,
  checkDirectID,
  runIncomeInsights,
  bypassDirectID,
  resetIncomeInsights,
  cancelIncomeInsights,
} from "../../../../../../utils/Thunk";

import formInputStyles from "../../../../../../components/form-control/form-input/form-input.module.scss";
import styles from "./income-insights.module.scss";
import { ROLES } from "../../../../../../utils/Constant";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    customGeneralModalData: state.modal.customGeneralModalData,
  };
};

class IncomeInsights extends Component {
  constructor(props) {
    super(props);
    this.state = {
      method: "phone",
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

    const { application } = this.props;
    const { income_insights } = application;

    // Default Phone
    if (income_insights && income_insights.id) {
      this.setState({
        phone: income_insights.phone,
        email: income_insights.email,
        method: income_insights.method || "phone",
      });
      if (income_insights.status == "In Progress") this.checkDirectID();
    } else {
      this.setState({
        phone: application.personal_information.phone,
        email: application.personal_information.email,
        method: "phone",
      });
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
      const { income_insights } = application;
      const { income_insights: income_insights_prev } = applicationPrev;

      if (
        JSON.stringify(income_insights_prev) !=
          JSON.stringify(income_insights) &&
        income_insights &&
        income_insights.id
      ) {
        this.setState({
          phone: income_insights.phone,
          email: income_insights.email,
          method: income_insights.method || "phone",
        });
      } else {
        if (
          application.id !== applicationPrev.id &&
          application.personal_information
        ) {
          this.setState({
            phone: application.personal_information.phone,
            email: application.personal_information.email,
            method: "phone",
          });
        }
      }

      // Just after doDirectID finishes
      if (
        (!income_insights_prev ||
          !income_insights_prev.id ||
          income_insights_prev.status != "In Progress") &&
        income_insights &&
        income_insights.id &&
        income_insights.status == "In Progress"
      )
        this.checkDirectID();
      else {
        // Just after checkDirectID finishes
        if (
          income_insights_prev &&
          income_insights_prev.id &&
          income_insights &&
          income_insights.id &&
          !income_insights_prev.directid_result &&
          income_insights.directid_result
        )
          this.checkDirectID();
      }
    }

    // Custom General Modal Data
    if (
      customGeneralModalDataPrev &&
      customGeneralModalDataPrev.action &&
      customGeneralModalData
    ) {
      // Custom General Modal Data - Phone
      if (customGeneralModalData.action == "update-income-phone") {
        if (
          (!customGeneralModalDataPrev.returnData ||
            !customGeneralModalDataPrev.returnData.phone) &&
          customGeneralModalData.returnData &&
          customGeneralModalData.returnData.phone
        ) {
          this.setState({ phone: customGeneralModalData.returnData.phone });
        }
      }

      // Custom General Modal Data - Email
      if (customGeneralModalData.action == "update-income-email") {
        if (
          (!customGeneralModalDataPrev.returnData ||
            !customGeneralModalDataPrev.returnData.email) &&
          customGeneralModalData.returnData &&
          customGeneralModalData.returnData.email
        ) {
          this.setState({ email: customGeneralModalData.returnData.email });
        }
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

  runIncomeInsights() {
    const { application, onRefresh } = this.props;

    if (application.purged_at !== null) {
      return;
    }

    this.props.dispatch(
      runIncomeInsights(application.id, null, (res) => {
        if (res.application && onRefresh) onRefresh(res.application);
      })
    );
  }

  checkDirectID() {
    const { application, onRefresh, authUser } = this.props;
    const { income_insights } = application;

    if (this.stop) return;

    if (income_insights && income_insights.directid_result) {
      setTimeout(
        () => {
          this.runIncomeInsights();
        },
        authUser.demo_mode ? Helper.getRandomIntInclusive(2500, 4000) : 10
      );
      return;
    }

    this.props.dispatch(
      checkDirectID(application.id, null, (res) => {
        if (res && res.success) {
          if (res.application && onRefresh) onRefresh(res.application);
          else if (!res.application || !res.application.id) {
            if (this.mounted && !this.stop) {
              this.timer = setTimeout(() => {
                this.checkDirectID();
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

    await this.props.dispatch(
      setCustomGeneralModalData({
        title: "Change Phone Number",
        body: "This phone number must be able to recieve SMS text messages.",
        action: "update-income-phone",
        data: {
          phone,
        },
      })
    );
    await this.props.dispatch(setActiveModal("custom-general"));
  };

  clickChangeEmail = async (e) => {
    e.preventDefault();
    const { email } = this.state;

    await this.props.dispatch(
      setCustomGeneralModalData({
        title: "Change Email Address",
        body: "Enter an email address to recieve a bank account verification link.",
        action: "update-income-email",
        data: {
          email,
        },
      })
    );
    await this.props.dispatch(setActiveModal("custom-general"));
  };

  clickBypass = (e) => {
    e.preventDefault();
    const { application } = this.props;

    this.props.dispatch(
      bypassDirectID(
        application.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        () => {
          this.props.dispatch(hideCanvas());
        }
      )
    );
  };

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
      cancelIncomeInsights(
        application.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.application && onRefresh) onRefresh(res.application);
        }
      )
    );
  };

  clickReset = (e) => {
    e.preventDefault();
    const { application, onRefresh } = this.props;

    this.props.dispatch(
      resetIncomeInsights(
        application.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.application && onRefresh) onRefresh(res.application);
        }
      )
    );
  };

  submit = (e) => {
    e.preventDefault();

    const { method, email, phone } = this.state;
    const { application, onRefresh } = this.props;

    if (method == "email" && !Helper.validateEmail(email)) {
      this.props.dispatch(showAlert("Please input valid email address"));
      return;
    }

    if (method == "phone" && !phone) {
      this.props.dispatch(showAlert("Please input phone number"));
      return;
    }

    const params = {
      method,
      email,
      phone,
    };

    this.stop = false;

    this.props.dispatch(
      doDirectID(
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

  renderMethodButtons() {
    const { method } = this.state;
    const { application } = this.props;
    const { income_insights } = application;

    if (application.purged_at) return null;

    if (income_insights && income_insights.status == "In Progress") return null;

    if (
      application.decision !== "No Action" &&
      application.decision_reason !== ""
    )
      return null;
    if (application.main_app_id !== 0 && application.main_app_decision) {
      return null;
    }

    return (
      <Fragment>
        <p className="font-size-13 mt-3">{`Select the preferred method of verification`}</p>
        <div className={styles.methodButtonsWrap}>
          <a
            className={[
              method == "phone"
                ? "btn btn-primary btn-small"
                : "btn btn-primary-outline btn-small",
              styles.btnMethodButtonsWrap,
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
              styles.btnMethodButtonsWrap,
            ].join(" ")}
            onClick={() => this.setState({ method: "email" })}
          >
            Email
          </a>
        </div>
      </Fragment>
    );
  }

  renderMethodContent() {
    const { method, phone, email } = this.state;
    const { application, authUser } = this.props;
    const { income_insights } = application;

    if (
      application.decision !== "No Action" &&
      application.decision_reason !== ""
    )
      return null;

    if (application.main_app_id !== 0 && application.main_app_decision) {
      return null;
    }
    // Hide the change button if the loan application wasn't created by a supervisor
    const hideChangeButton =
      authUser.role === ROLES.supervisor && authUser.id !== application.user_id;
    const shouldShowChangeButton =
      !hideChangeButton &&
      (!income_insights || income_insights.status !== "In Progress");

    return (
      <Fragment>
        <label className="d-block font-size-14 mt-3">{method === "phone" ? "Phone Number" : "Email Address"}</label>
        <div className={styles.incomeInsightsSection__phone}>
          <span className="font-size-14 font-weight-600">{method === "phone" ? phone : email}</span>
          {shouldShowChangeButton ? (
            <a
              className="color-primary font-size-13"
              onClick={method === "phone" ? this.clickChangePhone : this.clickChangeEmail}
            >
              Change
            </a>
          ) : null}
        </div>
      </Fragment>
    );
  }

  renderForm() {
    const { checked } = this.state;
    const { application } = this.props;
    const { income_insights } = application;

    if (
      application.decision !== "No Action" &&
      application.decision_reason !== ""
    )
      return null;

    if (application.main_app_id !== 0 && application.main_app_decision) {
      return null;
    }

    if (income_insights && income_insights.status == "In Progress") {
      return (
        <Fragment>
          <div className={styles.incomeVerifyingTag}>
            <ClipLoader size={16} color="#0376BC" />
            <label>
              Verifying .. Please do not refresh or close your browser
            </label>
          </div>
          <a
            className="btn btn-danger btn-small mt-3"
            onClick={this.clickCancel}
          >
            Cancel
          </a>
          {/*!income_insights.directid_result ? (
            <a
              className="btn btn-primary btn-small mt-3"
              onClick={this.clickBypass}
            >
              Bypass DirectID Result Check
            </a>
          ) : null*/}
        </Fragment>
      );
    }

    return (
      <form action="" method="POST" onSubmit={this.submit}>
        <div
          className={[
            formInputStyles.customFormControl,
            formInputStyles.customFormControlCheckbox,
            "mt-4",
          ].join(" ")}
        >
          <input
            checked={checked}
            required
            id="confirm-checkbox"
            type="checkbox"
            onChange={(e) => this.setState({ checked: e.target.checked })}
          />
          <label
            className="font-size-13"
            htmlFor="confirm-checkbox"
          >{`I am a loan officer with full permission from the consumer to run this application as the consumer's proxy`}</label>
        </div>

        <button type="submit" className="btn btn-primary btn-small mt-4">
          Send
        </button>
      </form>
    );
  }

  renderGlobalStatus() {
    const { application } = this.props;
    const { income_insights } = application;

    if (!income_insights || !income_insights.id) {
      if (application.purged_at !== null)
        return <span className="app-status message">Expired</span>;
      return null;
    }

    if (income_insights.result == "Verified") {
      return <span className="app-status success">Verified</span>;
    }

    if (
      income_insights.result == "Insufficient-Info" ||
      income_insights.result == "Needs-Review"
    ) {
      return <span className="app-status warning">Needs Review</span>;
    }

    if (income_insights.result == "Error" && !income_insights.directid_result) {
      return <span className="app-status danger">Error</span>;
    }

    if (income_insights.result == "Error") {
      if (application.purged_at !== null)
        return <span className="app-status message">Expired</span>;
      return <span className="app-status fail">Not Verified</span>;
    }

    if (income_insights.result == "Not-Verified") {
      return <span className="app-status fail">Not Verified</span>;
    }

    return null;
  }

  renderStatus() {
    const { application } = this.props;
    const { income_insights } = application;

    if (income_insights && income_insights.id) {
      if (income_insights.income_info) {
        const incomeInfo = JSON.parse(income_insights.income_info);

        if (incomeInfo.FID_confidence_score == "High")
          return <span className="app-status-outline success">High</span>;

        if (incomeInfo.FID_confidence_score == "Low")
          return <span className="app-status-outline warning">Low</span>;

        return <span className="app-status-outline info">Medium</span>;
      }
    } else {
      if (application.purged_at !== null) {
        return null;
      }
      return (
        <div>
          <img src="/warning.png" alt="" />
          <label className="font-size-13">Action Required</label>
        </div>
      );
    }
  }

  renderLabel() {
    const { application } = this.props;
    const { income_insights } = application;

    if (income_insights && income_insights.id) {
      if (income_insights.status == "In Progress") {
        if (application.purged_at !== null)
          return <label className="font-size-13">Not Completed</label>;
        if (!income_insights.directid_result) {
          return (
            <label className="font-size-13">
              Waiting for DirectID response
            </label>
          );
        }
      } else {
        if (income_insights.result == "Expired")
          return <label className="font-size-13">Expired</label>;

        if (income_insights.directid_result) {
          if (application.purged_at !== null)
            return <label className="font-size-13">Not Completed</label>;
          return <label className="font-size-13">Completed</label>;
        }
      }
    } else {
      if (application.purged_at !== null)
        return <label className="font-size-13">Not Completed</label>;

      return <label className="font-size-13">Not Submitted</label>;
    }
  }

  renderLabel2() {
    const { application } = this.props;
    const { income_insights } = application;

    if (
      income_insights &&
      income_insights.id &&
      income_insights.directid_result &&
      income_insights.result &&
      income_insights.result !== "Error"
    )
      return <label className="font-size-13">Completed</label>;

    if (application.purged_at !== null)
      return <label className="font-size-13">Not Completed</label>;

    return null;
  }

  renderEmploymentText() {
    const { application } = this.props;
    const { income_insights } = application;

    if (
      !income_insights ||
      !income_insights.id ||
      !income_insights.directid_result ||
      income_insights.result === "Error"
    ) {
      if (application.purged_at)
        return (
          <p className="font-size-13 mt-2">
            Employment Verification was not completed prior to the expiration of
            this application.
          </p>
        );
      return (
        <p className="font-size-13 mt-2">{`This process will start automatically after bank verification is completed`}</p>
      );
    }

    return null;
  }

  renderRetryButton() {
    const { application } = this.props;
    const { income_insights } = application;

    if (application.purged_at) return null;

    if (income_insights && income_insights.status !== "In Progress") {
      return (
        <div>
          <div>
            <a className="btn btn-primary btn-small" onClick={this.clickReset}>
              Retry
            </a>
          </div>
          <div className="spacer_noline mt-2 mb-2"></div>
        </div>
      );
    }
    return null;
  }

  renderBody2() {
    const { application } = this.props;
    const { income_insights } = application;

    if (income_insights && income_insights.id && income_insights.twn_info) {
      let content2 = {
        status: "fail",
        code: "",
        message: "",
      };

      const twnInfo = JSON.parse(income_insights.twn_info);

      let part2 = null;
      let part3 = null;
      let part4 = null;

      if (twnInfo && twnInfo.details) {
        twnInfo.details.forEach((item) => {
          if (item.detail_code == "FID-TWN-SSN-MATCH") {
            part4 = <Fragment>SSN Match: Verified</Fragment>;
          } else if (item.detail_code == "FID-TWN-SSN-MISMATCH") {
            part4 = <Fragment>SSN Match: Not Verified</Fragment>;
          } else if (item.detail_code == "FID-TWN-NAME-MATCH") {
            part3 = <Fragment>Name Match: Verified</Fragment>;
          } else if (item.detail_code == "FID-TWN-NAME-MISMATCH") {
            part3 = <Fragment>Name Match: Not Verified</Fragment>;
          } else if (item.detail_code == "FID-TWN-EMPLOYMENT-STATUS-MATCH") {
            content2 = {
              ...content2,
              status: "success",
            };
            part2 = <Fragment>Employment Status: Verified</Fragment>;
          } else if (item.detail_code == "FID-TWN-EMPLOYMENT-STATUS-MISMATCH") {
            part2 = <Fragment>Employment Status: Needs Review</Fragment>;
          } else {
            part2 = <Fragment>{item.detail_message}</Fragment>;
          }
        });
      }

      content2 = {
        ...content2,
        message: (
          <Fragment>
            {part2}
            <br />
            {part3}
            <br />
            {part4}
          </Fragment>
        ),
      };

      return (
        <div className={["mt-3", styles.verificationItemsGroup].join(" ")}>
          <VerificationItem title="Equifax TWN" content={content2} />
        </div>
      );
    }

    return null;
  }

  renderBody() {
    const { application } = this.props;
    const { income_insights } = application;

    if (
      income_insights &&
      income_insights.id &&
      income_insights.income_info &&
      income_insights.twn_info
    ) {
      let content = {
        status: "fail",
        code: "",
        message: "",
      };

      const incomeInfo = JSON.parse(income_insights.income_info);

      if (
        typeof incomeInfo.confidence_score === "number" &&
        incomeInfo.confidence_score > 0
      ) {
        content = {
          ...content,
          status: "success",
        };
      }

      let part1 = (
        <Fragment>
          FID Confidence Score: {incomeInfo.FID_confidence_score}
        </Fragment>
      );

      content = {
        ...content,
        message: <Fragment>{part1}</Fragment>,
      };

      return (
        <div className={["mt-3", styles.verificationItemsGroup].join(" ")}>
          <VerificationItem title="DirectID Report" content={content} />
        </div>
      );
    } else if (
      income_insights &&
      income_insights.directid_result &&
      income_insights.result &&
      income_insights.result !== "Error"
    ) {
      let content = {
        status: "fail",
        code: "",
        message: "",
      };
      return (
        <div className="mt-3">
          <VerificationItem title="DirectID Report" content={content} />
        </div>
      );
    }

    if (application.purged_at)
      return (
        <p className="font-size-13 mt-2">
          Bank Account Verification was not completed prior to the expiration of
          this application.
        </p>
      );

    return (
      <Fragment>
        {this.renderMethodButtons()}
        {this.renderMethodContent()}
        {this.renderForm()}
      </Fragment>
    );
  }

  render() {
    return (
      <div className={styles.incomeInsightsSection}>
        <div className={["row", styles.incomeInsightsSectionHeader].join(" ")}>
          <div className="col-md-2">
            <h3>Verification Results</h3>
          </div>
          <div className={["col-md-10", styles.verificationResults].join(" ")}>
            {this.renderGlobalStatus()}
          </div>
        </div>
        <div className="spacer mt-4 mb-4"></div>
        {this.renderRetryButton()}
        <div className={["row", styles.incomeInsightsSectionHeader].join(" ")}>
          <div className="col-md-3">
            <h3>Bank Account Verification</h3>
          </div>
          <div className="col-md-2">
            {this.renderStatus()}
          </div>
          <div className="col-md-7">
            {this.renderLabel()}
          </div>
        </div>
        <div>{this.renderBody()}</div>
        <div className="spacer mt-4 mb-4"></div>
        <div className={["row", styles.incomeInsightsSectionHeader].join(" ")}>
          <div className="col-md-3">
            <h3>Employment Verification</h3>
          </div>
          <div className="col-md-9">
            {this.renderLabel2()}
          </div>
        </div>
        <div>{this.renderBody2()}</div>
        {this.renderEmploymentText()}
      </div>
    );
  }
}

export default connect(mapStateToProps)(IncomeInsights);
