// log
import store from "../store";

const fetchDataRequest = () => {
  return {
    type: "CHECK_DATA_REQUEST",
  };
};

const fetchDataSuccess = (payload) => {
  return {
    type: "CHECK_DATA_SUCCESS",
    payload: payload,
  };
};

const fetchDataFailed = (payload) => {
  return {
    type: "CHECK_DATA_FAILED",
    payload: payload,
  };
};

export const fetchData = (account) => {
  return async (dispatch) => {
    dispatch(fetchDataRequest());
    try {
      let allCars = await store
        .getState()
        .blockchain.carToken.methods.getCars()
        .call();
      let allOwnerCars = await store
        .getState()
        .blockchain.carToken.methods.getOwnerCars(account)
        .call();
        
      dispatch(
        fetchDataSuccess({
          allCars,
          allOwnerCars,
        })
      );
    } catch (err) {
      console.log(err);
      console.log("Error in try");
      dispatch(fetchDataFailed("Could not load data from contract. from dataAction"));
    }
  };
};