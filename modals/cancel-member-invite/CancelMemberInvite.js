import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  hideCanvas,
  removeActiveModal,
  setBlockAlertData,
  setCancelInviteMemberData,
  setMembersTableStatus,
  showCanvas,
} from "../../redux/actions";
import { cancelMemberInvite } from "../../utils/Thunk";

import styles from "./cancel-member-invite.module.scss";

const mapStateToProps = (state) => {
  return {
    cancelInviteMemberData: state.modal.cancelInviteMemberData,
  };
};

class ResetMemberPassword extends Component {
  componentDidMount() {
    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const proceedInvitationButton = this.getProceedInvitationButton();
        if (proceedInvitationButton) {
          proceedInvitationButton.click();
        }
      }
    });
  }

  getProceedInvitationButton() {
    return document.getElementById("proceedInvitationButton");
  }

  proceed = (e) => {
    const proceedInvitationButton = this.getProceedInvitationButton();
    if (proceedInvitationButton) {
      proceedInvitationButton.disabled = true;
    }

    e.preventDefault();
    const { cancelInviteMemberData, history } = this.props;
    if (!cancelInviteMemberData || !cancelInviteMemberData.id) return;

    this.props.dispatch(
      cancelMemberInvite(
        cancelInviteMemberData.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(removeActiveModal());
            this.props.dispatch(setCancelInviteMemberData({}));
            this.props.dispatch(
              setBlockAlertData({
                message: `${cancelInviteMemberData.first_name} ${cancelInviteMemberData.last_name} has been cancelled.`,
                color: "success",
                type: "member",
              })
            );
            this.props.dispatch(setMembersTableStatus(true));
            history.push("/app/members");
          } else {
            if (proceedInvitationButton) {
              proceedInvitationButton.disabled = false;
            }
          }
        }
      )
    );
  };

  close = (e) => {
    e.preventDefault();
    this.props.dispatch(removeActiveModal());
    this.props.dispatch(setCancelInviteMemberData({}));
  };

  componentWillUnmount() {
    this.props.dispatch(setBlockAlertData({}));
  }

  render() {
    const { cancelInviteMemberData } = this.props;
    if (!cancelInviteMemberData || !cancelInviteMemberData.id) return null;

    return (
      <div className={styles.cancelMemberInviteModal}>
        <h3>{`Cancel Invite`}</h3>
        <label className="mt-4 mb-3 d-block font-size-13">
          This will cancel the invitation sent to{" "}
          <b>
            {cancelInviteMemberData.first_name}{" "}
            {cancelInviteMemberData.last_name}
          </b>
        </label>
        <div className={styles.cancelMemberInviteModal__buttons}>
          <button
            id="proceedInvitationButton"
            className={[
              "btn btn-primary",
              styles.btnCancelMemberInviteModal,
            ].join(" ")}
            onClick={this.proceed}
          >
            Proceed
          </button>
          <a
            className={[
              "btn btn-light",
              styles.btnCancelMemberInviteModal,
            ].join(" ")}
            onClick={this.close}
          >
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(ResetMemberPassword));
