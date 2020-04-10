import React, { Component } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import { listNotes } from "./graphql/queries";
import { withAuthenticator } from "aws-amplify-react";

class App extends Component {
  state = {
    emptyNote: { id: "", note: "" },
    currentNote: { id: "", note: "" },
    notes: [],
    formButtonText: "Add"
  };

  async componentDidMount() {
    const result = await API.graphql(graphqlOperation(listNotes));
    this.setState({ notes: result.data.listNotes.items });
  }

  handleNote = async noteId => {
    const { notes } = this.state;
    const selectedNote = notes.find(note => note.id === noteId);
    this.setState({
      currentNote: Object.assign({}, selectedNote),
      formButtonText: "Update"
    });
  };

  handleChangeNote = event => {
    let updatedNote = this.state.currentNote;
    updatedNote.note = event.target.value;
    this.setState({ currentNote: updatedNote });
  };

  handleAddNote = async event => {
    event.preventDefault();
    const { currentNote, emptyNote, notes } = this.state;
    const result = await API.graphql(
      graphqlOperation(createNote, { input: { note: currentNote.note } })
    );
    const newNote = result.data.createNote;
    const updatesNotes = [newNote, ...notes];
    this.setState({
      notes: updatesNotes,
      currentNote: Object.assign({}, emptyNote)
    });
  };

  handleUpdateNote = async event => {
    event.preventDefault();
    const { currentNote, emptyNote, notes } = this.state;
    const result = await API.graphql(
      graphqlOperation(updateNote, {
        input: { note: currentNote.note, id: currentNote.id }
      })
    );
    if (result.data !== null && result.data.updateNote !== null) {
      const updatedNotes = notes.map(note => {
        if (note.id === result.data.updateNote.id) {
          note.note = result.data.updateNote.note;
        }

        return note;
      });

      this.setState({
        notes: updatedNotes,
        currentNote: Object.assign({}, emptyNote),
        formButtonText: "Add"
      });
    }
  };

  handleDeleteNote = async itemId => {
    const { notes } = this.state;
    const result = await API.graphql(
      graphqlOperation(deleteNote, { input: { id: itemId } })
    );
    const updatedNotes = notes.filter(
      note => note.id !== result.data.deleteNote.id
    );
    this.setState({ notes: updatedNotes });
  };

  render() {
    const { currentNote, notes, formButtonText } = this.state;
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <h1 className="code f2-1">Amplify Notetaker</h1>
        <form
          onSubmit={
            formButtonText === "Add"
              ? this.handleAddNote
              : this.handleUpdateNote
          }
          className="mb3"
        >
          <input
            type="text"
            className="pa2 f4"
            placeholder="write your note"
            onChange={this.handleChangeNote}
            value={currentNote.note}
          />
          <button className="pa2 f4" type="submit">
            {formButtonText} Note
          </button>
        </form>

        {/* Notes List */}
        {notes.map(item => (
          <div key={item.id} className="flex items-center">
            <li
              className="list pa1 f3 pointer"
              onClick={() => this.handleNote(item.id)}
            >
              {item.note}
            </li>
            <button
              onClick={() => this.handleDeleteNote(item.id)}
              className="bg-transparent bn f4 pointer"
            >
              <span>&times;</span>
            </button>
          </div>
        ))}
      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true });
