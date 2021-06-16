import React, { Component } from "react";
import "./dropdown.css";
import Select from "react-select";
import update from "immutability-helper";
import Button from "react-bootstrap/Button";

export default class dropdown extends Component {
  constructor(props) {
    super(props);

    this.handleItemClick = this.handleItemClick.bind(this);
    this.handleRemoveGame = this.handleRemoveGame.bind(this);
    this.handleRemoveTag = this.handleRemoveTag.bind(this);
    this.state = {
      options: this.props.options,
      pickedTags: [],
      pickedGame: "",
    };
  }

  handleItemClick = (object) => {
    if (object.tag_id) {
      object.isDisabled = true;

      const index = this.state.options.findIndex(
        (option) => option.tag_id === object.tag_id
      );
      const newOptions = update(this.state.options, {
        $splice: [[index, 1, object]],
      });

      this.setState({
        pickedTags: [...this.state.pickedTags, object],
        options: newOptions,
      });

      this.props.setSelectedTags(object);
    } else {
      this.setState({
        pickedGame: object,
      });
      this.props.setSelectedGame(object);
    }
  };

  handleRemoveTag = (object) => {
    let filteredArray = this.state.pickedTags.filter(
      (tagObj) => tagObj.tag_id !== object.tag_id
    );

    object.isDisabled = false;

    const index = this.state.options.findIndex(
      (option) => option.tag_id === object.tag_id
    );
    const newOptions = update(this.state.options, {
      $splice: [[index, 1, object]],
    });

    this.setState({ pickedTags: filteredArray, options: newOptions });
    this.props.deselectTag(object.tag_id);
  };
  handleRemoveGame = () => {
    this.setState({ pickedGame: "" });
    this.props.deselectGame();
  };

  async componentDidMount() {
    if (this.props.selectedTags !== []) {
      this.setState({
        pickedTags: this.props.selectedTags,
      });
    }
    if (this.props.selectedGame !== "") {
      this.setState({
        pickedGame: this.props.selectedGame,
      });
    }
  }

  render() {
    return (
      <div className="dropdown-root">
        <Select
          options={this.props.options}
          getOptionValue={(option) => option.name}
          getOptionLabel={(option) => option.name}
          value={null}
          placeholder={`Choose ${this.props.title}`}
          closeMenuOnSelect={true}
          closeMenuOnScroll
          isSearchable
          onChange={(option) => this.handleItemClick(option)}
          isOptionDisabled={(option) => option.isDisabled}
        />

        {this.props.title === "Tags" ? (
          this.state.pickedTags.length > 0 ? (
            <div className="dropdown-picked">
              {this.state.pickedTags.map((tag) => (
                <Button
                  className="dropdown-picked-tag"
                  onClick={() => this.handleRemoveTag(tag)}
                  name={tag}
                >
                  {tag.name}
                </Button>
              ))}
            </div>
          ) : null
        ) : this.state.pickedGame !== "" ? (
          <div className="dropdown-picked">
            <div
              className="dropdown-picked-tag"
              onClick={this.handleRemoveGame}
            >
              {this.state.pickedGame.name}
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
