import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import { FormInputComponent, FormSelectComponent } from "../../../../components";
import {
  showCanvas,
  hideCanvas,
  showAlert,
  setBlockAlertData,
  setActiveModal,
  setCloseBranchData,
} from "../../../../redux/actions";
import { getBranchById, updateBranch } from "../../../../utils/Thunk";
import { cityRegex, stateRegex, streetAddressRegex, aptSuiteNumberRegex } from "../../../../utils/Regex";
import styles from "./edit-branch.module.scss";
import Helper from "../../../../utils/Helper";

const mapStateToProps = () => {
  return {};
};

class EditBranch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      branchId: 0,
      branch: {},
      name: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      zip: "",
      supervisors: [],
      pageReloaded: false,
    };
  }

  componentDidMount() {
    const {
      match: { params },
      history,
    } = this.props;

    const branchId = params.branchId;
    this.props.dispatch(
      getBranchById(
        branchId,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.branch && res.branch.id) {
            // Init Values
            const branch = res.branch;
            this.setState({
              branch,
              branchId: branch.id,
              name: branch.name || "",
              address_1: branch.address_1 || "",
              address_2: branch.address_2 || "",
              city: branch.city || "",
              state: branch.state || "",
              zip: branch.zip || "",
              supervisors: branch.supervisors || [],
            });
          } else history.push("/app/branches");
        }
      )
    );

    document.addEventListener("keypress", (e) => {
      const isModalOpen =
        document.getElementsByClassName("custom-modals").length > 0 ? 1 : 0;

      // `Enter` key is pressed
      if (e.keyCode == 13 && !isModalOpen) {
        const updateBranchButton = this.getUpdateBranchButton();
        if (updateBranchButton) {
          updateBranchButton.click();
        }
      }
    });
  }

  componentDidUpdate() {
    if (!this.state.pageReloaded) {
      const branchNameField = document.getElementById("branchNameField");
      if (branchNameField) {
        branchNameField.focus();
      }

      this.setState({ ["pageReloaded"]: true });
    }
  }

  closeBranch = (e) => {
    const { branch } = this.state;
    e.preventDefault();
    this.props.dispatch(setActiveModal("close-branch"));
    this.props.dispatch(setCloseBranchData(branch));
  };

  getUpdateBranchButton() {
    return document.getElementById("updateBranchButton");
  }

  submit = (e) => {
    const updateBranchButton = this.getUpdateBranchButton();
    if (updateBranchButton) {
      updateBranchButton.disabled = true;
    }

    e.preventDefault();
    const { branchId, name, address_1, address_2, city, state, zip } =
      this.state;

    if (!branchId) return;

    if (!name.trim()) {
      this.props.dispatch(showAlert("Please input branch name"));
      if (updateBranchButton) {
        updateBranchButton.disabled = false;
      }
      return;
    }

    if (!address_1.trim()) {
      this.props.dispatch(showAlert("Please input street address"));
      if (updateBranchButton) {
        updateBranchButton.disabled = false;
      }
      return;
    }

    if (!city.trim()) {
      this.props.dispatch(showAlert("Please input city"));
      if (updateBranchButton) {
        updateBranchButton.disabled = false;
      }
      return;
    }

    if (!state.trim()) {
      this.props.dispatch(showAlert("Please input state"));
      if (updateBranchButton) {
        updateBranchButton.disabled = false;
      }
      return;
    }

    if (!zip.trim()) {
      this.props.dispatch(showAlert("Please input zip code"));
      if (updateBranchButton) {
        updateBranchButton.disabled = false;
      }
      return;
    }

    const params = {
      name,
      address_1,
      address_2,
      city,
      state,
      zip,
    };

    this.props.dispatch(
      updateBranch(
        branchId,
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            const { history } = this.props;
            history.push("/app/branches");
            this.props.dispatch(
              setBlockAlertData({
                message: `Changes to "${name}" has been saved.`,
                color: "success",
                type: "branch",
              })
            );
          } else {
            if (updateBranchButton) {
              updateBranchButton.disabled = false;
            }
          }
        }
      )
    );
  };

  componentWillUnmount() {
    this.props.dispatch(setBlockAlertData({}));
  }

  inputField(e, key) {
    this.setState({ [key]: e.target.value });
  }

  renderSidebar() {
    const { supervisors, branchId, branch } = this.state;
    if (!supervisors || !supervisors.length) {
      return (
        <Fragment>
          <p>There are no supervisor at Rule</p>
          <Link to={`/app/member/new?branchId=${branchId}&role=supervisor`}>
            <Icon.Plus size={16} />
            <label>Add Supervisor</label>
          </Link>
        </Fragment>
      );
    }

    const names = [];
    supervisors.forEach((supervisor) => {
      names.push(supervisor.first_name + " " + supervisor.last_name);
    });

    return (
      <Fragment>
        <p className="word-break-all">Supervisor at {branch.name}</p>
        <label>{names.join(", ")}</label>
        <Link to={`/app/member/new?branchId=${branchId}&role=supervisor`}>
          <Icon.Plus size={16} />
          <label>Add Supervisor</label>
        </Link>
      </Fragment>
    );
  }

  render() {
    const { branchId, name, address_1, address_2, city, state, zip } =
      this.state;

    if (!branchId) return null;

    return (
      <div className={styles.appEditBranchPage}>
        <div className={["row c-container", styles.cContainer].join(" ")}>
          <div className={["col-md-9", styles.appEditBranchPage__content].join(" ")}>
            <div className="app-page-header">
              <h2 className="word-break-all">Edit Branch: {name}</h2>
            </div>

            <form action="" method="POST" onSubmit={this.submit}>
              <h3 className="mt-4 mb-3">Branch Information</h3>
              <div className={styles.cFormRow}>
                <label>Branch Name</label>
                <FormInputComponent
                  id="branchNameField"
                  value={name}
                  required={true}
                  onChange={(e) => this.inputField(e, "name")}
                  type="text"
                  height="40px"
                  maxLength={64}
                />
              </div>
              <div className="spacer"></div>
              <h3 className="mt-4 mb-3">Address</h3>
              <div className="row">
                <div className="col-md-8">
                  <div className={styles.cFormRow}>
                    <label>Street Address</label>
                    <FormInputComponent
                      value={address_1}
                      required={true}
                      onChange={(e) => this.inputField(e, "address_1")}
                      type="text"
                      height="40px"
                      pattern={streetAddressRegex.source}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className={styles.cFormRow}>
                    <label>Suite, Unit, Floor, etc.</label>
                    <FormInputComponent
                      value={address_2}
                      onChange={(e) => this.inputField(e, "address_2")}
                      type="text"
                      height="40px"
                      pattern={aptSuiteNumberRegex.source}
                    />
                    <span>Optional</span>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-5">
                  <div className={styles.cFormRow}>
                    <label>City</label>
                    <FormInputComponent
                      value={city}
                      required={true}
                      onChange={(e) => this.inputField(e, "city")}
                      type="text"
                      height="40px"
                      pattern={cityRegex.source}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className={styles.cFormRow}>
                    <label>State</label>
                    <FormSelectComponent
                      value={state}
                      required={true}
                      onChange={(e) => this.inputField(e, "state")}
                      options={Helper.getStateOptions()}
                      placeholder="Select a State"
                      height="40px"
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className={styles.cFormRow}>
                    <label>ZIP Code</label>
                    <FormInputComponent
                      value={zip}
                      required={true}
                      onChange={(e) => this.inputField(e, "zip")}
                      type="text"
                      height="40px"
                      pattern="^[0-9]{5}$"
                    />
                  </div>
                </div>
              </div>
              <div className={styles.appEditBranchPage__buttons}>
                <button
                  id="updateBranchButton"
                  type="submit"
                  className="btn btn-primary"
                >
                  Update Branch
                </button>
                <Link to="/app/branches" className="btn btn-light">
                  Cancel
                </Link>
                <a
                  className={[
                    "btn btn-danger-outline",
                    styles.btnAppEditBranchPage,
                  ].join(" ")}
                  onClick={this.closeBranch}
                >
                  Close Branch
                </a>
              </div>
            </form>
          </div>
          <div className={["col-md-3", styles.appEditBranchPage__sidebar].join(" ")}>
            {this.renderSidebar()}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(EditBranch));
