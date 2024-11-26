import React, { useState, useEffect } from "react";
import CardGroup from 'react-bootstrap/CardGroup';
import Row from 'react-bootstrap/Row';
import BookCard from "../components/BookCard";

export default function App() {
    const [books, setBooks] = useState([]);

    const getBooks = async () => {
        try {
            const response = await fetch('http://localhost:3000/books', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            const data = await response.json();
            console.log('Books API Response:', data);

            if (Array.isArray(data)) {
                setBooks(data);
            } else if (Array.isArray(data.books)) {
                setBooks(data.books);
            } else {
                console.error('Unexpected API response:', data);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    useEffect(() => {
        getBooks();
    }, []);

    return (
        <div className="container pt-5 pb-5">
            <h2>Books</h2>
            <CardGroup>
                <Row xs={1} md={2} className="d-flex justify-content-around">
                    {Array.isArray(books) && books.length > 0 ? (
                        books.map((book) => (
                            <BookCard key={book._id} {...book} />
                        ))
                    ) : (
                        <p>No books available.</p>
                    )}
                </Row>
            </CardGroup>
        </div>
    );
}
