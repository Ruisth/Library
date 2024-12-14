import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { userSession } from '../auth';
import UserCard from "../components/UserCard";

export default function App() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleted, setIsDeleted] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null); // Reset any previous error
      console.log(`Fetching user with ID: ${id}`);

      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('User API Response:', data);

      if (data && typeof data === 'object') {
        setUser(data);
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError(err.message || 'Error fetching user details');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    try {
      setDeleteError(null); // Reset any previous error
      console.log(`Deleting user with ID: ${id}`);
      
      const response = await fetch(`http://localhost:3000/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }

      setIsDeleted(true);
    } catch (err) {
      console.error("Error deleting user:", err);
      setDeleteError(err.message || 'Error deleting user');
    }
  };

  useEffect(() => {
    if (!isDeleted) fetchUser();
  }, [id, isDeleted]);

  if (isDeleted) {
    return (
      <div className="container pt-5 pb-5">
        <h2>User Deleted</h2>
        <p>The user has been successfully deleted.</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/users')}
        >
          Back to Users List
        </button>
      </div>
    );
  }

  return (
    <div className="container pt-5 pb-5">
      <h2>User Details</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {deleteError && <p style={{ color: 'red' }}>Error: {deleteError}</p>}
      {user ? (
        <>
            {/* Ensure user is defined before rendering UserCard */}
            {user && <UserCard key={user._id} />}
          <div>
            <h3>{(user.first_name + " " + user.last_name) || "Name not available"}</h3>
            <p><strong>Year of birth:</strong> {user.year_of_birth || "N/A"}</p>
            <p><strong>Job:</strong> {user.job || "N/A"}</p>
            <p><strong>Reviews:</strong> {user.reviews ? user.reviews.join(", ") : "N/A"}</p>
          </div>
        </>
      ) : (
        !loading && !error && <p>User not found.</p>
      )}
  
      <div className="mt-4">
        <button
          className="btn btn-primary"
          onClick={() => navigate('/users')}
        >
          Back to Users List
        </button>
        {user && (
          <button
            className="btn btn-danger ms-2"
            onClick={deleteUser}
          >
            Delete User
          </button>
        )}
      </div>
    </div>
  );  
}
