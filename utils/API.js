/* eslint-disable no-undef */
/* global require */
import Helper from "./Helper";

const axios = require("axios");

const sendRequest = (
  url,
  params = {},
  method = "POST",
  requireAuth = false
) => {
  let headers = { "Content-Type": "application/json" };
  const userData = Helper.fetchUser();
  if (requireAuth) {
    const accessToken = userData.accessTokenAPI || "";

    headers = {
      ...headers,
      Authorization: `Bearer ${accessToken}`,
    };
  }

  // eslint-disable-next-line no-undef
  let apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL + "api" + url;
  if (method == "GET") {
    const urlParams = [];
    for (let key in params) {
      if (key && params[key]) {
        urlParams.push(`${key}=${encodeURIComponent(params[key])}`);
      }
    }
    if (urlParams.length) {
      apiUrl += `?${urlParams.join("&")}`;
    }
  }

  return new Promise((resolve) => {
    axios({
      method,
      headers,
      data: JSON.stringify(params),
      url: apiUrl,
    })
      .then((res) => {
        if (res.data) {
          let data = res.data;

          if (!data.success && !data.message) {
            data = {
              ...data,
              message: "Please try again later",
            };
          }

          resolve(data);
        } else {
          resolve({
            success: false,
            message: "Please try again later",
          });
        }
      })
      .catch((err) => {
        // Needs to login again
        let status = 0;
        let message = "Please try again later";
        if (err.response) {
          const response = err.response;
          if (response.status) {
            status = response.status;
          }
          const data = response.data;
          if (data && data.message) {
            message = data.message;
          }
        }

        if (status === 401 && userData && userData.id) {
          Helper.removeUser();
          Helper.removeAppType();
          Helper.storeUser({});
          if (document) {
            document.location.href = "/";
          }
          //this.props.dispatch(saveUser({}));
        }

        resolve({
          success: false,
          message: message,
        });
      });
  });
};

class API {
  // Send Reset Email
  static sendResetEmail(email) {
    const params = {
      email,
      url: process.env.NEXT_PUBLIC_MAIN_URL,
    };
    return sendRequest("/common/send-reset-email", params, "POST");
  }

  // Login
  static login(email, password, loginFrom) {
    const params = {
      email,
      password,
      loginFrom,
    };
    return sendRequest("/login", params, "POST");
  }

  // Register
  static register(params) {
    return sendRequest("/register", params, "POST");
  }

  // Get Invitation Data
  static getInvitationData(code) {
    return sendRequest(`/invitation/${code}`, {}, "GET");
  }

  // Finish Invitation
  static finishInvitation(params) {
    return sendRequest("/invitation", params, "PUT");
  }

  // Get Auth User
  static getMe() {
    return sendRequest("/me", {}, "GET", true);
  }

  // Get Card Info - Admin & Supervisor
  static getCardInfo(params) {
    return sendRequest("/common/card-info", params, "GET", true);
  }

  // Get Graph Info - All Roles
  static getGraphInfo(params) {
    return sendRequest("/common/graph-info", params, "GET", true);
  }

  // Change Password - Common
  static changePassword(params) {
    return sendRequest("/common/change-password", params, "PUT", true);
  }

  // Update Settings - Admin
  static updateSettings(params) {
    return sendRequest("/admin/settings", params, "PUT", true);
  }

  // Update Profile - Common
  static updateProfile(params) {
    return sendRequest("/common/profile", params, "PUT", true);
  }

  // Enable TwoFA - Common
  static enableTwoFA() {
    return sendRequest("/common/two-fa/enable", {}, "PUT", true);
  }

  // Disable TwoFA - Common
  static disableTwoFA() {
    return sendRequest("/common/two-fa/disable", {}, "PUT", true);
  }

  // Invite Member - Admin & Supervisor
  static inviteMember(params) {
    return sendRequest("/common/member", params, "POST", true);
  }

  // Resend Member - Admin & Supervisor
  static resendInviteMember(memberId, params) {
    return sendRequest(
      `/common/member/${memberId}/resend-invite`,
      params,
      "PUT",
      true
    );
  }

  // Create Application - Supervisor & Loan Officer
  static createApplication(params) {
    return sendRequest("/common/application", params, "POST", true);
  }

  static editApplication(params) {
    return sendRequest("/common/application", params, "PUT", true);
  }

  static deleteApplication(id) {
    return sendRequest(`/common/application/${id}`, {}, "DELETE", true);
  }

  static submitApplication(params) {
    return sendRequest(`/common/application`, params, "PATCH", true);
  }

  static getConfig(config) {
    return sendRequest(`/config/${config}`, {}, "GET", false);
  }

  // Run Application Consumer Insights - Supervisor & Loan Officer
  static runConsumerInsights(applicationId, reset = false) {
    return sendRequest(
      `/equifax/application/${applicationId}/consumer-insights`,
      { reset },
      "POST",
      true
    );
  }

