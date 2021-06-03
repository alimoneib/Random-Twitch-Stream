import React, { Component } from "react";
import axios from "axios";
import endpoint from "../helpers/api_service";
import Dropdown from 'react-bootstrap/Dropdown';
import Spinner from 'react-bootstrap/Spinner';

class Homepage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            accessToken: '',
            tags: [],
            games: [],
            isMature: Boolean,
            isLoadingTags: true,
            isLoadingGames: true,
        };
    }

    async componentDidMount() {
        await axios
            .get(`${endpoint}/twitch/token`)
            .then((res) => {
                this.setState({ accessToken: res.data });
            })
            .catch((err) => {
                console.log(err);
            });

        axios
            .get(`${endpoint}/twitch/tags?accessToken=${this.state.accessToken}`)
            .then((res) => {
                this.setState({ tags: res.data, isLoadingTags: false })
            })
            .catch((err) => {
                console.log(err);
            })

        axios
            .get(`${endpoint}/twitch/games?accessToken=${this.state.accessToken}`)
            .then((res) => {
                this.setState({ games: res.data, isLoadingGames: false });
                console.log(res.data)
            })
            .catch((err) => {
                console.log(err);
            })
    }

    render() {
        console.log(this.state)
        return (
            <div>
                <h1>Homepage Playa! {this.state.accessToken}</h1>
                {this.isLoadingTags === false ?
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            Dropdown Button
                </Dropdown.Toggle>

                        <Dropdown.Menu>
                            {this.state.tags.map((tag) => (
                                <Dropdown.Item>${tag.name}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown> :

                    <Spinner animation="border" role="status">
                        {/* <span className="sr-only">Loading...</span> */}
                    </Spinner>}
                    <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic">
                            Categories
                </Dropdown.Toggle>

                        <Dropdown.Menu>
                            {this.state.games.map((game, index) => (
                                <Dropdown.Item key={index}>{game.name}</Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
            </div>
        );
    }
}

export default Homepage;
