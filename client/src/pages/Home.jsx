import React, { useEffect, useState } from "react";
import { getLoggedInUser, logoutUser ,checkTokenValidity} from "../util/authUtils";

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const loggedInUser = await getLoggedInUser();
      setUser(loggedInUser);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const success = await logoutUser();
    if (success) {
      setUser(null);
    }
  };

  return (
    <div>
      <h1>Home Page</h1>
      {user ? (
        <div>
          <h2>Welcome, {user.email} 👋</h2>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <button onClick={handleLogout}>Logout</button>
          <button onClick={checkTokenValidity}>Check Token Validity</button>
        </div>
      ) : (
        <p>Please log in to view your details.</p>
      )}
    </div>
  );
};

export default Home;
