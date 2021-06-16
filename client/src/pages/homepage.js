import React, { Component } from "react";
import axios from "axios";
import endpoint from "../helpers/api_service";
import "./homepage.css";
import Spinner from "react-bootstrap/Spinner";
import Dropdown from "../components/dropdown/dropdown.js";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ToggleButton from "react-bootstrap/ToggleButton";
import Button from "react-bootstrap/esm/Button";
import "react-input-range/lib/css/index.css";
import InputRange from "react-input-range";
import Form from "react-bootstrap/Form";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
class Homepage extends Component {
  constructor(props) {
    super(props);
    this.handleMatureFlag = this.handleMatureFlag.bind(this);

    this.setSelectedTags = this.setSelectedTags.bind(this);
    this.setSelectedGame = this.setSelectedGame.bind(this);
    this.deselectTag = this.deselectTag.bind(this);
    this.deselectGame = this.deselectGame.bind(this);
    this.handleFollowersValuesChange =
      this.handleFollowersValuesChange.bind(this);
    this.handleViewersValuesChange = this.handleViewersValuesChange.bind(this);

    this.setMaxValue = this.setMaxValue.bind(this);
    this.setMinValue = this.setMinValue.bind(this);
    this.handleRandomise = this.handleRandomise.bind(this);
    this.toggleToastFlag = this.toggleToastFlag.bind(this);

    this.state = {
      accessToken: "",
      tags: [],
      games: [],

      isMature: "either",
      selectedTags: [],
      visibleTags: [],
      selectedGame: "",
      viewersRangeValue: {
        min: 0,
        max: 200,
      },
      followersRangeValue: {
        min: 0,
        max: 1000,
      },
      isLoadingTags: true,
      isLoadingGames: true,
      isFetchingChannel: false,
      toasterFlag: false,
    };
  }

  handleFollowersValuesChange(value) {
    this.setState({
      followersRangeValue: value,
    });
  }
  handleViewersValuesChange(value) {
    this.setState({
      viewersRangeValue: value,
    });
  }

  toggleToastFlag() {
    this.setState({
      toasterFlag: false,
    });
  }

  setMinValue = (e) => {
    let originalRange = { ...this.state.viewersRangeValue };
    originalRange.min = e.target.value;
    this.setState({ viewersRangeValue: originalRange });
  };

  setMaxValue = (e) => {
    let originalRange = { ...this.state.viewersRangeValue };
    originalRange.max = e.target.value;
    this.setState({ viewersRangeValue: originalRange });
  };

  handleMatureFlag = (matureVal) => {
    this.setState({
      isMature: matureVal,
    });
  };

  setSelectedTags = (tag) => {
    this.setState({
      selectedTags: [...this.state.selectedTags, tag.tag_id],
      visibleTags: [...this.state.visibleTags, tag],
    });
  };

  deselectTag = (tagIDtbr) => {
    let filteredArray = this.state.selectedTags.filter(
      (tagID) => tagID !== tagIDtbr
    );
    this.setState({ selectedTags: filteredArray, visibleTags: filteredArray });
  };

  async handleRandomise() {
    this.setState({
      isFetchingChannel: true,
    });

    if (this.state.selectedGame === "") {
      await axios
        .post(`${endpoint}/twitch/streams/tags`, {
          isMature: this.state.isMature,
          viewersRange: this.state.viewersRangeValue,
          accessToken: this.state.accessToken,
          tagIDs: this.state.selectedTags,
        })
        .then((res) => {
          console.log(res.data);
          if (res.data) {
            window.open(`//www.twitch.tv/${res.data.username}`, "_blank");
          } else {
            toast(`We couldn't find a stream with the specified criteria`, {
              hideProgressBar: true,
            });
          }

          this.setState({
            isFetchingChannel: false,
          });
        })
        .catch((err) => {
          console.log(err);
          this.setState({
            isFetchingChannel: false,
          });
        });
    } else {
      await axios
        .post(`${endpoint}/twitch/streams`, {
          accessToken: this.state.accessToken,
          gameID: this.state.selectedGame.id,
          isMature: this.state.isMature,
          viewersRange: this.state.viewersRangeValue,
          tagIDs: this.state.selectedTags,
        })
        .then((res) => {
          console.log(res.data);
          if (res.data) {
            window.open(`//www.twitch.tv/${res.data.username}`, "_blank");
          } else {
            toast(`We couldn't find a stream with the specified criteria`, {
              hideProgressBar: true,
            });
          }
          this.setState({
            isFetchingChannel: false,
          });
        })
        .catch((err) => {
          console.log(err);
          this.setState({
            isFetchingChannel: false,
          });
        });
    }
  }

