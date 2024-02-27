import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FormInputComponent } from "../../components";
import {
  hideCanvas,
  removeActiveModal,
  setBlockAlertData,
  setDeleteMemberData,
  setMembersTableStatus,
  showAlert,
  showCanvas,
} from "../../redux/actions";
import { deleteMember } from "../../utils/Thunk";

import styles from "./delete-member.module.scss";

const mapStateToProps = (state) => {
  return {
    deleteMemberData: state.modal.deleteMemberData,
  };
};

class DeleteMember extends Component {
  componentDidMount() {
    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const deleteMemberButton = this.getDeleteMemberButton();
        if (deleteMemberButton) {
          deleteMemberButton.click();
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

  getDeleteMemberButton() {
    return document.getElementById("deleteMemberButton");
  }

  delete = (e) => {
    const deleteMemberButton = this.getDeleteMemberButton();
    if (deleteMemberButton) {
      deleteMemberButton.disabled = true;
    }

    e.preventDefault();
    const { deleteMemberData, history } = this.props;
    const { name } = this.state;
    if (!deleteMemberData || !deleteMemberData.id) return;

    if (name != "DELETE") {
      this.props.dispatch(showAlert("Please confirm the action"));
      if (deleteMemberButton) {
        deleteMemberButton.disabled = false;
      }
      return;
    }

    this.props.dispatch(
      deleteMember(
        deleteMemberData.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(removeActiveModal());
            this.props.dispatch(setDeleteMemberData({}));
            this.props.dispatch(setMembersTableStatus(true));
            history.push("/app/members");
            this.props.dispatch(
              setBlockAlertData({
                message: `"${deleteMemberData.first_name} ${deleteMemberData.last_name}" access has been deleted.`,
                color: "success",
                type: "member",
              })
            );
          } else {
            if (deleteMemberButton) {
              deleteMemberButton.disabled = false;
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
    this.props.dispatch(setDeleteMemberData({}));
  };

  render() {
    const { deleteMemberData } = this.props;
    const { name } = this.state;
    if (!deleteMemberData || !deleteMemberData.id) return null;

    return (
      <div className={styles.deleteMemberModal}>
        <h3>{`Delete "${deleteMemberData.first_name} ${deleteMemberData.last_name}"`}</h3>
        <p className="mt-4">
          This action will permanently delete this member. There is no undo.
        </p>

        <label className="mt-4 d-block font-size-13">
          Type <b>DELETE</b> to confirm
        </label>
        <FormInputComponent
          value={name}
          onChange={(e) => this.setState({ name: e.target.value })}
          type="text"
          height="40px"
        />
        <div className={styles.deleteMemberModal__buttons}>
          <button
            id="deleteMemberButton"
            className={["btn btn-danger", styles.btnDeleteMemberModal].join(
              " "
            )}
            onClick={this.delete}
          >
            Delete Member
          </button>
          <a
            className={["btn btn-light", styles.btnDeleteMemberModal].join(" ")}
            onClick={this.close}
          >
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(DeleteMember));
