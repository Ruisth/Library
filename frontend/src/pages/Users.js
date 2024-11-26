import React, {useState, useEffect} from "react";
import CardGroup from 'react-bootstrap/CardGroup';
import Row from 'react-bootstrap/Row';

export default function App() {
  

  useEffect(() => {
    //getUsers();
  }, []);

  return (
    <div className="container pt-5 pb-5">
      <h2>Users Page</h2>
      <CardGroup>
            <Row xs={1} md={2} className="d-flex justify-content-around">
            
            </Row>
        </CardGroup>
    </div>
  )
}