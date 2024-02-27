import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  hideCanvas,
  removeActiveModal,
  setBlockAlertData,
  setBulkApplyAccessGroupMembersData,
  setMembersTableStatus,
  showAlert,
  showCanvas,
} from "../../redux/actions";
import { bulkApplyAccessGroup, getAccessGroups } from "../../utils/Thunk";

import formInputStyles from "../../components/form-control/form-input/form-input.module.scss";
import styles from "./bulk-apply-access-group.module.scss";

const mapStateToProps = (state) => {
  return {
    bulkApplyAccessGroupMembersData:
      state.modal.bulkApplyAccessGroupMembersData,
  };
};

class BulkApplyAccessGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accessGroups: [],
      accessGroupId: 0,
    };
  }

  componentDidMount() {
    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        this.clickOnDefaultButton();
      }
    });
    this.props.dispatch(
      getAccessGroups(
        { returnAll: 1 },
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          const accessGroups = res.accessGroups || [];
          this.setState({ accessGroups });
        }
      )
    );

    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        this.clickOnDefaultButton();
      }
    });
  }

  apply = (e) => {
    const applyAccessGroupButton = this.getApplyAccessGroupButton();
    if (applyAccessGroupButton) {
      applyAccessGroupButton.disabled = true;
    }

    e.preventDefault();
    const { bulkApplyAccessGroupMembersData } = this.props;
    const { accessGroupId } = this.state;

    if (
      !bulkApplyAccessGroupMembersData ||
      !bulkApplyAccessGroupMembersData.length
    )
      return;

    if (!accessGroupId) {
      this.props.dispatch(showAlert("Please select an access group"));
      if (applyAccessGroupButton) {
        applyAccessGroupButton.disabled = false;
      }
      return;
    }

    const params = {
      members: bulkApplyAccessGroupMembersData,
      accessGroupId,
    };

    this.props.dispatch(
      bulkApplyAccessGroup(
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            this.props.dispatch(removeActiveModal());
            this.props.dispatch(setBulkApplyAccessGroupMembersData([]));
            this.props.dispatch(
              setBlockAlertData({
                message: `Access group has been applied.`,
                color: "success",
                type: "member",
              })
            );
            this.props.dispatch(setMembersTableStatus(true));
          } else {
            if (applyAccessGroupButton) {
              applyAccessGroupButton.disabled = false;
            }
          }
        }
      )
    );
  };

  close = (e) => {
    e.preventDefault();
    this.props.dispatch(removeActiveModal());
    this.props.dispatch(setBulkApplyAccessGroupMembersData([]));
  };

  handleKeyDown = (e) => {
    // `Enter` key is pressed
    if (e.keyCode == 13) {
      e.preventDefault();
      this.clickOnDefaultButton();
    }
  };

  getApplyAccessGroupButton() {
    return document.getElementById("applyAccessGroupButton");
  }

  clickOnDefaultButton() {
    const applyAccessGroupButton = this.getApplyAccessGroupButton();
    if (applyAccessGroupButton) {
      applyAccessGroupButton.click();
    }
  }

  componentWillUnmount() {
    this.props.dispatch(setBlockAlertData({}));
  }

  renderOptions() {
    const { accessGroups } = this.state;
    const items = [];

    accessGroups.forEach((accessGroup, index) => {
      items.push(
        <option key={`option_${index}`} value={accessGroup.id}>
          {accessGroup.name}
        </option>
      );
    });

    return items;
  }

  render() {
    const { accessGroupId } = this.state;
    const { bulkApplyAccessGroupMembersData } = this.props;
    if (
      !bulkApplyAccessGroupMembersData ||
      !bulkApplyAccessGroupMembersData.length
    )
      return null;

    return (
      <div className={styles.bulkApplyAccessGroupModal}>
        <h3>{`Apply Access Group to Selected Members`}</h3>
        <p className="font-size-13 mt-3 mb-4">{`These members will have access to FortifID portal from IP address/Range in this Access Group.`}</p>

        <label className="mt-4 d-block">Access Group</label>
        <select
          className={[
            formInputStyles.customFormControl,
            styles.customFormControlSelect,
          ].join(" ")}
          value={accessGroupId}
          onChange={(e) => this.setState({ accessGroupId: e.target.value })}
          onKeyDown={this.handleKeyDown}
        >
          <option value="">Select an access group</option>
          {this.renderOptions()}
        </select>
        <div className={styles.bulkApplyAccessGroupModal__buttons}>
          <button
            id="applyAccessGroupButton"
            className={[
              "btn btn-primary",
              styles.btnApplyAccessGroupModal,
            ].join(" ")}
            onClick={this.apply}
          >
            Apply Access Group
          </button>
          <a
            className={["btn btn-light", styles.btnApplyAccessGroupModal].join(
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

export default connect(mapStateToProps)(withRouter(BulkApplyAccessGroup));
