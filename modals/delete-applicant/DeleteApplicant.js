import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { removeActiveModal } from "../../redux/actions";
import Helper from "../../utils/Helper";

import styles from "./delete-applicant.module.scss";

const mapStateToProps = (state) => {
  return {
    index: Helper.getIndex(state.global),
    next: state.global.next,
  };
};

class DeleteApplicant extends Component {
  // delete = () => {
  //   let primary = Helper.fetchApplicant(0);
  //   const params = {
  //     id: primary.id,
  //   };

  //   this.props.dispatch(
  //     deleteApplication(
  //       params,
  //       () => {
  //         this.props.dispatch(showCanvas());
  //       },
  //       (res) => {
  //         this.props.dispatch(hideCanvas());
  //         if (res && res.success && res.application) {
  //           const { history } = this.props;
  //         }
  //       }
  //     )
  //   );
  // };

  componentDidMount() {
    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const deleteApplicantProceedButton =
          this.getDeleteApplicantProceedButton();
        if (deleteApplicantProceedButton) {
          deleteApplicantProceedButton.click();
        }
      }
    });
  }

  getDeleteApplicantProceedButton() {
    return document.getElementById("deleteApplicantProceedButton");
  }

  proceed = async (e) => {
    const deleteApplicantProceedButton = this.getDeleteApplicantProceedButton();
    if (deleteApplicantProceedButton) {
      deleteApplicantProceedButton.disabled = true;
    }

    e.preventDefault();
    const { index, next } = this.props;
    await this.props.dispatch(removeActiveModal());
    try {
      if (next) {
        next(index);
      }
    } catch (error) {
      if (deleteApplicantProceedButton) {
        deleteApplicantProceedButton.disabled = false;
      }
      //
    }
  };

  close = (e) => {
    e.preventDefault();
    this.props.dispatch(removeActiveModal());
  };

  render() {
    return (
      <div className={styles.cancelNewApplicationModal}>
        <h3>{`Are you sure you want to remove this co-applicant?`}</h3>
        <p className="mt-4">This co-applicant’s information will be lost.</p>
        <div className={styles.cancelNewApplicationModal__buttons}>
          <button
            id="deleteApplicantProceedButton"
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
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(DeleteApplicant));
