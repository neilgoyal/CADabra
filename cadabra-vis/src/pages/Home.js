import React, { Suspense } from 'react'
import {Link} from "react-router-dom";
// import { Resizable } from 're-resizable';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import Viewer from './Viewer';
import sample from '../assets/cool_bish.glb';
import { CADspace, VersionSpace, PromptSpace, HomeSpace } from '../ss';
import Chat from './Chat';
import CodeEditor from './CodeEditor';

const {Resizable} = require('react-resizable');

const Home = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 20, left: 0 });
  };
  
  return (
  <HomeSpace>
  <Resizable>
  <CADspace>
     <Viewer fileUrl={sample}/>
  </CADspace>
  </Resizable>
  <VersionSpace> <CodeEditor />  </VersionSpace>
  <PromptSpace> <Chat></Chat> </PromptSpace>
  </HomeSpace>

  )
}

export default Home