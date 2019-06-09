import React from 'react';
import Display from "./display.js"
import axios from 'axios';

var formData = new FormData();

class Upload extends React.Component {

    constructor(props) {
      super(props);

      this.state = {
          selectedFile: null,
          inputPath: true,
          returned: false,
          value: "",
          seeUser: false,
          filelist: [],
          loading: false
      };

      this.handleFileSubmit = this.handleFileSubmit.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleFlip = this.handleFlip.bind(this);
      this.handleAccount = this.handleAccount.bind(this);
      this.handleBack = this.handleBack.bind(this);
    }

    handleChange(event) {
      this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        this.setState({loading: true})
        var postData = {
          username: this.props.username,
          in_path: this.state.value
        };

        let axiosConfig = {
              headers: {
                "Content-Type": "application/json;charset=UTF-8",
                "Access-Control-Allow-Origin": "*"
              }
        };

        let currentComponent = this;

        axios.post("http://0.0.0.0:5444/predict", postData, axiosConfig)
        .then(function (response) {

          currentComponent.setState({filelist: response.data.pic_list});
          console.log(response.data.pic_list.length)
          console.log(response.data.pic_list);
          if (response.data.pic_list.length > 0) {
            if (response.data.pic_list[0] === "Error") {
               alert("Invalid file path input, retry!")
            }
            else {
              currentComponent.setState({returned: true});
            }
            currentComponent.setState({loading: false})
          }
        })
        .catch(function (error) {
          //console.log(error);
        });

        event.preventDefault();
    }


    fileSelectedHandler = event => {
        this.setState({
            selectedFile: event.target.files[0]
        })
    }

    onChange(e) {
        let files=e.target.files;
        let reader = new FileReader();

        for (var i = 0; i < e.target.files.length; i++) {
            formData.append("file", e.target.files[i])
        }

        reader.readAsDataURL(files[0]);
        reader.onload=(e)=>{
          console.log("img data ",e.target.result)
        }
        console.log(files[0])
        for (var variab in files[0]) {
          console.log(variab + ": "+files[0].variab)
        }
    }

    handleFileSubmit(e) {
        this.postCall()
    }

    handleFlip(e) {
      this.setState({inputPath: !this.state.inputPath})
    }

    handleBack(e) {
      this.setState({returned: false})
      this.setState({seeUser: false})
    }

    handleAccount(e) {

        var postData = {
          username: this.props.username,
        };

        let axiosConfig = {
              headers: {
                "Content-Type": "application/json;charset=UTF-8",
                "Access-Control-Allow-Origin": "*"
              }
        };

        let currentComponent = this;

        axios.post("http://0.0.0.0:5444/getfiles", postData, axiosConfig)
        .then(function (response) {
          console.log("LIST: " + response.data.filelist)
          if (response.data.filelist.length > 0) {
            if (response.data.filelist[0] === "Error") {
               alert("No images submitted for analysis yet. \nPlease submit atleast one image before accessing account.")
            }
            else {
              currentComponent.setState({filelist: response.data.filelist});
              currentComponent.setState({seeUser: !currentComponent.state.seeUser})
              currentComponent.setState({returned: false})
            }
          }

        })
        .catch(function (error) {
          //console.log(error);
        });


    }

    //<Display directory={response}/>
    render() {
      const {filelist} = this.state;
      if (this.state.returned) {

        return (
          <div>
            <p>Logged in as <b>{this.props.username}</b></p>
            <button onClick={this.handleBack}>Back to Upload</button>
            <br/>
            <Display files={this.state.filelist} username={this.props.username}/>
        </div>
        );
      }
      else if (this.state.seeUser) {
        return(
        <div>
          <p>Logged in as <b>{this.props.username}</b></p>
          <button onClick={this.handleBack}>Back to Upload</button>
          <br/>
          <Display files={this.state.filelist} username={this.props.username}/>
          </div>
        );
      }
      else {
          if (this.state.inputPath) {
              return (
                <div>
                    <center>
                      <p>Logged in as <b>{this.props.username}</b></p>
                      <button onClick={this.handleAccount}>Go to Account</button>
                      <br/>
                      <form onSubmit={this.handleSubmit}>
                        <label>
                          Absolute File Path:
                          <input type="text" style={{fontSize: '15px', borderRadius: '5px'}} value={this.state.value} onChange={this.handleChange} />
                        </label>
                        <input type="submit" style={{fontSize: '20px', borderRadius: '10px', backgroundColor: "#D0D0D0"}} value="Submit" />
                      </form>
                      {this.state.loading ? (
                          <p>Loading...</p>
                      ): (
                          ""
                      )}
                      <br/>
                      <button style={{backgroundColor: "#D0D0D0", fontSize: '12px'}} onClick={this.handleFlip}>Switch Input Type</button>

                    </center>
                </div>
              );
          }
          else {
              return (
                <div>
                  <center>
                    <p>Logged in as <b>{this.props.username}</b></p>
                    <button onClick={this.handleAccount}>Go to Account</button>
                    <br/>

                    <div style={{width: '300px'}} className='buttons'>
                       <input type="file" name="file" multiple="multiple"  onChange={(e)=>this.onChange(e)}/>
                    </div>
                    <br/>
                    <button style={{fontSize: '20px', borderRadius: '10px', backgroundColor: "#D0D0D0"}} onClick={this.handleFileSubmit}>Submit</button>
                    <br/>
                    <button style={{backgroundColor: "#D0D0D0", fontSize: '12px'}} onClick={this.handleFlip}>Switch Input Type</button>
                  </center>
                </div>
              );
          }
        }
    }
}

export default Upload;