  // Do DirectID - Supervisor & Loan Officer
  static doDirectID(applicationId, params) {
    return sendRequest(
      `/equifax/application/${applicationId}/direct-id`,
      params,
      "POST",
      true
    );
  }

  // Check DirectID - Supervisor & Loan Officer
  static checkDirectID(applicationId) {
    return sendRequest(
      `/equifax/application/${applicationId}/direct-id-check`,
      {},
      "POST",
      true
    );
  }

  // Cancel Income Insights - Supervisor & Loan Officer
  static cancelIncomeInsights(applicationId) {
    return sendRequest(
      `/equifax/application/${applicationId}/income-insights`,
      {},
      "DELETE",
      true
    );
  }

  // Reset Business Insights - Supervisor & Loan Officer
  static resetBusinessInsights(applicationId) {
    return sendRequest(
      `/equifax/application/${applicationId}/reset-business-insights`,
      {},
      "PUT",
      true
    );
  }

  // Reset Income Insights - Supervisor & Loan Officer
  static resetIncomeInsights(applicationId) {
    return sendRequest(
      `/equifax/application/${applicationId}/reset-income-insights`,
      {},
      "PUT",
      true
    );
  }

  // Bypass DirectID - Supervisor & Loan Officer
  static bypassDirectID(applicationId) {
    return sendRequest(
      `/equifax/application/${applicationId}/direct-id-bypass`,
      {},
      "POST",
      true
    );
  }

  // Run Application Income Insights - Supervisor & Loan Officer
  static runIncomeInsights(applicationId) {
    return sendRequest(
      `/equifax/application/${applicationId}/income-insights`,
      {},
      "POST",
      true
    );
  }

  // Run Application Business Insights - Supervisor & Loan Officer
  static runBusinessInsights(applicationId) {
    return sendRequest(
      `/equifax/application/${applicationId}/business-insights`,
      {},
      "POST",
      true
    );
  }

  // Run Application Doc Verify - Supervisor & Loan Officer
  static runDocVerify(applicationId, params) {
    return sendRequest(
      `/equifax/application/${applicationId}/doc-verify`,
      params,
      "POST",
      true
    );
  }

  // Cancel MFA - Supervisor & Loan Officer
  static cancelMFA(applicationId) {
    return sendRequest(
      `/equifax/application/${applicationId}/mfa`,
      {},
      "DELETE",
      true
    );
  }

  static cancelMFAEmail(applicationId) {
    return sendRequest(
      `/equifax/application/${applicationId}/mfa-email`,
      {},
      "DELETE",
      true
    );
  }

  // Cancel DocVerify - Supervisor & Loan Officer
  static cancelDocVerify(applicationId) {
    return sendRequest(
      `/equifax/application/${applicationId}/doc-verify`,
      {},
      "DELETE",
      true
    );
  }

  // Check Application DocVerify - Supervisor & Loan Officer
  static checkDocVerify(applicationId) {
    return sendRequest(
      `/equifax/application/${applicationId}/doc-verify-check`,
      {},
      "POST",
      true
    );
  }

  // Run Application MFA - Supervisor & Loan Officer
  static runMFA(applicationId, params) {
    return sendRequest(
      `/equifax/application/${applicationId}/mfa`,
      params,
      "POST",
      true
    );
  }

  static runMFAEmail(applicationId, params) {
    return sendRequest(
      `/equifax/application/${applicationId}/mfa-email`,
      params,
      "POST",
      true
    );
  }

  static sendOTP(applicationId, params) {
    return sendRequest(
      `/equifax/application/${applicationId}/mfa-otp`,
      params,
      "POST",
      true
    );
  }

  // Check Application MFA - Supervisor & Loan Officer
  static checkMFA(applicationId) {
    return sendRequest(
      `/equifax/application/${applicationId}/mfa-check`,
      {},
      "POST",
      true
    );
  }
  static checkMFAEmail(applicationId) {
    return sendRequest(
      `/equifax/application/${applicationId}/mfa-email-check`,
      {},
      "POST",
      true
    );
  }

  // Get Application By Id - Supervisor & Loan Officer
  static getApplicationById(applicationId) {
    return sendRequest(`/common/application/${applicationId}`, {}, "GET", true);
  }

  // Get Application By App Id - Supervisor & Loan Officer
  static getApplicationByAppId(appId) {
    return sendRequest(`/common/application/app-id/${appId}`, {}, "GET", true);
  }

  // Create Access Group - Admin
  static createAccessGroup(params) {
    return sendRequest("/admin/access-group", params, "POST", true);
  }

  // Check Two FA Code - Common
  static checkTwoFACode(code, hash) {
    return sendRequest(
      "/check-twoFA-code",
      {
        code,
        hash,
      },
      "POST",
      true
    );
  }

  // Update Access Group - Admin
  static updateAccessGroup(accessGroupId, params) {
    return sendRequest(
      `/admin/access-group/${accessGroupId}`,
      params,
      "PUT",
      true
    );
  }

