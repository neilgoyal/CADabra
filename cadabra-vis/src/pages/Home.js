import React, { Suspense } from 'react'
import {Link} from "react-router-dom";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import Viewer from './Viewer';
import sample from '../assets/cool_bish.glb';
import { CADspace, VersionSpace, PromptSpace, HomeSpace } from '../ss';

const Home = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 20, left: 0 });
  };
  
  return (
  <HomeSpace>
  <CADspace>
     <Viewer fileUrl={sample}/>
  </CADspace>
  <VersionSpace> </VersionSpace>
  <PromptSpace> </PromptSpace>
  </HomeSpace>

  )
}

export default Home