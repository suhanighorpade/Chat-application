import {
  SET_CURRENT_USER,
  SET_ALL_ROOMS,
  ROOM_LOADING_COMPLETE,
  PUBLIC_ROOMS_LOADED,
  INIT_PUBLIC_ROOMS,
  JOINING_ROOM,
  JOINED_ROOM
} from "../actionTypes";

const DEFAULT_STATE = {
  isAuthenticated: false, // hopefully be true, when logged in
  user: {}, // all the user info when logged in
  allRooms: [],
  isRoomLoaded: false,
  allPublicRooms: [],
  publicRoomsLoaded: false,
  joiningNewRoom: false
};

export default (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case SET_CURRENT_USER:
      console.log(action.user)
      return {
        // turn empty object into false or if there are keys, true
        isAuthenticated: !!Object.keys(action.user).length,
        user: action.user
      };

    case SET_ALL_ROOMS:
      return {
        ...state,
        allRooms: action.allRooms
      }

    case ROOM_LOADING_COMPLETE:
      return {
        ...state,
        isRoomLoaded: true
      }

    case PUBLIC_ROOMS_LOADED:
      return {
        ...state,
        publicRoomsLoaded: true
      }

    case INIT_PUBLIC_ROOMS:
      return {
        ...state,
        allPublicRooms: action.allPublicRooms
      }

    case JOINING_ROOM:
      return {
        ...state,
        joiningNewRoom: true
      }

    case JOINED_ROOM:
      // After the room is joined
      console.log(action.roomName)
      let newPublicRooms = state.allPublicRooms;
      const index = newPublicRooms.indexOf(action.roomObject);
      if (index !== -1)
        newPublicRooms.splice(index, 1);
      console.log(newPublicRooms)
      let newJoinedRooms = [...state.allRooms]
      newJoinedRooms.push(action.roomObject)
      console.log(newJoinedRooms)
      return {
        ...state,
        allPublicRooms: newPublicRooms,
        allRooms: newJoinedRooms,
        joiningNewRoom: false
      }

    default:
      return state;
  }
};
