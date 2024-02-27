/* eslint-disable no-undef */
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FormInputComponent } from "../../components";
import {
  setCustomGeneralModalData,
  showAlert,
  removeActiveModal,
  removeActiveChildModal
} from "../../redux/actions";
import Helper from "../../utils/Helper";

import styles from "./custom-general.module.scss";
import { BUILD_TYPE } from "../../utils/Constant";

const mapStateToProps = (state) => {
  return {
    customGeneralModalData: state.modal.customGeneralModalData,
    buildType: state.global.buildType
  };
};

class CustomGeneral extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phone: "",
      email: "",
    };
  }

  componentDidMount() {
    const { customGeneralModalData } = this.props;
    // Phone
    if (
      customGeneralModalData &&
      ["update-phone", "update-doc-phone", "update-income-phone"].includes(
        customGeneralModalData.action
      )
    ) {
      this.setState({
        phone:
          customGeneralModalData.data && customGeneralModalData.data.phone
            ? customGeneralModalData.data.phone
            : "",
      });
    }

    // Email
    if (
      customGeneralModalData &&
      ["update-income-email"].includes(customGeneralModalData.action)
    ) {
      this.setState({
        email:
          customGeneralModalData.data && customGeneralModalData.data.email
            ? customGeneralModalData.data.email
            : "",
      });
    }

    document.addEventListener("keypress", (e) => {
      // `Enter` key is pressed
      if (e.keyCode == 13) {
        const changePhoneNumberButton = document.getElementById(
          "changePhoneNumberButton"
        );
        if (changePhoneNumberButton) {
          changePhoneNumberButton.click();
        }
      }
    });
  }

  clickOK = (e) => {
    e.preventDefault();
    let { customGeneralModalData } = this.props;
    const { phone, email } = this.state;

    // Phone
    if (
      customGeneralModalData &&
      ["update-phone", "update-doc-phone", "update-income-phone"].includes(
        customGeneralModalData.action
      )
    ) {
      if (!phone) {
        this.props.dispatch(showAlert("Please input phone number"));
        return;
      }
      if(!Helper.validatePhoneNumber(phone)){
        this.props.dispatch(showAlert("Please input valid phone number"));
        return;
      }

      customGeneralModalData = {
        ...customGeneralModalData,
        returnData: {
          phone,
        },
      };
      this.props.dispatch(setCustomGeneralModalData(customGeneralModalData));
    }

    // Email
    if (
      customGeneralModalData &&
      ["update-income-email"].includes(customGeneralModalData.action)
    ) {
      if (!email || !Helper.validateEmail(email)) {
        this.props.dispatch(showAlert("Please input valid email address"));
        return;
      }

      customGeneralModalData = {
        ...customGeneralModalData,
        returnData: {
          email,
        },
      };
      this.props.dispatch(setCustomGeneralModalData(customGeneralModalData));
    }

    this.closeModal();
  };

  closeModal() {
    const { buildType } = this.props;
    if (buildType === BUILD_TYPE.FUTURE_FAMILY) {
      this.props.dispatch(removeActiveChildModal());
    } else {
      this.props.dispatch(removeActiveModal());
    }
  }

  clickClose = (e) => {
    e.preventDefault();
    this.closeModal();
  };

  inputField = (e, key) => {
    this.setState({ [key]: e.target.value });
  };

  render() {
    const { customGeneralModalData } = this.props;
    const { phone, email } = this.state;
    if (JSON.stringify(customGeneralModalData) == "{}") return null;

    return (
      <div className={styles.customGeneralModal}>
        {customGeneralModalData.title ? (
          <h3>{customGeneralModalData.title}</h3>
        ) : null}
        {customGeneralModalData.body ? (
          <p className="mt-4">{customGeneralModalData.body}</p>
        ) : null}

        {["update-phone", "update-doc-phone", "update-income-phone"].includes(
          customGeneralModalData.action
        ) ? (
          <div className={styles.cFormRow}>
            <label className="d-block mt-4 mb-1">Phone Number</label>
            <FormInputComponent
              type="text"
              value={phone}
              onChange={(e) => this.inputField(e, "phone")}
              pattern="^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$"
              placeholder="(xxx) xxx-xxxx"
            />
          </div>
        ) : null}

        {["update-income-email"].includes(customGeneralModalData.action) ? (
          <div className={styles.cFormRow}>
            <label className="d-block mt-4 mb-1">Email Address</label>
            <FormInputComponent
              type="text"
              value={email}
              onChange={(e) => this.inputField(e, "email")}
            />
          </div>
        ) : null}
        <div className={styles.customGeneralModal__buttons}>
          <a
            id="changePhoneNumberButton"
            className={["btn btn-primary", styles.btnCustomGeneralModal].join(
              " "
            )}
            onClick={this.clickOK}
          >
            Submit
          </a>
          <a
            className={["btn btn-light", styles.btnCustomGeneralModal].join(
              " "
            )}
            onClick={this.clickClose}
          >
            Cancel
          </a>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(withRouter(CustomGeneral));
