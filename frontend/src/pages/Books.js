import React, { useState, useEffect } from "react";
import CardGroup from 'react-bootstrap/CardGroup';
import Row from 'react-bootstrap/Row';
import Pagination from 'react-bootstrap/Pagination';
import BookCard from "../components/BookCard";

export default function App() {
    const [books, setBooks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // Página atual
    const [totalPages, setTotalPages] = useState(1); // Total de páginas
    const booksPerPage = 20; // Number of books per page

    const getBooks = async (page = 1) => {
        try {
            const response = await fetch(`http://localhost:3000/books?page=${page}&limit=${booksPerPage}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            const data = await response.json();
            console.log('Books API Response:', data);

            if (data && data.books) {
                setBooks(data.books); // Livros da página atual
                setTotalPages(data.totalPages); // Número total de páginas retornado pela API
            } else {
                console.error('Unexpected API response:', data);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    useEffect(() => {
        getBooks(currentPage);
    }, [currentPage]);

    // Handle pagination click
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber); // Atualiza a página atual
    };

    // Criar os itens de paginação
    const paginationItems = [];
    for (let page = 1; page <= totalPages; page++) {
        paginationItems.push(
            <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => handlePageChange(page)}
            >
                {page}
            </Pagination.Item>
        );
    }


    return (
        <div className="container pt-5 pb-5">
            <h2>Books</h2>
            <CardGroup>
                <Row xs={1} md={2} className="d-flex justify-content-between">
                    {books.length > 0 ? (
                        books.map((book) => (
                            <BookCard key={book._id} {...book} />
                        ))
                    ) : (
                        <p>No books available.</p>
                    )}
                </Row>
            </CardGroup>
            <div className="d-flex justify-content-center">
                <Pagination>
                    <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                    {currentPage > 1 && <Pagination.Item onClick={() => handlePageChange(currentPage - 1)}>{currentPage - 1}</Pagination.Item>}
                    <Pagination.Item active>{currentPage}</Pagination.Item>
                    {currentPage < totalPages && <Pagination.Item onClick={() => handlePageChange(currentPage + 1)}>{currentPage + 1}</Pagination.Item>}
                    <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
            </div>
        </div>
    );
}
