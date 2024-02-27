import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import * as Icon from "react-feather";
import * as moment from "moment-timezone";

import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Scatter,
  ResponsiveContainer,
} from "recharts";
import {
  getBranches,
  getGraphInfo,
  getMembersByBranch,
} from "../../../utils/Thunk";
import { hideCanvas, showCanvas } from "../../../redux/actions";
import Helper from "../../../utils/Helper";
import { BUILD_TYPE, LOAN_TYPE } from "../../../utils/Constant";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    buildType: state.global.buildType,
  };
};

class Graph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: Helper.fetchAppType(),
      rangeType: "week",
      graphData: [],
      graphInfo: {},
      role: "",
      loading: false,
      branches: [],
      branch: 0,
      members: [],
      member: 0,
    };
  }

  componentDidMount() {
    this.getBranches();
    this.getGraphInfo();
  }

  // Get Branches
  getBranches() {
    const { authUser } = this.props;
    if (authUser && authUser.role == "admin") {
      this.props.dispatch(
        getBranches({}, null, (res) => {
          const branches = res.branches || [];
          this.setState({ branches });
        })
      );
    } else if (authUser && authUser.role == "supervisor") {
      this.setState({ branch: parseInt(authUser.branch_id) }, () => {
        this.getMembers(false);
      });
    }
  }

  getMembers(loadGraph = true) {
    const { branch } = this.state;
    if (branch) {
      this.props.dispatch(
        getMembersByBranch(
          branch,
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            this.props.dispatch(hideCanvas());
            this.setState({ members: res.members || [], member: 0 }, () => {
              if (loadGraph) this.getGraphInfo();
            });
          }
        )
      );
    } else {
      this.setState({ members: [], member: 0 }, () => {
        if (loadGraph) this.getGraphInfo();
      });
    }
  }

  // Render Branches
  renderBranches() {
    const { branches } = this.state;
    const items = [];
    if (branches && branches.length) {
      branches.forEach((branch, index) => {
        items.push(
          <option value={branch.id} key={`branch_${index}`}>
            {branch.name}
          </option>
        );
      });
    }
    return items;
  }

  // Render Members
  renderMembers() {
    const { members } = this.state;
    const items = [];
    if (members && members.length) {
      members.forEach((member, index) => {
        items.push(
          <option value={member.id} key={`member_${index}`}>
            {member.first_name} {member.last_name}
          </option>
        );
      });
    }
    return items;
  }

  // Set Type
  setType(type) {
    Helper.storeAppType(type);
    this.setState({ type }, () => {
      this.getGraphInfo();
    });
  }

  // Set Range Type
  setRangeType = (e) => {
    this.setState({ rangeType: e.target.value }, () => {
      this.getGraphInfo();
    });
  };

  // Set Role
  setRole = (e) => {
    this.setState({ role: e.target.value }, () => {
      this.getGraphInfo();
    });
  };

  // Change Branch
  changeBranch = (e) => {
    const branch = parseInt(e.target.value);
    this.setState({ branch }, () => {
      this.getMembers();
    });
  };

  // Change Member
  changeMember = (e) => {
    const member = parseInt(e.target.value);
    this.setState({ member }, () => {
      this.getGraphInfo();
    });
  };

  // Click Force Refresh
  clickForceRefresh = (e) => {
    e.preventDefault();
    this.getGraphInfo();
  };

  // Get Graph Info
  getGraphInfo() {
    const { loading, rangeType, branch, role, member } = this.state;
    const { buildType } = this.props;
    let type;
    if (buildType === BUILD_TYPE.FUTURE_FAMILY) {
      type = LOAN_TYPE.PERSONAL_LOAN;
    } else {
      type = Helper.fetchAppType();
    }
    if (loading) return;

    const params = {
      type,
      rangeType,
      branch,
      role,
      member,
    };

    this.props.dispatch(
      getGraphInfo(
        params,
        () => {
          this.setState({ loading: true });
        },
        (res) => {
          let graphData = this.createGraphData(res);
          let graphInfo = {
            not_verified: 0,
            verified: 0,
            needs_review: 0,
            action_required: 0,
            total_applications: 0,
          };

          if (graphData.length > 0) {
            graphData.forEach((data) => {
              graphInfo.not_verified += data["Not Verified"];
              graphInfo.verified += data["Verified"];
              graphInfo.needs_review += data["Needs Review"];
              graphInfo.action_required += data["Action Required"];
              graphInfo.total_applications += data["Total Applications"];
            });
          }

          this.setState({ graphData, graphInfo, loading: false });
        }
      )
    );
  }

  getUserTimezone() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) {
      return;
    }
    return authUser.profile.timezone;
  }

  createGraphData(res) {
    const userTimeZone = this.getUserTimezone();
    const fromFormat = "YYYY-MM-DDTHH:mm:ssZ";
    const toFormat = "MMM DD";
    let graphData = [];

    const admission = moment(res.start, fromFormat);
    const roundUpAdmission = admission.startOf("hour");
    const discharge = moment(res.end, fromFormat);
    const roundUpDischarge =
      discharge.minute() || discharge.second() || discharge.millisecond()
        ? discharge.add(1, "hour").startOf("hour")
        : discharge.startOf("hour");
    const diffDays = roundUpDischarge.diff(roundUpAdmission, "days");

    for (let i = 0; i < diffDays; i++) {
      const createdOn = moment(res.start, "YYYY-MM-DD")
        .add(i, "days")
        .format(toFormat);

      let submittedApps = res.data.filter((obj) => {
        return (
          moment(obj.created_at, fromFormat)
            //.tz(userTimeZone)
            .format(toFormat) == createdOn
        );
      });

      if (submittedApps.length > 0) {
        for (let j = 0; j < submittedApps.length; j++) {
          let existingData = graphData.find((data) => {
            return data.name == createdOn;
          });

          if (existingData) {
            switch (submittedApps[j].status) {
              case "Not Verified": {
                existingData["Not Verified"]++;
                break;
              }
              case "Verified": {
                existingData["Verified"]++;
                break;
              }
              case "Needs Review": {
                existingData["Needs Review"]++;
                break;
              }
              default: {
                existingData["Action Required"]++;
              }
            }

            existingData["Total Applications"]++;
          } else {
            const graphDataObj = {
              name: createdOn,
              "Not Verified": submittedApps[j].status == "Not Verified" ? 1 : 0,
              Verified: submittedApps[j].status == "Verified" ? 1 : 0,
              "Needs Review": submittedApps[j].status == "Needs Review" ? 1 : 0,
              "Action Required":
                submittedApps[j].status == "Action Required" ? 1 : 0,
              "Total Applications": 1,
            };

            graphData.push(graphDataObj);
          }
        }
      } else {
        const graphDataObj = {
          name: createdOn,
          "Not Verified": 0,
          Verified: 0,
          "Needs Review": 0,
          "Action Required": 0,
          "Total Applications": 0,
        };

        graphData.push(graphDataObj);
      }
    }

    return graphData;
  }

  renderLoader() {
    const { styles } = this.props;
    const { loading } = this.state;
    if (loading) {
      return (
        <div className={styles.appDashboardPageGraph__canvas}>
          <ClipLoader color="#0376BC" />
        </div>
      );
    }
    return null;
  }

  renderHeader() {
    const { styles, buildType } = this.props;
    const type = Helper.fetchAppType();
    return (
      <div className={["row", styles.appDashboardPageGraph__header].join(" ")}>
        {buildType !== BUILD_TYPE.FUTURE_FAMILY && (
          <div className="col-md-9">
            <a
              className={[
                type == "Credit Card"
                  ? "btn btn-primary btn-small"
                  : "btn btn-primary-outline btn-small",
                styles.btnAppDashboardPageGraph,
              ].join(" ")}
              onClick={() => this.setType("Credit Card")}
            >
              Credit Card
            </a>
            <a
              className={[
                type == "Personal Loan"
                  ? "btn btn-primary btn-small"
                  : "btn btn-primary-outline btn-small",
                styles.btnAppDashboardPageGraph,
              ].join(" ")}
              onClick={() => this.setType("Personal Loan")}
            >
              Personal Loan
            </a>
            <a
              className={[
                type == "Small Business Loan"
                  ? "btn btn-primary btn-small"
                  : "btn btn-primary-outline btn-small",
                styles.btnAppDashboardPageGraph,
              ].join(" ")}
              onClick={() => this.setType("Small Business Loan")}
            >
              Small Business Loan
            </a>
          </div>
        )}
        <div className="col-md-3" style={{ flex: "auto" }}>
          <a
            className={["force-refresh", styles.forceRefresh].join(" ")}
            onClick={this.clickForceRefresh}
            title="Refresh"
          >
            <Icon.RefreshCw />
          </a>
        </div>
      </div>
    );
  }

  renderGraphHeader() {
    const { rangeType, graphInfo, branch, member } = this.state;
    const { authUser, styles, buildType } = this.props;

    return (
      <div className={styles.appDashboardPageGraph__graphHeader}>
        <div className="row">
          <div
            className={[
              "col-md-3",
              styles.appDashboardPageGraphApplicationsCount,
            ].join(" ")}
          >
            <h3>
              Applications:{" "}
              {graphInfo.verified +
                graphInfo.not_verified +
                graphInfo.needs_review +
                graphInfo.action_required || 0}
            </h3>
          </div>
          {/*authUser && authUser.role == "admin" ? (
            <select className={styles.graphRoleFilter} value={role} onChange={this.setRole}>
              <option value="">Filter by Role</option>
              <option value="supervisor">Supervisor</option>
              <option value="loanofficer">Loan Officer</option>
            </select>
          ) : null*/}
          <div
            className={[
              "col-md-9",
              styles.appDashboardPageGraphApplicationsFilter,
            ].join(" ")}
          >
            {buildType !== BUILD_TYPE.FUTURE_FAMILY &&
            authUser &&
            authUser.role == "admin" ? (
              <select
                className={styles.graphBranchFilter}
                value={branch}
                onChange={this.changeBranch}
              >
                <option value="0">Filter By Branch</option>
                {this.renderBranches()}
              </select>
            ) : null}
            {buildType !== BUILD_TYPE.FUTURE_FAMILY &&
            authUser &&
            authUser.role != "loanofficer" ? (
              <select
                className={styles.graphMemberFilter}
                value={member}
                onChange={this.changeMember}
                disabled={branch ? false : true}
              >
                <option value="0">Filter By Member</option>
                {this.renderMembers()}
              </select>
            ) : null}
            <select
              className={styles.graphRangeFilter}
              value={rangeType}
              onChange={this.setRangeType}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="today">Today</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              {buildType === BUILD_TYPE.FUTURE_FAMILY && (
                <option value="last90days">Last 90 Days</option>
              )}
            </select>
          </div>
        </div>
        {/*
          <div>
          
            <label>
              Consumer Insights Calls ({graphInfo.consumer_insights_calls || 0})
            </label>
            <label>
              Income Insights Calls ({graphInfo.income_insights_calls || 0})
            </label>
            {type == "Small Business Loan" ? (
              <label>
                Small Business Insights Calls (
                {graphInfo.business_insights_calls || 0})
              </label>
            ) : null}
            
          </div>
        */}
      </div>
    );
  }

  renderGraphFooter() {
    const { graphInfo } = this.state;
    const { buildType } = this.props;
    const type =
      buildType === BUILD_TYPE.FUTURE_FAMILY
        ? LOAN_TYPE.PERSONAL_LOAN
        : Helper.fetchAppType();
    return (
      <ul>
        <li
          style={
            buildType === BUILD_TYPE.FUTURE_FAMILY ? { flex: "0 0 33%" } : {}
          }
        >
          <label>Verified</label>
          <span>{graphInfo.verified || 0}</span>
          {buildType === BUILD_TYPE.FUTURE_FAMILY ? (
            <Link to={`/app/applications/?status=Verified&type=${type}`}>
              View all verified
            </Link>
          ) : (
            <p>Results may take upto 78 hours to update</p>
          )}
        </li>
        <li
          style={
            buildType === BUILD_TYPE.FUTURE_FAMILY ? { flex: "0 0 33%" } : {}
          }
        >
          <label>Not Verified</label>
          <span>{graphInfo.not_verified || 0}</span>
          <Link to={`/app/applications/?status=Not Verified&type=${type}`}>
            View all not verified
          </Link>
        </li>
        <li
          style={
            buildType === BUILD_TYPE.FUTURE_FAMILY ? { flex: "0 0 33%" } : {}
          }
        >
          <label>Needs Review</label>
          <span>{graphInfo.needs_review || 0}</span>
          <Link to={`/app/applications?status=Needs Review&type=${type}`}>
            View all needs review
          </Link>
        </li>
        {buildType !== BUILD_TYPE.FUTURE_FAMILY && (
          <li>
            <label>Action Required</label>
            <span>{graphInfo.action_required || 0}</span>
            <Link to={`/app/applications?status=Action Required&type=${type}`}>
              View all action required
            </Link>
          </li>
        )}
      </ul>
    );
  }

  render() {
    const { authUser, styles, buildType } = this.props;
    if (!authUser || !authUser.id) return null;
    const { graphData } = this.state;

    return (
      <div className={styles.appDashboardPageGraph}>
        {this.renderLoader()}
        {this.renderHeader()}
        {this.renderGraphHeader()}
        <ResponsiveContainer width="100%" height={450}>
          <ComposedChart data={graphData}>
            <CartesianGrid stroke="#C2D2D9" />
            <XAxis dataKey="name" scale="band" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Area
              dataKey="Total Applications"
              stroke="#00B0B5"
              fill="rgba(0, 176, 181, 0.2)"
            />
            <Bar dataKey="Verified" barSize={40} fill="#42C27D" />
            <Line type="monotone" dataKey="Not Verified" stroke="#DE4A0B" />
            <Line type="monotone" dataKey="Needs Review" stroke="#FFC400" />
            {buildType !== BUILD_TYPE.FUTURE_FAMILY && (
              <Scatter dataKey="Action Required" fill="#0376BC" />
            )}
          </ComposedChart>
        </ResponsiveContainer>
        {this.renderGraphFooter()}
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Graph));
