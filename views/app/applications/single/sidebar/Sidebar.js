/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import * as Icon from "react-feather";

import {
  setActiveModal,
  setTXModalApp,
  showAlert,
} from "../../../../../redux/actions";
import { CopyToClipboard } from "react-copy-to-clipboard";

import styles from "./sidebar.module.scss";
import Helper from "../../../../../utils/Helper";
import { Tooltip } from "@material-ui/core";

const moment = require("moment-timezone");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    index: Helper.getIndex(state.global),
  };
};

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timezone: "",
      timezone_abbr: "",
      selected: -1,
      //application: this.props.application,
    };
  }

  componentDidMount() {
    const { authUser } = this.props;
    // Get Timezone
    if (authUser && authUser.id) this.getTimezone();
  }

  componentDidUpdate(prevProps) {
    // Get Timezone
    const { authUser } = this.props;
    if (
      (!prevProps.authUser || !prevProps.authUser.id) &&
      authUser &&
      authUser.id
    )
      this.getTimezone();
  }

  // Get Timezone
  getTimezone() {
    const { authUser } = this.props;
    // Timezone, Timezone Abbr
    let timezone = "US/Eastern";
    let timezone_abbr = "EST";
    if (authUser.profile && authUser.profile.id && authUser.profile.timezone) {
      timezone = authUser.profile.timezone;
      timezone_abbr = moment.tz(timezone).zoneAbbr();
    }

    this.setState({ timezone, timezone_abbr });
  }

  clickTXButton = async (e) => {
    e.preventDefault();
    //if (!this.checkButton()) return;
    const { application, tab } = this.props;
    const data = {
      ...application,
      tab,
    };
    await this.props.dispatch(setTXModalApp(data));
    await this.props.dispatch(setActiveModal("tx-record"));
  };

  selectApplicant = (e) => {
    e.preventDefault();
    const index = e.target.getAttribute("data-index");
    this.props.selectApplicant(index);
  };

  onCopy = () => {
    this.props.dispatch(
      showAlert("Application ID copied to clipboard", "success", "center")
    );
  };

  renderTime() {
    const { application } = this.props;
    const { timezone, timezone_abbr } = this.state;
    if (!timezone || !timezone_abbr) return null;

    return (
      <span className="d-block font-size-14 font-weight-600">
        {moment(application.created_at).tz(timezone).format("M/D/YYYY h:mm A") +
          " " +
          timezone_abbr}
      </span>
    );
  }

  checkButton() {
    const { application, tab } = this.props;
    let flag = false;
    if (tab == "Consumer Insights") {
      const { consumer_insights } = application;
      if (
        consumer_insights &&
        consumer_insights.status != "In Progress" &&
        consumer_insights.result
      )
        flag = true;
    } else if (tab == "Income Insights") {
      const { income_insights } = application;
      if (
        income_insights &&
        income_insights.status != "In Progress" &&
        income_insights.result
      )
        flag = true;
    } else if (tab == "Small Business Insights") {
      const { business_insights } = application;
      if (
        business_insights &&
        business_insights.status != "In Progress" &&
        business_insights.result
      )
        flag = true;
    }
    return flag;
  }

  getApplicants() {
    let applicantsObj = {};
    let {
      application: { purged_at },
      applicantsList,
    } = this.props;
    applicantsList = applicantsList || [];
    //if (purged_at) return {};
    if (applicantsList.length > 0) {
      applicantsObj = applicantsList.reduce(
        (map, element) => ({
          ...map,
          [element.app_index]: {
            ...(!purged_at && {name: element.name}),
            app_submitted: element.app_submitted,
          },
        }),
        {}
      );
    }
    return applicantsObj;
  }

  openPersonalIdentifiableInformationModal() {
    this.props.dispatch(
      setActiveModal("personal-identifiable-information", {
        ...this.props,
        ...this.state,
      })
    );
  }

  renderButtons() {
    //if (!this.checkButton()) return null;
    const items = [];
    const { application, applicantsList } = this.props;

    items.push(
      <a
        key={"trans"}
        onClick={this.clickTXButton}
        className={"btn btn-primary-outline btn-small " + styles.getRecords}
      >
        Get Transaction Record
      </a>
    );

    let count = (applicantsList && applicantsList.length) || 0;

    if (count > 0) {
      //let index = selected === -1 ? application.app_index : selected;
      let index = application.app_index;
      let applicantsObj = this.getApplicants();

      const classNames = [
        "btn btn-primary btn-small",
        "btn btn-primary-outline btn-small",
        "btn btn-disable btn-small"
      ];

      // const appId = application.app_id;
      // let mainId;

      // const dashIndex = appId.indexOf("-");
      // if (dashIndex > -1) {
      //   mainId = appId.substr(0, dashIndex);
      // } else {
      //   mainId = appId;
      // }

      for (let idx = 0; idx < count; idx++) {
        //const newId = idx > 0 ? `${mainId}-${idx}` : mainId;
        // console.log(idx, newId);
        //const url = `/app/application/${newId}`;
        items.push(
          // <Link
          //   to={`/app/application/${newId}`}
          //   data-index={idx}
          //   className={idx === index ? styles[0] : styles[1]}
          // >
          //   {idx > 0 ? `Co-applicant ${idx}` : "Primary applicant"}
          // </Link>
          <div key={`app-${idx}`} className={styles.applicantsTabWrapper}>
            <Tooltip
              title={
                applicantsObj[idx]?.app_submitted === false
                  ? "Application is not submitted"
                  : ""
              }
            >
              <a
                onClick={
                  applicantsObj[idx]?.app_submitted === false
                    ? undefined
                    : this.selectApplicant
                }
                data-index={idx}
                //data-url={url}
                className={
                  (applicantsObj[idx]?.app_submitted === false
                    ? classNames[2]
                    : idx === index
                    ? classNames[0]
                    : classNames[1]) +
                  " " +
                  styles.applicantsTab
                }
              >
                {idx > 0
                  ? applicantsObj[idx]?.name || `Co-applicant ${idx}`
                  : applicantsObj[idx]?.name || "Primary applicant"}
              </a>
            </Tooltip>
            {idx === index && (
              <Icon.Info
                size="18"
                className={styles.infoIcon}
                onClick={() => this.openPersonalIdentifiableInformationModal()}
              />
            )}
          </div>
        );
      }
    }
    return <div className="mt-4">{items}</div>;
  }

  render() {
    const { application } = this.props;
    if (!application || !application.id) return null;

    return (
      <div className={styles.appSingleApplicationPageSidebar}>
        <label className="d-block font-size-14 mb-1">Application ID</label>
        <span className="d-block font-size-15 font-weight-500">
          {Helper.stripOrgId(application.app_id, application.parent) || ""}
        </span>
        <CopyToClipboard text={application.app_id} onCopy={this.onCopy}>
          <a className="btn btn-primary-outline btn-small mt-2">Copy ID</a>
        </CopyToClipboard>
        <label className="d-block font-size-14 mt-4 mb-1">Date Created</label>
        {this.renderTime()}
        {this.renderButtons()}
        {/* {!application.applicant_count && (
          <div className="d-flex mt-2">
            <Icon.Info
              size="23"
              className={styles.infoIcon}
              onClick={() => this.openPersonalIdentifiableInformationModal()}
            />
          </div>
        )} */}
      </div>
    );
  }
}

export default connect(mapStateToProps)(Sidebar);
