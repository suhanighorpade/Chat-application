import React from 'react'
import { connect } from 'react-redux';
import LoadingOverlay from 'react-loading-overlay';
import { Link } from 'react-router-dom';
import { Modal, Button, Form, Col, ListGroup, ListGroupItem, Row } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Alert from 'react-bootstrap/Alert'

import {
    setAuthorizationToken,
    getCurrentUser,
    getAllRoomsOfUser,
    getAllPublicRooms,
    joinPublicRoom,
    createRoom,
    setRoomError
} from '../store/actions/auth';
import { initRoom } from '../store/actions/chatActions'
import { logout } from '../store/actions/auth'
import { setTokenHeader } from '../services/api';
import CreateRoom from './roomPopUp';

import Icon from '../Assests/Images/icon-logo-2.png'
import Profile from '../Assests/Images/acc.png'
import searchIcon from "../Assests/Images/search-icon.png";

import './RoomPage.css'


class RoomPage extends React.Component {

    state = {
        show: false,
        invites: [],
        roomName: "",
        description: "",
        private: true,
        task: '',
    }

    handleClose = () => {
        this.setState({ show: false , invites: []});
        
    }
    handleShow = () => this.setState({ show: true });

    handleSubmit = () => {
        // Validation
        if (this.state.roomName.length === 0) {
            this.props.setRoomError("Name can't be empty")
            return
        }

        const roomObject = {
            title: this.state.roomName,
            description: this.state.description,
            private: this.state.private
        }

        this.props.createRoom(roomObject);

        this.setState({ show: false , invites: []});
        console.log(this.state.roomName, this.state.description, this.state.private, this.state.invites)
    }

    emailChangeHandler = (event) => {
        this.setState({ task: event.target.value })
    }

    nameChangeHandler = (event) => {
        this.setState({ roomName: event.target.value })
    }

    descriptionChangeHandler = (event) => {
        this.setState({ description: event.target.value })
    }

    privacyChangeHandler = (event) => {
        if (event.target.value === "Public")
            this.setState({
                private: false
            })
        else
            this.setState({
                private: true
            })
    }

    handleInvites = (task) => {
        if (task !== "") {
            this.setState({ invites: [...this.state.invites, task], task: "" })
        }
    }

    joinedRoomNames = [];
    componentDidMount() {
        if (!localStorage.jwtToken) {
            this.props.history.push("/authenticate/signin")
            return;
        }
        // Token exists.
        // Add this token to api header
        setTokenHeader(localStorage.jwtToken)

        if (!this.props.isAuthenticated)
            this.props.getCurrentUser();

        // Get all rooms of this user
        this.props.getAllRoomsOfUser();

        console.log("GETTING PUBLIC ROOMS")
        // Get all the public rooms
        this.props.getAllPublicRooms();

    }

    roomList = () => {
        if (this.props.allRooms) {
            return this.props.allRooms.map((roomObject, index) => {
                return <button
                    key={index}
                    type="button"
                    className="list-group-item list-group-item-action rounded border border-dark"
                    onClick={() => {
                        // console.log(roomObject)
                        this.props.initRoom(roomObject.title)
                        this.props.history.push("/chat")
                    }
                    }
                >
                    {roomObject.title}
                </button>
            })
        }
    }

    logout = e => {
        e.preventDefault();
        this.props.logout();
    };

    publicRoomList = () => {
        if (this.props.allPublicRooms) {
            return this.props.allPublicRooms.map((roomObject, index) => {
                if (!this.joinedRoomNames.includes(roomObject.title))
                    return <button
                        key={index}
                        type="button"
                        className="list-group-item list-group-item-action rounded border border-dark"
                        onClick={() => {
                            this.props.joinPublicRoom(roomObject.title)
                            console.log(roomObject)
                        }
                        }
                    >
                        {roomObject.title}
                    </button>
            })
        }
    }

