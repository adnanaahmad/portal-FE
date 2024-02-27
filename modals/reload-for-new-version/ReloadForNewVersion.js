import React, { Component } from "react";
import Router from "next/router";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  removeActiveModal,
  setActiveModal,
  setReloadForNewVersionData,
} from "../../redux/actions";
import { getConfig } from "../../utils/Thunk";

import styles from "./reload-for-new-version.module.scss";

const mapStateToProps = (state) => {
  return {
    reloadForNewVersion: state.modal.reloadForNewVersion,
  };
};

class ReloadForNewVersion extends Component {
  componentDidMount() {
    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const reloadNowButton = document.getElementById("reloadNowButton");
        if (reloadNowButton) {
          reloadNowButton.click();
        }
      }
    });
  }

  constructor(props) {
    super(props);
  }

  reload = (e) => {
    e.preventDefault();
    this.closeModal();
    Router.reload(window.location.pathname);
  };

  closeModal() {
    this.props.dispatch(removeActiveModal());
  }

  clickCancel = (e) => {
    e.preventDefault();
    this.closeModal();

    // notify user again after an hour
    setTimeout(() => {
      this.props.dispatch(
        getConfig(
          "front",
          () => {},
          (res) => {
            if (res) {
              if (
                res.version &&
                process.env.NEXT_PUBLIC_VERSION !== res.version
              ) {
                this.props.dispatch(
                  setReloadForNewVersionData({
                    buildVersion: res.version,
                  })
                );

                this.props.dispatch(setActiveModal("reload-for-new-version"));
              }
            }
          },
          true
        )
      );
    }, 1000 * 60 * 60);
  };

  render() {
    const buildVersion = this.props.reloadForNewVersion.buildVersion;

    return (
      <div className={styles.reloadForNewVersionModal}>
        <h3>New version is available</h3>
        <p className="mt-4">
          v{buildVersion} is available. Please refresh this page to ensure you
          have all the latest updates.
        </p>
        <div className={styles.reloadForNewVersionModal__button}>
          <a
            id="reloadNowButton"
            className={[
              "btn btn-primary",
              styles.btnReloadForNewVersionModal,
            ].join(" ")}
            onClick={this.reload}
          >
            Refresh Now
          </a>
          <a
            className={[
              "btn btn-light",
              styles.btnReloadForNewVersionModal,
            ].join(" ")}
            onClick={this.clickCancel}
          >
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ReloadForNewVersion));
