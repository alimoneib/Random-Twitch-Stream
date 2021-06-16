import React from "react";
import Navbar from "react-bootstrap/Navbar";
import image from "../../twitchIcon.png";
import "./navbar.css";

function navbar() {
  return (
    <Navbar className="nav-root">
      <div className="title">
        <img className="logo" alt="Logo" src={image} width="70" height="70" />
        <h2 className="logo">Twitch Stream Randomiser</h2>
      </div>
    </Navbar>
  );
}

export default navbar;
