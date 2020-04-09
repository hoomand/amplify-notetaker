import React, { Component } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { createNote } from "./graphql/mutations";
import { withAuthenticator } from "aws-amplify-react";

class App extends Component {
  state = {
    note: "",
    notes: []
  };

  handleChangeNote = event => {
    this.setState({ note: event.target.value });
  };

  handleAddNote = event => {
    event.preventDefault();
    const { note } = this.state;
    API.graphql(graphqlOperation(createNote, { input: { note } }));
  };

  render() {
    const { notes } = this.state;
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <h1 className="code f2-1">Amplify Notetaker</h1>
        <form onSubmit={this.handleAddNote} className="mb3">
          <input
            type="text"
            className="pa2 f4"
            placeholder="write your note"
            onChange={this.handleChangeNote}
          />
          <button className="pa2 f4" type="submit">
            Add Note
          </button>
        </form>

        {/* Notes List */}
        {notes.map(item => (
          <div key={item.id} className="flex items-center">
            <li className="list pa1 f3">{item.note}</li>
            <button className="bg-transparent bn f4">
              <span>&times;</span>
            </button>
          </div>
        ))}
      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true });
