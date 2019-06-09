import React from 'react';
import  { Redirect } from 'react-router-dom'
import userFile from './users.json'
import Upload from "./upload.js"
import axios from 'axios';
import "./css/login.css"

var fs = require("fs")

function checkUsername(user, pass) {
    var password = userFile[user];
    if (typeof "string" == typeof password) {
        if (pass === password)
          return true
    }
    return false
}

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
        username: '',
        password: '',
        confirmpassword: '',
        account: true,
        loggedin: false
    };

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleConfirmPasswordChange = this.handleConfirmPasswordChange.bind(this);
    this.handleAccountSwitch = this.handleAccountSwitch.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleUsernameChange(e) {
    this.setState({username: e.target.value});
  }
  handlePasswordChange(e) {
    this.setState({password: e.target.value});
  }
  handleConfirmPasswordChange(e) {
    this.setState({confirmpassword: e.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.state.account) {
        var valid = checkUsername(this.state.username, this.state.password);
        if (valid) {
          this.setState({loggedin: true});
        }
        else {
          alert("Invalid username and/or password")
        }
    }

    else {

        var postData = {
          username: this.state.username,
          password: this.state.password
        };

        let axiosConfig = {
              headers: {
                "Content-Type": "application/json;charset=UTF-8",
                "Access-Control-Allow-Origin": "*"
              }
        };

        let currentComponent = this;
        axios.post("http://0.0.0.0:5444/adduser", postData, axiosConfig)
        .then(function (response) {

          //var picList = response.data.pic_list;

          //console.log(picList);
        })
        .catch(function (error) {
          //console.log(error);
        });

    }
  }

  handleAccountSwitch(e) {
    console.log(this.state.account)

    this.setState({account: !this.state.account});
  }

  validateForm() {
    if (this.state.account) {
      return (this.state.password !== '' &&
              this.state.username !== '')
    }
    return (this.state.password === this.state.confirmpassword &&
            this.state.password !== '')
  }

  render() {
    if (this.state.loggedin) {
      return (
        <div>
            <br />
            <Upload username={this.state.username}/>
        </div>);
    }
    else {
      if (this.state.account) {
          return (
            <div>
            <h5> LOGIN </h5>

            <form className="form" onSubmit={this.handleSubmit}>

              <label>
                Username:
                <input type="text" style={{fontSize: '30px', borderRadius: '5px'}} className="input" value={this.state.username} onChange={this.handleUsernameChange} />
              </label>

              <br/>

              <label>
                Password:
                <input type="password" style={{fontSize: '30px', borderRadius: '5px'}} className="buttons" value={this.state.password} onChange={this.handlePasswordChange} />
              </label>

              <br/>

              <input type="submit" style={{fontSize: '20px', borderRadius: '10px', backgroundColor: "#D0D0D0"}} className="button" value="Submit" disabled={!this.validateForm()}/>
            </form>
            <p> Don't have an account? </p>
            <button className="button" onClick={this.handleAccountSwitch}>Sign up</button>
            </div>
          );
        }
    else {
      return (
        <div>
        <form className="form" onSubmit={this.handleSubmit}>
          <h5> SIGNUP </h5>
          <label>
            Username:
            <input className="input" style={{fontSize: '30px', borderRadius: '5px'}} type="text" value={this.state.username} onChange={this.handleUsernameChange} />
          </label>

          <br/>

          <label>
            Password:
            <input className="input" style={{fontSize: '30px', borderRadius: '5px'}} type="password" value={this.state.password} onChange={this.handlePasswordChange} />
          </label>

          <br/>

          <label>
            Confirm Password:
            <input className="input" style={{fontSize: '30px', borderRadius: '5px'}} type="password" value={this.state.confirmpassword} onChange={this.handleConfirmPasswordChange} />
          </label>

          <br/>

          <input className="button" type="submit" value="Submit" disabled={!this.validateForm()}/>
        </form>
        <p> Already have an account? </p>
        <button className="button" onClick={this.handleAccountSwitch}>Login</button>
        </div>
      );
    }

    }
  }
}

export default Login;
