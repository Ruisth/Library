import React, {useState, useEffect} from "react";
import CardGroup from 'react-bootstrap/CardGroup';
import Row from 'react-bootstrap/Row';

import BookCard from "../components/BookCard";

export default function App() {
  let [books, setBooks] = useState([]);

  const getBooks = async () => {
    try {
      const response = await fetch('http://localhost:3000/books', {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json'
        },
      });
      
      const data = await response.json();
      console.log(data)
      setBooks(data);

    } catch (error) {
      console.error('Error:', error);
    }
  }

  useEffect(() => {
    getBooks();
  }, []);

  return (
    <div className="container pt-5 pb-5">
        <h2>Books</h2>
        <CardGroup>
            <Row xs={1} md={2} className="d-flex justify-content-around">
            {books && books.map((book) => {
                return (
                    <BookCard 
                        key={book._id} 
                        {...book}
                    />
                );
            })}
            </Row>
        </CardGroup>
    </div>
  )
}