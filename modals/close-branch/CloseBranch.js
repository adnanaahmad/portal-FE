import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FormInputComponent } from "../../components";
import {
  hideCanvas,
  removeActiveModal,
  setBlockAlertData,
  setCloseBranchData,
  showAlert,
  showCanvas,
} from "../../redux/actions";
import { closeBranch } from "../../utils/Thunk";

import styles from "./close-branch.module.scss";

const mapStateToProps = (state) => {
  return {
    closeBranchData: state.modal.closeBranchData,
  };
};

class CloseBranch extends Component {
  componentDidMount() {
    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.which == 13) {
        const closeBranchButton = this.getCloseBranchButton();
        if (closeBranchButton) {
          closeBranchButton.click();
        }
      }
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      name: "",
    };
  }

  componentWillUnmount() {
    this.props.dispatch(setBlockAlertData({}));
  }

  getCloseBranchButton() {
    return document.getElementById("closeBranchButton");
  }

  closeBranch = (e) => {
    const closeBranchButton = this.getCloseBranchButton();
    if (closeBranchButton) {
      closeBranchButton.disabled = true;
    }

    e.preventDefault();
    const { closeBranchData, history } = this.props;
    const { name } = this.state;
    if (!closeBranchData || !closeBranchData.id) return;

    if (name != closeBranchData.name) {
      this.props.dispatch(showAlert("Please confirm the branch name"));
      if (closeBranchButton) {
        closeBranchButton.disabled = false;
      }
      return;
    }

    this.props.dispatch(
      closeBranch(
        closeBranchData.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(removeActiveModal());
            this.props.dispatch(setCloseBranchData({}));
            history.push("/app/branches");
            this.props.dispatch(
              setBlockAlertData({
                message: `"${closeBranchData.name}" has been closed.`,
                color: "success",
                type: "branch",
              })
            );
          } else {
            if (closeBranchButton) {
              closeBranchButton.disabled = false;
            }
          }
        }
      )
    );
  };

  close = (e) => {
    e.preventDefault();
    this.props.dispatch(removeActiveModal());
    this.props.dispatch(setCloseBranchData({}));
  };

  render() {
    const { closeBranchData } = this.props;
    const { name } = this.state;
    if (!closeBranchData || !closeBranchData.id) return null;

    return (
      <div className={styles.closeBranchModal}>
        <h3>{`Closing "${closeBranchData.name}"`}</h3>
        <p className="mt-4">
          This action will permanently close this branch. There is no undo.
        </p>

        <label className="mt-4 d-block font-weight-700 font-size-13">
          This action will also permanently delete:
        </label>
        <ul>
          <li className="font-size-13">Supervisors at this branch.</li>
          <li className="font-size-13">Loan Officers at this branch.</li>
        </ul>

        <label className="mt-4 d-block font-weight-700 font-size-13">
          This action will not delete:
        </label>
        <ul>
          <li className="font-size-13">Linked applications.</li>
        </ul>

        <label className="mt-4 d-block font-size-13">
          Type <b>Branch Name</b> to confirm. This is case sensitive.
        </label>
        <FormInputComponent
          value={name}
          onChange={(e) => this.setState({ name: e.target.value })}
          type="text"
          height="40px"
        />
        <div className={styles.closeBranchModal__buttons}>
          <button
            id="closeBranchButton"
            className={["btn btn-danger", styles.btnCloseBranchModal].join(" ")}
            onClick={this.closeBranch}
          >
            Close Branch
          </button>
          <a
            className={["btn btn-light", styles.btnCloseBranchModal].join(" ")}
            onClick={this.close}
          >
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(CloseBranch));
