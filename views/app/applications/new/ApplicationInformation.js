import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FormInputComponent } from "../../../../components";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    fillDemoData: state.global.fillDemoData,
    index: state.global.index,
  };
};

class ApplicationInformation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      do_coapplicant: this.props.do_coapplicant,
      is_coapplicant: this.props.is_coapplicant,
    };
  }

  setData() {
    const { onSetData } = this.props;
    const { is_coapplicant } = this.state;
    if (onSetData) {
      onSetData("application_information", {
        is_coapplicant,
      });
    }
  }

  setCoApplicant(is_coapplicant) {
    this.props.sendCoapplicant(is_coapplicant);
    this.setState({ is_coapplicant }, () => {
      this.setData();
    });
  }

  renderCoApplicantButtons() {
    const { styles } = this.props;
    const { is_coapplicant } = this.state;
    const active = ["btn btn-primary btn-small", styles.btnCInlineButtons].join(
      " "
    );
    const inactive = [
      "btn btn-primary-outline btn-small",
      styles.btnCInlineButtons,
    ].join(" ");

    return (
      <div className={styles.cInlineButtons}>
        <FormInputComponent
          type="text"
          value={is_coapplicant}
          required={true}
          hidden
        />
        <Fragment>
          <a
            className={is_coapplicant === "yes" ? active : inactive}
            onClick={() => this.setCoApplicant("yes")}
          >
            Yes
          </a>
          <a
            className={is_coapplicant === "no" ? active : inactive}
            onClick={() => this.setCoApplicant("no")}
          >
            No
          </a>
        </Fragment>
      </div>
    );
  }

  // Preview Content
  renderPreviewContent() {
    const { styles } = this.props;
    const { is_coapplicant } = this.state;
    return (
      <div className={styles.cDataRow}>
        <label>Do you have any co-applicants?</label>
        <span>{is_coapplicant === "yes" ? "Yes" : "No"}</span>
      </div>
    );
  }

  // Edit Content
  renderEditContent() {
    const { styles } = this.props;
    return (
      <div className="row">
        <div className="col-md-4">
          <div className={styles.cFormRow}>
            <label>Do you have any co-applicants?</label>
            {this.renderCoApplicantButtons()}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { preview, index, styles } = this.props;
    if (typeof index !== "undefined" && index > 0) {
      return null;
    }

    return (
      <div className={styles.cRow}>
        <div className={styles.cRowLabel}>
          <label>Application Information</label>
        </div>
        {/* .c-row-label */}
        <div className={styles.cRowContent}>
          {preview ? this.renderPreviewContent() : this.renderEditContent()}
          <div className="spacer"></div>
        </div>
        {/* .c-row-content */}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ApplicationInformation));
