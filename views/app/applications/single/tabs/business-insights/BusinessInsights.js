import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { showCanvas, hideCanvas } from "../../../../../../redux/actions";
import {
  resetBusinessInsights,
  runBusinessInsights,
} from "../../../../../../utils/Thunk";
import { VerificationItem } from "../../../../../../components";
import {
  setActiveModal,
  setJSONEditorData,
} from "../../../../../../redux/actions";
import _ from 'lodash';

import styles from "./business-insights.module.scss";
import Helper from "../../../../../../utils/Helper";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    JSONEditor: state.modal.JSONEditor,
  };
};

class BusinessInsights extends Component {

  constructor(props) {
    super(props);
    this.state = {
      start_or_retry: true,
      json_editor_used: false,
    }
  }

  componentDidMount() {

    const businessInsightsTab = document.getElementsByClassName(styles.businessInsightsSection)[0];

    if(businessInsightsTab) {

      document.addEventListener("keypress", (e) => {

        // `Enter` key is pressed
        if (e.keyCode == 13) {
          const startBusinessInsightsButton =
            this.getStartBusinessInsightsButton();
          if (startBusinessInsightsButton) {
            startBusinessInsightsButton.click();
          } else {
            const retryButton = this.getRetryButton();
            if (retryButton) {
              retryButton.click();
            }
          }
        }

      });

    }

  }

  componentDidUpdate() {

    const { application } = this.props;
    const { business_insights } = application;

    if(business_insights) {

      const businessInsights = Helper.mapObject(this.props.JSONEditor.file, (x) => {
        return (typeof x === 'object' && x !== null) ? JSON.stringify(x) : x; 
      });



      if(!_.isEmpty(businessInsights) && !_.isEqual(business_insights, businessInsights) && !this.state.start_or_retry) {
        this.setState({ json_editor_used: true });
        this.props.application.business_insights = businessInsights;
        this.renderContent();
      }
    }

  }

