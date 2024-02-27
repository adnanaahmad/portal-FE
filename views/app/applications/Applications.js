import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import { BlockAlertComponent } from "../../../components";
import DataTable from "react-data-table-component";
import { ApplicationsMenu } from "../../../layouts";
import {
  hideAlert,
  removeActiveModal,
  setTXModalApp,
} from "../../../redux/actions";
import Helper from "../../../utils/Helper";
import {
  getApplications,
  getBranches,
  getMembersByBranch,
} from "../../../utils/Thunk";
import {
  hideCanvas,
  setActiveModal,
  setCustomConfirmModalData,
  showCanvas,
  setIndex,
} from "../../../redux/actions";

import styles from "./applications.module.scss";
import { BUILD_TYPE, LOAN_TYPE } from "../../../utils/Constant";
import { ROLES } from "../../../utils/Constant";

// eslint-disable-next-line no-undef
const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    blockAlertData: state.global.blockAlertData,
    authUser: state.global.authUser,
    buildType: state.global.buildType,
  };
};

// const conditionalRowStyles = [
//   {
//     when: (row) => !row.app_index,
//     style: {
//       backgroundColor: "gray",
//       color: "white",
//       "&:hover": {
//         cursor: "pointer",
//       },
//     },
//   },
//   // {
//   //   when: (row) => row.app_index,
//   //   style: (row) => ({
//   //     backgroundColor: row.isSpecia ? "pink" : "inerit",
//   //   }),
//   // },
// ];

class Applications extends Component {
  constructor(props) {
    super(props);
    this.checkLoanTypeAndStore();
    this.state = {
      loading: false,
      page_id: 0,
      perPage: this.props.buildType === BUILD_TYPE.FUTURE_FAMILY ? 100 : 10,
      sort_key: "application.id",
      sort_direction: "desc",
      search: "",
      total: 0,
      applications: [],
      type:
        this.props.buildType === BUILD_TYPE.FUTURE_FAMILY
          ? LOAN_TYPE.PERSONAL_LOAN
          : Helper.fetchAppType(),
      role: "",
      branch: 0,
      branches: [],
      member: 0,
      members: [],
      columns: [],
      status: "",
      rangeType: "week",
    };

    this.timer = null;
    if (this.props.buildType === BUILD_TYPE.FUTURE_FAMILY) {
      this.updateApplication = this.updateApplication.bind(this);
    }
  }

