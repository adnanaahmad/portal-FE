import {
  SET_CLOSE_BRANCH_DATA,
  SET_REVOKE_MEMBER_DATA,
  SET_RESET_PASSWORD_MEMBER_DATA,
  SET_DELETE_MEMBER_DATA,
  SET_CANCEL_INVITE_MEMBER_DATA,
  SET_DELETE_ACCESS_GROUP_DATA,
  SET_BULK_APPLY_ACCESS_GROUP_MEMBERS_DATA,
  SET_BULK_REMOVE_ACCESS_GROUP_MEMBERS_DATA,
  SET_CUSTOM_CONFIRM_MODAL_DATA,
  SET_CUSTOM_GENERAL_MODAL_DATA,
  SET_RELOAD_FOR_NEW_VERSION_DATA,
  SET_JSON_EDITOR_DATA,
  SET_TX_MODAL_APP,
  SET_OTP_MODAL_DATA,
} from "../actions";

const initialState = {
  closeBranchData: {},
  revokeMemberData: {},
  resetPasswordMemberData: {},
  deleteMemberData: {},
  cancelInviteMemberData: {},
  deleteAccessGroupData: {},
  bulkApplyAccessGroupMembersData: [],
  bulkRemoveAccessGroupMembersData: [],
  customConfirmModalData: {},
  customGeneralModalData: {},
  reloadForNewVersion: {},
  JSONEditor: {},
  txModalApp: {},
  OTPModalData: {},
};

export default function setPayload(state = initialState, action) {
  switch (action.type) {
    case SET_TX_MODAL_APP: {
      const { txModalApp } = action.payload;
      return {
        ...state,
        txModalApp,
      };
    }
    case SET_CUSTOM_GENERAL_MODAL_DATA: {
      const { customGeneralModalData } = action.payload;
      return {
        ...state,
        customGeneralModalData,
      };
    }
    case SET_CUSTOM_CONFIRM_MODAL_DATA: {
      const { customConfirmModalData } = action.payload;
      return {
        ...state,
        customConfirmModalData,
      };
    }
    case SET_BULK_APPLY_ACCESS_GROUP_MEMBERS_DATA: {
      const { bulkApplyAccessGroupMembersData } = action.payload;
      return {
        ...state,
        bulkApplyAccessGroupMembersData,
      };
    }
    case SET_BULK_REMOVE_ACCESS_GROUP_MEMBERS_DATA: {
      const { bulkRemoveAccessGroupMembersData } = action.payload;
      return {
        ...state,
        bulkRemoveAccessGroupMembersData,
      };
    }
    case SET_DELETE_ACCESS_GROUP_DATA: {
      const { deleteAccessGroupData } = action.payload;
      return {
        ...state,
        deleteAccessGroupData,
      };
    }
    case SET_RESET_PASSWORD_MEMBER_DATA: {
      const { resetPasswordMemberData } = action.payload;
      return {
        ...state,
        resetPasswordMemberData,
      };
    }
    case SET_DELETE_MEMBER_DATA: {
      const { deleteMemberData } = action.payload;
      return {
        ...state,
        deleteMemberData,
      };
    }
    case SET_CANCEL_INVITE_MEMBER_DATA: {
      const { cancelInviteMemberData } = action.payload;
      return {
        ...state,
        cancelInviteMemberData,
      };
    }
    case SET_CLOSE_BRANCH_DATA: {
      const { closeBranchData } = action.payload;
      return {
        ...state,
        closeBranchData,
      };
    }
    case SET_REVOKE_MEMBER_DATA: {
      const { revokeMemberData } = action.payload;
      return {
        ...state,
        revokeMemberData,
      };
    }
    case SET_RELOAD_FOR_NEW_VERSION_DATA: {
      const { reloadForNewVersion } = action.payload;
      return {
        ...state,
        reloadForNewVersion,
      };
    }
    case SET_JSON_EDITOR_DATA: {
      const { JSONEditor } = action.payload;
      return {
        ...state,
        JSONEditor,
      };
    }
    case SET_OTP_MODAL_DATA: {
      const { OTPModalData } = action.payload;
      return {
        ...state,
        OTPModalData,
      };
    }
    default:
      return state;
  }
}
