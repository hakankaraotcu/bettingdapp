import * as s from "../styles/globalStyles";
import CarRenderer from "./carRenderer";
import React, { useState } from "react";
import { fetchData } from "../redux/data/dataActions";
import { useDispatch, useSelector } from "react-redux";

const Home = () => {
    const [loading, setLoading] = useState(false);
    const blockchain = useSelector((state) => state.blockchain);
    const data = useSelector((state) => state.data);
    const dispatch = useDispatch();
    

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

    return(
        <s.Container jc={"center"} fd={"row"} style={{flexWrap: "wrap"}}>
          {data.allCars.map(item => {
            return(
              <s.Container style={{padding: "15px"}}>
              <CarRenderer car={item}/>
              <s.SpacerMedium/>
              <s.Container>
                <s.TextDescription>ID: {item.id}</s.TextDescription>
                <s.TextDescription>VIN: {item.vin}</s.TextDescription>
                <s.TextDescription>Name: {item.name}</s.TextDescription>
                <s.TextDescription>Engine Power: {item.enginePower}</s.TextDescription>
                <s.TextDescription>Aerodynamic Stability: {item.aerodynamicStability}</s.TextDescription>
                <s.TextDescription>Chasis: {item.chasis}</s.TextDescription>
                <button 
                  disabled={loading ? 1 : 0}
                  onClick={(e) =>{
                  e.preventDefault();
                  upgradeEnginePower(blockchain.account, item.id);
                }}
                >Upgrade Engine</button>
                <button 
                  disabled={loading ? 1 : 0}
                  onClick={(e) =>{
                  e.preventDefault();
                  upgradeAerodynamicStablity(blockchain.account, item.id);
                }}
                >Upgrade Aerodynamic Stablity</button>
                <button 
                  disabled={loading ? 1 : 0}
                  onClick={(e) =>{
                  e.preventDefault();
                  upgradeChasis(blockchain.account, item.id);
                }}
                >Upgrade Chasis</button>
              </s.Container>
              </s.Container>
            );
          })}
        </s.Container>
    );
};

export default Home;