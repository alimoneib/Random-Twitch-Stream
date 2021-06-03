import React from 'react'
import Navbar from 'react-bootstrap/Navbar'

function navbar() {
    return (
        <Navbar style={{backgroundColor:'#6441a5'}}>
            <img
                alt="Logo"
                src="../twitchIcon.png"
                width="40"
                height="40"
            />{' '}
                    React Bootstrap
        </Navbar>
    )
}

export default navbar
