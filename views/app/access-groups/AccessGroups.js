import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect, Link, withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import { BlockAlertComponent } from "../../../components";
import DataTable from "react-data-table-component";
import { getAccessGroups } from "../../../utils/Thunk";
import {
  setAccessGroupsTableStatus,
  setActiveModal,
  setDeleteAccessGroupData,
} from "../../../redux/actions";
import { AppSettingsMenu } from "../../../layouts";

import styles from "./access-groups.module.scss";

const mapStateToProps = (state) => {
  return {
    blockAlertData: state.global.blockAlertData,
    authUser: state.global.authUser,
    deleteAccessGroupData: state.modal.deleteAccessGroupData,
    accessGroupsTableStatus: state.table.accessGroupsTableStatus,
  };
};

class AccessGroups extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      page_id: 0,
      perPage: 10,
      sort_key: "access_groups.id",
      sort_direction: "desc",
      search: "",
      total: 0,
      accessGroups: [],
      columns: [],
    };

    this.timer = null;
  }

  componentDidMount() {
    const { authUser } = this.props;
    if (authUser && authUser.id) this.makeColumns();
    this.getAccessGroups();
  }

  componentDidUpdate(prevProps) {
    const { accessGroupsTableStatus, authUser } = this.props;
    if (!prevProps.accessGroupsTableStatus && accessGroupsTableStatus) {
      this.handlePageChange(1);
      this.props.dispatch(setAccessGroupsTableStatus(false));
    }

    if (
      (!prevProps.authUser || !prevProps.authUser.id) &&
      authUser &&
      authUser.id
    )
      this.makeColumns();
  }

  makeColumns() {
    const { authUser } = this.props;

    const columns = [
      {
        name: "ID",
        selector: (row) => row.id,
        cell: (row) => {
          return <label className="font-size-13">{row.id}</label>;
        },
        sortable: true,
        sortField: "access_groups.id",
        compact: true,
      },
      {
        name: "Name",
        selector: (row) => row.name,
        cell: (row) => {
          return <label className="font-size-13">{row.name}</label>;
        },
        sortable: true,
        sortField: "access_groups.name",
        compact: true,
      },
      {
        name: "IP Address/Range",
        selector: (row) => row.iprange,
        cell: (row) => {
          const ips = row.iprange.split(",");
          const items = [];
          if (ips && ips.length) {
            ips.forEach((ip, index) => {
              items.push(
                <p className="font-size-13" key={`ip_${index}`}>
                  {ip}
                </p>
              );
            });
          }
          return <div>{items}</div>;
        },
        sortable: false,
        compact: true,
      },
      {
        name: "Members (View Only)",
        selector: (row) => row.members,
        cell: (row) => {
          if (!row.members || !row.members.length)
            return <label className="font-size-13">-</label>;
          const members = [];
          row.members.forEach((member, index) => {
            members.push(
              <div key={`member_${index}`} className="font-size-13 mt-1 mb-1">
                {member.first_name} {member.last_name}
              </div>
            );
          });
          return <div>{members}</div>;
        },
        sortable: false,
        compact: true,
      },
    ];

    if (authUser.role == "admin") {
      columns.push({
        name: "Actions",
        selector: (row) => row.actions,
        cell: (row) => {
          return (
            <div className="access-group-actions">
              <Link to={`/app/settings/access-group/${row.id}/edit`}>Edit</Link>
              <a className="color-danger" onClick={() => this.clickDelete(row)}>
                Delete
              </a>
            </div>
          );
        },
        sortable: false,
        compact: true,
      });
    }

    this.setState({ columns });
  }

  clickForceRefresh = (e) => {
    e.preventDefault();
    this.handlePageChange(1);
  };

  getAccessGroups() {
    const { page_id, loading, perPage, sort_key, sort_direction, search } =
      this.state;

    if (loading) return;

    const params = {
      page_id,
      page_length: perPage,
      sort_key,
      sort_direction,
      search,
    };

    this.props.dispatch(
      getAccessGroups(
        params,
        () => {
          this.setState({ loading: true });
        },
        (res) => {
          const total = res.total || 0;
          const accessGroups = res.accessGroups || [];
          this.setState({ loading: false, total, accessGroups });
        }
      )
    );
  }

  handleSort = (column, direction) => {
    this.setState(
      { page_id: 1, sort_key: column.sortField, sort_direction: direction },
      () => {
        this.getAccessGroups();
      }
    );
  };

  handlePerRowsChange = (perPage) => {
    this.setState({ page_id: 1, perPage }, () => {
      this.getAccessGroups();
    });
  };

  handlePageChange = (page_id) => {
    this.setState({ page_id }, () => {
      this.getAccessGroups();
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
        this.getAccessGroups(1);
      }, 500);
    });
  };

  renderAlert() {
    const { blockAlertData } = this.props;
    if (blockAlertData && blockAlertData.type == "access-group")
      return <BlockAlertComponent data={blockAlertData} />;

    return null;
  }

  clickDelete(row) {
    this.props.dispatch(setDeleteAccessGroupData(row));
    this.props.dispatch(setActiveModal("delete-access-group"));
  }

  render() {
    const { accessGroups, loading, total, perPage, columns, search } =
      this.state;
    const { authUser } = this.props;
    if (!authUser || !authUser.id) return null;
    if (authUser.role == "loanofficer") return <Redirect to="/app" />;

    return (
      <div className={styles.appAccessGroupsPage}>
        <AppSettingsMenu />
        <div className="c-container">
          {this.renderAlert()}

          <div className={styles.appAccessGroupsPageHeader}>
            {authUser.role == "admin" ? (
              <Link
                to={`/app/settings/access-group/new`}
                className="btn btn-primary btn-icon"
                custom-type="default"
              >
                <Icon.Plus size={18} />
                <label className="font-size-14">New Access Group</label>
              </Link>
            ) : null}
            <div className={styles.searchParent}>
              <div className={styles.search}>
                <input
                  type="text"
                  value={search}
                  placeholder="Search by name"
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

          <div className="table-wrapper">
            <DataTable
              columns={columns}
              data={accessGroups}
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

export default connect(mapStateToProps)(withRouter(AccessGroups));
