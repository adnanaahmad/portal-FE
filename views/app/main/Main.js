import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import CardView from "./Card";
import GraphView from "./Graph";

import styles from "./main.module.scss";
import { BUILD_TYPE } from "../../../utils/Constant";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    buildType: state.global.buildType
  };
};

class Main extends Component {
  renderHeader() {
    const { authUser, buildType } = this.props;
    return (
      <div className={["mb-4", styles.appDashboardPageHeader].join(" ")}>
        <h2>Hi, {authUser.first_name}</h2>
        {authUser.role == "admin" ? (
          <div>
            <Link
              to="/app/member/new"
              className={[
                "btn btn-icon btn-light",
                styles.btnAppDashboardPageHeader,
              ].join(" ")}
            >
              <Icon.Plus size={18} />
              <label>Add Member</label>
            </Link>
            {buildType !== BUILD_TYPE.FUTURE_FAMILY && (
              <Link
                to="/app/branch/new"
                className={[
                  "btn btn-icon btn-primary",
                  styles.btnAppDashboardPageHeader,
                ].join(" ")}
                custom-type="default"
              >
                <Icon.Plus size={18} />
                <label>New Branch</label>
              </Link>
            )}
          </div>
        ) : authUser.role == "supervisor" ? (
          <div>
            <Link
              to="/app/member/new"
              className={[
                "btn btn-icon btn-light",
                styles.btnAppDashboardPageHeader,
              ].join(" ")}
              custom-type="default"
            >
              <Icon.Plus size={18} />
              <label>Add Member</label>
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  render() {
    const { authUser, buildType } = this.props;
    if (!authUser || !authUser.id) return null;

    return (
      <div className={styles.appDashboardPage}>
        <div className={["c-container", styles.cContainer].join(" ")}>
          {this.renderHeader()}
          {buildType !== BUILD_TYPE.FUTURE_FAMILY && (
            <CardView styles={styles} />
          )}
          <GraphView styles={styles} />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Main));
