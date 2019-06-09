import React from 'react';
//import { Redirect } from 'react-router-dom'
import './App.css';
import Login from "./Pages/login.js"
import Header from "./Pages/header.js"

class App extends React.Component {

  render() {
    return (
      <div style={{backgroundColor:"#3fc1c9", minHeight: window.innerHeight+"px"}}>
          <Header/>
          <center>
          <div style={{width: '85%', height: window.innerHeight+"px", backgroundColor:"white", borderRadius: "3px", padding: '30px'}}>
              <Login />
          </div>
        </center>
      </div>
    );
  }


}

export default App;
