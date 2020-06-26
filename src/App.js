import React, {Component} from 'react';
import './App.css';
import Notes from './components/Notes/Notes';
import NotesList from './components/Notes/NotesList';
import Note from './components/Notes/Note';
import NoteForm from './components/Notes/NoteForm';
import Preview from './components/Preview/Preview';
import Message from './components/Message/Message'
import Alert from './components/Alert/Alert';
class App extends Component {
    state = {
        notes: [],
        title: '',
        content: '',
        selectedNote: null,
        creating: false,
        editing: false,
        validationErrors: []
    };

    componentWillMount() {
        if (localStorage.getItem('notes')) {
            this.setState({notes: JSON.parse(localStorage.getItem('notes'))});
        } else {
            localStorage.setItem('notes', JSON.stringify([]));
            this.setState({nots: []});
        }
    }

    componentDidUpdate() {
        const { validationErrors } = this.state;
        if (validationErrors.length !== 0) {
            setTimeout(() => {
                this.setState({validationErrors: []});
            }, 3000);
        }
    }

    saveToLocalStorage(name, item) {
        localStorage.setItem(name, JSON.stringify(item));
    };

    validate() {
        const {title, content} = this.state;
        const validationErrors = [];
        let passed = true;
        if (!title) {
            validationErrors.push("الرجاء إدخال عنوان الملاحظة");
            passed = false;
        }
        if (!content) {
            validationErrors.push("الرجاء إدخال محتوى الملاحظة");
            passed = false;
        }
        this.setState({validationErrors: validationErrors});
        return passed;
    }

    changeTitleHandler = (event) => {
        this.setState({title: event.target.value});
    };

    changeContentHandler = (event) => {
        this.setState({content: event.target.value});
    };

    addNoteHandler = () => {
        this.setState({creating: true, title: '', content: '', editing: false});
    };

    selectNoteHandler = (noteId) => {
        this.setState({selectedNote: noteId, creating: false, editing: false});
    };

    saveNoteHandler = () => {
        if(!this.validate()) return;
        const {title, content, notes} = this.state;
        const note = {
            id: new Date(),
            title: title,
            content: content,
        }
        const updatedNotes = [...notes, note];
        this.saveToLocalStorage('notes', updatedNotes);
        this.setState({
            notes: updatedNotes,
            title: '',
            content: '',
            creating: false,
            selectedNote: note.id
        });
    };

    deleteNoteHandler = (noteId) => {
        const notes = [...this.state.notes];
        const noteIndex = [...this.state.notes].findIndex(note => note.id === noteId);
        notes.splice(noteIndex, 1);
        this.saveToLocalStorage('notes', notes);
        this.setState({notes: notes, selectedNote: null});
    };

    editNoteHandler = (noteId) => {
        const note = this.state.notes.filter(note => note.id === noteId)[0];
        this.setState({editing: true, title: note.title, content: note.content});
    };

    updateNoteHandler = () => {
        if(!this.validate()) return;
        const {title, content, notes, selectedNote} = this.state;
        const updatedNotes = [...notes];
        const noteIndex = notes.findIndex(note => note.id === selectedNote);
        updatedNotes[noteIndex] = {
            id: selectedNote,
            title: title,
            content: content
        };
        this.saveToLocalStorage('notes', updatedNotes);
        this.setState({
            notes: updatedNotes,
            editing: false,
            title: '',
            content: ''
        });
    };

    getAddNote = () => {
        const {title, content} = this.state;
        return (
            <NoteForm
            formTitle='ملاحظة جديدة'
            title={title}
            content={content}
            titleChanged={this.changeTitleHandler}
            contentChanged={this.changeContentHandler}
            submitText='حفظ'
            submitClicked={this.saveNoteHandler}
        />
        );
    }

     getPreview = () => {
        const {selectedNote, notes, title, content, editing} = this.state;
        if (notes.length === 0) {
            return (
                <Message title='لا يوجد ملاحظات'/>
            );
        }

        if (!selectedNote) {
            return (
                <Message title='الرجاء اختيار ملاحظة'/>
            );
        }

        const note = notes.filter(note => {
            return note.id === selectedNote;
        })[0];

        let noteDisplay = (
            <div>
                <h2>{note.title}</h2>
                <p>{note.content}</p>
            </div>
        );

        if (editing) {
            noteDisplay = (
                <NoteForm
                    formTitle='تعديل ملاحظة'
                    title={title}
                    content={content}
                    titleChanged={this.changeTitleHandler}
                    contentChanged={this.changeContentHandler}
                    submitText='تعديل'
                    submitClicked={this.updateNoteHandler}
                />
            )
        }

        return (
            <div>
                {!editing &&
                <div className="note-operations">
                    <a href="#" onClick={() => this.editNoteHandler(note.id)}><i className="fa fa-pencil-alt"/></a>
                    <a href="#" onClick={() => this.deleteNoteHandler(note.id)}><i className="fa fa-trash"/></a>
                </div>
                }
                {noteDisplay}
            </div>
        );
    };

    render() {
        const {validationErrors} = this.state;
        return (
            <div className="App">
                <Notes>
                    <NotesList>
                        {this.state.notes.map((note) => (
                            <Note
                                key={note.id}
                                title={note.title}
                                active={this.state.selectedNote === note.id}
                                noteClicked={() => this.selectNoteHandler(note.id)}
                            />
                        ))}
                    </NotesList>
                    <button className="add-btn" onClick={this.addNoteHandler}>
                        +
                    </button>
                </Notes>
                <Preview>
                    {this.state.creating ? this.getAddNote() : this.getPreview()}
                </Preview>

                {validationErrors.length !== 0 && <Alert validationMessages={validationErrors} />}
            </div>
        );
    }
}

export default App;
