import {
  SET_MEMBERS_TABLE_STATUS,
  SET_ACCESS_GROUPS_TABLE_STATUS,
} from "../actions";

const initialState = {
  membersTableStatus: false,
  accessGroupsTableStatus: false,
};

export default function Table(state = initialState, action) {
  switch (action.type) {
    case SET_ACCESS_GROUPS_TABLE_STATUS: {
      const { accessGroupsTableStatus } = action.payload;
      return {
        ...state,
        accessGroupsTableStatus,
      };
    }
    case SET_MEMBERS_TABLE_STATUS: {
      const { membersTableStatus } = action.payload;
      return {
        ...state,
        membersTableStatus,
      };
    }
    default:
      return state;
  }
}
