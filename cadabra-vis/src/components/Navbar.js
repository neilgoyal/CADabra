import React from 'react';
import {Link} from "react-router-dom";
import {Navig, mainLogo, Text2, Text3, NavLink, Text, NavSpace, Text1, LinkStyle, Colors, Logo} from '../ss'
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faHouse} from '@fortawesome/free-solid-svg-icons';

import hat from "../assets/logo.png"
//require('/Users/anyakathpalia/Downloads/ak/src/assets/akLogo.png')

function Navbar() {
  
  return (
    <NavSpace>
    <Navig> 
    {/* <FontAwesomeIcon icon={faHouse} color = {Colors.grey2} size="2x" padding = {2} /> */}
    <Text1>
        <Logo src={hat} alt="logo" />
        <LinkStyle href = "/">
        cadabra
        </LinkStyle>
      </Text1>
    
    <div>
      <Text3>
        <LinkStyle href = "https://www.linkedin.com/in/anya-kathpalia/" target = "_blank">
        linkedin
        </LinkStyle>
      </Text3>
      <Text3>
        <LinkStyle href = "https://github.com/anyakath" target = "_blank">
        github
        </LinkStyle>
      </Text3>
    </div>
   
      {/* <Lottie animationData={animationData}/> */}
      
    </Navig>
    </NavSpace>
    
    
    
  )
}

export default Navbar