    modalElement = () => {
        return (
            <Modal show={this.state.show} onHide={this.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Room</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group >
                            <Form.Label>Room Name</Form.Label>
                            <Form.Control type="text" placeholder="Enter Name" onChange={this.nameChangeHandler} />
                        </Form.Group>

                        <Form.Group >
                            <Form.Label>Description</Form.Label>
                            <Form.Control type="text" placeholder="Enter Description" onChange={this.descriptionChangeHandler} />
                        </Form.Group>

                        <Form.Group controlId="exampleForm.SelectCustom">
                            <Form.Label>Privacy</Form.Label>
                            <Form.Control as="select" custom onChange={this.privacyChangeHandler}>
                                <option>Private</option>
                                <option>Public</option>
                            </Form.Control>
                        </Form.Group>

                        <Form.Group>

                            <Form.Label>Invite</Form.Label>
                            <Row>
                                <Col sm="10"><Form.Control type="text" placeholder="Enter Email" onChange={this.emailChangeHandler} value={this.state.task} /></Col>
                                <Col><Button className="float-right" onClick={() => { this.handleInvites(this.state.task) }}>Add</Button></Col>
                            </Row>
                            <Form.Group style={{ marginTop: 20, }}>
                                <ListGroup >{this.state.invites.length === 0 ? null : this.state.invites.map((invite) =>
                                    <ListGroupItem style={{ flexDirection: 'row' }}>{invite}

                                        <span className="glyphicon glyphicon-trash"></span>

                                    </ListGroupItem>
                                )}
                                </ListGroup>
                            </Form.Group>
                            <Col>

                            </Col>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" onClick={this.handleClose}>
                        Close
                        </Button>
                    <Button variant="outline-primary" onClick={this.handleSubmit}>
                        Create!
                        </Button>
                </Modal.Footer>
            </Modal>
        )

    }

    render() {
        // console.log(this.props)
        if (this.props.allRooms)
            this.props.allRooms.forEach((roomObject) => {
                this.joinedRoomNames.push(roomObject.title)
            })
        if (this.props.roomError && this.props.roomError.length !== 0) {
            return (
                <Alert onClose={() => this.props.setRoomError("")} dismissible variant="danger">
                    <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
                    <p>
                        {this.props.roomError}
                    </p>
                </Alert>
            )
        }


        return (
            <LoadingOverlay
                active={!this.props.isRoomLoaded || this.props.joiningNewRoom}
                spinner
                text="Retrieving the rooms that you are in..." >

                <ul className="nav">
                    <li className="nav-item">
                        <div className="icon-section-auth">
                            <img src={Icon} alt="icon" width="5px" className="icon" onClick={() => alert("ICON")} />
                        </div>
                    </li>
                    <li className="navbar-brand">
                        <Link to="/authenticate/signin" onClick={this.props.logout}>Logout</Link>
                    </li>
                </ul>

                <div className="roompage">
                    <div className="verticalLine">
                        <div className="form2">

                            <div className="form">
                                <p className="form-title">
                                    Discover Public Rooms </p>
                                <p className="form-subtitle">
                                    Open to all !!  </p>

                                <nav className="navbar navbar-light bg-light justify-content-between">
                                    <a className="navbar-brand mb-0 h1">Choose your Interest :)</a>
                                    <form className="form-inline">
                                        <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search"></input>
                                        <button className="btn my-2 my-sm-0" type="button">
                                            <img src={searchIcon} width="45" height="40" alt="search"></img>
                                        </button>
                                    </form>
                                </nav>

                                <div className="list-group">
                                    {this.publicRoomList()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form1">
                        <div className="form">
                            <p className="form-title">
                                Welcome !</p>
                            <p className="form-subtitle">
                                Choose a Chat Room to get Started with :) </p>
                            <div className="list-group">
                                {/* <li className="list-group-item list-group-item-action rounded border border-dark">Cras justo odio </li> */}
                                {this.roomList()}
                            </div>
                            <button className="form-submit">
                                Let's go!</button>
                            <p className="form-bottom-text">
                                Don't have a room yet?
                                <a
                                    href="#"
                                    onClick={() => {
                                        this.handleShow();
                                        console.log("BUTTON CLICK")
                                    }}
                                    className="new-room"
                                > Create One!</a>
                            </p>
                        </div>
                    </div>

                </div>

                {this.modalElement()}
            </LoadingOverlay>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.currentUser.isAuthenticated,
        isRoomLoaded: state.currentUser.isRoomLoaded,
        allRooms: state.currentUser.allRooms,
        allPublicRooms: state.currentUser.allPublicRooms,
        joiningNewRoom: state.currentUser.joinPublicRoom,
        roomError: state.currentUser.roomError
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        getCurrentUser: () => { dispatch(getCurrentUser()) },
        getAllRoomsOfUser: () => { dispatch(getAllRoomsOfUser()) },
        initRoom: (roomName) => { dispatch(initRoom(roomName)) },
        getAllPublicRooms: () => { dispatch(getAllPublicRooms()) },
        joinPublicRoom: (roomName) => { dispatch(joinPublicRoom(roomName)) },
        logout: () => { dispatch(logout()) },
        createRoom: (roomData) => { dispatch(createRoom(roomData)) },
        setRoomError: (errorMessage) => { dispatch(setRoomError(errorMessage)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RoomPage);