  setSelectedGame = (game) => {
    this.setState({
      selectedGame: game,
    });
  };

  deselectGame = () => {
    this.setState({ selectedGame: "" });
  };

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
        this.setState({ tags: res.data, isLoadingTags: false });
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .get(`${endpoint}/twitch/games?accessToken=${this.state.accessToken}`)
      .then((res) => {
        this.setState({ games: res.data, isLoadingGames: false });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <>
        <div className="root">
          {/* <div className="toast"> */}
          <ToastContainer bodyClassName="toaster" />
          {/* </div> */}
          <div className="center-div">
            {this.state.isFetchingChannel ? (
              <div className="loading">
                <h5>Please wait while we randomise the channels</h5>
                <h6>This won't take long</h6>
                <Spinner animation="border" role="status" />
              </div>
            ) : (
              <>
                <div className="title-body">
                  <h1>Welcome to the Twitch Stream Randomiser</h1>
                </div>
                <br></br>
                <div className="subtitle-body">
                  <h5>
                    Bored of the same old channels?! Want to get into a new
                    community but don't know where to start?! Well Twitch Stream
                    Randomiser is perfect for you. A free resource for anyone
                    who wants to quickly stumble upon a new twitch channel.
                  </h5>
                  <h5>
                    Just quickly set the filters you would like, click the
                    "Randomise" button, and you'll be redirected to a random
                    twitch channel that meets your criteria.
                  </h5>
                </div>
                <br></br>
                {this.state.isLoadingGames ? (
                  <div className="loading">
                    <h5>Please wait while we fetch real-time data</h5>
                    <h6>This won't take long</h6>
                    <Spinner animation="border" role="status" />
                  </div>
                ) : (
                  <div className="container">
                    <Container>
                      <Row>
                        <Col>
                          <div className="dropdown">
                            <Dropdown
                              options={this.state.tags}
                              title="Tags"
                              setSelectedTags={this.setSelectedTags}
                              deselectTag={this.deselectTag}
                              selectedTags={this.state.visibleTags}
                            />
                          </div>
                        </Col>
                        <Col>
                          <div className="dropdown">
                            <Dropdown
                              options={this.state.games}
                              title="Game/Category"
                              setSelectedGame={this.setSelectedGame}
                              deselectGame={this.deselectGame}
                              selectedGame={this.state.selectedGame}
                            />
                          </div>
                        </Col>
                        <Col>
                          <label className="subtitle-body">Mature?!</label>
                          <div className="mature-bar">
                            <ToggleButtonGroup
                              type="radio"
                              className="mature-btn"
                              name="matureRadio"
                              defaultValue="either"
                              onChange={this.handleMatureFlag}
                            >
                              <ToggleButton className="radio-btn" value="yes">
                                {" "}
                                Yes
                              </ToggleButton>
                              <ToggleButton className="radio-btn" value="no">
                                {" "}
                                No
                              </ToggleButton>
                              <ToggleButton
                                className="radio-btn"
                                value="either"
                              >
                                {" "}
                                Either
                              </ToggleButton>
                            </ToggleButtonGroup>
                          </div>
                          <br></br>
                          <label className="subtitle-body">
                            Number of Viewers:
                          </label>
                          <div className="viewers-slider">
                            <Container>
                              <InputRange
                                maxValue={1000}
                                minValue={0}
                                formatLabel={(value) => `${value}`}
                                value={this.state.viewersRangeValue}
                                onChange={(value) =>
                                  this.handleViewersValuesChange(value)
                                }
                              />
                              <br></br>
                              <Row>
                                <Col>
                                  <Form.Control
                                    className="viewers-input input-control"
                                    type="number"
                                    id="minVal"
                                    value={this.state.viewersRangeValue.min}
                                    onChange={this.setMinValue}
                                    max={this.state.viewersRangeValue.max}
                                    min="0"
                                  />
                                </Col>
                                <Col>
                                  <Form.Control
                                    type="number"
                                    className="viewers-input"
                                    id="maxVal"
                                    min={this.state.viewersRangeValue.min}
                                    value={this.state.viewersRangeValue.max}
                                    onChange={this.setMaxValue}
                                    max="1000"
                                  />
                                </Col>
                              </Row>
                            </Container>
                          </div>
                        </Col>
                      </Row>
                    </Container>
                    <br></br>
                    <div className="randomise-btn-div">
                      <Button
                        className="randomise-btn"
                        size="lg"
                        onClick={this.handleRandomise}
                      >
                        Randomise
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </>
    );
  }
}

export default Homepage;
