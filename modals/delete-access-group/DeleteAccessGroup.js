import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FormInputComponent } from "../../components";
import {
  hideCanvas,
  removeActiveModal,
  setAccessGroupsTableStatus,
  setBlockAlertData,
  setDeleteAccessGroupData,
  showAlert,
  showCanvas,
} from "../../redux/actions";
import { deleteAccessGroup } from "../../utils/Thunk";

import styles from "./delete-access-group.module.scss";

const mapStateToProps = (state) => {
  return {
    deleteAccessGroupData: state.modal.deleteAccessGroupData,
  };
};

class DeleteAccessGroup extends Component {
  componentDidMount() {
    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.which == 13) {
        const deleteAccessGroupButton = this.getDeleteAccessGroupButton();
        if (deleteAccessGroupButton) {
          deleteAccessGroupButton.click();
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

  getDeleteAccessGroupButton() {
    return document.getElementById("deleteAccessGroupButton");
  }

  delete = (e) => {
    const deleteAccessGroupButton = this.getDeleteAccessGroupButton();
    if (deleteAccessGroupButton) {
      deleteAccessGroupButton.disabled = true;
    }

    e.preventDefault();
    const { deleteAccessGroupData, history } = this.props;
    const { name } = this.state;
    if (!deleteAccessGroupData || !deleteAccessGroupData.id) return;

    if (name != "DELETE") {
      this.props.dispatch(showAlert("Please confirm the action"));
      if (deleteAccessGroupButton) {
        deleteAccessGroupButton.disabled = false;
      }
      return;
    }

    this.props.dispatch(
      deleteAccessGroup(
        deleteAccessGroupData.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(removeActiveModal());
            this.props.dispatch(setDeleteAccessGroupData({}));
            this.props.dispatch(
              setBlockAlertData({
                message: `${deleteAccessGroupData.name} has been deleted.`,
                color: "success",
                type: "access-group",
              })
            );
            this.props.dispatch(setAccessGroupsTableStatus(true));
            history.push("/app/settings/access-groups");
          } else {
            if (deleteAccessGroupButton) {
              deleteAccessGroupButton.disabled = false;
            }
          }
        }
      )
    );
  };

  componentWillUnmount() {
    this.props.dispatch(setBlockAlertData({}));
  }

  close = (e) => {
    e.preventDefault();
    this.props.dispatch(removeActiveModal());
    this.props.dispatch(setDeleteAccessGroupData({}));
  };

  render() {
    const { deleteAccessGroupData } = this.props;
    const { name } = this.state;
    if (!deleteAccessGroupData || !deleteAccessGroupData.id) return null;

    return (
      <div className={styles.deleteAccessGroupModal}>
        <h3>{`Delete "${deleteAccessGroupData.name}" Access Group`}</h3>

        <label className="mt-4 d-block font-size-13">
          Type <b>DELETE</b> to confirm
        </label>
        <FormInputComponent
          value={name}
          onChange={(e) => this.setState({ name: e.target.value })}
          type="text"
          height="40px"
        />
        <div className={styles.deleteAccessGroupModal__buttons}>
          <button
            id="deleteAccessGroupButton"
            className={[
              "btn btn-danger",
              styles.btnDeleteAccessGroupModal,
            ].join(" ")}
            onClick={this.delete}
          >
            Delete Access Group
          </button>
          <a
            className={["btn btn-light", styles.btnDeleteAccessGroupModal].join(
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

export default connect(mapStateToProps)(withRouter(DeleteAccessGroup));
