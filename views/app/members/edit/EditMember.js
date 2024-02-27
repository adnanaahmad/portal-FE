/* eslint-disable no-undef */
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Link, withRouter, Redirect } from "react-router-dom";
import {
  FormInputComponent,
  FormSelectComponent,
} from "../../../../components";
import {
  getAccessGroups,
  getBranches,
  getMemberById,
  updateMember,
} from "../../../../utils/Thunk";
import {
  showCanvas,
  hideCanvas,
  showAlert,
  setBlockAlertData,
  setActiveModal,
  setRevokeMemberData,
  setResetPasswordMemberData,
  setCancelInviteMemberData,
  setDeleteMemberData,
  setCustomConfirmModalData,
} from "../../../../redux/actions";
import Helper from "../../../../utils/Helper";

import formInputStyles from "../../../../components/form-control/form-input/form-input.module.scss";
import styles from "./edit-member.module.scss";
import { nameRegex } from "../../../../utils/Regex";
import { BUILD_TYPE } from "../../../../utils/Constant";

const moment = require("moment");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    buildType: state.global.buildType,
  };
};

class EditMember extends Component {
  constructor(props) {
    super(props);
    this.state = {
      role: "",
      first_name: "",
      last_name: "",
      email: "",
      branchKey: "",
      branches: [],
      member: {},
      memberId: 0,
      accessGroupKey: "",
      accessGroups: [],
      pageReloaded: false,
      loading: true
    };
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;

    const memberId = params.memberId;
    this.setState({ memberId }, () => {
      this.getData();
    });

    document.addEventListener("keypress", (e) => {
      const isModalOpen =
        document.getElementsByClassName("custom-modals").length > 0 ? 1 : 0;

      // `Enter` key is pressed
      if (e.keyCode == 13 && !isModalOpen) {
        this.clickOnDefaultButton();
      }
    });
  }

  componentDidUpdate() {
    if (!this.state.pageReloaded) {
      const firstNameField = document.getElementById("firstNameField");
      if (firstNameField) {
        firstNameField.focus();
      }

      this.setState({ ["pageReloaded"]: true });
    }
  }

  getData() {
    Promise.all([
      this.getBranches(),
      this.getAccessGroups(),
      this.getMember(),
    ]).then(() => {
      // All loaded
      this.props.dispatch(hideCanvas());
      const { member } = this.state;

      this.setState({
        role: member.role || "",
        first_name: member.first_name || "",
        last_name: member.last_name || "",
        email: member.email || "",
        branchKey: member.branch_id ? `branch_${member.branch_id}` : "",
        accessGroupKey: member.access_group_id
          ? `accessGroup_${member.access_group_id}`
          : "",
        loading: false
      });
    });
  }

