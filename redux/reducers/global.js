import {
  SHOW_ALERT,
  HIDE_ALERT,
  SHOW_CANVAS,
  HIDE_CANVAS,
  SET_ACTIVE_MODAL,
  REMOVE_ACTIVE_MODAL,
  SAVE_USER,
  SHOW_MENU,
  HIDE_MENU,
  SET_BLOCK_ALERT_DATA,
  SET_FILL_DEMO_DATA,
  SET_INDEX,
  SET_NEXT,
  SET_BUILD_TYPE,
  SET_ACTIVE_CHILD_MODAL,
  REMOVE_ACTIVE_CHILD_MODAL
} from "../actions";

const initialState = {
  showAlert: false,
  showAlertMessage: "",
  showAlertType: "",
  showAlertHorizontal: "",
  showCanvas: false,
  activeModal: "",
  activeModalData: {},
  authUser: {},
  blockAlertData: {},
  menuShown: false,
  fillDemoData: null,
  applicants: [],
  index: -1,
  buildType: "",
  activeChildModal: "",
};

export default function Global(state = initialState, action) {
  switch (action.type) {
    case SET_FILL_DEMO_DATA: {
      const { fillDemoData } = action.payload;
      return {
        ...state,
        fillDemoData,
      };
    }
    case SET_INDEX: {
      const { index } = action.payload;
      return {
        ...state,
        index,
      };
    }
    case SET_NEXT: {
      const { next } = action.payload;
      return {
        ...state,
        next,
      };
    }
    case SET_BUILD_TYPE: {
      const { buildType } = action.payload;
      return {
        ...state,
        buildType,
      };
    }
    case SHOW_MENU:
      return {
        ...state,
        menuShown: true,
      };
    case HIDE_MENU:
      return {
        ...state,
        menuShown: false,
      };
    case SET_BLOCK_ALERT_DATA: {
      const { blockAlertData } = action.payload;
      return {
        ...state,
        blockAlertData,
      };
    }
    case SAVE_USER: {
      const { authUser } = action.payload;
      return {
        ...state,
        authUser,
      };
    }
    case SHOW_ALERT: {
      const { showAlertMessage, showAlertType, showAlertHorizontal } =
        action.payload;
      return {
        ...state,
        showAlert: true,
        showAlertMessage,
        showAlertType,
        showAlertHorizontal,
      };
    }
    case HIDE_ALERT:
      return {
        ...state,
        showAlert: false,
        showAlertMessage: "",
        showAlertType: "",
        showAlertHorizontal: "",
      };
    case SHOW_CANVAS:
      return {
        ...state,
        showCanvas: true,
      };
    case HIDE_CANVAS:
      return {
        ...state,
        showCanvas: false,
      };
    case SET_ACTIVE_MODAL: {
      const { activeModal, activeModalData } = action.payload;
      return {
        ...state,
        activeModal,
        activeModalData,
      };
    }
    case REMOVE_ACTIVE_MODAL:
      return {
        ...state,
        activeModal: "",
        activeModalData: {},
      };
    case SET_ACTIVE_CHILD_MODAL: {
      const { activeChildModal } = action.payload;
      return {
        ...state,
        activeChildModal,
      };
    }
    case REMOVE_ACTIVE_CHILD_MODAL:
      return {
        ...state,
        activeChildModal: "",
      };
    default:
      return state;
  }
}
