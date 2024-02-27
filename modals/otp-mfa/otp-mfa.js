import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import {
  hideCanvas,
  removeActiveChildModal,
  showAlert,
  showCanvas,
} from "../../redux/actions";
import styles from "./otp-mfa.module.scss";
import { FormInputComponent } from "../../components";
import { sendOTP } from "../../utils/Thunk";

const mapStateToProps = (state) => {
  return {
    OTPModalData: state.modal.OTPModalData,
  };
};

class OtpMfa extends Component {
  constructor(props) {
    super(props);
    this.state = {
      otp: "",
    };
  }
  componentDidMount() {
    //console.log(this.props.OTPModalData);
  }

  close = (e) => {
    e.preventDefault();
    const { dispatch } = this.props;
    dispatch(removeActiveChildModal());
  };

  submit = (e) => {
    e.preventDefault();
    const { id } = this.props.OTPModalData;
    const { otp } = this.state;
    const params = {
      otp_code: otp,
    };

    if (!otp) {
      this.props.dispatch(showAlert("Please input OTP"));
      return;
    }

    this.props.dispatch(
      sendOTP(
        id,
        params,
        () => {
          this.props.dispatch(showCanvas());
        },
        (res) => {
          this.props.dispatch(hideCanvas());
          const { dispatch } = this.props;
          if (res.success) {
            dispatch(removeActiveChildModal());
          }
        }
      )
    );
  };

  render() {
    const { otp } = this.state;
    return (
      <div className={styles.otpModal}>
        <h3 className="mb-3">Enter OTP Code</h3>

        <div className="mb-4">
          <label className="d-block mt-4 mb-1">OTP</label>
          <FormInputComponent
            type="text"
            value={otp}
            onChange={(e) => this.setState({ otp: e.target.value })}
            maxLength={"6"}
          />
        </div>

        <div className="d-flex justify-content-end">
          <a
            className={"btn btn-primary " + styles.verify}
            onClick={this.submit}
          >
            Verify OTP
          </a>
          <a className={"btn btn-light"} onClick={this.close}>
            Close
          </a>
        </div>
      </div>
    );
  }
}
export default connect(mapStateToProps)(withRouter(OtpMfa));
