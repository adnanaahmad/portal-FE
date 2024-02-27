import API from "./API";
import { saveUser, showAlert } from "../redux/actions";
import Helper from "./Helper";

// Send Reset Email
export function sendResetEmail(email, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.sendResetEmail(email).then((res) => {
      if (res.success)
        dispatch(
          showAlert("We have emailed your password reset link", "success")
        );
      else {
        dispatch(showAlert(res.message));
      }
      if (completion) completion(res);
    });
  };
}

// Login
export function login(email, password, loginFrom, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.login(email, password, loginFrom).then((res) => {
      if (!res.success) dispatch(showAlert(res.message, "warning", "center"));
      if (completion) completion(res);
      if (res.success && res.user) {
        const userData = res.user;
        Helper.storeUser(userData);
        dispatch(saveUser(userData));
      }
    });
  };
}

// Register
export function register(params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.register(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message, "warning", "center"));
      if (completion) completion(res);
    });
  };
}

// Get Invitation Data
export function getInvitationData(code, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.getInvitationData(code).then((res) => {
      if (!res.success) dispatch(showAlert(res.message, "warning", "center"));
      if (completion) completion(res);
    });
  };
}

// Finish Invitation
export function finishInvitation(params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.finishInvitation(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
      if (res.success && res.user) {
        const userData = res.user;
        Helper.storeUser(userData);
        dispatch(saveUser(userData));
      }
    });
  };
}

// Get Me
export function getMe(start, completion, returnOnly = false) {
  return function (dispatch) {
    if (start) start();
    API.getMe().then((res) => {
      if (!returnOnly && res.me) {
        let userData = Helper.fetchUser();
        if (userData && userData.id) {
          userData = {
            ...res.me,
            accessTokenAPI: userData.accessTokenAPI,
          };

          Helper.storeUser(userData);
          dispatch(saveUser(userData));
        }
      }
      if (completion) completion(res);
    });
  };
}

// Check Two FA Code - Common
export function checkTwoFACode(code, hash, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.checkTwoFACode(code, hash).then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        if (res.user) {
          const userData = res.user;
          Helper.storeUser(userData);
          dispatch(saveUser(userData));
        }
        if (completion) completion(res);
      }
    });
  };
}

