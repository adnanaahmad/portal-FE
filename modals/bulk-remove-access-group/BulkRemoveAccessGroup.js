import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FormInputComponent } from "../../components";
import {
  hideCanvas,
  removeActiveModal,
  setBulkRemoveAccessGroupMembersData,
  setMembersTableStatus,
  showAlert,
  showCanvas,
} from "../../redux/actions";
import { bulkRemoveAccessGroup } from "../../utils/Thunk";

import styles from "./bulk-remove-access-group.module.scss";

const mapStateToProps = (state) => {
  return {
    bulkRemoveAccessGroupMembersData:
      state.modal.bulkRemoveAccessGroupMembersData,
  };
};

class BulkRemoveAccessGroup extends Component {
  componentDidMount() {
    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const removeAccessGroupButton = this.getRemoveAccessGroupButton();
        if (removeAccessGroupButton) {
          removeAccessGroupButton.click();
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

  getRemoveAccessGroupButton() {
    return document.getElementById("removeAccessGroupButton");
  }

  delete = (e) => {
    const removeAccessGroupButton = this.getRemoveAccessGroupButton();
    if (removeAccessGroupButton) {
      removeAccessGroupButton.disabled = true;
    }

    e.preventDefault();
    const { bulkRemoveAccessGroupMembersData } = this.props;
    const { name } = this.state;
    if (
      !bulkRemoveAccessGroupMembersData ||
      !bulkRemoveAccessGroupMembersData.length
    )
      return;

    if (name != "DELETE") {
      this.props.dispatch(showAlert("Please confirm the action"));
      if (removeAccessGroupButton) {
        removeAccessGroupButton.disabled = false;
      }
      return;
    }

    const params = {
      members: bulkRemoveAccessGroupMembersData,
    };

    this.props.dispatch(
      bulkRemoveAccessGroup(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(removeActiveModal());
            this.props.dispatch(setBulkRemoveAccessGroupMembersData([]));
            this.props.dispatch(setMembersTableStatus(true));
          } else {
            if (removeAccessGroupButton) {
              removeAccessGroupButton.disabled = false;
            }
          }
        }
      )
    );
  };

  close = (e) => {
    e.preventDefault();
    this.props.dispatch(removeActiveModal());
    this.props.dispatch(setBulkRemoveAccessGroupMembersData([]));
  };

  render() {
    const { bulkRemoveAccessGroupMembersData } = this.props;
    const { name } = this.state;

    if (
      !bulkRemoveAccessGroupMembersData ||
      !bulkRemoveAccessGroupMembersData.length
    )
      return null;

    return (
      <div className={styles.bulkRemoveAccessGroupModal}>
        <h3>{`Remove Access Group`}</h3>

        <label className="mt-4 d-block font-size-13">
          Type <b>DELETE</b> to confirm
        </label>
        <FormInputComponent
          value={name}
          onChange={(e) => this.setState({ name: e.target.value })}
          type="text"
          height="40px"
        />
        <div className={styles.bulkRemoveAccessGroupModal__buttons}>
          <button
            id="removeAccessGroupButton"
            className={[
              "btn btn-danger",
              styles.btnRemoveAccessGroupModal,
            ].join(" ")}
            onClick={this.delete}
          >
            Remove Access Group
          </button>
          <a
            className={["btn btn-light", styles.btnRemoveAccessGroupModal].join(
              " "
            )}
            onClick={this.close}
          >
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(BulkRemoveAccessGroup));
