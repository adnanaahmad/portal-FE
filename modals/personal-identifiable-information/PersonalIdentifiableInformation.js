import moment from "moment";
import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { removeActiveModal } from "../../redux/actions";
import styles from "./personal-identifiable-information.module.scss";
import Helper from "../../utils/Helper";

const mapStateToProps = (state) => {
  return {
    data: state.global.activeModalData,
  };
};

class PersonalIdentifiableInformation extends Component {
    componentDidMount() {}
  
    constructor(props) {
      super(props);
    }

    close = (e) => {
      e.preventDefault();
      const {dispatch} = this.props.data;
      dispatch(removeActiveModal());
    };

    renderPII() {
      const {
        application: {
          personal_information: user,
          residential_address: address,
          created_at,
          purged_at,
        },
        timezone,
        timezone_abbr
      } = this.props.data;
      // use perged_at if it exists otherwise add 336 hours (2 weeks) to created_at date to show purge date
      const purgeDate =
        (!timezone || !timezone_abbr)
          ? null
          : (purged_at ? moment(purged_at) : moment(created_at).add(336, "hours"))
              .tz(timezone)
              .format("M/D/YYYY h:mm A") +
            " " +
            timezone_abbr;
      const purgeLabel = purged_at ? "Purged on" : "Purge Date";
      return (
        <div className="mb-2">
          {!purged_at && (
            <React.Fragment>
              <PersonalInformationBlock
                label={"Full Name"}
                value={
                  user.first_name +
                  " " +
                  (user.middle_name ? user.middle_name + " " : "") +
                  user.last_name
                }
                className={"mb-3"}
              />
              <PersonalInformationBlock
                label={"Verification Code"}
                value={user.existing_application_code}
                className={"mb-3"}
              />
              <PersonalInformationBlock
                label={"Zip Code"}
                value={address.zip}
                className={"mb-3"}
              />
              <DataMaskBlock
                label={"SSN"}
                value={user.ssn}
                className={"mb-3"}
                maskAndFormatData = {() => Helper.maskSSN(user.ssn)}
              />
              <DataMaskBlock
                label={"DOB"}
                value={user.dob}
                className={"mb-3"}
                maskAndFormatData = {() => Helper.maskDOB(user.dob)}
              />
            </React.Fragment>
          )}
          <PersonalInformationBlock label={purgeLabel} value={purgeDate} />
        </div>
      );
    }

    render() {
      return (
        <div className={styles.personalIdentifiableInformationModal}>
          <h3 className="mb-3">Personal Information</h3>
          {this.renderPII()}
          <div className="d-flex justify-content-end">
            <a
            className={"btn btn-light"}
            onClick={this.close}
            >
              Close
            </a>
          </div>
        </div>
      )
    }

}

function PersonalInformationBlock(props) {
  const { label, value, ...rest } = props;
  if (!value) return null;
  return (
    <div {...rest}>
      <label className="d-block font-size-14 mb-1">{label}</label>
      <span className="d-block font-size-13 font-weight-500">{value}</span>
    </div>
  );
}

function DataMaskBlock({ label, value, maskAndFormatData, ...rest }) {
  const [state, setState] = React.useState({ show: false });
  
  const maskedData = React.useMemo(() => {
    return maskAndFormatData(value);
  }, [value, maskAndFormatData]);
  
  if (!value) return null;
  
  const labelClass = 'd-block font-size-14 mb-1';
  const dataClass = 'font-size-13 font-weight-500';

  return (
    <div {...rest}>
      <label className={labelClass}>{label}</label>
      <div>
        <span className={dataClass}>
          {state.show ? maskedData[2] : maskedData[1]}
        </span>
        <a
          className={styles.eyeIcon}
          onClick={() => setState({ ...state, show: !state.show })}
        >
          <img
            src={`/${state.show ? "eye-visible" : "eye-invisible"}.png`}
            alt="visibility"
            width={20}
            height={20}
          />
        </a>
      </div>
    </div>
  );
}

export default connect(mapStateToProps)(withRouter(PersonalIdentifiableInformation));
