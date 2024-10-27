import './App.css';
import Navbar from "./components/Navbar";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Home from "./pages/Home.js"
import * as React from 'react';

import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle `
  * {
    margin: 0;
    padding: 0;
  }
`




function App() {
    return (
    <>
    <GlobalStyle />
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" exact element= {<Home/>}/>
        </Routes>
      </Router>
    </>
    </>
    );

}

export default App;

