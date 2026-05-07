import "./index.css";
import { useState } from "react";
import AppLayout from "./layout/AppLayout";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(localStorage.getItem("username"));
  const [page, setPage] = useState("home");

  return (
    <>
      {!user ? (
        <Login setUser={setUser} />
      ) : (
        <AppLayout page={page} setPage={setPage} />
      )}
    </>
  );
}

export default App;
