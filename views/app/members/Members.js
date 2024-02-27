import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import { BlockAlertComponent } from "../../../components";
import DataTable from "react-data-table-component";
import { getMembers } from "../../../utils/Thunk";
import {
  setActiveModal,
  setBulkApplyAccessGroupMembersData,
  setBulkRemoveAccessGroupMembersData,
  setCancelInviteMemberData,
  setDeleteMemberData,
  setMembersTableStatus,
  setRevokeMemberData,
  showAlert,
} from "../../../redux/actions";

import styles from "./members.module.scss";
import { BUILD_TYPE } from "../../../utils/Constant";

const mapStateToProps = (state) => {
  return {
    blockAlertData: state.global.blockAlertData,
    bulkApplyAccessGroupMembersData:
      state.modal.bulkApplyAccessGroupMembersData,
    bulkRemoveAccessGroupMembersData:
      state.modal.bulkRemoveAccessGroupMembersData,
    membersTableStatus: state.table.membersTableStatus,
    authUser: state.global.authUser,
    buildType: state.global.buildType,
  };
};

class Members extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      page_id: 0,
      perPage: 10,
      sort_key: "users.first_name",
      sort_direction: "asc",
      search: "",
      members: [],
      total: 0,
      totalAll: 0,
      totalActive: 0,
      totalPending: 0,
      totalRevoked: 0,
      status: "",
      selected: [],
      role: "",
      toggledClearRows: false,
    };

    this.columns = [];
    this.timer = null;
  }

  componentDidMount() {
    const { authUser, buildType } = this.props;
    this.columns = [
      {
        name: "Name",
        selector: (row) => row.first_name,
        cell: (row) => {
          return (
            <div className="member-name-box">
              <label>
                {row.first_name} {row.last_name}
              </label>
              <div>{row.id !== authUser.id && this.renderActions(row)}</div>
            </div>
          );
        },
        sortable: true,
        sortField: "users.first_name",
        compact: true,
      },
      {
        name: "Email Address",
        selector: (row) => row.email,
        cell: (row) => {
          return <div className="overflow-text">{row.email}</div>;
        },
        sortable: true,
        sortField: "users.email",
        compact: true,
        minWidth: "250px",
      },
      {
        name: "Status",
        selector: (row) => row.status,
        cell: (row) => {
          if (row.status == "active") {
            return (
              <div className={`member-status-box ${row.status}`}>Active</div>
            );
          } else if (row.status == "pending") {
            return (
              <div className={`member-status-box ${row.status}`}>Pending</div>
            );
          }

          return (
            <div className={`member-status-box ${row.status}`}>Revoked</div>
          );
        },
        sortable: true,
        sortField: "users.status",
        compact: true,
      },
      {
        name: "Role",
        selector: (row) => row.role,
        cell: (row) => {
          if (row.role == "supervisor") return "Supervisor";
          else if (row.role == "loanofficer") return "Loan Officer";
          else if (row.role == "admin") return "Administrator";
          return "";
        },
        sortable: true,
        sortField: "users.role",
        compact: true,
      },
      ...(buildType !== BUILD_TYPE.FUTURE_FAMILY
        ? [
            {
              name: "Branch",
              selector: (row) => row.branch_id,
              cell: (row) => {
                return row.role === "admin"
                  ? "All Branches"
                  : row.branchName || "";
              },
              sortable: true,
              sortField: "users.branch_id",
              compact: true,
            },
          ]
        : []),
      {
        name: "IP Access Group",
        selector: (row) => row.access_group,
        cell: (row) => {
          return row.accessGroupName || "";
        },
        sortable: false,
        compact: true,
      },
    ];

    if (authUser && authUser.id) this.initValues();
  }

  componentDidUpdate(prevProps) {
    const { membersTableStatus, authUser } = this.props;
    if (!prevProps.membersTableStatus && membersTableStatus) {
      this.props.dispatch(setMembersTableStatus(false));
      this.setState({ selected: [] }, () => {
        this.handlePageChange(1);
      });
      this.handleClearRows();
    }
    if (
      (!prevProps.authUser || !prevProps.authUser.id) &&
      authUser &&
      authUser.id
    )
      this.initValues();
  }

  initValues() {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get("role") || "";
    this.setState({ role }, () => {
      this.getMembers();
    });
  }

  clickForceRefresh = (e) => {
    e.preventDefault();
    this.setState({ selected: [] }, () => {
      this.handlePageChange(1);
    });
  };

  getMembers() {
    const {
      page_id,
      loading,
      perPage,
      sort_key,
      sort_direction,
      search,
      status,
      role,
    } = this.state;

    if (loading) return;

    const params = {
      page_id,
      page_length: perPage,
      sort_key,
      sort_direction,
      search,
      status,
      role,
    };

    this.props.dispatch(
      getMembers(
        params,
        () => {
          this.setState({ loading: true });
        },
        (res) => {
          const total = res.total || 0;
          const totalAll = res.all || 0;
          const totalActive = res.active || 0;
          const totalPending = res.pending || 0;
          const totalRevoked = res.revoked || 0;
          const members = res.members || [];
          this.setState({
            loading: false,
            total,
            members,
            totalAll,
            totalActive,
            totalPending,
            totalRevoked,
          });
        }
      )
    );
  }

  handleSort = (column, direction) => {
    this.setState(
      { page_id: 1, sort_key: column.sortField, sort_direction: direction },
      () => {
        this.getMembers();
      }
    );
  };

  handlePerRowsChange = (perPage) => {
    this.setState({ page_id: 1, perPage }, () => {
      this.getMembers();
    });
  };

  handlePageChange = (page_id) => {
    this.setState({ page_id }, () => {
      this.getMembers();
    });
  };

  handleClearRows = () => {
    this.setState({ toggledClearRows: !this.state.toggledClearRows });
  };

  handleRowSelect = (row) => {
    const selected = [];
    if (row.selectedRows && row.selectedRows.length) {
      row.selectedRows.forEach((item) => {
        selected.push(item.id);
      });
    }
    this.setState({ selected });
  };

  handleInput = (e) => {
    e.preventDefault();
    this.setState({ search: e.target.value, page_id: 1 }, () => {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      this.timer = setTimeout(() => {
        this.getMembers();
      }, 500);
    });
  };

  changeSelect = (e) => {
    this.setState({ status: e.target.value, page_id: 1 }, () => {
      this.getMembers();
    });
  };

  changeRole = (e) => {
    this.setState({ role: e.target.value, page_id: 1 }, () => {
      this.getMembers();
    });
  };

  changeBulk = (e) => {
    const action = e.target.value;
    const { selected } = this.state;
    if (!selected || !selected.length) {
      this.props.dispatch(showAlert("Please select rows"));
      return;
    }

    if (action == "bulk-apply-access-group") {
      this.props.dispatch(setBulkApplyAccessGroupMembersData(selected));
      this.props.dispatch(setActiveModal(action));
    } else if (action == "bulk-remove-access-group") {
      this.props.dispatch(setBulkRemoveAccessGroupMembersData(selected));
      this.props.dispatch(setActiveModal(action));
    }
  };

  clickRevoke(row) {
    this.props.dispatch(setRevokeMemberData(row));
    this.props.dispatch(setActiveModal("revoke-member"));
  }

  clickDelete(row) {
    this.props.dispatch(setDeleteMemberData(row));
    this.props.dispatch(setActiveModal("delete-member"));
  }

  clickCancel(row) {
    this.props.dispatch(setCancelInviteMemberData(row));
    this.props.dispatch(setActiveModal("cancel-member-invite"));
  }

  renderActions(row) {
    return (
      <Fragment>
        <Link to={`/app/member/${row.id}/edit`}>Edit</Link>
        {row.status == "active" ? (
          <a onClick={() => this.clickRevoke(row)}>Revoke</a>
        ) : row.status == "pending" ? (
          <a onClick={() => this.clickCancel(row)}>Cancel</a>
        ) : (
          <a onClick={() => this.clickDelete(row)}>Delete</a>
        )}
      </Fragment>
    );
  }

  renderAlert() {
    const { blockAlertData } = this.props;
    if (blockAlertData && blockAlertData.type == "member")
      return (
        <BlockAlertComponent
          data={blockAlertData}
          customClass={styles.cBlockAlert}
        />
      );

    return null;
  }

  renderTableHeader() {
    const { totalAll, totalActive, totalPending, totalRevoked, status, role } =
      this.state;
    const { authUser, buildType } = this.props;
    return (
      <Fragment>
        <div className={["row", styles.appMembersPage__tableHeader].join(" ")}>
          <div className="col-md-8">
            <select value={status} onChange={this.changeSelect}>
              <option value="">Filter By Status</option>
              <option value="all">All Members ({totalAll})</option>
              <option value="active">Active Members ({totalActive})</option>
              <option value="pending">Pending Members ({totalPending})</option>
              <option value="revoked">Revoked Members ({totalRevoked})</option>
            </select>
            {buildType !== BUILD_TYPE.FUTURE_FAMILY &&
            (authUser.role == "admin" || authUser.role == "supervisor") ? (
              <select
                className={styles.filterRole}
                value={role}
                onChange={this.changeRole}
              >
                <option value="">Filter By Role</option>
                <option value="all">All Roles</option>
                <option value="admin">Administrator</option>
                <option value="supervisor">Supervisor</option>
                <option value="loanofficer">Loan Officer</option>
              </select>
            ) : null}
          </div>
          <div className="col-md-4">
            <select value="" onChange={this.changeBulk}>
              <option value="">Bulk Actions</option>
              <option value="bulk-apply-access-group">Apply Access Group</option>
              <option value="bulk-remove-access-group">
                Remove Access Group
              </option>
            </select>
            <a onClick={this.clickForceRefresh} title="Refresh">
              <Icon.RefreshCw />
            </a>
          </div>
        </div>
      </Fragment>
    );
  }

  render() {
    const { members, loading, total, perPage, search, toggledClearRows } =
      this.state;
    const { buildType } = this.props;
    return (
      <div className={styles.appMembersPage}>
        <div className={styles.appMembersPageHeader}>
          <div className={["row c-container", styles.cContainer].join(" ")}>
            <div className="col-md-9">
              <Link
                to={`/app/member/new`}
                className="btn btn-primary btn-icon"
                custom-type="default"
              >
                <Icon.Plus size={18} />
                <label className="font-size-14">Add Member</label>
              </Link>
            </div>

            <div className="col-md-3">
              <input
                type="text"
                value={search}
                placeholder={
                  buildType !== BUILD_TYPE.FUTURE_FAMILY
                    ? "Search by name, email or branch"
                    : "Search by name or email"
                }
                onChange={this.handleInput}
              />
              <Icon.Search color="#B2C6CF" size={18} />
            </div>
          </div>
        </div>

        <div className={["c-container", styles.cContainer].join(" ")}>
          {this.renderAlert()}
          {this.renderTableHeader()}
          <div className="table-wrapper tableWrapper">
            <DataTable
              columns={this.columns}
              data={members}
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
              selectableRows
              clearSelectedRows={toggledClearRows}
              onSelectedRowsChange={this.handleRowSelect}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Members));
