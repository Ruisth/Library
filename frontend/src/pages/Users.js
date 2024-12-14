import React, { useState, useEffect } from "react";
import CardGroup from 'react-bootstrap/CardGroup';
import Row from 'react-bootstrap/Row';
import Pagination from 'react-bootstrap/Pagination';
import UserCard from "../components/UserCard";

export default function App() {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // Página atual
    const [totalPages, setTotalPages] = useState(1); // Total de páginas
    const usersPerPage = 20; // Number of users per page

    const getUsers = async (page = 1) => {
        try {
            const response = await fetch(`http://localhost:3000/users?page=${page}&limit=${usersPerPage}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            const data = await response.json();
            console.log('Users API Response:', data);

            if (data && data.users) {
                setUsers(data.users); // Livros da página atual
                setTotalPages(data.totalPages); // Número total de páginas retornado pela API
            } else {
                console.error('Unexpected API response:', data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        getUsers(currentPage);
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
            <h2>Users Page</h2>
            <CardGroup>
                <Row xs={1} md={2} className="d-flex justify-content-around">
                    {users.length > 0 ? (
                        users.map((user) => (
                            <UserCard key={user._id} {...user} />
                        ))
                    ) : (
                        <p>No users available.</p>
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
    )
}