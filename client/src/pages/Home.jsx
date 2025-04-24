import React, { useEffect, useState } from "react";
import { getLoggedInUser} from "../util/auth-utils";

const Home = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const loggedInUser = await getLoggedInUser();
      setUser(loggedInUser);
    };
    fetchUser();
  }, []);


  return (
    <div>
      <h1>Home Page</h1>
      {user ? (
        <div>
          <h2>Welcome, {user.email} 👋</h2>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      ) : (
        <p>Please log in to view your details.</p>
      )}
    </div>
  );
};

export default Home;
