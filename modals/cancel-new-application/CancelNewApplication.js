import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { removeActiveModal } from "../../redux/actions";
import Helper from "../../utils/Helper";

import styles from "./cancel-new-application.module.scss";

const mapStateToProps = (state) => {
  return {
    index: Helper.getIndex(state.global),
  };
};

class CancelNewApplication extends Component {
  componentDidMount() {
    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const proceedAppButton = document.getElementById("proceedAppButton");
        if (proceedAppButton) {
          proceedAppButton.click();
        }
      }
    });
  }

  proceed = async (e) => {
    e.preventDefault();
    await this.props.dispatch(removeActiveModal());
    const { history } = this.props;

    if (Helper.fetchApplicants().length === 0) {
      history.push("/app/applications");
    } else {
      //Helper.removeApplicants();
      history.push("/app/applicants");
    }
  };

  close = (e) => {
    e.preventDefault();
    this.props.dispatch(removeActiveModal());
  };

  render() {
    const index = Helper.getIndex(this.props);
    const count = Helper.fetchApplicants().length;
    const co = count > 0 && index > 0;
    return (
      <div className={styles.cancelNewApplicationModal}>
        <h3>
          {co
            ? "Are you sure you want to cancel adding this co-applicant?"
            : "Are you sure you want to cancel?"}
        </h3>
        <p className="mt-4">
          {co
            ? "This co-applicant’s information will be lost"
            : "This will cancel and exit this application"}
        </p>
        <div className={styles.cancelNewApplicationModal__buttons}>
          <a
            id="proceedAppButton"
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

export default connect(mapStateToProps)(withRouter(CancelNewApplication));
