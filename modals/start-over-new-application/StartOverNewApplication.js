import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { removeActiveModal } from "../../redux/actions";

import styles from "./start-over-new-application.module.scss";

const mapStateToProps = () => {
  return {};
};

class StartOverNewApplication extends Component {
  startOver = async (e) => {
    e.preventDefault();
    await this.props.dispatch(removeActiveModal());
    window.location.href = "/app/application/new";
  };

  close = (e) => {
    e.preventDefault();
    this.props.dispatch(removeActiveModal());
  };

  render() {
    return (
      <div className={styles.startOverNewApplicationModal}>
        <h3>{`Are you sure you want to start over?`}</h3>
        <p className="mt-4">
          This will clear all answers and start again from the begining
        </p>
        <div className={styles.startOverNewApplicationModal__buttons}>
          <a
            className={[
              "btn btn-primary",
              styles.btnStartOverNewApplicationModal,
            ].join(" ")}
            onClick={this.startOver}
          >
            Start Over
          </a>
          <a
            className={[
              "btn btn-light",
              styles.btnStartOverNewApplicationModal,
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

export default connect(mapStateToProps)(withRouter(StartOverNewApplication));
