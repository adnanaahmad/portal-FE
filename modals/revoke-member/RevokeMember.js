import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FormInputComponent } from "../../components";
import {
  hideCanvas,
  removeActiveModal,
  setBlockAlertData,
  setMembersTableStatus,
  setRevokeMemberData,
  showAlert,
  showCanvas,
} from "../../redux/actions";
import { revokeMember } from "../../utils/Thunk";

import styles from "./revoke-member.module.scss";

const mapStateToProps = (state) => {
  return {
    revokeMemberData: state.modal.revokeMemberData,
  };
};

class RevokeMember extends Component {
  componentDidMount() {
    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.which == 13) {
        const revokeAccessButton = this.getRevokeAccessButton();
        if (revokeAccessButton) {
          revokeAccessButton.click();
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

  getRevokeAccessButton() {
    return document.getElementById("revokeAccessButton");
  }

  revoke = (e) => {
    const revokeAccessButton = this.getRevokeAccessButton();
    if (revokeAccessButton) {
      revokeAccessButton.disabled = true;
    }

    e.preventDefault();
    const { revokeMemberData, history } = this.props;
    const { name } = this.state;
    if (!revokeMemberData || !revokeMemberData.id) return;

    if (name != "REVOKE") {
      this.props.dispatch(showAlert("Please confirm the action"));
      if (revokeAccessButton) {
        revokeAccessButton.disabled = false;
      }
      return;
    }

    this.props.dispatch(
      revokeMember(
        revokeMemberData.id,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(removeActiveModal());
            this.props.dispatch(setRevokeMemberData({}));
            this.props.dispatch(setMembersTableStatus(true));
            history.push("/app/members");
            this.props.dispatch(
              setBlockAlertData({
                message: `"${revokeMemberData.first_name} ${revokeMemberData.last_name}" access has been revoked.`,
                color: "success",
                type: "member",
              })
            );
          } else {
            if (revokeAccessButton) {
              revokeAccessButton.disabled = false;
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
    this.props.dispatch(setRevokeMemberData({}));
  };

  render() {
    const { revokeMemberData } = this.props;
    const { name } = this.state;
    if (!revokeMemberData || !revokeMemberData.id) return null;

    return (
      <div className={styles.revokeMemberModal}>
        <h3>{`Revoke "${revokeMemberData.first_name} ${revokeMemberData.last_name}" Access`}</h3>
        <p className="mt-4">
          This member will no longer have access to FortifID portal.
        </p>

        <label className="mt-4 d-block font-size-13">
          Type <b>REVOKE</b> to confirm
        </label>
        <FormInputComponent
          value={name}
          onChange={(e) => this.setState({ name: e.target.value })}
          type="text"
          height="40px"
        />
        <div className={styles.revokeMemberModal__buttons}>
          <button
            id="revokeAccessButton"
            className={["btn btn-danger", styles.btnRevokeMemberModal].join(
              " "
            )}
            onClick={this.revoke}
          >
            Revoke Access
          </button>
          <a
            className={["btn btn-light", styles.btnRevokeMemberModal].join(" ")}
            onClick={this.close}
          >
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(RevokeMember));
