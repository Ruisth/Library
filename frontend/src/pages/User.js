import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserCard from "../components/UserCard";

export default function App() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);
  const [topBooks, setTopBooks] = useState(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3000/users/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch user: ${response.statusText}`);

      const data = await response.json();
      setUser(data);

      if (data.topBooks) {
        setTopBooks(data.topBooks);
      } else {
        setTopBooks([]);
      }
    } catch (err) {
      setError(err.message || "Error fetching user details.");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    try {
      setDeleteError(null);
      const response = await fetch(`http://localhost:3000/users/${parseInt(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(`Failed to delete user: ${response.statusText}`);
      setIsDeleted(true);
    } catch (err) {
      setDeleteError(err.message || "Error deleting user.");
    }
  };

  useEffect(() => {
    if (!isDeleted) fetchUser();
  }, [id, isDeleted]);

  if (isDeleted) {
    return (
      <div className="container pt-5 pb-5">
        <h2>User Deleted</h2>
        <button className="btn btn-primary" onClick={() => navigate("/users")}>
          Back to Users List
        </button>
      </div>
    );
  }

  return (
    <div className="container pt-5 pb-5">
      <h2 className="mb-4 text-center">User Details</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {deleteError && <p className="text-danger">{deleteError}</p>}
      {user ? (
        <>
          <UserCard key={user._id} />
          <div className="user-info text-center">
            <h3>{`${user.first_name} ${user.last_name}`}</h3>
            <p><strong>Year of birth:</strong> {user.year_of_birth || "N/A"}</p>
            <p><strong>Job:</strong> {user.job || "N/A"}</p>
          </div>
          <div className="top-books">
            <h3 className="mt-4">Top 3 Books from this user</h3>
            {topBooks?.length > 0 ? (
              <div className="row">
                {topBooks.map((book, index) => (
                  <div key={index} className="col-md-4 mb-4">
                    <div className="card h-100 text-center">
                      <a href={`../books/id/${book._id}`} rel="noopener noreferrer">
                        {book.thumbnailUrl ? (
                          <img
                            src={book.thumbnailUrl}
                            alt={book.title || "Book Thumbnail"}
                            className="card-img-top img-fluid rounded-3"
                            style={{ width: '40%', marginTop: '2rem' }}
                          />
                        ) : (
                          <div className="card-img-top img-fluid rounded-3 d-flex align-items-center justify-content-center" style={{ height: '200px', backgroundColor: '#f0f0f0' }}>
                            <p>No Image Available</p>
                          </div>
                        )}
                      </a>
                      <div className="card-body text-center">
                        <h5 className="card-title">{book.title}</h5>
                        <p className="card-text"><strong>Score:</strong> {book.score || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No books to display.</p>
            )}
          </div>
        </>
      ) : (
        !loading && !error && <p>User not found.</p>
      )}

      <div className="mt-4 d-flex justify-content-between">
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Back
        </button>
        {user && (
          <button className="btn btn-danger ms-2" onClick={deleteUser}>
            Delete User
          </button>
        )}
      </div>
    </div>
  );
}
