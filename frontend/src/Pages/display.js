import React from 'react';
import axios from 'axios';

function getName(str) {
  var arr = str.split("/")
  var editted = arr[arr.length -1].split(".jpeg")
  return editted[0] + ".tiff"
}
class Display extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
          index: 0,
          files: this.props.files,
          file_results: [],
          downloaded: false,
          downloadpath: ""
      };

      this.onNext = this.onNext.bind(this)
      this.onBack = this.onBack.bind(this)
      this.download = this.download.bind(this)
    }

    componentDidMount() {
      var resultFiles = []
      for (var i = 0; i < this.props.files.length; i++) {
          resultFiles.push((this.props.files[i].substring(0, this.props.files[i].length-5) + "_result.jpeg"))
      }
      this.setState({file_results: resultFiles})
    }

    onNext(e) {
        //Find length of array
        if (this.props.files.length-1 > this.state.index) {
            console.log(this.props.files.length )
            console.log(this.state.index)
            this.setState({index: this.state.index + 1})
            this.setState({downloaded: false})

        }
    }

    onBack(e) {
        if (this.state.index > 0) {
            this.setState({index: this.state.index - 1})
            this.setState({downloaded: false})
        }
    }

    download(e) {
        var postData = {
          username: this.props.username,
          filename: this.state.files[this.state.index]
        };

        let axiosConfig = {
              headers: {
                "Content-Type": "application/json;charset=UTF-8",
                "Access-Control-Allow-Origin": "*"
              }
        };

        let currentComponent = this;
        axios.post("http://0.0.0.0:5444/getcsv", postData, axiosConfig)
        .then(function (response) {
            currentComponent.setState({downloaded: true})
            currentComponent.setState({downloadpath: response.data.url})
        })
        .catch(function (error) {
          //console.log(error);
        });
    }


    render() {
      const { files, index, file_results } = this.state;

      console.log(String(typeof file_results[index]))

      if (typeof file_results[index] == typeof files[index]) {
        return (
          <div>
        	    <center>
                  <p style={{fontSize: '20px'}}>File: <b>{getName(files[index])}</b></p>
              		<div>
              		    	<img src={process.env.PUBLIC_URL + (files[index] + "")} alt="Original" style={{display: "inline-block", margin:'10px', width: "40%", height: "40%"}}/>
                        <img src={process.env.PUBLIC_URL + (file_results[index] + "")} alt="New" style={{display: "inline-block", margin:'10px', width: "40%", height: "40%"}}/>
                  </div>
        	    </center>

        	    <div>
        	    	<button onClick={this.onBack} style={{display: "inline-block", margin:'30px'}}>back</button>
        	    	<button onClick={this.onNext} style={{display: "inline-block", margin:'30px'}}>next</button>
        	    </div>
        	    <div>
                <br/>
        		<button onClick={this.download}>Download CSV</button>
            <br/>
            {this.state.downloaded ? (
                <p>.csv file downloaded to {this.state.downloadpath}</p>
              ) : (
                ""
              )

            }
        	    </div>
        	  </div>
        );
      }
      else {
        return(<div> <h3> Compiling Images</h3></div>)
      }
    }
}
export default Display;