  componentDidMount() {
    const { authUser, buildType } = this.props;
    if (authUser && authUser.id) {
      this.loadData();
    }
    Helper.removeApplicants();
    let type =
      buildType === BUILD_TYPE.FUTURE_FAMILY
        ? LOAN_TYPE.PERSONAL_LOAN
        : Helper.fetchAppType();
    if (!type | (type.length === 0)) {
      Helper.storeAppType("Credit Card");
    }
    this.getBranches();
    this.props.dispatch(setIndex(-1));
    window.addEventListener("beforeunload", this.closeModal());
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = this._backConfirm;
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.closeModal());
    window.onpopstate = () => {};
  }

  componentDidUpdate(prevProps) {
    const { authUser } = this.props;

    if (
      (!prevProps.authUser || !prevProps.authUser.id) &&
      authUser &&
      authUser.id
    ) {
      this.loadData();
    }
  }

  initValues() {
    const { authUser, buildType } = this.props;
    if (authUser && authUser.id) {
      const { status: xstatus } = this.state;
      const urlParams = new URLSearchParams(window.location.search);
      const status = xstatus || urlParams.get("status") || "";
      const type =
        buildType === BUILD_TYPE.FUTURE_FAMILY
          ? LOAN_TYPE.PERSONAL_LOAN
          : Helper.fetchAppType();
      const columns = [
        ...(buildType !== BUILD_TYPE.FUTURE_FAMILY
          ? [
              {
                name: "Application ID",
                selector: (row) => row.app_id,
                cell: (row) => {
                  return authUser && authUser.role !== "admin" ? (
                    <label
                      className={
                        row.app_index ? "font-size-12" : "font-size-13"
                      }
                    >
                      <Link to={`/app/application/${row.app_id}`}>
                        {Helper.stripOrgId(row.app_id, row.parent)}
                      </Link>
                    </label>
                  ) : (
                    <label
                      className={
                        row.app_index ? "font-size-12" : "font-size-13"
                      }
                    >
                      {Helper.stripOrgId(row.app_id, row.parent)}
                    </label>
                  );
                },
                sortable: true,
                sortField: "application.app_id",
                compact: false,
              },
            ]
          : []),
        ...(buildType === BUILD_TYPE.FUTURE_FAMILY
          ? [
              {
                name: "Transaction ID",
                selector: (row) => row.consumer_insights,
                cell: (row) => {
                  return (
                    <label
                      onClick={() => this.clickTXButton(row)}
                      className="font-size-12"
                    >
                      <a style={{ color: "#00bdbb", cursor: "pointer" }}>
                        {row.consumer_insights
                          ? row.consumer_insights.m_request_id
                          : "Not Available"}
                      </a>
                    </label>
                  );
                },
                sortable: false,
                compact: true,
              },
            ]
          : []),
        ...(buildType === BUILD_TYPE.FUTURE_FAMILY
          ? [
              {
                name: "Request Reference",
                selector: (row) => row.consumer_insights,
                cell: (row) => {
                  return (
                    <label
                      className="font-size-12"
                      style={{ marginRight: "1rem" }}
                    >
                      {row.consumer_insights?.m_requester_reference}
                    </label>
                  );
                },
                sortable: false,
                compact: true,
              },
            ]
          : []),
        {
          name: "Date Created",
          selector: (row) => row.created_at,
          cell: (row) => {
            return (
              <label className="font-size-12">
                {moment(row.created_at).format("M/D/YYYY h:mm A")}
              </label>
            );
          },
          sortable: true,
          sortField: "application.created_at",
          compact: true,
        },
        ...(buildType === BUILD_TYPE.FUTURE_FAMILY
          ? [
              {
                name: "Algorithm Name",
                selector: (row) => row.consumer_insights,
                cell: (row) => {
                  return (
                    <label
                      className="font-size-12"
                      style={{ marginRight: "1rem" }}
                    >
                      {row.consumer_insights?.algorithm}
                    </label>
                  );
                },
                sortable: true,
                sortField: "application.algorithm",
                compact: true,
              },
            ]
          : []),
        ...(buildType === BUILD_TYPE.FUTURE_FAMILY
          ? [
              {
                name: "Verification Status",
                selector: (row) => row.status,
                cell: (row) => {
                  return <label className="font-size-12">{row.status}</label>;
                },
                sortable: true,
                sortField: "application.status",
                compact: true,
              },
            ]
          : []),
        ...(buildType !== BUILD_TYPE.FUTURE_FAMILY
          ? [
              {
                name: "Member",
                selector: (row) => row.user_id,
                cell: (row) => {
                  if (row.user && row.user.id) {
                    const user = row.user;
                    return (
                      <label className="font-size-12">
                        {user.first_name + " " + user.last_name}
                      </label>
                    );
                  }
                  return null;
                },
                sortable: false,
                compact: true,
              },
            ]
          : []),
        ...(buildType !== BUILD_TYPE.FUTURE_FAMILY
          ? [
              {
                name: "Consumer Insights",
                selector: (row) => row.consumer_status,
                cell: (row) => {
                  return this.renderConsumerInsightsStatus(row);
                },
                sortable: false,
                compact: true,
              },
            ]
          : []),
        ...(buildType !== BUILD_TYPE.FUTURE_FAMILY
          ? [
              {
                name: "Income Insights",
                selector: (row) => row.income_status,
                cell: (row) => {
                  return this.renderIncomeInsightsStatus(row);
                },
                sortable: false,
                compact: true,
              },
            ]
          : []),
      ];

      if (type === "Small Business Loan") {
        columns.push({
          name: "Small Business Insights",
          selector: (row) => row.small_business_status,
          cell: (row) => {
            return this.renderBusinessInsightsStatus(row);
          },
          sortable: false,
          compact: true,
        });
      }

      if (authUser && authUser.role != "admin") {
        // columns.push({
        //   name: "Action",
        //   selector: "application.action",
        //   cell: (row) => {
        //     return <Link to={`/app/application/${row.app_id}`}>View</Link>;
        //   },
        //   sortable: false,
        //   compact: true,
        // });
        if (buildType === BUILD_TYPE.FUTURE_FAMILY) {
          if (window.location.href.includes("-demo")) {
            columns.push({
              name: "Suggested Validation",
              selector: (row) => row.suggested,
              cell: (row) => {
                return (
                  <label
                    className="font-size-12"
                    onClick={(e) =>
                      row.suggested === "No Validation Needed"
                        ? e.preventDefault()
                        : this.clickSuggestedValidation(row)
                    }
                  >
                    <a
                      style={
                        row.suggested === "No Validation Needed"
                          ? { color: "#00bdbb" }
                          : { color: "#00bdbb", cursor: "pointer" }
                      }
                    >
                      {row.suggested}
                    </a>
                  </label>
                );
              },
              sortable: true,
              sortField: "application.suggested",
              compact: true,
            });
          } else {
            columns.push({
              name: "Suggested Validation",
              selector: (row) => row.suggested,
              cell: (row) => {
                return (
                  <label className="font-size-12">
                    <a style={{ color: "#333333" }}>{row.suggested}</a>
                  </label>
                );
              },
              sortable: true,
              sortField: "application.suggested",
              compact: true,
            });
          }
        }
        columns.push({
          name: "Decision",
          selector: (row) => row.decision,
          cell: (row) =>
            row.app_index ? null : !row.decision ||
              row.decision.length < 1 ||
              row.decision == "No Action" ? (
              row.purged_at === null ? (
                <select
                  value={row.decision}
                  onChange={(e) => this.changeDecision(row, e.target.value)}
                >
                  <option value="No Action">No Action</option>
                  <option value="Approve">Approve</option>
                  <option value="Decline">Decline</option>
                </select>
              ) : (
                <div className="app-table-status">
                  <span className="font-size-13">Expired</span>
                </div>
              )
            ) : row.decision == "Approve" ? (
              <span className="app-status-outline success">Approved</span>
            ) : (
              <span className="app-status-outline error">Declined</span>
            ),
          sortable: false,
          compact: true,
        });
      }

      this.setState({ columns, status, type });
    }
  }
  // By using async/await, we can guarantee that initValues will finish executing before getApplications is called,
  // allowing us to correctly set the initial state of the component before fetching any data through the API.
  async loadData() {
    await this.initValues();
    await this.getApplications();
  }

  checkLoanTypeAndStore() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get("type");
    if (
      type === LOAN_TYPE.CREDIT_CARD ||
      type === LOAN_TYPE.PERSONAL_LOAN ||
      type === LOAN_TYPE.SMALL_BUSINESS_LOAN
    ) {
      Helper.storeAppType(type);
    }
  }

  // Render Consumer Insights Column
  renderConsumerInsightsStatus(row) {
    const action = Helper.getConsumerInsightsStatus(row);
    return this.renderActionTag(action);
  }

  // Render Income Insights Column
  renderIncomeInsightsStatus(row) {
    const action = Helper.getIncomeInsightsStatus(row);
    return this.renderActionTag(action);
  }

  // Render Business Insights Column
  renderBusinessInsightsStatus(row) {
    const action = Helper.getBusinessInsightsStatus(row);
    return this.renderActionTag(action);
  }

  renderActionTag(action) {
    if (action == "verified") {
      return (
        <div className="app-table-status">
          <img src="/completed.png" alt="" />
          <span className="font-size-13">Verified</span>
        </div>
      );
    }

    if (action == "not verified") {
      return (
        <div className="app-table-status">
          <img src="/incomplete.png" alt="" />
          <span className="font-size-13">Not Verified</span>
        </div>
      );
    }

    if (action == "required") {
      return (
        <div className="app-table-status">
          <img src="/warning.png" alt="" />
          <span className="font-size-13">Action Required</span>
        </div>
      );
    }

    if (action == "needs review") {
      return (
        <div className="app-table-status">
          <img src="/warning.png" alt="" />
          <span className="font-size-13">Needs Review</span>
        </div>
      );
    }

    if (action == "expired") {
      return (
        <div className="app-table-status">
          <span className="font-size-13">Expired</span>
        </div>
      );
    }

    return (
      <div className="app-table-status">
        <span className="font-size-13">-</span>
      </div>
    );
  }

  getBranches() {
    const { authUser } = this.props;
    if (authUser) {
      if (authUser.role == "admin") {
        this.props.dispatch(
          getBranches({}, null, (res) => {
            const branches = res.branches || [];
            this.setState({ branches });
          })
        );
      } else if (authUser.role == "supervisor") {
        this.setState({ branch: parseInt(authUser.branch_id) }, () => {
          this.getMembers(false);
        });
      }
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
              if (loadGraph) this.handlePageChange(1);
            });
          }
        )
      );
    } else {
      this.setState({ members: [], member: 0 }, () => {
        if (loadGraph) this.handlePageChange(1);
      });
    }
  }

  getApplications() {
    const {
      loading,
      page_id,
      perPage,
      sort_key,
      sort_direction,
      search,
      type,
      role,
      branch,
      member,
      status,
      rangeType,
    } = this.state;

    const { buildType } = this.props;

    if (loading) return;

    const statusValue = status === "All" ? "" : status;

    const params = {
      page_id,
      page_length: perPage,
      sort_key,
      sort_direction,
      search,
      type,
      role,
      branch,
      member,
      status: statusValue,
      ...(buildType === BUILD_TYPE.FUTURE_FAMILY && { rangeType: rangeType }),
    };

    this.props.dispatch(
      getApplications(
        params,
        () => {
          this.setState({ loading: true });
        },
        (res) => {
          const total = res.total || 0;
          const applications = res.applications || [];
          // const temp = res.applications || [];
          // const count = temp.length;

          // const applications = [];
          // const group = [];
          // for (let index = 0; index < count; index++) {
          //   const app = temp[index];
          //   if (!app.app_index) {
          //     applications.push(app);
          //     for (let j = 0; j < group.length; j++) {
          //       applications.push(group[j]);
          //     }
          //     group.length = 0;
          //   } else {
          //     group.unshift(app);
          //   }
          // }
          this.initValues();
          this.setState({
            loading: false,
            total,
            applications,
          });
        }
      )
    );
  }

  // Close Modal
  closeModal() {
    this.props.dispatch(setTXModalApp({}));
    this.props.dispatch(removeActiveModal());
    this.props.dispatch(hideAlert());
  }

  clickExport = (e) => {
    e.preventDefault();
    const { status, branch, member, type } = this.state;
    const { authUser } = this.props;

    const form = document.getElementById("csv-form");
    // eslint-disable-next-line no-undef
    form.action = process.env.NEXT_PUBLIC_BACKEND_URL + "api/csv";
    form.action.value = "applications";
    form.status.value = status;
    form.branch.value = branch;
    form.member.value = member;
    form.user.value = authUser.id;
    form.type.value = type;
    form.submit();
  };

  clickTab = (type) => {
    Helper.storeAppType(type);
    this.setState({ type }, () => {
      this.handlePageChange(1);
    });
  };

  clickForceRefresh = (e) => {
    e.preventDefault();
    this.handlePageChange(1);
  };

  changeStatus = (e) => {
    this.setState({ status: e.target.value }, () => {
      this.handlePageChange(1);
    });
  };

  changeStatusButton = (value) => {
    this.setState({ status: value }, () => {
      this.handlePageChange(1);
    });
  };

  changeRole = (e) => {
    this.setState({ role: e.target.value }, () => {
      this.handlePageChange(1);
    });
  };

  // Set Range Type
  setRangeType = (e) => {
    this.setState({ rangeType: e.target.value }, () => {
      this.handlePageChange(1);
    });
  };

  changeBranch = (e) => {
    const branch = parseInt(e.target.value);
    this.setState({ branch }, () => {
      this.getMembers();
    });
  };

  changeMember = (e) => {
    const member = parseInt(e.target.value);
    this.setState({ member }, () => {
      this.handlePageChange(1);
    });
  };

  handleSort = (column, direction) => {
    this.setState(
      { page_id: 1, sort_key: column.sortField, sort_direction: direction },
      () => {
        this.getApplications();
      }
    );
  };

  handlePerRowsChange = (perPage) => {
    this.setState({ page_id: 1, perPage }, () => {
      this.getApplications();
    });
  };

  handlePageChange = (page_id) => {
    this.setState({ page_id }, () => {
      this.getApplications();
    });
  };

  handleInput = (e) => {
    e.preventDefault();
    this.setState({ search: e.target.value, page_id: 1 }, () => {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      this.timer = setTimeout(() => {
        this.getApplications();
      }, 500);
    });
  };

  renderAlert() {
    const { blockAlertData } = this.props;
    if (blockAlertData && blockAlertData.type == "application")
      return <BlockAlertComponent data={blockAlertData} />;

    return null;
  }

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

  clickTXButton = async (row) => {
    const data = {
      ...row,
      tab: "Consumer Insights",
    };
    await this.props.dispatch(setTXModalApp(data));
    await this.props.dispatch(setActiveModal("tx-record"));
  };

  clickSuggestedValidation = async (row) => {
    this.props.dispatch(
      setActiveModal("suggested-validation", {
        application: { ...row },
        updateApplication: this.updateApplication,
      })
    );
  };

  updateApplication(application) {
    this.setState((prevState) => {
      // Create a copy of the original application array
      const updatedApplications = [...prevState.applications];

      // Find the index of the element to update
      const index = updatedApplications.findIndex(
        (item) => item.id === application.id
      );

      if (index !== -1) {
        // Make the necessary changes to the element
        updatedApplications[index] = application;
      }

      // Set the modified array back to the state
      return {
        ...prevState,
        applications: updatedApplications,
      };
    });
  }

  newApp = () => {
    //e.preventDefault();
    Helper.removeApplicants();
  };

  changeDecision(app, value) {
    const { buildType } = this.props;
    this.props.dispatch(
      setCustomConfirmModalData({
        title: `Update Decision`,
        body: `Update application ${
          buildType === BUILD_TYPE.FUTURE_FAMILY
            ? app.consumer_insights?.m_request_id
            : app.app_id
        } to ${value}?`,
        action: "update-decision",
        data: {
          app,
          decision: value,
        },
        updateApplication: this.updateApplication,
      })
    );
    this.props.dispatch(setActiveModal("custom-confirm"));
  }

  render() {
    const {
      applications,
      loading,
      total,
      perPage,
      search,
      type,
      // role,
      branch,
      member,
      status,
      page_id,
      rangeType,
    } = this.state;
    const { authUser, buildType } = this.props;
    if (!authUser || !authUser.id) return null;

    return (
      <div className={styles.appApplicationsPage}>
        <form id="csv-form" method="POST" action="">
          <input type="hidden" name="action" value="" />
          <input type="hidden" name="status" value="" />
          <input type="hidden" name="branch" value="" />
          <input type="hidden" name="member" value="" />
          <input type="hidden" name="type" value="" />
          <input type="hidden" name="user" value="" />
        </form>
        {buildType !== BUILD_TYPE.FUTURE_FAMILY && (
          <ApplicationsMenu
            activeTab={type}
            onClick={this.clickTab}
            isLoading={this.state.loading}
          />
        )}
        <div className={["c-container", styles.cContainer].join(" ")}>
          {this.renderAlert()}

          <div className={["row", styles.appApplicationsPageHeader].join(" ")}>
            <div className="col-md-7">
              {buildType !== BUILD_TYPE.FUTURE_FAMILY &&
              authUser.role != "admin" ? (
                <Link
                  to={`/app/application/new`}
                  className={[
                    "btn btn-primary btn-icon",
                    styles.btnAppApplicationsPageHeader,
                  ].join(" ")}
                  custom-type="default"
                >
                  <Icon.Plus size={18} />
                  <label className="font-size-14">New Application</label>
                </Link>
              ) : null}
              {buildType !== BUILD_TYPE.FUTURE_FAMILY && (
                <select value={status} onChange={this.changeStatus}>
                  <option value="All">
                    {status ? "All Results" : "Filter By Result"}
                  </option>
                  <option value="Verified">Verified</option>
                  <option value="Needs Review">Needs Review</option>
                  <option value="Not Verified">Not Verified</option>
                  <option value="Action Required">Action Required</option>
                </select>
              )}

              {buildType === BUILD_TYPE.FUTURE_FAMILY && (
                <React.Fragment>
                  <a
                    className={[
                      status == "All" || status == ""
                        ? "btn btn-primary btn-small"
                        : "btn btn-primary-outline btn-small",
                      styles.btnAppPageStatus,
                    ].join(" ")}
                    onClick={() => this.changeStatusButton("All")}
                  >
                    All Applications
                  </a>
                  <a
                    className={[
                      status == "Verified"
                        ? "btn btn-primary btn-small"
                        : "btn btn-primary-outline btn-small",
                      styles.btnAppPageStatus,
                    ].join(" ")}
                    onClick={() => this.changeStatusButton("Verified")}
                  >
                    Verified
                  </a>
                  <a
                    className={[
                      status == "Not Verified"
                        ? "btn btn-primary btn-small"
                        : "btn btn-primary-outline btn-small",
                      styles.btnAppPageStatus,
                    ].join(" ")}
                    onClick={() => this.changeStatusButton("Not Verified")}
                  >
                    Not Verified
                  </a>
                  <a
                    className={[
                      status == "Needs Review"
                        ? "btn btn-primary btn-small"
                        : "btn btn-primary-outline btn-small",
                      styles.btnAppPageStatus,
                    ].join(" ")}
                    onClick={() => this.changeStatusButton("Needs Review")}
                  >
                    Needs Review
                  </a>
                </React.Fragment>
              )}

              {/*authUser.role == "admin" ? (
                <select value={role} onChange={this.changeRole}>
                  <option value="">Filter By Role</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="loanofficer">Loan Officer</option>
                </select>
              ) : null*/}

              {buildType !== BUILD_TYPE.FUTURE_FAMILY &&
              authUser &&
              authUser.role == "admin" ? (
                <select value={branch} onChange={this.changeBranch}>
                  <option value="0">Filter By Branch</option>
                  {this.renderBranches()}
                </select>
              ) : null}

              {buildType !== BUILD_TYPE.FUTURE_FAMILY &&
              authUser &&
              authUser.role != "loanofficer" ? (
                <select
                  value={member}
                  onChange={this.changeMember}
                  disabled={branch ? false : true}
                >
                  <option value="0">Filter By Member</option>
                  {this.renderMembers()}
                </select>
              ) : null}
            </div>
            <div className="col-md-5">
              {buildType === BUILD_TYPE.FUTURE_FAMILY && (
                <select
                  className={styles.rangeFilter}
                  value={rangeType}
                  onChange={this.setRangeType}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="today">Today</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="last90days">Last 90 Days</option>
                </select>
              )}
              <div>
                <input
                  type="text"
                  value={search}
                  placeholder="Search"
                  onChange={this.handleInput}
                />
                <Icon.Search color="#B2C6CF" size={18} />
              </div>

              <a
                className={["force-refresh", styles.forceRefresh].join(" ")}
                onClick={this.clickForceRefresh}
                title="Refresh"
              >
                <Icon.RefreshCw />
              </a>
            </div>
          </div>

          {/* {authUser && authUser.role == "admin" ? (
            <div className="mt-4">
              <a className="btn btn-primary" onClick={this.clickExport}>
                Export as CSV
              </a>
            </div>
          ) : null} */}

          <div className="table-wrapper">
            <DataTable
              columns={this.state.columns}
              data={applications}
              sortServer={true}
              onSort={this.handleSort}
              progressPending={loading}
              responsive
              noHeader
              //conditionalRowStyles={conditionalRowStyles}
              striped={true}
              persistTableHead
              pagination
              paginationServer
              onChangeRowsPerPage={this.handlePerRowsChange}
              onChangePage={this.handlePageChange}
              paginationDefaultPage={page_id || 1}
              paginationTotalRows={total}
              paginationPerPage={perPage}
              paginationRowsPerPageOptions={[
                10,
                20,
                30,
                40,
                50,
                ...(buildType === BUILD_TYPE.FUTURE_FAMILY ? [100] : []),
              ]}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Applications));
