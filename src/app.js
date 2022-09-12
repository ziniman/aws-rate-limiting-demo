import React from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const API_ENDPOINT = process.env.REACT_APP_BACKEND_API;
var EVENT_NAME = process.env.REACT_APP_EVENT_NAME;

document.title = EVENT_NAME

if (!EVENT_NAME) {
  EVENT_NAME = 'AWS Events';
}

if (!cookies.get('userID')) cookies.set('userID', guid(), { path: '/' });
var user_id = cookies.get('userID');

const colors = ['bg-danger', 'bg-secondary', 'bg-warning', 'bg-primary', 'bg-success']

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
    var timer = this.props.timer;

    if (score && status === 200) {
        return (
          <div className="container">
            <div className="row m-2 text-center justify-content-center"><h5>Thanks for your vote!</h5></div>
            <div className="row m-2 text-center justify-content-center"><h5>We have recorded the color <b>{score}</b> as your selection.</h5></div>
            <div className="row m-2 text-center justify-content-center"><h6>Call time: <b>{timer}</b>ms</h6></div>
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
      timer: 0,
    };
  }

  handleChildClick(a, i) {
    this.setState({hide: false});
    this.setState({score: a});
    var click_t = Date.now();

    fetch(API_ENDPOINT + '/info/store_feedback', {
        method: 'POST',
        headers : {'Content-Type': 'application/json'},
        body:JSON.stringify({user_id:user_id, score:a})
    })
        .then(async res => {
            const data = await res.json();

            console.log(data.message);
            this.setState({
                status: res.status,
                timer: Date.now() - click_t,
            });
            if (res.status !== 200) {
                this.setState({
                    error:
                        {message: data.message},
                });
                setTimeout(() => {
                    this.setState({
                        error: null,
                        score: null,
                        status: null,
                    });
                }, 5000);
            }


        })
    .catch((err) => {
      console.log(JSON.stringify(err));
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
          <div className="row badge block-wrap badge-pill badge-danger m-5 p-2"><h4>Error: {error.message}</h4></div>
        </div>
      );
    } else {
    return (
      <div className="container">
        <div className="row m-2 text-center justify-content-center"><h1>{EVENT_NAME}</h1></div>
        <div className="row m-2 text-center justify-content-center">
          {this.renderOptions(1, "Red")}
          {this.renderOptions(2, "Gray")}
          {this.renderOptions(3, "Yellow")}
          {this.renderOptions(4, "Blue")}
          {this.renderOptions(5, "Green")}
        </div>
        <div className="row m-2 text-center justify-content-center"><h2>Pick your favorite color</h2></div>
        <VoteOutput dataFromVote = {this.state.score} status = {this.state.status} timer = {this.state.timer}/>
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

export default Vote;

const root = createRoot(document.getElementById('root'));
root.render(<Vote />);
