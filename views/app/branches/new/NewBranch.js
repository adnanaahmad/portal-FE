import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, withRouter } from "react-router-dom";
import {
  FormInputComponent,
  FormSelectComponent,
} from "../../../../components";
import {
  setBlockAlertData,
  showAlert,
  showCanvas,
  hideCanvas,
} from "../../../../redux/actions";
import { createBranch } from "../../../../utils/Thunk";
import { cityRegex, streetAddressRegex, aptSuiteNumberRegex } from "../../../../utils/Regex";
import styles from "./new-branch.module.scss";
import Helper from "../../../../utils/Helper";

const mapStateToProps = () => {
  return {};
};

class NewBranch extends Component {
  componentDidMount() {
    const branchNameField = document.getElementById("branchNameField");
    if (branchNameField) {
      branchNameField.focus();
    }

    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const saveBranchButton = this.getSaveBranchButton();
        if (saveBranchButton) {
          saveBranchButton.click();
        }
      }
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      name: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      zip: "",
    };
  }

  getSaveBranchButton() {
    return document.getElementById("saveBranchButton");
  }

  submit = (e) => {
    const saveBranchButton = this.getSaveBranchButton();
    if (saveBranchButton) {
      saveBranchButton.disabled = true;
    }

    e.preventDefault();
    const { name, address_1, address_2, city, state, zip } = this.state;

    if (!name.trim()) {
      this.props.dispatch(showAlert("Please input branch name"));
      if (saveBranchButton) {
        saveBranchButton.disabled = false;
      }
      return;
    }

    if (!address_1.trim()) {
      this.props.dispatch(showAlert("Please input street address"));
      if (saveBranchButton) {
        saveBranchButton.disabled = false;
      }
      return;
    }

    if (!city.trim()) {
      this.props.dispatch(showAlert("Please input city"));
      if (saveBranchButton) {
        saveBranchButton.disabled = false;
      }
      return;
    }

    if (!state.trim()) {
      this.props.dispatch(showAlert("Please input state"));
      if (saveBranchButton) {
        saveBranchButton.disabled = false;
      }
      return;
    }

    if (!zip.trim()) {
      this.props.dispatch(showAlert("Please input zip code"));
      if (saveBranchButton) {
        saveBranchButton.disabled = false;
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
      createBranch(
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
                message: "New Branch has been added.",
                color: "success",
                type: "branch",
              })
            );
          } else {
            if (saveBranchButton) {
              saveBranchButton.disabled = false;
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

  render() {
    const { name, address_1, address_2, city, state, zip } = this.state;
    return (
      <div className={styles.appNewBranchPage}>
        <div className="c-container small">
          <div className="app-page-header">
            <h2>New Branch</h2>
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
                    onChange={(e) => this.inputField(e, "state")}
                    required={true}
                    options={Helper.getStateOptions()}
                    placeholder="Select a State"
                    height="40px"
                    disableAutoComplete
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
            <div className={styles.appNewBranchPage__buttons}>
              <button
                id="saveBranchButton"
                type="submit"
                className={["btn btn-primary", styles.btnAppNewBranchPage].join(
                  " "
                )}
              >
                Save Branch
              </button>
              <Link
                to="/app/branches"
                className={["btn btn-light", styles.btnAppNewBranchPage].join(
                  " "
                )}
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

export default connect(mapStateToProps)(withRouter(NewBranch));
