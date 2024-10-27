// Navbar.js
import React from 'react';
import {Link} from "react-router-dom";
import {Navig, mainLogo, Text2, Text3, NavLink, Text, NavSpace, Text1, LinkStyle, Colors, Logo} from '../ss'
import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faHouse} from '@fortawesome/free-solid-svg-icons';

import hat from "../assets/logo.png"

function Navbar() {
  return (
    <NavSpace>
      <Navig> 
        <Text1>
          <Logo src={hat} alt="logo" />
          <LinkStyle href = "/">
            CADabra
          </LinkStyle>
        </Text1>
      </Navig>
    </NavSpace>
  )
}

export default Navbar;
