import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import {
  FormInputComponent,
  FormSelectComponent,
} from "../../../../components";
import {
  getAccessGroups,
  getBranches,
  inviteMember,
} from "../../../../utils/Thunk";
import {
  showCanvas,
  hideCanvas,
  showAlert,
  setBlockAlertData,
} from "../../../../redux/actions";
import Helper from "../../../../utils/Helper";

import styles from "./new-member.module.scss";
import { nameRegex } from "../../../../utils/Regex";
import { BUILD_TYPE } from "../../../../utils/Constant";

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
    buildType: state.global.buildType,
  };
};

class NewMember extends Component {
  constructor(props) {
    super(props);
    this.state = {
      role: "",
      first_name: "",
      last_name: "",
      email: "",
      branchKey: "",
      branches: [],
      accessGroupKey: "",
      accessGroups: [],
    };
  }

  componentDidMount() {
    Promise.all([this.getBranches(), this.getAccessGroups()]).then(() => {
      this.props.dispatch(hideCanvas());
    });

    const { authUser } = this.props;
    if (authUser && authUser.id) this.initValues();

    const firstNameField = document.getElementById("firstNameField");
    if (firstNameField) {
      firstNameField.focus();
    }

    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        this.clickOnDefaultButton();
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
    const { authUser } = this.props;
    if (authUser.role == "supervisor") {
      this.setState({
        role: "loanofficer",
        branchKey: `branch_${authUser.branch_id}`,
      });
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const branchId = urlParams.get("branchId");
      const role = urlParams.get("role");

      this.setState({
        branchKey: `branch_${branchId}`,
        role,
      });
    }
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

  submit = (e) => {
    const saveMemberButton = this.getSaveMemberButton();
    if (saveMemberButton) {
      saveMemberButton.disabled = true;
    }

    e.preventDefault();
    const { first_name, last_name, role, email, branchKey, accessGroupKey } =
      this.state;

    if (!role) {
      this.props.dispatch(showAlert("Please select role"));
      if (saveMemberButton) {
        saveMemberButton.disabled = false;
      }
      return;
    }

    if (!first_name.trim()) {
      this.props.dispatch(showAlert("Please input first name"));
      if (saveMemberButton) {
        saveMemberButton.disabled = false;
      }
      return;
    }

    if (!last_name.trim()) {
      this.props.dispatch(showAlert("Please input last name"));
      if (saveMemberButton) {
        saveMemberButton.disabled = false;
      }
      return;
    }

    if (!email.trim() || !Helper.validateEmail(email.trim())) {
      this.props.dispatch(showAlert("Please input valid email"));
      if (saveMemberButton) {
        saveMemberButton.disabled = false;
      }
      return;
    }

    if (!branchKey.trim() && role !== "admin") {
      this.props.dispatch(showAlert("Please select branch"));
      if (saveMemberButton) {
        saveMemberButton.disabled = false;
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
      // eslint-disable-next-line no-undef
      url: process.env.NEXT_PUBLIC_MAIN_URL,
    };

    this.props.dispatch(
      inviteMember(
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
                message: `${first_name} ${last_name} has been created`,
                color: "success",
                type: "member",
              })
            );
          } else {
            if (saveMemberButton) {
              saveMemberButton.disabled = false;
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

  getSaveMemberButton() {
    return document.getElementById("saveMemberButton");
  }

  clickOnDefaultButton() {
    const saveMemberButton = this.getSaveMemberButton();
    if (saveMemberButton) {
      saveMemberButton.click();
    }
  }

  renderBranchSection() {
    const { branches, branchKey, role } = this.state;
    const { authUser } = this.props;

    return (
      <Fragment>
        <h3>Branch Information</h3>
        <div className={styles.cFormRow}>
          <label>Branch Name</label>
          {authUser.role == "admin" ? (
            <div>
              <FormSelectComponent
                additionalClassName={styles.customFormControl}
                value={branchKey}
                required={role !== "admin"}
                height="40px"
                options={branches}
                placeholder="Select a Branch"
                onChange={(e) => this.inputField(e, "branchKey")}
                onKeyDown={this.handleKeyDown}
              />
              {/*
              <span className="font-size-13">or</span>
              <a className="btn btn-light btn-icon">
                <Icon.Plus size={18} />
                <label className="font-size-14">New Branch</label>
              </a>
              */}
            </div>
          ) : (
            <p>
              <b>{authUser.branch ? authUser.branch.name || "" : ""}</b>
            </p>
          )}
        </div>
        <div className="spacer mt-4 mb-4"></div>
      </Fragment>
    );
  }

  renderRoleSection() {
    const { role } = this.state;
    const { authUser, buildType } = this.props;

    if (authUser.role != "admin") return null;

    return (
      <Fragment>
        <h3>Select Role</h3>
        <div className={styles.appNewMemberPage__roles}>
          <a
            className={
              role == "admin"
                ? [
                    "btn btn-round",
                    styles.active,
                    styles.btnAppNewMemberPageRoles,
                  ].join(" ")
                : ["btn btn-round", styles.btnAppNewMemberPageRoles].join(" ")
            }
            onClick={(e) => this.setRole(e, "admin")}
          >
            Administrator
          </a>
          {buildType !== BUILD_TYPE.FUTURE_FAMILY && (
            <a
              className={
                role == "supervisor"
                  ? [
                      "btn btn-round",
                      styles.active,
                      styles.btnAppNewMemberPageRoles,
                    ].join(" ")
                  : ["btn btn-round", styles.btnAppNewMemberPageRoles].join(" ")
              }
              onClick={(e) => this.setRole(e, "supervisor")}
            >
              Supervisor
            </a>
          )}
          <a
            className={
              role == "loanofficer"
                ? [
                    "btn btn-round",
                    styles.active,
                    styles.btnAppNewMemberPageRoles,
                  ].join(" ")
                : ["btn btn-round", styles.btnAppNewMemberPageRoles].join(" ")
            }
            onClick={(e) => this.setRole(e, "loanofficer")}
          >
            Loan Officer
          </a>
        </div>
        <div className="spacer mt-4 mb-3"></div>
      </Fragment>
    );
  }

  render() {
    const { first_name, last_name, email, accessGroupKey, accessGroups, role } =
      this.state;

    const { authUser, buildType } = this.props;
    if (!authUser || !authUser.id) return null;

    return (
      <div className={styles.appNewMemberPage}>
        <div className="c-container small">
          <div className="app-page-header mb-3">
            <h2>Add Member</h2>
          </div>

          <form action="" method="POST" onSubmit={this.submit}>
            {this.renderRoleSection()}
            <h3>Basic Info</h3>
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
                  />
                </div>
              </div>
            </div>
            <div className="spacer mt-4 mb-4"></div>
            {buildType !== BUILD_TYPE.FUTURE_FAMILY &&
              role !== "admin" &&
              this.renderBranchSection()}
            <h3>Security</h3>
            <div className={styles.cFormRow}>
              <label>Access Group</label>
              <div>
                <FormSelectComponent
                  additionalClassName={styles.customFormControl}
                  value={accessGroupKey}
                  height="40px"
                  options={accessGroups}
                  placeholder="Select an access group"
                  onChange={(e) => this.inputField(e, "accessGroupKey")}
                  onKeyDown={this.handleKeyDown}
                />
                {/*authUser.role == "admin" ? (
                  <Fragment>
                    <span className="font-size-13">or</span>
                    <a className="btn btn-light btn-icon">
                      <Icon.Plus size={18} />
                      <label className="font-size-14">Access Group</label>
                    </a>
                  </Fragment>
                ) : null*/}
              </div>
            </div>
            <div className="spacer mt-4 mb-4"></div>
            <div className={styles.appNewMemberPage__buttons}>
              <button
                id="saveMemberButton"
                type="submit"
                className={[
                  "btn btn-primary",
                  styles.btnAppNewMemberPageButtons,
                ].join(" ")}
              >
                Save Member
              </button>
              <Link
                to="/app/members"
                className={[
                  "btn btn-light",
                  styles.btnAppNewMemberPageButtons,
                ].join(" ")}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(NewMember));
