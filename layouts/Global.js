/* eslint-disable no-unreachable */
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { GlobalCanvasComponent, PopupAlertComponent } from "../components";
import {
  BulkApplyAccessGroupModal,
  BulkRemoveAccessGroupModal,
  CancelMemberInviteModal,
  CancelNewApplicationModal,
  CancelApplicantsModal,
  ChangePasswordModal,
  CloseBranchModal,
  CustomConfirmModal,
  CustomGeneralModal,
  DeleteAccessGroupModal,
  DeleteApplicantModal,
  DeleteMemberModal,
  ResetMemberPasswordModal,
  RevokeMemberModal,
  StartOverNewApplicationModal,
  TXRecordModal,
  ReloadForNewVersionModal,
  JSONEditorModal,
  SoloApplicantModal,
} from "../modals";
import PersonalIdentifiableInformation from "../modals/personal-identifiable-information/PersonalIdentifiableInformation";
import { hideAlert } from "../redux/actions";
import SuggestedValidation from "../modals/suggested-validation/suggestedValidation";
import OtpMfa from "../modals/otp-mfa/otp-mfa";

const mapStateToProps = (state) => {
  return {
    showAlert: state.global.showAlert,
    showAlertMessage: state.global.showAlertMessage,
    showAlertType: state.global.showAlertType,
    showAlertHorizontal: state.global.showAlertHorizontal,
    showCanvas: state.global.showCanvas,
    authUser: state.global.authUser,
    activeModal: state.global.activeModal,
    activeChildModal: state.global.activeChildModal,
    next: state.global.next,
  };
};

class Global extends Component {
  hideAlert = () => {
    this.props.dispatch(hideAlert());
  };

  renderModal(modal) {
    switch (modal) {
      case "close-branch":
        return <CloseBranchModal />;
      case "change-password":
        return <ChangePasswordModal />;
      case "revoke-member":
        return <RevokeMemberModal />;
      case "reset-member-password":
        return <ResetMemberPasswordModal />;
      case "cancel-member-invite":
        return <CancelMemberInviteModal />;
      case "delete-member":
        return <DeleteMemberModal />;
      case "delete-access-group":
        return <DeleteAccessGroupModal />;
      case "bulk-apply-access-group":
        return <BulkApplyAccessGroupModal />;
      case "bulk-remove-access-group":
        return <BulkRemoveAccessGroupModal />;
      case "start-over-new-application":
        return <StartOverNewApplicationModal />;
      case "cancel-new-application":
        return <CancelNewApplicationModal />;
      case "cancel-applicants":
        return <CancelApplicantsModal />;
      case "delete-applicant":
        return <DeleteApplicantModal />;
      case "solo-applicant":
        return <SoloApplicantModal />;
      case "custom-confirm":
        return <CustomConfirmModal />;
      case "custom-general":
        return <CustomGeneralModal />;
      case "tx-record":
        return <TXRecordModal />;
      case "reload-for-new-version":
        return <ReloadForNewVersionModal />;
      case "json-editor":
        return <JSONEditorModal />;
      case "personal-identifiable-information":
        return <PersonalIdentifiableInformation />;
      case "suggested-validation":
        return <SuggestedValidation />;
      case "otp-mfa":
        return <OtpMfa />;
    }
    return null;
  }

  render() {
    const {
      showCanvas,
      showAlert,
      showAlertMessage,
      showAlertType,
      showAlertHorizontal,
      activeModal,
      activeChildModal,
    } = this.props;

    return (
      <Fragment>
        {showCanvas ? <GlobalCanvasComponent /> : null}

        {activeModal ? (
          <div className="custom-modals">{this.renderModal(activeModal)}</div>
        ) : null}

        {activeChildModal ? (
          <div className="custom-modals">
            {this.renderModal(activeChildModal)}
          </div>
        ) : null}

        <PopupAlertComponent
          onClose={this.hideAlert}
          shown={showAlert}
          message={showAlertMessage}
          type={showAlertType}
          horizontal={showAlertHorizontal}
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps)(Global);
