import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { openContractCall } from '@stacks/connect';
import {
  bufferCV,
} from '@stacks/transactions';
import { utf8ToBytes } from '@stacks/common';
import { userSession } from '../auth';
const bytes = utf8ToBytes('foo');
const bufCV = bufferCV(bytes);


export default function App() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const fetchBook = async () => {
    try {
      setLoading(true);
      setError(null); // Reset any previous error
      console.log(`Fetching book with ID: ${id}`);

      const response = await fetch(`http://localhost:3000/books/id/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch book: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Book API Response:', data);

      if (data && typeof data === 'object') {
        setBook(data);
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (err) {
      console.error("Error fetching book details:", err);
      setError(err.message || 'Error fetching book details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  // Helper function to format the MongoDB date
  const formatPublishedDate = (publishedDate) => {
    if (publishedDate) {
      const date = new Date(publishedDate);
      return date.toLocaleDateString();
    }
    return "N/A";
  };


  return (
    <div className="container pt-5 pb-5">
      <h2>Book Details</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {book ? (
        <div>
          <h3>{book.title || "Title not available"}</h3>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {book.thumbnailUrl ? (
              <img
                src={book.thumbnailUrl}
                alt={book.title || "Book Thumbnail"}
                style={{ width: "200px", borderRadius: "8px", marginRight: "20px" }}
              />
            ) : (
              <p>No thumbnail available</p>
            )}
            <div>
              <p><strong>ISBN:</strong> {book.isbn || "N/A"}</p>
              <p><strong>Page Count:</strong> {book.pageCount || "N/A"}</p>
              <p><strong>Published Date:</strong> {formatPublishedDate(book.publishedDate)}</p>
              <p><strong>Status:</strong> {book.status || "N/A"}</p>
              <p><strong>Authors:</strong> {book.authors ? book.authors.join(", ") : "N/A"}</p>
              <p><strong>Categories:</strong> {book.categories ? book.categories.join(", ") : "N/A"}</p>
              <p><strong>Description:</strong> {book.longDescription || "No description available."}</p>
            </div>
          </div>
        </div>
      ) : (
        !loading && !error && <p>Book not found.</p>
      )}

      {/* Button to go to the previous list */}
      <div className="mt-4">
        <button
          className="btn btn-primary"
          onClick={() => navigate('/books')}
        >
          Back to Book List
        </button>
      </div>
    </div>
  );
}