  getMember() {
    const { memberId } = this.state;
    return new Promise((resolve) => {
      this.props.dispatch(
        getMemberById(
          memberId,
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            const member = res.member || {};
            this.setState({ member }, () => {
              resolve(true);
            });
          }
        )
      );
    });
  }

  getBranches() {
    return new Promise((resolve) => {
      this.props.dispatch(
        getBranches(
          {},
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            if (res && res.branches) {
              let branches = {};
              res.branches.forEach((branch) => {
                const key = "branch_" + branch.id;
                branches[key] = branch.name;
              });
              this.setState({ branches });
            }
            resolve(true);
          }
        )
      );
    });
  }

  getAccessGroups() {
    return new Promise((resolve) => {
      this.props.dispatch(
        getAccessGroups(
          { returnAll: 1 },
          () => {
            this.props.dispatch(showCanvas());
          },
          (res) => {
            if (res && res.accessGroups) {
              let accessGroups = {};
              res.accessGroups.forEach((accessGroup) => {
                const key = "accessGroup_" + accessGroup.id;
                accessGroups[key] = accessGroup.name;
              });
              this.setState({ accessGroups });
            }
            resolve(true);
          }
        )
      );
    });
  }

  clickDelete = (e) => {
    e.preventDefault();
    const { member } = this.state;
    this.props.dispatch(setDeleteMemberData(member));
    this.props.dispatch(setActiveModal("delete-member"));
  };

  clickResend = (e) => {
    e.preventDefault();
    const { member } = this.state;
    this.props.dispatch(
      setCustomConfirmModalData({
        title: `Resend an invitation to ${member.first_name} ${member.last_name}`,
        body: `This will send an invitation again to ${member.first_name} ${member.last_name}`,
        action: "resend-invitation",
        data: member,
      })
    );
    this.props.dispatch(setActiveModal("custom-confirm"));
  };

  clickCancelInvite = (e) => {
    e.preventDefault();
    const { member } = this.state;
    this.props.dispatch(setCancelInviteMemberData(member));
    this.props.dispatch(setActiveModal("cancel-member-invite"));
  };

  clickResetPassword = (e) => {
    e.preventDefault();
    const { member } = this.state;
    this.props.dispatch(setResetPasswordMemberData(member));
    this.props.dispatch(setActiveModal("reset-member-password"));
  };

  clickRevoke = (e) => {
    e.preventDefault();
    const { member } = this.state;
    this.props.dispatch(setRevokeMemberData(member));
    this.props.dispatch(setActiveModal("revoke-member"));
  };

  clickRestore = (e) => {
    e.preventDefault();
    const { member } = this.state;
    this.props.dispatch(
      setCustomConfirmModalData({
        title: `Restore "${member.first_name} ${member.last_name}" Access`,
        body: `This will restore the access of ${member.first_name} ${member.last_name}`,
        action: "restore",
        data: member,
      })
    );
    this.props.dispatch(setActiveModal("custom-confirm"));
  };

  submit = (e) => {
    const updateInfoButton = this.getUpdateInfoButton();
    if (updateInfoButton) {
      updateInfoButton.disabled = true;
    }

    e.preventDefault();
    const {
      memberId,
      first_name,
      last_name,
      role,
      email,
      branchKey,
      accessGroupKey,
    } = this.state;

    if (!role) {
      this.props.dispatch(showAlert("Please select role"));
      if (updateInfoButton) {
        updateInfoButton.disabled = false;
      }
      return;
    }

    if (!first_name.trim()) {
      this.props.dispatch(showAlert("Please input first name"));
      if (updateInfoButton) {
        updateInfoButton.disabled = false;
      }
      return;
    }

    if (!last_name.trim()) {
      this.props.dispatch(showAlert("Please input last name"));
      if (updateInfoButton) {
        updateInfoButton.disabled = false;
      }
      return;
    }

    if (!email.trim() || !Helper.validateEmail(email.trim())) {
      this.props.dispatch(showAlert("Please input valid email"));
      if (updateInfoButton) {
        updateInfoButton.disabled = false;
      }
      return;
    }

    if (!branchKey.trim() && role !== "admin") {
      this.props.dispatch(showAlert("Please select branch"));
      if (updateInfoButton) {
        updateInfoButton.disabled = false;
      }
      return;
    }

    const branchId = parseInt(branchKey.replace("branch_", ""));

    let accessGroupId = 0;
    if (accessGroupKey)
      accessGroupId = parseInt(accessGroupKey.replace("accessGroup_", ""));

    const params = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      role,
      email: email.trim(),
      branchId,
      accessGroupId,
    };

    this.props.dispatch(
      updateMember(
        memberId,
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            const { history } = this.props;
            history.push("/app/members");
            this.props.dispatch(
              setBlockAlertData({
                message: `Changes to "${first_name} ${last_name}" has been saved`,
                color: "success",
                type: "member",
              })
            );
          } else {
            if (updateInfoButton) {
              updateInfoButton.disabled = false;
            }
          }
        }
      )
    );
  };

  componentWillUnmount() {
    this.props.dispatch(setBlockAlertData({}));
  }

  setRole(e, role) {
    e.preventDefault();
    this.setState({ role });
  }

  inputField(e, key) {
    this.setState({ [key]: e.target.value });
  }

  handleKeyDown = (e) => {
    // `Enter` key is pressed
    if (e.keyCode == 13) {
      e.preventDefault();
      this.clickOnDefaultButton();
    }
  };

  getUpdateInfoButton() {
    return document.getElementById("updateInfoButton");
  }

  clickOnDefaultButton() {
    const updateInfoButton = this.getUpdateInfoButton();
    if (updateInfoButton) {
      updateInfoButton.click();
    }
  }

  renderButtons() {
    const { member, loading } = this.state;
    if (loading) return null;
    return (
      <Fragment>
        {member.status == "active" ? (
          <a
            className={[
              "btn btn-danger-outline btn-small",
              styles.btnAppEditMemberPageContentButtons,
            ].join(" ")}
            onClick={this.clickRevoke}
          >
            Revoke Access
          </a>
        ) : member.status == "pending" ? (
          <a
            className={[
              "btn btn-light btn-small",
              styles.btnAppEditMemberPageContentButtons,
            ].join(" ")}
            onClick={this.clickCancelInvite}
          >
            Cancel Invite
          </a>
        ) : (
          <a
            className={[
              "btn btn-primary-outline btn-small",
              styles.btnAppEditMemberPageContentButtons,
            ].join(" ")}
            onClick={this.clickRestore}
          >
            Restore Access
          </a>
        )}
        {member.status !== "pending" && (
          <a
            className={[
              "btn btn-light btn-small",
              styles.btnAppEditMemberPageContentButtons,
            ].join(" ")}
            onClick={this.clickResetPassword}
          >
            Reset Password
          </a>
        )}
      </Fragment>
    );
  }

  renderStatus() {
    const { member, loading } = this.state;
    if (loading) return null;
    return (
      <Fragment>
        <div
          className={[
            "member-status-box",
            styles.memberStatusBox,
            `${member.status}`,
          ].join(" ")}
        >
          {member.status == "active"
            ? "Active"
            : member.status == "pending"
            ? "Pending"
            : "Revoked"}
        </div>
      </Fragment>
    );
  }

  renderExtraButton() {
    const { member, loading } = this.state;
    if (loading) return null;
    if (member.status != "active")
      return (
        <a
          className={[
            "btn btn-danger-outline",
            styles.btnAppEditMemberPageButtons,
            styles.btnDangerAppEditMemberPage,
          ].join(" ")}
          onClick={this.clickDelete}
        >
          Delete Member
        </a>
      );
    return null;
  }

  renderRoleSection() {
    const { role, member } = this.state;
    const { authUser } = this.props;

    if (authUser.role != "admin") return null;
    if (authUser.id === member.id) return <Redirect to="/app" />;

    return (
      <div className="row">
        <div className="col-md-8">
          <div className={styles.cFormRow}>
            <label>Role</label>
            <select
              value={role}
              className={[
                formInputStyles.customFormControl,
                styles.customFormControlSelect,
              ].join(" ")}
              onChange={(e) => this.inputField(e, "role")}
              onKeyDown={this.handleKeyDown}
            >
              <option value="">Select a Role</option>
              <option value="admin">Administrator</option>
              <option value="supervisor">Supervisor</option>
              <option value="loanofficer">Loan Officer</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  renderBranchSection() {
    const { branches, branchKey, role } = this.state;
    const { authUser } = this.props;

    return (
      <Fragment>
        <div className="spacer mt-4 mb-4"></div>
        <h3 className="mb-3">Branch Information</h3>
        <div className={styles.cFormRow}>
          <label>Branch Name</label>
          {authUser.role == "admin" ? (
            <FormSelectComponent
              value={branchKey}
              required={role !== "admin"}
              height="40px"
              options={branches}
              placeholder="Select a Branch"
              onChange={(e) => this.inputField(e, "branchKey")}
              onKeyDown={this.handleKeyDown}
            />
          ) : (
            <p>
              <b>{authUser.branch ? authUser.branch.name : ""}</b>
            </p>
          )}
        </div>
      </Fragment>
    );
  }

  renderLogs() {
    const { member } = this.state;
    const logs = [];
    if (member && member.logs) {
      member.logs.forEach((log, index) => {
        logs.push(
          <tr key={`log_${index}`}>
            <td>
              <p>
                {moment(log.created_at).local().format("M/D/YYYY")}
                <br />
                {moment(log.created_at).local().format("h:mm A")}
              </p>
            </td>
            <td>{log.ip}</td>
            <td>{log.event}</td>
          </tr>
        );
      });
    }
    return logs;
  }

  renderSidebar() {
    const { member } = this.state;
    if (member && member.status == "pending") {
      return (
        <Fragment>
          <label>Invitation</label>
          <p>Sent on {moment(member.created_at).local().format("M/D/YYYY")}</p>
          <div>
            <a
              className={[
                "btn btn-primary-outline btn-small",
                styles.btnAppEditMemberPageSidebar,
              ].join(" ")}
              onClick={this.clickResend}
            >
              Resend
            </a>
            <a className="color-danger" onClick={this.clickCancelInvite}>
              Cancel
            </a>
          </div>
        </Fragment>
      );
    }
    return (
      <Fragment>
        <label>Activity Log</label>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>IP</th>
              <th>Event</th>
            </tr>
          </thead>
          <tbody>{this.renderLogs()}</tbody>
        </table>
      </Fragment>
    );
  }

  render() {
    const {
      first_name,
      last_name,
      email,
      accessGroupKey,
      accessGroups,
      member,
      role,
    } = this.state;
    const { authUser, buildType } = this.props;
    if (!authUser || !authUser.id) return null;

    return (
      <div className={styles.appEditMemberPage}>
        <div className={["row c-container", styles.cContainer].join(" ")}>
          <div className={["col-md-9", styles.appEditMemberPage__content].join(" ")}>
            <div className={styles.appEditMemberPage__contentHeader}>
              <h2>
                {first_name} {last_name}
              </h2>
              {this.renderStatus()}
            </div>

            <div className={styles.appEditMemberPage__contentButtons}>
              {this.renderButtons()}
            </div>

            <form action="" method="POST" onSubmit={this.submit}>
              <div className="app-page-header mb-3">
                <h3>Basic Info</h3>
              </div>
              <div className="row">
                <div className="col-md-8">
                  <div className={styles.cFormRow}>
                    <label>First Name</label>
                    <FormInputComponent
                      id="firstNameField"
                      type="text"
                      value={first_name}
                      required={true}
                      height="40px"
                      onChange={(e) => this.inputField(e, "first_name")}
                      disabled={member.status === "pending"}
                      pattern={nameRegex.source}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-8">
                  <div className={styles.cFormRow}>
                    <label>Last Name</label>
                    <FormInputComponent
                      type="text"
                      value={last_name}
                      required={true}
                      height="40px"
                      onChange={(e) => this.inputField(e, "last_name")}
                      disabled={member.status === "pending"}
                      pattern={nameRegex.source}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-8">
                  <div className={styles.cFormRow}>
                    <label>Email</label>
                    <FormInputComponent
                      type="email"
                      value={email}
                      required={true}
                      height="40px"
                      onChange={(e) => this.inputField(e, "email")}
                      disabled={true}
                    />
                  </div>
                </div>
              </div>
              {buildType !== BUILD_TYPE.FUTURE_FAMILY &&
                this.renderRoleSection()}
              {buildType !== BUILD_TYPE.FUTURE_FAMILY &&
                role !== "admin" &&
                this.renderBranchSection()}
              <div className="spacer mt-4 mb-4"></div>
              <h3 className="mb-3">Security</h3>
              <div className={styles.cFormRow}>
                <label>Access Group</label>
                <FormSelectComponent
                  value={accessGroupKey}
                  height="40px"
                  options={accessGroups}
                  placeholder="Select an access group"
                  onChange={(e) => this.inputField(e, "accessGroupKey")}
                  onKeyDown={this.handleKeyDown}
                />
              </div>
              <div className="spacer mt-4 mb-4"></div>
              <div className={styles.appEditMemberPage__buttons}>
                <button
                  id="updateInfoButton"
                  type="submit"
                  className={[
                    "btn btn-primary",
                    styles.btnAppEditMemberPageButtons,
                  ].join(" ")}
                >
                  Update Info
                </button>
                <Link
                  to="/app/members"
                  className={[
                    "btn btn-light",
                    styles.btnAppEditMemberPageButtons,
                  ].join(" ")}
                >
                  Cancel
                </Link>
                {this.renderExtraButton()}
              </div>
            </form>
          </div>
          <div className={["col-md-3", styles.appEditMemberPage__sidebar].join(" ")}>
            {this.renderSidebar()}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(EditMember));
