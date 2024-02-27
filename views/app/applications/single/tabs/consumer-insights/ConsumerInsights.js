import React, { Component } from "react";
import { connect } from "react-redux";
import VerificationView from "./Verification";
import MFAView from "./MFA";
import DocVerifyView from "./DocVerify";

import formInputStyles from "../../../../../../components/form-control/form-input/form-input.module.scss";
import styles from "./consumer-insights.module.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class ConsumerInsights extends Component {
  render() {
    const { application, onRefresh } = this.props;
    return (
      <div className={styles.consumerInsightsSection}>
        <VerificationView
          styles={styles}
          application={application}
          onRefresh={onRefresh}
        />
        <MFAView
          styles={[styles, formInputStyles]}
          application={application}
          onRefresh={onRefresh}
        />
        <DocVerifyView
          styles={[styles, formInputStyles]}
          application={application}
          onRefresh={onRefresh}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps)(ConsumerInsights);
