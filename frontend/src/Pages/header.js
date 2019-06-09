import React from 'react';

class Header extends React.Component {

    render() {
      return (
        <div style={{backgroundColor: "#D0D0D0", height: "60px", width: "100%", padding: '15px', borderBottom: "1px solid #444"}}>
          <h1>ecSEG <i>Online</i></h1>
        </div>
      );
    }
}
export default Header;
