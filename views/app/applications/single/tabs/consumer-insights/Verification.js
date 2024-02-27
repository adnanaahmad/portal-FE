import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { runConsumerInsights } from "../../../../../../utils/Thunk";
import { FLAGGED_CODES } from "../../../../../../utils/Constant";
import { VerificationItem } from "../../../../../../components";
import Helper from "../../../../../../utils/Helper";
import { Fragment } from "react";
import {
  showAlert,
  hideAlert,
  hideCanvas,
  showCanvas,
  setActiveModal,
  setJSONEditorData
} from "../../../../../../redux/actions";
import _ from 'lodash';

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    JSONEditor: state.modal.JSONEditor,
  };
};

class Verification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      failed: false,
      retry: false,
      json_editor_used: false,
    };
  }

  componentDidMount() {
    const { application } = this.props;
    const { consumer_insights } = application;
    if (!consumer_insights || !consumer_insights.id) {
      // useEffect(() => {
      this.setState({ retry: true });
      this.runConsumerInsights();
      // }, []);
    }
  }

  // Run Consumer Insights
  runConsumerInsights(reset, retryCheck = true) {
    const { application, onRefresh, authUser } = this.props;

    if (application.purged_at !== null) {
      return;
    }

    if (application && reset) {
      let copy = { ...application };
      copy.consumer_insights = null;
      onRefresh(copy);
    }

    this.props.dispatch(showCanvas());
    this.props.dispatch(hideAlert());
    setTimeout(
      () => {
        this.props.dispatch(
          runConsumerInsights(application.id, reset, null, (res) => {
            let retry = false;
            this.props.dispatch(hideCanvas());
            if (res && res.application) {
              onRefresh(res.application);
              this.setState({ failed: true, retry: false });
              const consumer_insights = res.application.consumer_insights;
              retry =
                retryCheck &&
                (!consumer_insights ||
                  !consumer_insights.id ||
                  !consumer_insights.aml_info ||
                  !!consumer_insights.data_provider);
            } else {
              retry = retryCheck;
              this.setState({ failed: true, retry: false });
            }

            if (retry) {
              this.props.dispatch(
                showAlert(
                  "There was an issue retrieving your data. Please try again.",
                  "error",
                  "center"
                )
              );
            }
          })
        );
      },
      authUser.demo_mode ? Helper.getRandomIntInclusive(2500, 4000) : 10
    );
  }
  //componentDidUpdate(prevState, prevProps, snapshot)
  componentDidUpdate(prevProps) {

    // prevState contains state before update
    // prevProps contains props before update

    const { application } = this.props;
    const { consumer_insights } = application;
    if (application.app_id !== prevProps.application.app_id) {
      if (!consumer_insights && application.isNew) {
        delete application.isNew;
        this.runConsumerInsights();
      }
    }

    if(consumer_insights) {

      const consumerInsights = Helper.mapObject(this.props.JSONEditor.file, (x) => {
        return (typeof x === 'object' && x !== null) ? JSON.stringify(x) : x; 
      });

      if(!_.isEmpty(consumerInsights) && !_.isEqual(consumer_insights, consumerInsights)) {
        this.setState({ json_editor_used: true });
        this.props.application.consumer_insights = consumerInsights;
        this.renderDetail();
      }
    }

  }

  renderResult() {
    const { application } = this.props;
    const { consumer_insights } = application;

    if (!consumer_insights || !consumer_insights.id) {
      if (application.purged_at !== null) {
        return <span className="app-status message">Expired</span>;
      }
      return null;
    }

    const { status, result } = consumer_insights;
    if (result == "Verified")
      return <span className="app-status success">Verified</span>;
    else if (result == "Insufficient-Info" || result == "Needs-Review")
      return <span className="app-status warning">Needs Review</span>;
    else if (status == "Failed" || result == "Not-Verified")
      return <span className="app-status fail">Not Verified</span>;
    return <span className="app-status danger">Error</span>;
  }

  renderRetryButton() {
    const { application } = this.props;

    if (application.isNew) {
      return null;
    }

    const { consumer_insights } = application;

    const retry =
      !this.state.retry &&
      (!consumer_insights ||
        !consumer_insights.id ||
        !consumer_insights.aml_info ||
        !!consumer_insights.data_provider);

    if (retry) {
      return (
        <div>
          <p>There was an issue retrieving your data. Please try again.</p>
          <br />
          <button
            type="submit"
            className="btn btn-primary btn-small mb-4"
            onClick={() => {
              this.setState({ retry: true });
              this.runConsumerInsights(true);
            }}
          >
            Retry
          </button>
        </div>
      );
    } else {
      return null;
    }
  }

  renderDetail() {
    const { application, styles } = this.props;
    const { consumer_insights } = application;

    let phone = {
      status: "loading",
      message: "",
      code: "",
    };
    let ip = {
      status: "loading",
      message: "",
      code: "",
    };
    let identity = {
      status: "loading",
      message: "",
      code: "",
    };
    let ssn = {
      status: "loading",
      message: "",
      code: "",
    };
    let fraud = {
      status: "loading",
      message: "",
      code: "",
    };
    let aml = {
      status: "loading",
      message: "",
      code: "",
    };
    let dl = {
      status: "loading",
      message: "",
      code: "",
    };

    let sf = {
      status: "loading",
      message: "",
      code: "",
    };

    if (consumer_insights && consumer_insights.id) {
      // IP Check
      ip = {
        status: "fail",
        message: "Failed",
        code: "",
      };

      if (consumer_insights.ipaddr_info) {
        const ipInfo = JSON.parse(consumer_insights.ipaddr_info);
        if (ipInfo && ipInfo.ipaddr_in_US) {
          ip = {
            ...ip,
            status: "success",
            message: "Passed. In U.S.",
          };
        }
      }

      // AML Check
      // aml = {
      //   status: "fail",
      //   message: "Not Verified",
      //   code: "",
      // };
      aml = {
        status: "success",
        code: "[Refer: FID-AML-STATUS]",
        message: "Passed",
      };

      if (consumer_insights.aml_info) {
        const amlInfo = JSON.parse(consumer_insights.aml_info);
        // if (
        //   amlInfo &&
        //   amlInfo.aml_risk_level &&
        //   amlInfo.aml_risk_level.toLowerCase() == "low"
        // ) {
        //   aml = {
        //     ...aml,
        //     status: "success",
        //     message: "Passed",
        //   };
        // }

        if(amlInfo && amlInfo.aml_details && amlInfo.aml_details.length > 0) {

          const detail = amlInfo.aml_details.find(detail => {

            return detail.detail_code === "FID-AML-STATUS";

          });

          if(detail.detail_message == "Inconspic") {

            aml = {
              ...aml,
              status: "success",
              code: "[Refer: FID-AML-STATUS]",
              message: "Passed",
            };

          } else if(detail.detail_message == "Check") {

            aml = {
              ...aml,
              status: "fail",
              code: "[Refer: FID-AML-CATEGORY-*]",
              message: "Failed",
            };

          }

        }

      }
      // Other Areas - Data Provider
      ssn = {
        status: "fail",
        message: "",
        code: "",
      };
      identity = {
        status: "fail",
        message: "",
        code: "",
      };
      fraud = {
        status: "fail",
        message: "",
        code: "",
      };

      sf = {
        status: "fail",
        message: "",
        code: "",
      };

      phone = {
        status: "fail",
        message: "",
        code: "",
      };
      dl = {
        status: "fail",
        message: "",
        code: "",
      };

      if (consumer_insights.data_providers) {
        let dataProviders = JSON.parse(consumer_insights.data_providers);
        if (dataProviders && dataProviders.length) {
          dataProviders.forEach((dataProvider) => {
            if (dataProvider.data_provider == "Equifax") {
              // Identity, Fraud
              for (let i = 0; i < dataProvider.details.length; i++) {
                const detail_code = dataProvider.details[i].detail_code;
                // const detail_message = dataProvider.details[i].detail_message;

                // SSN Check
                /*
                FID-SSNCHK-VALID = VERIFIED
                FID-SSNCHK-MISMATCH NOT VERIFIED
                FID-SSNCHK-UNAVAIL = NEEDS REVIEW
                FID-SSNCHK-EXCEPT = NEEDS REVIEW
                */

                if (detail_code == "FID-SSNCHK-VALID") {
                  ssn = {
                    ...ssn,
                    status: "success",
                    code: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].refer || "" : "",
                    message: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].text || "" : "",
                  };
                } else if (detail_code.includes("FID-SSNCHK")) {
                  ssn = {
                    ...ssn,
                    status: "fail",
                    code: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].refer || "" : "",
                    message: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].text || "" : "",
                  };
                }

                // Fraud Check
                /*
                FID-FRAUD-VERIFIED = VERIFIED
                FID-FRAUD-WARNING = NEEDS REVIEW
                FID-FRAUD-EXCEPT = NEEDS REVIEW
                FID-FRAUD-VICTIM = NOT VERIFIED
                FID-FRAUD-BOTH = NOT VERIFIED
                */
                if (detail_code == "FID-FRAUD-VERIFIED") {
                  fraud = {
                    ...fraud,
                    status: "success",
                    code: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].refer || "" : "",
                    message: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].text || "" : "",
                  };
                } else if (detail_code.includes("FID-FRAUD-")) {
                  fraud = {
                    ...fraud,
                    status: "fail",
                    code: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].refer || "" : "",
                    message: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].text || "" : "",
                  };
                }

                // Identity Check
                const MATCHASSMNT = detail_code.split("MATCHASSMNT");
                if (MATCHASSMNT[0] == "FID-" && MATCHASSMNT[1]) {
                  if (
                    MATCHASSMNT[1] == "-A" ||
                    MATCHASSMNT[1] == "-B" ||
                    MATCHASSMNT[1] == "-C" ||
                    MATCHASSMNT[1] == "-D" ||
                    MATCHASSMNT[1] == "-E" ||
                    MATCHASSMNT[1] == "-F" ||
                    MATCHASSMNT[1] == "-G"
                  ) {
                    identity = {
                      ...identity,
                      status: "success",
                      code: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].refer || "" : "",
                      message: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].text || "" : "",
                    };
                  } else {
                    identity = {
                      ...identity,
                      status: "fail",
                      code: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].refer || "" : "",
                      message: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].text || "" : "",
                    };
                  }
                }
              }
            } else if (dataProvider.data_provider == "SyntheticId") {
              for (let i = 0; i < dataProvider.details.length; i++) {
                const detail_code = dataProvider.details[i].detail_code;
                if (detail_code === "FID-SFID-FINAL-ASSESSMENT-FLAG") {
                  const message = dataProvider.details[i].detail_message;
                  sf.code = "[Refer: FID-SFID-FINAL-ASSESSMENT-FLAG]";

                  switch (message) {
                    case "N": {
                      sf.status = "success";
                      sf.message = "Passed";
                      break;
                    }
                    case "Y": {
                      sf.message = "Failed";
                      break;
                    }
                    default:
                      sf.message = "Undetermined";
                      sf.status = "";
                      break;
                  }
                }
              }
            } else if (dataProvider.data_provider == "Neustar") {
              // Phone, IP
              /*
              FID-PHONE-VERIFIED = VERIFIED
              FID-PHONE-UNVERIFIED = NOT VERIFIED
              FID-PHONE-REVIEW = NEEDS REVIEW
              */

              for (let i = 0; i < dataProvider.details.length; i++) {

                const detail_code = dataProvider.details[i].detail_code;
                const refer_detail_code = dataProvider.details.find(detail => {
                  return detail.detail_code === "FID-PHONE-ADDRESS-NAME-LINK";
                });
                const detail_message = (FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].text || "" : "") + (refer_detail_code ? refer_detail_code.detail_message || "" : "");

                if (detail_code == "FID-PHONE-VERIFIED") {
                  phone = {
                    ...phone,
                    status: "success",
                    code: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].refer || "" : "",
                    message: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].text || "" : "",
                  };
                }
                else if(detail_code == "FID-PHONE-REVIEW") {
                  phone = {
                    ...phone,
                    status: "success",
                    code: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].refer || "" : "",
                    message: detail_message,
                  };
                }
                else {
                  phone = {
                    ...phone,
                    status: "fail",
                    code: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].refer || "" : "",
                    message: detail_message,
                  };
                }
              }
            } else if (dataProvider.data_provider == "SambaSafety") {
              // Driver License
              /*
              FID-DL-EXPLAIN-VERIFIED = VERIFIED
		          FID-DL-EXPLAIN-UNVERIFIED = NOT VERIFIED (detail_code contains reason)
              */

              for (let i = 0; i < dataProvider.details.length; i++) {
                const detail_code = dataProvider.details[i].detail_code;
                if (detail_code == "FID-DL-EXPLAIN-VERIFIED") {
                  // if (detail_message == "ALL VALIDATION REQUIREMENTS PASSED") {
                  //   detail_message = "Passed";
                  //   //if (!detail_message || detail_message.length < 1) {
                  //   // detail_message =
                  //   //   FLAGGED_CODES[detail_code] &&
                  //   //   FLAGGED_CODES[detail_code].text
                  //   //     ? FLAGGED_CODES[detail_code].text
                  //   //     : "";
                  //   //}
                  //   dl = {
                  //     ...dl,
                  //     status: "success",
                  //     code: detail_code,
                  //     message: detail_message,
                  //   };
                  // } else {
                  //   dl = {
                  //     ...dl,
                  //     status: "fail",
                  //     code: detail_code,
                  //     message: detail_message,
                  //   };
                  // }

                  dl = {
                    ...dl,
                    status: "success",
                    code: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].refer || "" : "",
                    message: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].text || "" : "",
                  };

                } else if (detail_code === "FID-DL-EXPLAIN-UNVERIFIED") {
                  // if (!detail_message || detail_message.length < 1) {
                  //   detail_message = FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].text || "" : "";
                  // }

                  var detail_message = dataProvider.details[i].detail_message;
                  if(detail_message) {
                    //detail_message = detail_message.trim().split(/(?<=\bFAILED|PRODUCT\b)/).join(",");
                    detail_message = detail_message
                    .replace(/\b(FAILED|PRODUCT)\b/g, '$1,')
                    .replace(/,(\s+)?$/, '');
                  }

                  dl = {
                    ...dl,
                    status: "fail",
                    code: FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].refer || "" : "",
                    message: (FLAGGED_CODES[detail_code] ? FLAGGED_CODES[detail_code].text || "" : "") + detail_message,
                  };

                }
              }
            }
          });
        }
      }
    } else if (application.purged_at !== null) {
      return (
        <div className="font-size-13">
          Consumer Insights was not completed prior to the expiration of this
          application.
          <div className="mt-4"></div>
        </div>
      );
    }

    return (
      <Fragment>
        <img src="/logo-neustar.png" alt="" />
        <div className={["my-3", styles.verificationItemsGroup].join(" ")}>
          <VerificationItem title="Phone Number Verification" content={phone} />
          <VerificationItem title="Geo-Location Check" content={ip} />
        </div>

        <img src="/logo-equifax.png" alt="" />
        <div className={["my-3", styles.verificationItemsGroup].join(" ")}>
          <VerificationItem title="Identity Verification" content={identity} />
          <VerificationItem title="SSN Verification" content={ssn} />
          <VerificationItem title="Fraud Check Verification" content={fraud} />
          <VerificationItem title="AML Database Check" content={aml} />
          <VerificationItem title="Synthetic ID Alert" content={sf} />
        </div>

        <img src="/logo-samba.png" alt="" />
        <div className={["my-3", styles.verificationItemsGroup].join(" ")}>
          <VerificationItem
            title="Driver's License Verification"
            content={dl}
          />
        </div>
      </Fragment>
    );
  }

  openJSONEditor = () => {

    this.setState({ json_editor_used: false });

    const { application } = this.props;

    const { consumer_insights } = application;
    let consumerInsights = {};
    if (consumer_insights) {

      consumerInsights = Helper.mapObject(consumer_insights, (x) => {
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
        file: consumerInsights,
      })
    );
    this.props.dispatch(setActiveModal("json-editor"));

  }

  render() {
    const { styles, authUser } = this.props;
    // const { consumer_insights } = application;

    // if (!retry && !consumer_insights && application.isNew) {
    //   delete application.isNew;
    //   this.runConsumerInsights(false, false);
    //   return null;
    // }

    return (
      <div id="consumer-insights-sectionVerification">
        {/* { authUser.demo_mode ? (
          <a className="btn btn-primary" onClick={this.openJSONEditor}>JSON Editor</a>
        ) : null } */}
        <div
          className={[styles.consumerInsightsSectionHeader, "mb-4 row"].join(" ")}
        >
          <div className="col-md-2">
            <h3>Verification Results</h3>
          </div>
          <div className={["col-md-10", styles.verificationResults].join(" ")}>
            {this.renderResult()}
          </div>
        </div>
        <div className="spacer mt-4 mb-4"></div>
        {this.renderRetryButton()}
        {this.renderDetail()}
        <div className="spacer"></div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Verification));
