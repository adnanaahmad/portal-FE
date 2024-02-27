import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { removeActiveModal } from "../../redux/actions";
import stylesModal from "./suggested-validation.module.scss";
import formInputStyles from "../../components/form-control/form-input/form-input.module.scss";
import styles from "../../views/app/applications/single/tabs/consumer-insights/consumer-insights.module.scss";
import MFAView from "../../views/app/applications/single/tabs/consumer-insights/MFA";
import DocVerifyView from "../../views/app/applications/single/tabs/consumer-insights/DocVerify";
import MFAEmail from "../../views/app/applications/single/tabs/consumer-insights/MFAEmail";

const mapStateToProps = (state) => {
  return {
    data: state.global.activeModalData,
  };
};

class SuggestedValidation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      application: this.props.data.application,
    };
  }
  componentDidMount() {
    //console.log(this.props.data);
  }

  refreshApp = (application) => {
    this.setState({ application });
    this.props.data.updateApplication(application);
  };

  close = (e) => {
    e.preventDefault();
    const { dispatch } = this.props;
    dispatch(removeActiveModal());
  };

  render() {
    const { application } = this.state;
    return (
      <div className={stylesModal.suggestedValidationModal}>
        <h3 className="mb-3">Suggested Validation</h3>
        <div className={styles.consumerInsightsSection}>
          {(JSON.parse(application.verification_attempts)?.includes("mfa") ||
            application.mfa?.result !== "Authenticated") && (
            <MFAView
              styles={[styles, formInputStyles]}
              application={application}
              onRefresh={this.refreshApp}
            />
          )}
          {(JSON.parse(application.verification_attempts)?.includes(
            "mfaEmail"
          ) ||
            application.mfa_email?.result !== "Authenticated") && (
            <MFAEmail
              styles={[styles, formInputStyles]}
              application={application}
              onRefresh={this.refreshApp}
            />
          )}
          {(JSON.parse(application.verification_attempts)?.includes(
            "doc_verify"
          ) ||
            application.doc_verify?.result !== "Authenticated") && (
            <DocVerifyView
              styles={[styles, formInputStyles]}
              application={application}
              onRefresh={this.refreshApp}
            />
          )}
        </div>
        <div className="d-flex justify-content-end mt-3">
          <a className={"btn btn-light"} onClick={this.close}>
            Close
          </a>
        </div>
      </div>
    );
  }
}
export default connect(mapStateToProps)(withRouter(SuggestedValidation));