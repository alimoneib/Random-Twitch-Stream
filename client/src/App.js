import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Homepage from "./pages/homepage.js";
import Navbar from "./components/navbar/navbar.js";

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <Switch>
          <Route path="/" exact component={Homepage} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
