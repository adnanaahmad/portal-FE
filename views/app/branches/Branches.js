import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import {
  BlockAlertComponent,
  GlobalRelativeCanvasComponent,
} from "../../../components";
import { getBranches } from "../../../utils/Thunk";

import styles from "./branches.module.scss";

const mapStateToProps = (state) => {
  return {
    blockAlertData: state.global.blockAlertData,
  };
};

class Branches extends Component {
  constructor(props) {
    super(props);
    this.state = {
      branches: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.getBranches();
  }

  getBranches() {
    this.props.dispatch(
      getBranches(
        {},
        () => {
          this.setState({ loading: true });
        },
        (res) => {
          const branches = res.branches || [];
          this.setState({ loading: false, branches });
        }
      )
    );
  }

  renderAlert() {
    const { blockAlertData } = this.props;
    if (blockAlertData && blockAlertData.type == "branch")
      return <BlockAlertComponent data={blockAlertData} />;

    return null;
  }

  renderBranchAddress(branch) {
    if (branch.is_digital) return null;
    if (branch.address_2)
      return `${branch.address_1}, ${branch.address_2}, ${branch.city}, ${branch.state} ${branch.zip}`;
    return `${branch.address_1} ${branch.city}, ${branch.state} ${branch.zip}`;
  }

  renderBranchInfo(branch) {
    const users = branch.users || [];
    const supervisors = [];
    if (users && users.length) {
      users.forEach((user) => {
        if (user.role == "supervisor")
          supervisors.push(user.first_name + " " + user.last_name);
      });
    }

    if (!supervisors || !supervisors.length) {
      return (
        <p>
          Branch Supervisor <i>Unassigned</i>
        </p>
      );
    }

    return (
      <p>
        Branch Supervisors <b>{supervisors.join(", ")}</b>
      </p>
    );
  }

  renderBranches() {
    const { branches } = this.state;

    if (!branches || !branches.length) {
      return (
        <div className="app-no-results">
          <h3>No Results Found</h3>
        </div>
      );
    }

    const items = [];
    branches.forEach((branch, index) => {
      items.push(
        <li key={`branch_${index}`}>
          <article>
            <div>
              <b className="word-break-all">{branch.name}</b>
              <p className="word-break-all">{this.renderBranchAddress(branch)}</p>
            </div>
            {this.renderBranchInfo(branch)}
          </article>
          <Link hidden={branch.is_digital} to={`/app/branch/${branch.id}/edit`} className="btn btn-light">
            Edit
          </Link>
        </li>
      );
    });

    return <ul>{items}</ul>;
  }

  render() {
    const { loading } = this.state;
    return (
      <div className={styles.appBranchesPage}>
        <div className={styles.appBranchesPageHeader}>
          <div className={["c-container", styles.cContainer].join(" ")}>
            <Link
              to="/app/branch/new"
              className="btn btn-icon btn-primary"
              custom-type="default"
            >
              <Icon.Plus size={18} />
              <label>New Branch</label>
            </Link>
            <div></div>
          </div>
        </div>
        <div className={["c-container", styles.cContainer].join(" ")}>
          {this.renderAlert()}
          <div className={styles.appBranchesPage__list}>
            {loading ? (
              <GlobalRelativeCanvasComponent />
            ) : (
              this.renderBranches()
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(Branches));
