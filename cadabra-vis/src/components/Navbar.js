// Navbar.js
import React from 'react';
import { Navig, NavSpace, Text1, LinkStyle, Logo } from '../ss';
import hat from "../assets/logo.png";

function Navbar() {
  return (
    <NavSpace>
      <Navig> 
        <Text1>
          <Logo src={hat} alt="logo" />
          <LinkStyle href="/">CADabra</LinkStyle>
        </Text1>
      </Navig>
    </NavSpace>
  );
}

export default Navbar;
