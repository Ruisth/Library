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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


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

  useEffect(() => {
    fetchUser();
  }, [id]);


  return (
    <div className="container pt-5 pb-5">
      <h2>User Details</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {user ? (
        <div>
          <h3>{(user.first_name + " " + user.last_name) || "Name not available"}</h3>
          <p><strong>Year of birth:</strong> {user.year_of_birth|| "N/A"}</p>
          <p><strong>Job:</strong> {user.job || "N/A"}</p>
          <p><strong>Reviews:</strong> {user.reviews ? user.reviews.join(", ") : "N/A"}</p>
        </div>
      ) : (
        !loading && !error && <p>User not found.</p>
      )}
    
    {/* Button to go to the previous list */}
    <div className="mt-4">
        <button
          className="btn btn-primary"
          onClick={() => navigate('/users')}
        >
          Back to Users List
        </button>
      </div>
    </div>
  );
}