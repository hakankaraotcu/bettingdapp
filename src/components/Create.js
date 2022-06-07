import { Row, Form, Button } from 'react-bootstrap';
import { useState } from 'react';
import { fetchData } from "../redux/data/dataActions";
import { useDispatch, useSelector } from "react-redux";

const Create = () => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const blockchain = useSelector((state) => state.blockchain);
    const dispatch = useDispatch();

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
    return (
        <div className='container-fluid mt-5'>
            <div className='row'>
                <main role="main" className='col-lg-12 mx-auto' style={{ maxWidth: "100px"}}>
                    <div className='content mx-auto'>
                        <Row className='g-4'>
                            <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder='Name'></Form.Control>
                            <div className='d-grid px-0'>
                                <Button onClick={(e) =>{
                                     e.preventDefault();
                                     mintNFT(blockchain.account, name);
                                }}>Create</Button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Create