  // Create Branch - Admin
  static createBranch(params) {
    return sendRequest("/admin/branch", params, "POST", true);
  }

  // Update Branch - Admin
  static updateBranch(branchId, params) {
    return sendRequest(`/admin/branch/${branchId}`, params, "PUT", true);
  }

  // Bulk Apply Access Group - Admin & Supervisor
  static bulkApplyAccessGroup(params) {
    return sendRequest("/common/bulk-apply-access-group", params, "POST", true);
  }

  // Bulk Remove Access Group - Admin & Supervisor
  static bulkRemoveAccessGroup(params) {
    return sendRequest(
      "/common/bulk-remove-access-group",
      params,
      "POST",
      true
    );
  }

  // Get Demo Setting - Supervisor & Loan Officer
  static getDemoSetting() {
    return sendRequest("/common/demo-setting", {}, "GET", true);
  }

  // Get Applications - Supervisor & Loan Officer
  static getApplications(params) {
    return sendRequest("/common/applications", params, "GET", true);
  }

  // Get Access Groups - Admin & Supervisor
  static getAccessGroups(params) {
    return sendRequest("/common/access-groups", params, "GET", true);
  }

  // Get Access Group By Id - Admin
  static getAccessGroupById(accessGroupId) {
    return sendRequest(`/admin/access-group/${accessGroupId}`, {}, "GET", true);
  }

  // Delete Access Group - Admin
  static deleteAccessGroup(accessGroupId) {
    return sendRequest(
      `/admin/access-group/${accessGroupId}`,
      {},
      "DELETE",
      true
    );
  }

  // Get Activity Log - Admin & Supervisor
  static getActivityLog(params) {
    return sendRequest("/common/activity-log", params, "GET", true);
  }

  // Get Members - Admin & Supervisor
  static getMembers(params) {
    return sendRequest("/common/members", params, "GET", true);
  }

  // Get Member By Id - Admin & Supervisor
  static getMemberById(memberId) {
    return sendRequest(`/common/member/${memberId}`, {}, "GET", true);
  }

  // Cancel Member Invite - Admin & Supervisor
  static cancelMemberInvite(memberId) {
    return sendRequest(
      `/common/member/${memberId}/cancel-invite`,
      {},
      "PUT",
      true
    );
  }

  // Reset Password - All
  static resetPassword(params) {
    return sendRequest("/common/reset-password", params, "POST");
  }

  // Reset Member Password - Admin & Supervisor
  static resetMemberPassword(memberId, params) {
    return sendRequest(
      `/common/member/${memberId}/reset-password`,
      params,
      "PUT",
      true
    );
  }

  // Update Member - Admin & Supervisor
  static updateMember(memberId, params) {
    return sendRequest(`/common/member/${memberId}`, params, "PUT", true);
  }

  // Restore Member - Admin & Supervisor
  static restoreMember(memberId) {
    return sendRequest(`/common/member/${memberId}/restore`, {}, "PUT", true);
  }

  // Delete Member - Admin & Supervisor
  static deleteMember(memberId) {
    return sendRequest(`/common/member/${memberId}`, {}, "DELETE", true);
  }

  // Revoke Member - Admin & Supervisor
  static revokeMember(memberId) {
    return sendRequest(`/common/member/${memberId}/revoke`, {}, "PUT", true);
  }

  // Close Branch - Admin
  static closeBranch(branchId) {
    return sendRequest(`/admin/branch/${branchId}`, {}, "DELETE", true);
  }

  // Get Branches - Admin
  static getBranches(params) {
    return sendRequest("/admin/branches", params, "GET", true);
  }

  // Get Members - Admin & Supervisor
  static getMembersByBranch(branchId) {
    return sendRequest(`/common/branch/${branchId}/members`, {}, "GET", true);
  }

  // Get Branch By Id - Admin
  static getBranchById(branchId) {
    return sendRequest(`/admin/branch/${branchId}`, {}, "GET", true);
  }

  // Upload File
  static uploadFile(formData) {
    const userData = Helper.fetchUser();
    const accessToken = userData.accessTokenAPI || "";

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    return new Promise((resolve) => {
      axios
        .post(
          process.env.NEXT_PUBLIC_BACKEND_URL + "api/admin/upload",
          formData,
          {
            headers,
          }
        )
        .then((res) => {
          if (res.data) {
            let data = res.data;

            if (!data.success && !data.message) {
              data = {
                ...data,
                message: "Please try again later",
              };
            }
            resolve(data);
          } else {
            resolve({
              success: false,
              message: "Please try again later",
            });
          }
        })
        .catch(() => {
          resolve({
            success: false,
            message: "Please try again later",
          });
        });
    });
  }

  // Update Member - Admin & Supervisor
  static updateAppDecision(appId, params) {
    return sendRequest(
      `/common/application/${appId}/decision`,
      params,
      "PUT",
      true
    );
  }
}

export default API;
