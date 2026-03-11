import "./index.css";
import { useState } from "react";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Home";

function App() {

  const [page, setPage] = useState("home");

  return (
    <AppLayout page={page} setPage={setPage}>
      {page === "home" && <Home />}
    </AppLayout>
  );
}

export default App;