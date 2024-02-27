import React, { Component } from "react";
import { connect } from "react-redux";
import { Switch } from "react-router-dom";
import { AppRoutes } from "../../routes";
import AppHeaderLayout from "../app-header/AppHeader";
import AppFooterLayout from "../app-footer/AppFooter";

import styles from "./app.module.scss";
import { BUILD_TYPE } from "../../utils/Constant";

const mapStateToProps = (state) => {
  return {
    activeModal: state.global.activeModal,
    buildType: state.global.buildType,
  };
};

class App extends Component {
  render() {
    const { auth, activeModal, buildType } = this.props;

    const className = activeModal
      ? [styles.appPageWrap, styles.noOverflow].join(" ")
      : styles.appPageWrap;

    if (buildType === BUILD_TYPE.FUTURE_FAMILY) {
      const root = document.documentElement;
      root.style.setProperty("--primary-color", "#00bdbb");
      root.style.setProperty("--primary-dark-color", "#018d8b");
    }

    return (
      <div className={className}>
        <AppHeaderLayout />
        <section>
          <Switch>
            <AppRoutes auth={auth} />
          </Switch>
        </section>
        <AppFooterLayout />
      </div>
    );
  }
}

export default connect(mapStateToProps)(App);
