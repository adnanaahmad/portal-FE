import React, { Component } from "react";
import { connect } from "react-redux";
import { Switch } from "react-router-dom";
import { LandingRoutes } from "../../routes";
import FooterLayout from "../footer/Footer";

import styles from "./landing.module.scss";
import { BUILD_TYPE } from "../../utils/Constant";

const mapStateToProps = (state) => {
  return {
    activeModal: state.global.activeModal,
    buildType: state.global.buildType,
  };
};

class Landing extends Component {
  render() {
    const { auth, activeModal, buildType } = this.props;

    let className = activeModal
      ? [styles.outerPageWrap, styles.noOverflow].join(" ")
      : styles.outerPageWrap;

    if (buildType === BUILD_TYPE.FUTURE_FAMILY) {
      const root = document.documentElement;
      root.style.setProperty("--primary-color", "#0376BC");
      root.style.setProperty("--primary-dark-color", "#02568a");
    }

    return (
      <div className={className}>
        <section>
          <Switch>
            <LandingRoutes auth={auth} />
          </Switch>
        </section>

        <FooterLayout />
      </div>
    );
  }
}

export default connect(mapStateToProps)(Landing);