  clickReset = (e) => {

    this.setState({ start_or_retry: true });

    const retryButton = this.getRetryButton();
    if (retryButton) {
      retryButton.disabled = true;
    }

    e.preventDefault();
    const { application, onRefresh } = this.props;

    this.props.dispatch(
      resetBusinessInsights(
        application.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.application && onRefresh) {
            onRefresh(res.application);
          } else {
            if (retryButton) {
              retryButton.disabled = false;
            }
          }
        }
      )
    );
  };

  getStartBusinessInsightsButton() {
    return document.getElementById("startBusinessInsightsButton");
  }

  getRetryButton() {
    return document.getElementById("retryButton");
  }

  runBusinessInsights = (e) => {

    this.setState({ start_or_retry: true });

    const startBusinessInsightsButton = this.getRetryButton();
    if (startBusinessInsightsButton) {
      startBusinessInsightsButton.disabled = true;
    }

    e.preventDefault();
    const { application, onRefresh, authUser } = this.props;
    if (application.purged_at !== null) {
      if (startBusinessInsightsButton) {
        startBusinessInsightsButton.disabled = false;
      }
      return;
    }

    const { business_insights } = application;

    if (business_insights && business_insights.id) return;

    this.props.dispatch(
      runBusinessInsights(
        application.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          setTimeout(
            () => {
              if (res && res.application && onRefresh) {
                onRefresh(res.application);
              } else {
                if (startBusinessInsightsButton) {
                  startBusinessInsightsButton.disabled = false;
                }
              }
              this.props.dispatch(hideCanvas());
            },
            authUser.demo_mode ? Helper.getRandomIntInclusive(2500, 4000) : 10
          );
        }
      )
    );
  };

  renderResult() {
    const { application } = this.props;
    const { business_insights } = application;

    if (!business_insights || !business_insights.id) {
      if (application.purged_at !== null) {
        return <span className="app-status message">Expired</span>;
      }
      return null;
    }

    const { status, result } = business_insights;

    if (result == "Verified")
      return <span className="app-status success">Verified</span>;

    if (result == "Not-Verified")
      return <span className="app-status fail">Not Verified</span>;

    if (status == "Failed")
      return <span className="app-status fail">Not Verified</span>;

    if (result == "Insufficient-Info" || result == "Needs-Review") {
      if (application.purged_at !== null) {
        return <span className="app-status message">Expired</span>;
      }
      return <span className="app-status warning">Needs Review</span>;
    }

    return <span className="app-status danger">Error</span>;
  }

  renderContent() {
    const { application } = this.props;
    const { business_insights } = application;

    if (
      application.decision !== "No Action" &&
      application.decision_reason !== ""
    ) {
      return (
        <p className="font-size-13 mt-2">
          You are no longer able to perform this operation.
        </p>
      );
    }
    if (application.main_app_id !== 0 && application.main_app_decision) {
      return (
        <p className="font-size-13 mt-2">
          You are no longer able to perform this operation.
        </p>
      );
    }

    if (application.purged_at === null) {
      if (!business_insights || !business_insights.id) {
        return (
          <button
            id="startBusinessInsightsButton"
            className="btn btn-primary btn-small"
            onClick={this.runBusinessInsights}
          >
            Start Small Business Insights
          </button>
        );
      }
    } else {
      if (!business_insights || !business_insights.id) {
        return (
          <p className="font-size-13 mt-2">
            Small Business Insights was not completed prior to the expiration of
            this application.
          </p>
        );
      }
    }

    let address = {
      status: "loading",
      code: "",
      message: "",
    };

    let phone = {
      status: "loading",
      code: "",
      message: "",
    };

    let name = {
      status: "loading",
      code: "",
      message: "",
    };

    let identity = {
      status: "loading",
      code: "",
      message: "",
    };

    let ofac = {
      status: "loading",
      code: "",
      message: "",
    };
    if (business_insights.details) {
      const details = JSON.parse(business_insights.details);

      if (details && details.length) {
        let address_line1_status = -1;
        let address_zip_status = -1;
        let address_status = -1;
        let address_message = "";
        let phone_status = -1;
        let phone_message = "";
        let name_status = -1;
        let name_message = "";
        let identity_status = -1;
        let identity_message = "";
        let ofac_status = -1;
        let ofac_message = "";

        details.forEach((item) => {
          const detail_code = item.detail_code;
          const detail_message = item.detail_message;

          if (detail_code == "FID-BUSINESS-ADDR-STREET-LINE1-MATCH") {
            address_line1_status = 1;
          }

          if (detail_code == "FID-BUSINESS-ADDR-STREET-LINE1-MISMATCH") {
            address_line1_status = 0;
          }

          if (detail_code == "FID-BUSINESS-ADDR-ZIP-MATCH") {
            address_zip_status = 1;
          }

          if (detail_code == "FID-BUSINESS-ADDR-ZIP-MISMATCH") {
            address_zip_status = 0;
          }
          if (detail_code == "FID-BUSINESS-PHONE-MATCH") {
            phone_status = 1;
            phone_message = "Phone verified";
          }

          if (detail_code == "FID-BUSINESS-PHONE-MISMATCH") {
            phone_status = 0;
            phone_message = "Phone not verified";
          }

          if (detail_code == "FID-BUSINESS-NAME-MATCH") {
            name_status = 1;
            name_message = "Business name verified";
          }

          if (detail_code == "FID-BUSINESS-NAME-MISMATCH") {
            name_status = 0;
            name_message = "Business name not verified";
          }

          if (detail_code == "FID-BUSINESS-NOT-FOUND") {
            name_status = 0;
            name_message = detail_message;
          }
          if (detail_code == "FID-BUSINESS-ID-NUMBER-MATCH") {
            identity_status = 1;
            identity_message = "Business identity verified";
          }

          if (detail_code == "FID-BUSINESS-ID-NUMBER-MISMATCH") {
            identity_status = 0;
            identity_message = "Business identity not verified";
          }

          if (detail_code == "FID-BUSINESS-ID-NUMBER-NOT-FOUND") {
            identity_status = 2;
            identity_message = detail_message;
          }

          if (detail_code == "FID-BUSINESS-NO-OFAC-HIT") {
            ofac_status = 1;
            ofac_message = detail_message;
          }

          if (detail_code == "FID-BUSINESS-OFAC-HIT") {
            ofac_status = 0;
            ofac_message = detail_message;
          }
        });

        if (address_line1_status == 1 && address_zip_status == 1) {
          address_status = 1;
          address_message = "Address verified";
        } else if (address_line1_status == 0 && address_zip_status == 1) {
          address_status = 2;
          address_message = "Address needs review";
        } else if (address_zip_status == 0) {
          address_status = 0;
          address_message = "Address not verified";
        }

        if (address_status == 1) {
          address = {
            ...address,
            status: "success",
            code: "[Refer: FID-BUSINESS-ADDR-STREET-LINE1-MATCH and FID-BUSINESS-ADDR-ZIP-MATCH for details]",
            message: address_message,
          };
        } else if (address_status == 0) {
          address = {
            ...address,
            status: "fail",
            code: "[Refer: FID-BUSINESS-ADDR-STREET-LINE1-MISMATCH and FID-BUSINESS-ADDR-ZIP-MISMATCH for details]",
            message: address_message,
          };
        } else if (address_status == 2) {
          address = {
            ...address,
            status: "",
            code: "[Refer: FID-BUSINESS-ADDR-STREET-LINE1-MISMATCH and FID-BUSINESS-ADDR-ZIP-MATCH for details]",
            message: address_message,
          };
        }
        if (phone_status == 1) {
          phone = {
            ...phone,
            status: "success",
            code: "[Refer: FID-BUSINESS-PHONE-MATCH for details]",
            message: phone_message,
          };
        } else if (phone_status == 0) {
          phone = {
            ...phone,
            status: "fail",
            code: "[Refer: FID-BUSINESS-PHONE-MISMATCH for details]",
            message: phone_message,
          };
        }
        if (name_status == 1) {
          name = {
            ...name,
            status: "success",
            code: "[Refer: FID-BUSINESS-NAME-MATCH for details]",
            message: name_message,
          };
        } else if (name_status == 0) {
          name = {
            ...name,
            status: "fail",
            code: "[Refer: FID-BUSINESS-NAME-MISMATCH for details]",
            message: name_message,
          };
        }
        if (identity_status == 1) {
          identity = {
            ...identity,
            status: "success",
            code: "[Refer: FID-BUSINESS-ID-NUMBER-MATCH for details]",
            message: identity_message,
          };
        } else if (identity_status == 0) {
          identity = {
            ...identity,
            status: "fail",
            code: "[Refer: FID-BUSINESS-ID-NUMBER-MISMATCH for details]",
            message: identity_message,
          };
        } else if (identity_status == 2) {
          identity = {
            ...identity,
            status: "",
            message: identity_message,
          };
        }
        if (ofac_status == 1) {
          ofac = {
            ...ofac,
            status: "success",
            message: ofac_message,
          };
        } else if (ofac_status == 0) {
          ofac = {
            ...ofac,
            status: "fail",
            message: ofac_message,
          };
        }
      }
    }

    return (
      <Fragment>
        {(!business_insights || business_insights.result !== "Verified") && (
          <div>
            <a
              id="retryButton"
              className="btn btn-primary btn-small"
              onClick={this.clickReset}
            >
              Retry
            </a>
          </div>
        )}
        <div className="spacer_noline mt-2 mb-2"></div>
        <div>
          <img src="/logo-equifax.png" alt="" />
        </div>
        <div className={["my-3", styles.verificationItemsGroup].join(" ")}>
          <VerificationItem title="Address Verification" content={address} />
          <VerificationItem title="Phone Verification" content={phone} />
          <VerificationItem title="Name Verification" content={name} />
          <VerificationItem
            title="Business Identity Verification"
            content={identity}
          />
          <VerificationItem title="OFAC" content={ofac} />
        </div>
      </Fragment>
    );
  }

  openJSONEditor = () => {

    this.setState({ start_or_retry: false, json_editor_used: false });

    const { application } = this.props;

    const { business_insights } = application;
    let businessInsights = {};
    if (business_insights) {

      businessInsights = Helper.mapObject(business_insights, (x) => {
        try { 
          return JSON.parse(x); 
        }
        catch (e) { 
          return x; 
        }
      });

    }

    this.props.dispatch(
      setJSONEditorData({
        file: businessInsights,
      })
    );
    this.props.dispatch(setActiveModal("json-editor"));

  }

  render() {
    const { application, authUser } = this.props;
    const { business_insights } = application;

    if (
      !application ||
      !application.business_information ||
      !application.business_information.id
    )
      return null;
    return (
      <div className={styles.businessInsightsSection}>
        {/* { (authUser.demo_mode && business_insights && business_insights.id) ? (
          <a className="btn btn-primary" onClick={this.openJSONEditor}>JSON Editor</a>
        ) : null } */}
        <div
          className={["mb-4", styles.businessInsightsSectionHeader].join(" ")}
        >
          <h3>Verification Results</h3>
          {this.renderResult()}
        </div>
        <div className="spacer mt-4 mb-4" />
        <div id="business-insights-sectionContent">{this.renderContent()}</div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(BusinessInsights);
