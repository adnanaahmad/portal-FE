import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { Redirect, Link, withRouter } from "react-router-dom";
import * as Icon from "react-feather";
import { FormInputComponent } from "../../../../components";
import {
  setBlockAlertData,
  showAlert,
  showCanvas,
  hideCanvas,
} from "../../../../redux/actions";
import Helper from "../../../../utils/Helper";
import { getAccessGroupById, updateAccessGroup } from "../../../../utils/Thunk";
import { AppSettingsMenu } from "../../../../layouts";

import styles from "./edit-access-group.module.scss";

// eslint-disable-next-line no-undef
const isCidr = require("is-cidr");

const mapStateToProps = (state) => {
  return {
    authUser: state.global.authUser,
  };
};

class EditAccessGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accessGroupId: 0,
      accessGroup: {},
      name: "",
      ipranges: [
        {
          value: "",
        },
      ],
      pageReloaded: false,
    };
  }

  componentDidMount() {
    const {
      match: { params },
      history,
    } = this.props;

    const accessGroupId = params.accessGroupId;
    this.props.dispatch(
      getAccessGroupById(
        accessGroupId,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res && res.accessGroup && res.accessGroup.id) {
            const accessGroup = res.accessGroup;
            const items = accessGroup.iprange.split(",");
            const ipranges = [];
            if (items && items.length) {
              items.forEach((item) => {
                ipranges.push({
                  value: item,
                });
              });
            }

            if (!ipranges.length) {
              ipranges.push({
                value: "",
              });
            }

            this.setState({
              accessGroup,
              accessGroupId,
              name: accessGroup.name || "",
              ipranges,
            });
          } else history.push("/app/settings/access-groups");
        }
      )
    );

    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const updateAccessGroupButton = this.getUpdateAccessGroupButton();
        if (updateAccessGroupButton) {
          updateAccessGroupButton.click();
        }
      }
    });
  }

  componentDidUpdate() {
    if (!this.state.pageReloaded) {
      const accessGroupNameField = document.getElementById(
        "accessGroupNameField"
      );
      if (accessGroupNameField) {
        accessGroupNameField.focus();
      }

      this.setState({ ["pageReloaded"]: true });
    }
  }

  inputField(e, key) {
    this.setState({ [key]: e.target.value });
  }

  inputRange(e, index) {
    const { ipranges } = this.state;
    if (ipranges && ipranges[index]) {
      ipranges[index] = {
        ...ipranges[index],
        value: e.target.value,
      };
      this.setState({ ipranges });
    }
  }

  addRange = (e) => {
    e.preventDefault();
    const { ipranges } = this.state;
    if (ipranges.length >= 5) {
      this.props.dispatch(showAlert("You cannot add more IP Address / Range"));
      return;
    }

    ipranges[ipranges.length] = {
      value: "",
    };

    this.setState({ ipranges });
  };

  componentWillUnmount() {
    this.props.dispatch(setBlockAlertData({}));
  }

  deleteRange(index) {
    let { ipranges } = this.state;
    if (ipranges.length <= 1) {
      this.props.dispatch(
        showAlert("You need to have at least one IP Address / Range")
      );
      return;
    }

    if (ipranges && ipranges[index]) {
      ipranges.splice(index, 1);
    }

    this.setState({ ipranges });
  }

  renderSidebar() {
    const { accessGroup } = this.state;
    if (!accessGroup.members || !accessGroup.members.length) {
      return (
        <Fragment>
          <label className="d-block font-size-13 font-weight-600">
            {accessGroup.name} has no members
          </label>
          <p className="font-size-13 mt-4">
            Go to <Link to="/app/members">Members</Link> to allow more members
            to this access group
          </p>
        </Fragment>
      );
    }

    const items = [];
    accessGroup.members.forEach((member, index) => {
      items.push(
        <li key={`member_${index}`}>
          {member.first_name} {member.last_name}
        </li>
      );
    });

    return (
      <Fragment>
        <label className="d-block font-size-13 font-weight-600">
          {accessGroup.name} has these members
        </label>
        <ul>{items}</ul>
        <p className="font-size-13 mt-4">
          Go to <Link to="/app/members">Members</Link> to allow more members to
          this access group
        </p>
      </Fragment>
    );
  }

  renderIPRanges() {
    const { ipranges } = this.state;
    const items = [];

    if (ipranges && ipranges.length) {
      ipranges.forEach((iprange, index) => {
        items.push(
          <div key={`iprange_${index}`} className="app-iprange-input-itemWrap">
            <div className="app-iprange-input-item">
              <span onClick={() => this.deleteRange(index)}>
                <Icon.X />
              </span>
              <FormInputComponent
                additionalClassName="custom-form-control"
                name="text"
                value={iprange.value}
                onChange={(e) => this.inputRange(e, index)}
                required={true}
                placeholder="ex: 123.123.234.56"
              />
            </div>
            <div className="spacer"></div>
          </div>
        );
      });
    }

    return items;
  }

  getUpdateAccessGroupButton() {
    return document.getElementById("updateAccessGroupButton");
  }

  submit = (e) => {
    const updateAccessGroupButton = this.getUpdateAccessGroupButton();
    if (updateAccessGroupButton) {
      updateAccessGroupButton.disabled = true;
    }

    e.preventDefault();
    const { accessGroupId, name, ipranges } = this.state;
    if (!ipranges || !ipranges.length) return;

    if (!name.trim()) {
      this.props.dispatch(showAlert("Please input name"));
      if (updateAccessGroupButton) {
        updateAccessGroupButton.disabled = false;
      }
      return;
    }

    const items = [];
    let ipValid = true;
    for (let i in ipranges) {
      if (!ipranges[i].value.trim()) {
        ipValid = false;
        break;
      } else {
        if (
          !isCidr.v4(ipranges[i].value.trim()) &&
          !Helper.validateIPAddress(ipranges[i].value.trim())
        )
          ipValid = false;
        else items.push(ipranges[i].value.trim());
      }
    }

    if (!ipValid) {
      this.props.dispatch(showAlert("Please input valid IP Address / Range"));
      if (updateAccessGroupButton) {
        updateAccessGroupButton.disabled = false;
      }
      return;
    }

    const params = {
      name: name.trim(),
      ipranges: items,
    };

    this.props.dispatch(
      updateAccessGroup(
        accessGroupId,
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          if (res.success) {
            const { history } = this.props;
            history.push("/app/settings/access-groups");
            this.props.dispatch(
              setBlockAlertData({
                message: `${name.trim()} has been updated`,
                color: "success",
                type: "access-group",
              })
            );
          } else {
            if (updateAccessGroupButton) {
              updateAccessGroupButton.disabled = false;
            }
          }
        }
      )
    );
  };

  render() {
    const { authUser } = this.props;
    const { name, accessGroupId, accessGroup } = this.state;
    if (!authUser || !authUser.id || !accessGroupId) return null;
    if (authUser.role != "admin") return <Redirect to="/app" />;

    return (
      <div className={styles.appEditAccessGroupPage}>
        <AppSettingsMenu />
        <div className={["row c-container", styles.cContainer].join(" ")}>
          <div className={["col-md-9", styles.appEditAccessGroupPage__content].join(" ")}>
            <h2>Edit Access Group: {accessGroup.name}</h2>
            <div className="spacer mt-4 mb-4"></div>
            <form action="" method="POST" onSubmit={this.submit}>
              <div className={styles.cFormRow}>
                <label>Name</label>
                <FormInputComponent
                  id="accessGroupNameField"
                  value={name}
                  type="text"
                  onChange={(e) => this.inputField(e, "name")}
                  required={true}
                  height="40px"
                />
              </div>
              <div className="spacer mt-4 mb-4"></div>
              <h3>IP Address or Range</h3>
              <p className="font-size-13 mt-1 mb-3">
                IP addresses should be entered in Classless Inter-Domain Routing
                (CIDR). <b>You may enter up to five (5) IP addresses.</b>
              </p>
              {this.renderIPRanges()}
              <a
                className="btn btn-primary-outline btn-icon"
                onClick={this.addRange}
              >
                <Icon.Plus size={18} />
                <label className="font-size-13 font-weight-500">
                  Add IP Address
                </label>
              </a>
              <div className="spacer mt-4 mb-4"></div>
              <div className={styles.appEditAccessGroupPage__buttons}>
                <button
                  id="updateAccessGroupButton"
                  type="submit"
                  className={[
                    "btn btn-primary",
                    styles.btnAppEditAccessGroupPage,
                  ].join(" ")}
                >
                  Update Access Group
                </button>
                <Link
                  to="/app/settings/access-groups"
                  className={[
                    "btn btn-light",
                    styles.btnAppEditAccessGroupPage,
                  ].join(" ")}
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
          {/* Content End */}
          <div className={["col-md-3", styles.appEditAccessGroupPage__sidebar].join(" ")}>
            {this.renderSidebar()}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(EditAccessGroup));
