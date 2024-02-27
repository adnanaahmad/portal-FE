// General
export const SHOW_ALERT = "SHOW_ALERT";
export const HIDE_ALERT = "HIDE_ALERT";
export const SHOW_CANVAS = "SHOW_CANVAS";
export const HIDE_CANVAS = "HIDE_CANVAS";
export const SHOW_MENU = "SHOW_MENU";
export const HIDE_MENU = "HIDE_MENU";
export const SET_INDEX = "SET_INDEX";
export const SET_NEXT = "SET_NEXT";
export const SET_BLOCK_ALERT_DATA = "SET_BLOCK_ALERT_DATA";
export const SET_FILL_DEMO_DATA = "SET_FILL_DEMO_DATA";

// User
export const SAVE_USER = "SAVE_USER";

// Table
export const SET_MEMBERS_TABLE_STATUS = "SET_MEMBERS_TABLE_STATUS";
export const SET_ACCESS_GROUPS_TABLE_STATUS = "SET_ACCESS_GROUPS_TABLE_STATUS";

// Modal
export const SET_ACTIVE_MODAL = "SET_ACTIVE_MODAL";
export const REMOVE_ACTIVE_MODAL = "REMOVE_ACTIVE_MODAL";
export const SET_ACTIVE_CHILD_MODAL = "SET_ACTIVE_CHILD_MODAL";
export const REMOVE_ACTIVE_CHILD_MODAL = "REMOVE_ACTIVE_CHILD_MODAL";
export const SET_CLOSE_BRANCH_DATA = "SET_CLOSE_BRANCH_DATA";
export const SET_REVOKE_MEMBER_DATA = "SET_REVOKE_MEMBER_DATA";
export const SET_RESET_PASSWORD_MEMBER_DATA = "SET_RESET_PASSWORD_MEMBER_DATA";
export const SET_DELETE_MEMBER_DATA = "SET_DELETE_MEMBER_DATA";
export const SET_CANCEL_INVITE_MEMBER_DATA = "SET_CANCEL_INVITE_MEMBER_DATA";
export const SET_DELETE_ACCESS_GROUP_DATA = "SET_DELETE_ACCESS_GROUP_DATA";
export const SET_BULK_APPLY_ACCESS_GROUP_MEMBERS_DATA =
  "SET_BULK_APPLY_ACCESS_GROUP_MEMBERS_DATA";
export const SET_BULK_REMOVE_ACCESS_GROUP_MEMBERS_DATA =
  "SET_BULK_REMOVE_ACCESS_GROUP_MEMBERS_DATA";
export const SET_CUSTOM_CONFIRM_MODAL_DATA = "SET_CUSTOM_CONFIRM_MODAL_DATA";
export const SET_CUSTOM_GENERAL_MODAL_DATA = "SET_CUSTOM_GENERAL_MODAL_DATA";
export const SET_RELOAD_FOR_NEW_VERSION_DATA =
  "SET_RELOAD_FOR_NEW_VERSION_DATA";
export const SET_JSON_EDITOR_DATA = "SET_JSON_EDITOR_DATA";
export const SET_TX_MODAL_APP = "SET_TX_MODAL_APP";
export const SET_BUILD_TYPE = "SET_BUILD_TYPE";
export const SET_OTP_MODAL_DATA = "SET_OTP_MODAL_DATA";

export const setOTPModalData = (message) => ({
  type: SET_OTP_MODAL_DATA,
  payload: {
    OTPModalData: message,
  },
});

export const setTXModalApp = (message) => ({
  type: SET_TX_MODAL_APP,
  payload: {
    txModalApp: message,
  },
});

export const setFillDemoData = (message) => ({
  type: SET_FILL_DEMO_DATA,
  payload: {
    fillDemoData: message,
  },
});

export const showMenu = () => ({
  type: SHOW_MENU,
  payload: {},
});

export const hideMenu = () => ({
  type: HIDE_MENU,
  payload: {},
});

export const setAccessGroupsTableStatus = (message) => ({
  type: SET_ACCESS_GROUPS_TABLE_STATUS,
  payload: {
    accessGroupsTableStatus: message,
  },
});

