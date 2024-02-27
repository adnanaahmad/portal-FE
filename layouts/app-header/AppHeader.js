/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import {
  saveUser,
  showMenu,
  hideMenu,
  setActiveModal,
  setReloadForNewVersionData,
} from "../../redux/actions";
import Helper from "../../utils/Helper";
import { getConfig } from "../../utils/Thunk";

import styles from "./app-header.module.scss";
import { BUILD_TYPE } from "../../utils/Constant";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    menuShown: state.global.menuShown,
    buildType: state.global.buildType,
  };
};

class AppHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userClicked: false,
      tabs: [],
    };
  }

  componentDidMount() {
    const { authUser } = this.props;
    if (authUser && authUser.id) this.initValues();

    document.body.addEventListener("click", (e) => {
      const { userClicked } = this.state;
      if (!userClicked) return;

      if (
        e.target &&
        e.target.classList &&
        e.target.classList.contains(styles.clickMe)
      ) {
        // Do Nothing
      } else {
        this.setState({ userClicked: false });
      }
    });
  }

  componentDidUpdate(prevProps) {
    const { authUser } = this.props;
    if (
      (!prevProps.authUser || !prevProps.authUser.id) &&
      authUser &&
      authUser.id
    )
      this.initValues();
  }

  initValues() {
    const { authUser, buildType } = this.props;
    const { role } = authUser;

    let tabs = [];
    if (role == "admin") {
      tabs = [
        {
          link: "/app",
          label:
            buildType === BUILD_TYPE.FUTURE_FAMILY ? "Summary" : "Dashboard",
        },
        {
          link: "/app/applications",
          label: "Applications",
          pattern: "/app/application",
        },
        {
          link: "/app/members",
          label: "Members",
          pattern: "/app/member",
        },
        ...(buildType !== BUILD_TYPE.FUTURE_FAMILY
          ? [
              {
                link: "/app/branches",
                label: "Branches",
                pattern: "/app/branch",
              },
            ]
          : []),
      ];
    } else if (role == "supervisor") {
      tabs = [
        {
          link: "/app",
          label: "Dashboard",
        },
        {
          link: "/app/applications",
          label: "Applications",
          pattern: "/app/application",
        },
        {
          link: "/app/members",
          label: "Members",
          pattern: "/app/member",
        },
      ];
    } else if (role == "loanofficer") {
      tabs = [
        {
          link: "/app",
          label:
            buildType === BUILD_TYPE.FUTURE_FAMILY ? "Summary" : "Dashboard",
        },
        {
          link: "/app/applications",
          label: "Applications",
          pattern: "/app/applications",
        },
      ];
    }

    this.setState({ tabs });
  }

  clickMyProfile = (e) => {
    e.preventDefault();
    const { history } = this.props;
    this.setState({ userClicked: false });
    history.push("/app/profile");
  };

  clickTab = (e, tab) => {
    e.preventDefault();
    this.hideMenu();
    const { history } = this.props;
    history.push(tab.link);
  };

  showMenu = () => {
    this.props.dispatch(showMenu());
  };

  hideMenu = () => {
    this.props.dispatch(hideMenu());
  };

  logout = (e) => {
    e.preventDefault();
    this.setState({ userClicked: false });
    Helper.removeAppType();
    Helper.storeUser({});
    this.props.dispatch(saveUser({}));

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
  };

  checkClass(tab, path) {
    if ((tab.pattern && path.includes(tab.pattern)) || tab.link == path) {
      return styles.active;
    }
    return "";
  }

  checkSettingClass() {
    const { history } = this.props;
    let path = "/app";
    if (history && history.location && history.location.pathname)
      path = history.location.pathname;

    if (path == "/app/settings" || path.includes("/app/setting")) {
      return styles.active;
    }
    return "";
  }

  checkProfileClass() {
    const { userClicked } = this.state;
    const { history } = this.props;
    let path = "/app";
    if (history && history.location && history.location.pathname)
      path = history.location.pathname;

    let className = userClicked
      ? [styles.active, styles.clickMe].join(" ")
      : styles.clickMe;
    if (path == "/app/profile") {
      className = [className, styles.highlighted].join(" ");
    }
    return className;
  }

  toggleUserIcon = (e) => {
    e.preventDefault();
    const { userClicked } = this.state;
    this.setState({ userClicked: !userClicked });
  };

  renderTabs() {
    const items = [];
    const { history } = this.props;
    const { tabs } = this.state;

    let path = "/app";
    if (history && history.location && history.location.pathname)
      path = history.location.pathname;

    tabs.forEach((tab, index) => {
      items.push(
        <li key={`tab_${index}`}>
          <a
            onClick={(e) => this.clickTab(e, tab)}
            className={this.checkClass(tab, path)}
          >
            {tab.label}
          </a>
        </li>
      );
    });
    return items;
  }

  renderProfileInfo() {
    const { authUser, buildType } = this.props;
    if (!authUser || !authUser.id) return null;

    if (authUser.role == "admin") {
      return (
        <div className={styles.appProfileTabItem}>
          <p className="ellipsis">
            <b>
              {authUser.first_name} {authUser.last_name}
            </b>
          </p>
          <label>
            <b>{authUser.parent ? "Admin" : "Owner"}</b>
            <br />
            {authUser.parent_user && authUser.parent_user.profile
              ? authUser.parent_user.profile.company
              : authUser.profile.company}
          </label>
        </div>
      );
    }

    return (
      <div className={styles.appProfileTabItem}>
        <p className="ellipsis">
          <b>
            {authUser.first_name} {authUser.last_name}
          </b>
        </p>
        <label>
          <b>{authUser.role == "supervisor" ? "Supervisor" : "Loan Officer"}</b>
          <br />
          {buildType !== BUILD_TYPE.FUTURE_FAMILY && (
            <React.Fragment>
              {authUser.branch ? authUser.branch.name : ""}
            </React.Fragment>
          )}
        </label>
      </div>
    );
  }

  renderLogo() {
    const { authUser } = this.props;
    if (authUser) {
      if (
        authUser.role == "admin" &&
        authUser.profile &&
        authUser.profile.logo_path
      ) {
        return <img src={authUser.profile.logo_path} alt="" />;
      } else if (
        authUser.parent_user &&
        authUser.parent_user.profile &&
        authUser.parent_user.profile.logo_path
      ) {
        return <img src={authUser.parent_user.profile.logo_path} alt="" />;
      }
    }
    return <img src="/app-logo.png" alt="" />;
  }

  render() {
    const { authUser, menuShown, buildType } = this.props;
    if (!authUser || !authUser.id) return null;

    let color = "#142d53";
    if (authUser.role == "admin" && authUser.profile && authUser.profile.scheme)
      color = authUser.profile.scheme;
    else if (
      authUser.parent_user &&
      authUser.parent_user.profile &&
      authUser.parent_user.profile.scheme
    )
      color = authUser.parent_user.profile.scheme;

    return (
      <div className={styles.appHeader} style={{ backgroundColor: `${color}` }}>
        <div className={styles.appHeaderInner}>
          <Link to="/" className={styles.topLogo}>
            {this.renderLogo()}
          </Link>

          <div
            className={[styles.headerMenu, menuShown ? styles.active : ""].join(
              " "
            )}
          >
            <div className={styles.headerMenuClose} onClick={this.hideMenu}>
              <Icon.X />
            </div>
            <ul>{this.renderTabs()}</ul>
          </div>

          <div className={styles.headerIcons}>
            <ul>
              <li title="Help">
                <a
                  href={
                    buildType === BUILD_TYPE.FUTURE_FAMILY
                      ? "https://fortifid.zendesk.com/hc/en-us/requests/new"
                      : "https://fortifid.zendesk.com/hc/en-us"
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon.HelpCircle color="#ffffff" />
                </a>
              </li>
              <li className={this.checkSettingClass()} title="Settings">
                <Link to="/app/settings">
                  <Icon.Settings color="#ffffff" />
                </Link>
              </li>
              <li className={this.checkProfileClass()} title="Profile">
                <a onClick={this.toggleUserIcon} className={styles.clickMe}>
                  <Icon.User color="#ffffff" className={styles.clickMe} />
                </a>
                <ul className={styles.clickMe}>
                  <li>{this.renderProfileInfo()}</li>
                  <li>
                    <a className={styles.clickMe} onClick={this.clickMyProfile}>
                      My Profile
                    </a>
                  </li>
                  <li>
                    <a className={styles.clickMe} onClick={this.logout}>
                      Log Out
                    </a>
                  </li>
                  <li>
                    <p className={styles.version}>
                      v{process.env.NEXT_PUBLIC_VERSION}{" "}
                      {process.env.NEXT_PUBLIC_MODE} | v{authUser.version}
                    </p>
                  </li>
                </ul>
              </li>
            </ul>
          </div>

          <div className={styles.mobileBurger} onClick={this.showMenu}>
            <Icon.Menu color="#ffffff" />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(AppHeader));
