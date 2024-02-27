import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { removeActiveModal } from "../../redux/actions";
import Helper from "../../utils/Helper";

import styles from "./solo-applicant.module.scss";

const mapStateToProps = (state) => {
  return {
    index: Helper.getIndex(state.global),
    next: state.global.next,
  };
};

class SoloApplicant extends Component {
  componentDidMount() {
    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const soloApplicantProceedButton = this.getSoloApplicantProceedButton();
        if (soloApplicantProceedButton) {
          soloApplicantProceedButton.click();
        }
      }
    });
  }

  getSoloApplicantProceedButton() {
    return document.getElementById("soloApplicantProceedButton");
  }

  proceed = async (e) => {
    const soloApplicantProceedButton = this.getSoloApplicantProceedButton();
    if (soloApplicantProceedButton) {
      soloApplicantProceedButton.disabled = true;
    }

    e.preventDefault();
    const { next } = this.props;
    await this.props.dispatch(removeActiveModal());
    try {
      if (next) {
        next();
      }
    } catch (error) {
      if (soloApplicantProceedButton) {
        soloApplicantProceedButton.disabled = false;
      }
    }
  };

  close = (e) => {
    e.preventDefault();
    this.props.dispatch(removeActiveModal());
  };

  render() {
    return (
      <div className={styles.cancelNewApplicationModal}>
        <h3>{`Are you sure you want to proceed without adding any co-applicants??`}</h3>
        <p className="mt-4">You will not be able to add co-applicants later.</p>
        <div className={styles.cancelNewApplicationModal__buttons}>
          <button
            id="soloApplicantProceedButton"
            className={[
              "btn btn-danger",
              styles.btnCancelNewApplicationModal,
            ].join(" ")}
            onClick={this.proceed}
          >
            Proceed
          </button>
          <a
            className={[
              "btn btn-light",
              styles.btnCancelNewApplicationModal,
            ].join(" ")}
            onClick={this.close}
          >
            Go Back
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(SoloApplicant));