export const setMembersTableStatus = (message) => ({
  type: SET_MEMBERS_TABLE_STATUS,
  payload: {
    membersTableStatus: message,
  },
});

export const setCustomGeneralModalData = (message) => ({
  type: SET_CUSTOM_GENERAL_MODAL_DATA,
  payload: {
    customGeneralModalData: message,
  },
});

export const setCustomConfirmModalData = (message) => ({
  type: SET_CUSTOM_CONFIRM_MODAL_DATA,
  payload: {
    customConfirmModalData: message,
  },
});

export const setBulkApplyAccessGroupMembersData = (message) => ({
  type: SET_BULK_APPLY_ACCESS_GROUP_MEMBERS_DATA,
  payload: {
    bulkApplyAccessGroupMembersData: message,
  },
});

export const setBulkRemoveAccessGroupMembersData = (message) => ({
  type: SET_BULK_REMOVE_ACCESS_GROUP_MEMBERS_DATA,
  payload: {
    bulkRemoveAccessGroupMembersData: message,
  },
});

export const setDeleteAccessGroupData = (message) => ({
  type: SET_DELETE_ACCESS_GROUP_DATA,
  payload: {
    deleteAccessGroupData: message,
  },
});

export const setResetPasswordMemberData = (message) => ({
  type: SET_RESET_PASSWORD_MEMBER_DATA,
  payload: {
    resetPasswordMemberData: message,
  },
});

export const setDeleteMemberData = (message) => ({
  type: SET_DELETE_MEMBER_DATA,
  payload: {
    deleteMemberData: message,
  },
});

export const setCancelInviteMemberData = (message) => ({
  type: SET_CANCEL_INVITE_MEMBER_DATA,
  payload: {
    cancelInviteMemberData: message,
  },
});

export const setRevokeMemberData = (message) => ({
  type: SET_REVOKE_MEMBER_DATA,
  payload: {
    revokeMemberData: message,
  },
});

export const setCloseBranchData = (message) => ({
  type: SET_CLOSE_BRANCH_DATA,
  payload: {
    closeBranchData: message,
  },
});

export const setBlockAlertData = (message) => ({
  type: SET_BLOCK_ALERT_DATA,
  payload: {
    blockAlertData: message,
  },
});

export const saveUser = (message) => ({
  type: SAVE_USER,
  payload: {
    authUser: message,
  },
});

export const setIndex = (message) => ({
  type: SET_INDEX,
  payload: {
    index: parseInt(message),
  },
});

export const setNext = (message) => ({
  type: SET_NEXT,
  payload: {
    next: message,
  },
});

export const showAlert = (message, type = "warning", horizontal = "right") => ({
  type: SHOW_ALERT,
  payload: {
    showAlertMessage: message,
    showAlertType: type,
    showAlertHorizontal: horizontal,
  },
});

export const hideAlert = () => ({
  type: HIDE_ALERT,
  payload: {},
});

export const showCanvas = () => ({
  type: SHOW_CANVAS,
  payload: {},
});

export const hideCanvas = () => ({
  type: HIDE_CANVAS,
  payload: {},
});

export const setActiveModal = (activeModal, activeModalData={}) => ({
  type: SET_ACTIVE_MODAL,
  payload: {
    activeModal,
    activeModalData
  },
});

export const setActiveChildModal = (activeChildModal) => ({
  type: SET_ACTIVE_CHILD_MODAL,
  payload: {
    activeChildModal,
  },
});

export const removeActiveModal = () => ({
  type: REMOVE_ACTIVE_MODAL,
  payload: {},
});

export const removeActiveChildModal = () => ({
  type: REMOVE_ACTIVE_CHILD_MODAL,
  payload: {},
});

export const setReloadForNewVersionData = (buildVersion) => ({
  type: SET_RELOAD_FOR_NEW_VERSION_DATA,
  payload: {
    reloadForNewVersion: buildVersion,
  },
});

export const setJSONEditorData = (file) => ({
  type: SET_JSON_EDITOR_DATA,
  payload: {
    JSONEditor: file,
  },
});

export const setBuildType = (message) => ({
  type: SET_BUILD_TYPE,
  payload: {
    buildType: message,
  },
});
