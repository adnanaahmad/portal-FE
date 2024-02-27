import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { removeActiveModal } from "../../redux/actions";
import Helper from "../../utils/Helper";

import styles from "./cancel-applicants.module.scss";

const mapStateToProps = () => {
  return {};
};

class CancelApplicants extends Component {
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
        const cancelApplicantsProceedButton = document.getElementById(
          "cancelApplicantsProceedButton"
        );
        if (cancelApplicantsProceedButton) {
          cancelApplicantsProceedButton.click();
        }
      }
    });
  }

  proceed = async (e) => {
    e.preventDefault();
    Helper.removeApplicants();
    await this.props.dispatch(removeActiveModal());
    const { history } = this.props;
    history.push("/app/applications");
  };

  close = (e) => {
    e.preventDefault();
    this.props.dispatch(removeActiveModal());
  };

  render() {
    return (
      <div className={styles.cancelNewApplicationModal}>
        <h3>{`Are you sure you want to cancel?`}</h3>
        <p className="mt-4">This will cancel and exit this application</p>
        <div className={styles.cancelNewApplicationModal__buttons}>
          <a
            id="cancelApplicantsProceedButton"
            className={[
              "btn btn-danger",
              styles.btnCancelNewApplicationModal,
            ].join(" ")}
            onClick={this.proceed}
          >
            Proceed
          </a>
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

export default connect(mapStateToProps)(withRouter(CancelApplicants));
