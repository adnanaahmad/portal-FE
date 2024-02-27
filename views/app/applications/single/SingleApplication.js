/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter, Link } from "react-router-dom";
import * as Icon from "react-feather";
import { showCanvas, hideCanvas, hideAlert } from "../../../../redux/actions";
import { getApplicationByAppId } from "../../../../utils/Thunk";
import SidebarView from "./sidebar/Sidebar";
import ContentView from "./content/Content";

import styles from "./single-application.module.scss";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class SingleApplication extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appId: "",
      application: {},
      tab: "Consumer Insights",
      applicantsList: []
    };
  }

  onBackButtonEvent = async (e) => {
    e.preventDefault();
    this.props.history.replace("/app/applications");
  };

  componentWillUnmount() {
    this.props.dispatch(hideAlert());
    window.removeEventListener("popstate", this.onBackButtonEvent);
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;
    // Get App Data
    this.setState({ appId: params.appId }, () => {
      this.getApp();
    });
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", this.onBackButtonEvent);
  }

  // Get App
  getApp() {
    const { appId } = this.state;
    const { history } = this.props;
    this.props.dispatch(
      getApplicationByAppId(
        appId,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.application) {
            const { application } = res;
            application.isNew = true;
            this.setState({
              application,
              applicantsList: application.applicants_information,
            });
          } else {
            history.push("/app/applications");
          }
        }
      )
    );
  }

  selectApplicant = (index) => {
    const { appId } = this.state;
    let mainId;

    const dashIndex = appId.indexOf("-");
    if (dashIndex > -1) {
      mainId = appId.substr(0, dashIndex);
    } else {
      mainId = appId;
    }
    const newId = index > 0 ? `${mainId}-${index}` : mainId;

    if (newId === appId) {
      return;
    }

    this.props.dispatch(hideAlert());

    const url = `/app/application/${newId}`;
    this.setState({ appId: newId }, () => {
      const { history } = this.props;
      //history.push(url);
      history.replace(url);
      this.getApp();
    });
  };

  // Refresh App
  refreshApp = (application) => {
    this.setState({ application });
  };

  // Click Content Tab
  clickTab = (key) => {
    const { tab } = this.state;
    if (tab == key) return;
    this.setState({ tab: key });
  };

  render() {
    const { authUser } = this.props;
    const { appId, application, tab, applicantsList } = this.state;

    // User Check
    if (!authUser || !authUser.id) return null;

    // Data Check
    if (!appId || !application || !application.id) return null;

    return (
      <div className={styles.appSingleApplicationPage}>
        <div className={styles.appSingleApplicationPageHeader}>
          <Link to="/app/applications">
            <Icon.ChevronLeft color="#4F717F" size={16} />
            <label className="font-size-14 font-weight-600">
              Back to Applications
            </label>
          </Link>
        </div>
        <div className={styles.appSingleApplicationPageBody}>
          <SidebarView
            application={application}
            applicantsList={applicantsList}
            tab={tab}
            history={this.props.history}
            selectApplicant={this.selectApplicant}
          />
          <ContentView
            application={application}
            onRefresh={this.refreshApp}
            tab={tab}
            onClickTab={this.clickTab}
          />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(SingleApplication));