// Enable Two FA - Common
export function enableTwoFA(start, completion) {
  return function (dispatch) {
    if (start) start();
    API.enableTwoFA().then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Disable Two FA - Common
export function disableTwoFA(start, completion) {
  return function (dispatch) {
    if (start) start();
    API.disableTwoFA().then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Change Password - Common
export function changePassword(params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.changePassword(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Update Settings - Admin
export function updateSettings(params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.updateSettings(params).then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Update Profile - Common
export function updateProfile(params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.updateProfile(params).then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Resend Invite Member - Admin
export function resendInviteMember(memberId, params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.resendInviteMember(memberId, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Invite Member - Admin
export function inviteMember(params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.inviteMember(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Create Application - Supervisor & Loan Officer
export function createApplication(params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.createApplication(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

export function editApplication(params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.editApplication(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

export function deleteApplication(params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.deleteApplication(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

export function submitApplication(params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.submitApplication(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Do DirectID
export function doDirectID(applicationId, params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.doDirectID(applicationId, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Check DirectID
export function checkDirectID(applicationId, start, completion) {
  return function () {
    if (start) start();
    API.checkDirectID(applicationId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Bypass DirectID
export function bypassDirectID(applicationId, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.bypassDirectID(applicationId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Cancel Income Insights
export function cancelIncomeInsights(applicationId, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.cancelIncomeInsights(applicationId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Reset Business Insights
export function resetBusinessInsights(applicationId, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.resetBusinessInsights(applicationId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Reset Income Insights
export function resetIncomeInsights(applicationId, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.resetIncomeInsights(applicationId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Run Application Consumer Insights - Supervisor & Loan Officer
export function runConsumerInsights(applicationId, reset, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.runConsumerInsights(applicationId, reset).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Run Application Income Insights - Supervisor & Loan Officer
export function runIncomeInsights(applicationId, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.runIncomeInsights(applicationId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Run Application Business Insights - Supervisor & Loan Officer
export function runBusinessInsights(applicationId, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.runBusinessInsights(applicationId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Run Doc Verify - Supervisor & Loan Officer
export function runDocVerify(applicationId, params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.runDocVerify(applicationId, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Cancel MFA - Supervisor & Loan Officer
export function cancelMFA(applicationId, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.cancelMFA(applicationId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

export function cancelMFAEmail(applicationId, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.cancelMFAEmail(applicationId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Cancel Doc Verify - Supervisor & Loan Officer
export function cancelDocVerify(applicationId, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.cancelDocVerify(applicationId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Check Doc Verify - Supervisor & Loan Officer
export function checkDocVerify(applicationId, start, completion) {
  return function () {
    if (start) start();
    API.checkDocVerify(applicationId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Run MFA - Supervisor & Loan Officer
export function runMFA(applicationId, params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.runMFA(applicationId, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

export function runMFAEmail(applicationId, params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.runMFAEmail(applicationId, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

export function sendOTP(applicationId, params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.sendOTP(applicationId, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Check MFA - Supervisor & Loan Officer
export function checkMFA(applicationId, start, completion) {
  return function () {
    if (start) start();
    API.checkMFA(applicationId).then((res) => {
      if (completion) completion(res);
    });
  };
}

export function checkMFAEmail(applicationId, start, completion) {
  return function () {
    if (start) start();
    API.checkMFAEmail(applicationId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Create Access Group - Admin
export function createAccessGroup(params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.createAccessGroup(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Update Access Group - Admin
export function updateAccessGroup(accessGroupId, params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.updateAccessGroup(accessGroupId, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Delete Access Group - Admin
export function deleteAccessGroup(accessGroupId, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.deleteAccessGroup(accessGroupId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Create Branch - Admin
export function createBranch(params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.createBranch(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Update Branch - Admin
export function updateBranch(branchId, params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.updateBranch(branchId, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Reset Password - All
export function resetPassword(params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.resetPassword(params).then((res) => {
      if (res.success)
        dispatch(
          showAlert("You've successfully reset your password.", "success")
        );
      else dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Reset Member Password - Admin & Supervisor
export function resetMemberPassword(memberId, params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.resetMemberPassword(memberId, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Cancel Member Invite - Admin & Supervisor
export function cancelMemberInvite(memberId, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.cancelMemberInvite(memberId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Update Member - Admin & Supervisor
export function updateMember(memberId, params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.updateMember(memberId, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Restore Member - Admin & Supervisor
export function restoreMember(memberId, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.restoreMember(memberId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Delete Member - Admin & Supervisor
export function deleteMember(memberId, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.deleteMember(memberId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Revoke Member - Admin & Supervisor
export function revokeMember(memberId, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.revokeMember(memberId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Close Branch - Admin
export function closeBranch(branchId, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.closeBranch(branchId).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Bulk Apply Access Group - Admin & Supervisor
export function bulkApplyAccessGroup(params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.bulkApplyAccessGroup(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Bulk Remove Access Group - Admin & Supervisor
export function bulkRemoveAccessGroup(params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.bulkRemoveAccessGroup(params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}

// Get Demo Setting - Supervisor & Loan Officer
export function getDemoSetting(start, completion) {
  return function () {
    if (start) start();
    API.getDemoSetting().then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Applications - Supervisor & Loan Officer
export function getApplications(params, start, completion) {
  return function () {
    if (start) start();
    API.getApplications(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Access Groups - Admin & Supervisor
export function getAccessGroups(params, start, completion) {
  return function () {
    if (start) start();
    API.getAccessGroups(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Access Group By Id - Admin
export function getAccessGroupById(accessGroupId, start, completion) {
  return function () {
    if (start) start();
    API.getAccessGroupById(accessGroupId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Application By Id - Supervisor & Loan Officer
export function getApplicationById(applicationId, start, completion) {
  return function () {
    if (start) start();
    API.getApplicationById(applicationId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Application By App Id - Supervisor & Loan Officer
export function getApplicationByAppId(appId, start, completion) {
  return function () {
    if (start) start();
    API.getApplicationByAppId(appId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Activity Log - Admin & Supervisor
export function getActivityLog(params, start, completion) {
  return function () {
    if (start) start();
    API.getActivityLog(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Card Info - Admin & Supervisor
export function getCardInfo(params, start, completion) {
  return function () {
    if (start) start();
    API.getCardInfo(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Card Info - All Roles
export function getGraphInfo(params, start, completion) {
  return function () {
    if (start) start();
    API.getGraphInfo(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Members - Admin & Supervisor
export function getMembers(params, start, completion) {
  return function () {
    if (start) start();
    API.getMembers(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Member By Id - Admin & Supervisor
export function getMemberById(memberId, start, completion) {
  return function () {
    if (start) start();
    API.getMemberById(memberId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Members By Branch - Admin & Supervisor
export function getMembersByBranch(branchId, start, completion) {
  return function () {
    if (start) start();
    API.getMembersByBranch(branchId).then((res) => {
      if (completion) completion(res);
    });
  };
}

export function getConfig(config, start, completion) {
  return function () {
    if (start) start();
    API.getConfig(config).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Branches - Admin
export function getBranches(params, start, completion) {
  return function () {
    if (start) start();
    API.getBranches(params).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Get Branch By Id - Admin
export function getBranchById(branchId, start, completion) {
  return function () {
    if (start) start();
    API.getBranchById(branchId).then((res) => {
      if (completion) completion(res);
    });
  };
}

// Upload File
export function uploadFile(formData, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.uploadFile(formData).then((res) => {
      if (!res.success) {
        dispatch(showAlert(res.message));
        if (completion) completion(res);
      } else {
        dispatch(
          getMe(
            () => {},
            () => {
              if (completion) completion(res);
            }
          )
        );
      }
    });
  };
}

// Update App Decision
export function updateAppDecision(appId, params, start, completion) {
  return function (dispatch) {
    if (start) start();
    API.updateAppDecision(appId, params).then((res) => {
      if (!res.success) dispatch(showAlert(res.message));
      if (completion) completion(res);
    });
  };
}
