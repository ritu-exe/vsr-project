import "./index.css";
import { useState } from "react";
import AppLayout from "./layout/AppLayout";
import Login from "./pages/Login";
import { VoiceProvider } from "./context/VoiceContext";

function App() {
  const [user, setUser] = useState(localStorage.getItem("username"));
  const [page, setPage] = useState("home");

  return (
    <VoiceProvider>
      {!user ? (
        <Login setUser={setUser} />
      ) : (
        <AppLayout page={page} setPage={setPage} />
      )}
    </VoiceProvider>
  );
}

export default App;
