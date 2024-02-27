import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, withRouter } from "react-router-dom";
import DataTable from "react-data-table-component";
import * as Icon from "react-feather";
import { AppSettingsMenu } from "../../../layouts";
import { getActivityLog } from "../../../utils/Thunk";

import styles from "./activity-log.module.scss";

// eslint-disable-next-line no-undef
const moment = require("moment-timezone");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class ActivityLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      page_id: 0,
      perPage: 10,
      sort_key: "activity_log.created_at",
      sort_direction: "desc",
      total: 0,
      logs: [],
      timezone: "",
      timezone_abbr: "",
      columns: [],
    };
  }

  componentDidMount() {
    const { authUser } = this.props;
    if (authUser && authUser.id) this.getTimezone();
    this.getActivityLogs();
  }

  componentDidUpdate(prevProps) {
    const { authUser } = this.props;
    if (
      (!prevProps.authUser || !prevProps.authUser.id) &&
      authUser &&
      authUser.id
    )
      this.getTimezone();
  }

  getTimezone() {
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return;

    // Timezone, Timezone Abbr
    let timezone = "US/Eastern";
    let timezone_abbr = "EST";
    if (authUser.profile && authUser.profile.id && authUser.profile.timezone) {
      timezone = authUser.profile.timezone;
      timezone_abbr = moment.tz(timezone).zoneAbbr();
    }

    const columns = [
      {
        name: "Member",
        selector: (row) => row.subject_id,
        cell: (row) => {
          return (
            <div style={{ marginRight: "1rem" }}>
              <label className="d-block font-size-13">
                {row.user_first_name} {row.user_last_name}
              </label>
              <p className="d-block font-size-13">{row.user_email}</p>
            </div>
          );
        },
        sortable: true,
        sortField: "activity_log.subject_id",
        compact: true,
      },
      {
        name: "Event",
        selector: (row) => row.event,
        cell: (row) => {
          return (
            <p className="font-size-13" style={{ marginRight: "1rem" }}>
              {row.event}
            </p>
          );
        },
        sortable: true,
        sortField: "activity_log.event",
        compact: true,
      },
      {
        name: "Object",
        selector: (row) => row.first_name,
        cell: (row) => {
          if (row.first_name && row.last_name && row.email) {
            return (
              <div style={{ marginRight: "1rem" }}>
                <label className="d-block font-size-13">
                  {row.first_name} {row.last_name}
                </label>
                <p className="d-block font-size-13">{row.email}</p>
              </div>
            );
          }
          return null;
        },
        sortable: true,
        sortField: "activity_log.first_name",
        compact: true,
      },
      {
        name: (
          <label className={styles.timezoneTableHeader}>
            Timezone <span>{timezone_abbr}</span>
          </label>
        ),
        selector: (row) => row.created_at,
        cell: (row) => {
          return (
            <p className="font-size-13">
              {moment(row.created_at).tz(timezone).format("M/D/YYYY")}
              <br />
              {moment(row.created_at).tz(timezone).format("h:mm A")}
            </p>
          );
        },
        sortable: true,
        sortField: "activity_log.created_at",
        compact: true,
      },
    ];

    this.setState({ columns, timezone, timezone_abbr });
  }

  getActivityLogs() {
    const { loading, page_id, perPage, sort_key, sort_direction } = this.state;
    if (loading) return;

    const params = {
      page_id,
      page_length: perPage,
      sort_key,
      sort_direction,
      status,
    };

    this.props.dispatch(
      getActivityLog(
        params,
        () => {
          this.setState({ loading: true });
        },
        (res) => {
          const total = res.total || 0;
          const logs = res.logs || [];
          this.setState({
            loading: false,
            total,
            logs,
          });
        }
      )
    );
  }

  clickForceRefresh = (e) => {
    e.preventDefault();
    this.handlePageChange(1);
  };

  handleSort = (column, direction) => {
    this.setState(
      { page_id: 1, sort_key: column.sortField, sort_direction: direction },
      () => {
        this.getActivityLogs();
      }
    );
  };

  handlePerRowsChange = (perPage) => {
    this.setState({ page_id: 1, perPage }, () => {
      this.getActivityLogs();
    });
  };

  handlePageChange = (page_id) => {
    this.setState({ page_id }, () => {
      this.getActivityLogs();
    });
  };

  render() {
    const { logs, loading, total, perPage, columns } = this.state;
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;
    if (authUser.role == "loanofficer") return <Redirect to="/app" />;

    return (
      <div className={styles.appActivityLogPage}>
        <AppSettingsMenu />
        <div className="c-container">
          <div className={styles.appActivityLogPageHeader}>
            <h2>Activity Log</h2>
            <a onClick={this.clickForceRefresh} title="Refresh">
              <Icon.RefreshCw />
            </a>
          </div>
          <div className="table-wrapper">
            <DataTable
              columns={columns}
              data={logs}
              sortServer={true}
              onSort={this.handleSort}
              progressPending={loading}
              responsive
              noHeader
              striped={true}
              persistTableHead
              pagination
              paginationServer
              onChangeRowsPerPage={this.handlePerRowsChange}
              onChangePage={this.handlePageChange}
              paginationTotalRows={total}
              paginationPerPage={perPage}
              paginationRowsPerPageOptions={[10, 20, 30, 40, 50]}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ActivityLog));
