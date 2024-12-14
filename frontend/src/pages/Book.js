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
  const [averageScore, setAverageScore] = useState(null);
  const [totalReviews, setTotalReviews] = useState(null);
  const [comments, setComments] = useState([]);


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
        fetchAverageScore(data._id); // Fetch average score for this book
        fetchComments(data._id); // Fetch comments for this book
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

  const fetchComments = async bookId => {
    try {
      const response = await fetch(`http://localhost:3000/books/comments/${bookId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Comments API Response:', data);

      if (data && typeof data === 'object' && data.comments !== undefined) {
        setComments(data.comments);
      } else {
        throw new Error('Unexpected API response format');
      }
    }
    catch (err) {
      console.error("Error fetching comments:", err);
      setError(err.message || 'Error fetching comments');
    }
  };

  const fetchAverageScore = async bookId => {
    try {
      const response = await fetch(`http://localhost:3000/books/averageScore/${bookId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch average score: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Average Score API Response:', data);

      if (data && typeof data === 'object' && data.averageScore !== undefined) {
        setAverageScore(data.averageScore);
        setTotalReviews(data.totalReviews);
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (err) {
      console.error("Error fetching average score:", err);
      setError(err.message || 'Error fetching average score');
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

  // Helper function to convert score to stars
  const renderStars = (score) => {
    const fullStars = Math.floor(score);
    const halfStar = score % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    const roundedScore = score.toFixed(2);

    return (
      <div>
        {Array(fullStars).fill(<span style={{ color: 'darkgoldenrod' }}>&#9733;</span>)} {/* Full stars */}
        {halfStar && <span style={{ color: 'darkgoldenrod' }}>&#9733;</span>} {/* Half star */}
        {Array(emptyStars).fill(<span style={{ color: 'darkgoldenrod' }}>&#9734;</span>)} {/* Empty stars */}
        <span> ({roundedScore})</span> {/* Rounded score */}
      </div>
    );
  };

  return (
    <div className="container pt-5 pb-5">
      <h2>Book Details</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {book ? (
        <div style={{ marginTop: "40px" }}>
          <h3>{book.title || "Title not available"}</h3>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '20px' }}>
            {book.thumbnailUrl ? (
              <div style={{ marginRight: "20px" }}>
                <img
                  src={book.thumbnailUrl}
                  alt={book.title || "Book Thumbnail"}
                  style={{ width: "200px", borderRadius: "8px" }}
                />
                <p><strong>Average Score:</strong> {averageScore ? renderStars(averageScore) : "N/A"}</p>
                <p><strong>Total Reviews:</strong> {totalReviews || "N/A"}</p>
              </div>
            ) : (
              <div style={{ marginRight: "200px", borderRadius: "8px" }}>
                <p></p>
                <p>No_thumbnail_available</p>
                <p><strong>Average Score:</strong> {averageScore ? renderStars(averageScore) : "N/A"}</p>
                <p><strong>Total Reviews:</strong> {totalReviews || "N/A"}</p>
              </div>
            )}
            <div>
              <p><strong>ISBN:</strong> {book.isbn || "N/A"}</p>
              <p><strong>Page Count:</strong> {book.pageCount || "N/A"}</p>
              <p><strong>Published Date:</strong> {formatPublishedDate(book.publishedDate)}</p>
              <p><strong>Status:</strong> {book.status || "N/A"}</p>
              <p><strong>Authors:</strong> {book.authors ? book.authors.join(", ") : "N/A"}</p>
              <p><strong>Categories:</strong> {book.categories ? book.categories.join(", ") : "N/A"}</p>
              <p><strong>Description:</strong> {book.longDescription || "No description available."}</p>
              <p style={{ marginTop: '50px', color: 'darkgoldenrod' }}><strong>Comments:</strong></p>
              <div style={{ maxHeight: '200px', overflowY: 'scroll' }}>
                <table>
                  <tbody>
                    {comments.map((comment, index) => (
                      <tr key={index}>
                        <td>
                          <div style={{ marginBottom: '20px' }}>
                            {/* Comentário do user */}
                            <p style={{ marginBottom: '5px' }}>{comment.text || "No comment available"}</p>

                            {/* Nome do user e data */}
                            <span style={{ fontSize: '0.9em', color: 'black' }}>
                              {comment.user || "Anonymous"} --- {comment.date || "N/A"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
}