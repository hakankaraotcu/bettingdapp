import { useEffect, useState } from 'react'
import { Form } from "react-bootstrap"
import styles from '../styles/Home.module.css'
import * as s from '../styles/globalStyles'
import 'bulma/css/bulma.css'
import { useDispatch, useSelector } from "react-redux";
import Web3 from 'web3';
import CarRenderer from "./carRenderer";

const Bet = () => {
    const [web3, setWeb3] = useState();
    const [quantity, setQuantity] = useState("");
    const [lcContract, setLcContract] = useState();
    const [lotteryPot, setLotteryPot] = useState();
    const [lotteryPlayers, setPlayerss] = useState([]);
    const [lotteryHistory, setLotteryHistory] = useState([]);
    const [lotteryId, setLotteryId] = useState();
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const data = useSelector((state) => state.data);
    const blockchain = useSelector((state) => state.blockchain);
    const dispatch = useDispatch();


    useEffect(() => {
        updateState();

    }, [lcContract])


    const updateState = () => {
        if(blockchain.carToken) getPot();
        if(blockchain.carToken) getPlayers();
        if(blockchain.carToken) getLotteryId();
    }

    
    const getPot= async () => {
        const pot = await blockchain.carToken.methods.getPotBalance().call();
        const web3 = new Web3(window.ethereum);
        setWeb3(web3);
        setLotteryPot(web3.utils.fromWei(pot, 'ether'));
    }

    const getPlayers = async () => {
        const playerss = await blockchain.carToken.methods.getPlayers().call();
        setPlayerss(playerss);
    }

    const getHistory = async (id) => {
        setLotteryHistory([]);
        for(let i = parseInt(id); i>0; i--){
            const bet = await blockchain.carToken.methods.lotteryHistory(i).call();
            console.table(bet)
            const historyObj = {};
            historyObj.id = i;
            historyObj.address = bet.player;
            historyObj.carId = bet.car.name;
            setLotteryHistory(lotteryHistory => [...lotteryHistory, historyObj]);
        }
    }

    const getLotteryId = async () => {
        const lotteryId = await blockchain.carToken.methods.lotteryId().call();
        setLotteryId(lotteryId);
        await getHistory(lotteryId);
    }

    const enterLotteryHandler= async () => {
        setError("");
        setSuccessMsg("");
        try{
            await blockchain.carToken.methods.enter().send({
                from: blockchain.account,
                value: "15000000000000000",
                gas: 300000,
                gasPrice: null
            })
            updateState()
        } catch (err) {
            setError(err.message);
        }
    }

    const enterLotteryHandlerWithCar= async (_carId, _betAmount) => {
      setError("");
      setSuccessMsg("");
      console.log("typeof betamount:" + typeof _betAmount);
      console.log("betamount:" + _betAmount);
      try{
          await blockchain.carToken.methods.enterWithCar(_carId, _betAmount).send({
              from: blockchain.account,
              value:_betAmount * 10**18 ,
              gas: 300000,
              gasPrice: null
          })
          updateState();
      } catch (err) {
          setError("Error\n"+err.message);
      }
  }

    const pickWinnerHandler = async () => {
        setError("");
        setSuccessMsg("");
        console.log(`address from pick winner :: ${blockchain.account}`)
        try{
            await blockchain.carToken.methods.pickWinner().send({
                from: blockchain.account, 
                gas: 300000,
                gasPrice: null
            })
        } catch(err){
            setError(err.message);
        }
    }

    console.table(lotteryPlayers);

    return(
      <div>
        <div>
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
                <s.TextDescription>Bet Ratio: {item.ratio}</s.TextDescription>
                <Form.Control onChange={(e) => setQuantity(e.target.value)} type='number' placeholder='Quantity'></Form.Control>
                <button onClick={(e) => enterLotteryHandlerWithCar(item.id, parseInt(quantity))}>Bet on that Car</button>
              </s.Container>
              </s.Container>
            );
          })}
        </s.Container>
        </div>
      <main className={styles.main}>
        <nav className="navbar mt-4 mb-4">
          <div className="container">
            <div className="navbar-brand">
              <p>Ether Lottery</p>
            </div>
          </div>
        </nav>
        <div className="container">
          <section className="mt-5">
            <div className="columns">
              <div className="column is-two-thirds">
                <section className="mt-6">
                  <s.TextSubTitle><b>Admin only:</b> Pick winner</s.TextSubTitle>
                  <button onClick={pickWinnerHandler} className="button is-primary is-large is-light mt-3">Pick Winner</button>
                </section>
                <section>
                  <div className="container has-text-danger mt-6">
                    <s.TextSubTitle>{error}</s.TextSubTitle>
                  </div>
                </section>
                <section>
                  <div className="container has-text-success mt-6">
                    <s.TextSubTitle>{successMsg}</s.TextSubTitle>
                  </div>
                </section>
              </div>
              <div className={`${styles.lotteryinfo} column is-one-third`}>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Lottery History</h2>
                        {
                          (lotteryHistory && lotteryHistory.length > 0) && lotteryHistory.map(item => {
                            if (lotteryId != item.id) {
                              return <div className="history-entry mt-3" key={item.id}>
                                <div>Lottery #{item.id} winner:</div>
                                <div>
                                  <a href={`https://etherscan.io/address/${item.address}`} target="_blank">
                                    {item.address}
                                  </a>
                                  <p>Car:{item.carId}</p>
                                </div>
                              </div>
                            }
                          })
                        }
                      </div>
                    </div>
                  </div>
                </section>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Players ({lotteryPlayers.length})</h2>
                        <ul className="ml-0">
                          {
                            (lotteryPlayers && lotteryPlayers.length > 0) && lotteryPlayers.map((player, index) => {
                              return <li key={`${player}-${index}`}>
                                <a href={`https://etherscan.io/address/${player}`} target="_blank">
                                  {player}
                                </a>
                              </li>
                            })
                          }
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Pot</h2>
                        <p>{lotteryPot} Ether</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>

    )
}

export default Bet;