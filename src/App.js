import React, { useEffect, useState } from "react";
import './App.css';
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Form } from 'react-bootstrap';
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import Navigation from "./components/Navbar";
import Create from "./components/Create";
import Bet from "./components/Bet";
import _color from "./assets/images/bg/_color.png";
import Home from "./components/Home";

function App() {

  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  console.log(data);
  console.table(blockchain.account);

  //10000000000000000
  
  const mintNFT = (_account, _name) => {
    setLoading(true);
    blockchain.carToken.methods
    .createRandomCar(_name)
    .send({ 
      from: _account, 
      value: blockchain.web3.utils.toWei("0.01", "ether")
    })
    .once("error", (err) => {
      setLoading(false);
      console.log("Value Error: ", err)
    })
    .then((receipt) => {
      setLoading(false);
      console.log(receipt);
      dispatch(fetchData(blockchain.account));
    });
  };

  const upgradeEnginePower = (_account, _id) => {
    setLoading(true);
    blockchain.carToken.methods
    .upgradeEngine(_id)
    .send({ 
      from: _account,
    })
    .once("error", (err) => {
      setLoading(false);
      console.log("Upgrade Engine Error: ", err)
    })
    .then((receipt) => {
      setLoading(false);
      console.log(receipt);
      dispatch(fetchData(blockchain.account));
    });
  };

  const upgradeAerodynamicStablity = (_account, _id) => {
    setLoading(true);
    blockchain.carToken.methods
    .upgradeAerodynamicStablity(_id)
    .send({ 
      from: _account,
    })
    .once("error", (err) => {
      setLoading(false);
      console.log("Upgrade Aerodynamics Error: ", err)
    })
    .then((receipt) => {
      setLoading(false);
      console.log(receipt);
      dispatch(fetchData(blockchain.account));
    });
  };

  const upgradeChasis = (_account, _id) => {
    setLoading(true);
    blockchain.carToken.methods
    .upgradeChasis(_id)
    .send({ 
      from: _account,
    })
    .once("error", (err) => {
      setLoading(false);
      console.log("Upgrade Chasis Error: ", err)
    })
    .then((receipt) => {
      setLoading(false);
      console.log(receipt);
      dispatch(fetchData(blockchain.account));
    });
  };

  useEffect(() => {
    // eslint-disable-next-line
    if(blockchain.account != "" && blockchain.carToken != null){
      dispatch(fetchData(blockchain.account));
    }
    // eslint-disable-next-line
  }, [blockchain.carToken]);
  
  return (
    <BrowserRouter>
    <s.Screen image={_color}>
      <Navigation 
      web3Handler={ (e) => {
        e.preventDefault();
        dispatch(connect());}} account = {blockchain.account}/>
      {blockchain.account === "" || blockchain.carToken === null ? (
      <s.Container flex={1} ai={"center"} jc={"center"}>
        <s.TextTitle>Connect Your Wallet</s.TextTitle>
        <s.SpacerXSmall/>
        {blockchain.errorMsg != "" ? (
          <s.TextDescription>{blockchain.errorMsg}</s.TextDescription>
        ) : null}
      </s.Container>
      ) : (
      <s.Container ai={"center"} style={{padding: "24px"}}>
        <Routes>
          <Route path="/" element={
            <Home/>
          }></Route>
          <Route path="/create" element={
            <Create/>
          }></Route>
          <Route path="/bet" element={
            <Bet/>
          }></Route>
        </Routes>
        <s.TextTitle>Welcome to The Game</s.TextTitle>
        <s.TextTitle>Account: { blockchain.account }</s.TextTitle>
        <s.SpacerSmall/>
        <s.SpacerMedium/>
        
      </s.Container> 
      )}
    </s.Screen>
    </BrowserRouter>
  );
}

export default App;
