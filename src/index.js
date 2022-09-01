import React from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const API_ENDPOINT = process.env.REACT_APP_BACKEND_API;
var EVENT_NAME = process.env.REACT_APP_EVENT_NAME

document.title = "re:Invent 2022 - Rate limiting demo"

if (!EVENT_NAME) {
  EVENT_NAME = 'AWS Events';
}

if (!cookies.get('userID')) cookies.set('userID', guid(), { path: '/' });
var user_id = cookies.get('userID');

const colors = ['bg-danger', 'bg-dark', 'bg-warning', 'bg-primary', 'bg-success']

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

class Circle extends React.Component {
  handleClick (i){
    alert('Thanks for voting ' + i);
  }

  render() {
    var thisClass="col-xl text-light btn btn-dark btn-circle btn-xl " + colors[this.props.value-1]
    const {onClick} = this.props;
    return (
      <button
        className={thisClass}
        onClick={onClick}
      >
        {this.props.value}
      </button>
    );
  }
}

class VoteOutput extends React.Component {

  render() {
    var score = this.props.dataFromVote;
    var status = this.props.status;

    if (score && status === 200) {
        return (
          <div className="container">
            <div className="row m-2 text-center justify-content-center"><h5>Thanks for your vote!</h5></div>
            <div className="row m-2 text-center justify-content-center"><h5>We have recorded the color <b>{score}</b> as your selection.</h5></div>
          </div>
        );
    }
    else {
        return (
          <div className="container">
            <div className="row m-2 text-center justify-content-center"></div>
          </div>
        );
    }
  }
}

class Options extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hide: false,
      error: null,
      isLoaded: false,
      items: [],
      score: null,
      status: null,
    };
  }

  handleChildClick(a, i) {
    this.setState({hide: false});
    this.setState({score: a});

    fetch(API_ENDPOINT + '/info/store_feedback', {
        method: 'POST',
        headers : {'Content-Type': 'application/json'},
        body:JSON.stringify({user_id:user_id, score:a})
    })
    .then((res) => {
      console.log(res);
      this.setState({
          status: res.status,
      });
      if (res.status !== 200) {
        this.setState({
            error:
              {message: "Can't store data"},
          });
        setTimeout(() => {
          console.log(this.error);
          this.setState({
              error: null,
              score: null,
              status: null,
          });
        }, 5000);
      }
      res.json();
    })
    .catch((err) => {
      console.log(err);
      this.setState({
          error: err
        });
      setTimeout(() => {
        this.setState({
            error: null,
        });
      }, 5000);
    })
  }

  renderOptions(i, c = null) {
    return <Circle
      value={i}
      onClick={this.handleChildClick.bind(this, c , this.state.items)}
      />;
  }

  render() {
    const {hide, error, score} = this.state;
    if (hide) {
        return (
          <div className="container">
            <div className="row m-2 text-center justify-content-center"><h2>Thanks for your vote!</h2></div>
            <div className="row m-2 text-center justify-content-center"><h4>We have recorded the color <b>{score}</b> as your selection.</h4></div>
          </div>
        );
    }
    if (error) {
      return (
        <div className="container justify-content-center text-center">
          <div className="row badge badge-pill badge-danger m-4 p-4 col-md-auto"><h2>Error: {error.message}</h2></div>
        </div>
      );
    } else {
    return (
      <div className="container">
        <div className="row m-2 text-center justify-content-center"><h1>{EVENT_NAME}</h1></div>
        <div className="row m-2 text-center justify-content-center">
          {this.renderOptions(1, "Red")}
          {this.renderOptions(2, "Black")}
          {this.renderOptions(3, "Yellow")}
          {this.renderOptions(4, "Blue")}
          {this.renderOptions(5, "Green")}
        </div>
        <div className="row m-2 text-center justify-content-center"><h2>Pick your favorite color</h2></div>
        <VoteOutput dataFromVote = {this.state.score} status = {this.state.status}/>
      </div>
    );
    }
  }
}

class Vote extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hide: false,
      error: null,
      isLoaded: false,
      items: [],
      score: null,
    };
  }

  render() {
    return (
      <div className="vote">
        <div className="voting-options">
          <Options />
        </div>
      </div>
    );
  }
}

// ========================================

const root = createRoot(document.getElementById('root'));
root.render(<Vote />);
