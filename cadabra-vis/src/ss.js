import styled, {css } from "styled-components";
import grid from "./assets/grid.jpg" ;
import wavyGrid from "./assets/wavyGrid.jpg" ;
import { Color } from "three";
import Split from 'react-split';


export const Colors = {
    beige: '#F8F7F6',
    lav1: '#d4ccd6',
    lav2: '#bfb3c2',
    lav3: '#aa99ae',
    blush: '#dbbbaf',
    aqua:'#A0BABA',
    grey1: '#D9DDDC',
    grey2: '#A6A6A6',
    grey3: '#333333',
    grey4: '#222222',
    black: '#000000',
    orange: '#ff6700',
    white: '#ffffff'
}

export const Navig = styled.div `
   
    display: flex ;
    opacity: 100%;
    /* background-image:  url(${grid}); */
    background-size: 500px;
    background-repeat: space;
    background-position: center;
    //background-attachment: fixed;
    //background-position: round;
    width:  45%;
    height: 45%;
    justify-content: space-between;
    align-items: center;
    position: relative;
    vertical-align: middle;
    margin: 0 !important;
    height: 8vh;   
    width: 100%;
`

export const NavSpace = styled.div `
    display: flex ;
    flex-direction: ${(props) => props.direc? props.direc: 'row' };
    background-color: ${(props) => props.color? props.color: Colors.black };
    align-items: center;
    text-align: left;
    height: 6vh;  /* Reduced height */
    width: 100%;
    position: relative;
`;


export const HomeSpace = styled.div `
    display: flex ;
    flex: 1; 
    flex-direction: ${(props) => props.direc? props.direc: 'row' };
    background-color: ${(props) => props.color? props.color: Colors.grey1 };
    align-items: center;
    text-align: left;
    height: 100%;
    width: 100%;
    position: relative;

`

export const CADspace = styled.div `
    display: flex ;
    flex: 1; 
    flex-direction: ${(props) => props.direc? props.direc: 'column' };
    background-color: ${(props) => props.color? props.color: Colors.white };
    align-items: center;
    text-align: left;
    height: 100vh;
    width: 100%;
    position: relative;
    /* padding:50px; 
    box-sizing: border-box; */
`

export const VersionSpace = styled.div `
    display: flex ;
    flex: 1; 
    flex-direction: ${(props) => props.direc? props.direc: 'column' };
    background-color: ${(props) => props.color? props.color: Colors.grey3 };
    align-items: center;
    text-align: left;
    height: 100vh;
    width: 50%;
    position: relative;
`

export const PromptSpace = styled.div `
    display: flex ;
    flex: 1; 
    flex-direction: ${(props) => props.direc? props.direc: 'column' };
    background-color: ${(props) => props.color? props.color: Colors.grey4 };
    align-items: center;
    text-align: left;
    height: 100vh;
    width: 50%;
    position: relative;
`


export const Space = styled.div `
    display: flex ;
    flex-direction: ${(props) => props.direc? props.direc: 'column' };
    background-color: ${(props) => props.color? props.color: Colors.black };
    align-items: center;
    text-align: left;
    height: 52vh;
    width: 100%;
    position: relative;
`

export const Logo = styled.img `
  width: 80px; /* Adjust size as needed */
  height: 45px;
  margin-right: 8px; /* Adds spacing between the logo and the text */
`;




export const SkillGrid = styled.div `
   
    display: flex ;
    opacity: 40%;
    background-image:  url(${grid});
    background-attachment: fixed;

    background-size: cover ;
    //background-size: 400px;
    background-repeat: no-repeat;
    background-position: center;
    justify-content: right;
    align-items: center;
    position: relative;
    vertical-align: middle;
    margin: 0 !important;
    height: 20vh;   
    width: 100%;
`


export const SingleSkill = styled.div `
   
    display: flex ;
    flex-direction: column;
    
    justify-content: center;
    align-items: center;
    position: relative;
    vertical-align: middle;
    /* height: 20vh;   
    width: 100%; */
    width: 0.5vw;
    //height:100px;
    transition: all 0.6s ease;
    transform-style: preserve-3d; 
    &:hover{
        transform: scale(1.125);
    }

`

export const TextSpace = styled.div `

    display: flex ;
    flex-direction: ${(props) => props.direc? props.direc: 'column' };
    padding: 10px;
    //background-color: ${(props) => props.color? props.color: Colors.blush };
    //justify-content: left;
    //vertical-align: middle;
    height: 40%;
`

export const Text1 = styled.text `
    font-size: 38px;
    padding: 10px;
    color: ${(props) => props.color? props.color: Colors.white };
    font-family: 'Helvetica', cursive;
    letter-spacing: 2px;

`

export const Text2 = styled.text `
    display: flex;
    background: -webkit-linear-gradient( ${Colors.white}, ${Colors.grey3});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-size: ${(props) => props.size? props.size: '25px'};
    color: ${(props) => props.color? props.color: Colors.black };
    padding: 15px;
    font-family: 'Helvetica';
`

export const Text3 = styled.text `
    font-size: 18px;
    //color: black;
    color: ${(props) => props.color? props.color: Colors.grey2 };
    padding: 10px;
    font-family: 'Helvetica';

    &:hover{
        color: ${Colors.grey1};
    }
    //letter-spacing: 2px;
    //font-style: Georgia;
    /* &:hover {
        color: black;
    } */
`

export const Text4 = styled.text `
    font-size: 15px;
    color: ${(props) => props.color? props.color: Colors.grey2 };
    padding: 15px;
    font-family: 'Helvetica';
`

export const Text5 = styled.text `
    font-size: 12px;
    // text-align: justify;
    display: flex;
    color: ${(props) => props.color? props.color: Colors.grey2 };
    padding: 10px;
    line-height: 18px;
    font-family: 'Helvetica';
`

export const BigText = styled.text `
    display: flex;
    font-size: 48px;
    color: ${(props) => props.color? props.color: Colors.white };
    padding: 15px;
    font-family: 'Helvetica';
`


export const LinkStyle = styled.a `
    font-size: ${(props) => props.size? props.size : '20x'};
    color: ${(props) => props.color? props.color : Colors.white};
    text-decoration: none;
    text-align: center;
    letter-spacing: 1px;
    font-family:  Helvetica;
    margin: 10px;
    &:link, 
    &:visited{
        color: ${Colors.white};
    }
    &:hover,
    &:focus{
    color: ${Colors.grey2};
    }
    &:active{
    color: ${Colors.white};
    }
    // marginTop: '400px';
    // position: 'absolute';
`

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

export const MessagesContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

export const MessageRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
  margin: 8px 0;
`;


export const ProfileIcon = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  margin: ${({ isUser }) => (isUser ? '0 0 0 10px' : '0 10px 0 0')};
`;

export const MessageBubble = styled.div`
  background-color: ${({ isUser }) => (isUser ? Colors.grey1 :Colors.white)};
  color: ${Colors.grey4}; /* White text for better contrast */
  padding: 20px 28px;
  border-radius: 20px;
  max-width: 85%;
  word-wrap: break-word;
  margin: ${({ isUser }) => (isUser ? '0 14px 0 0' : '0 0 0 14px')};
  font-family: 'Helvetica', 'Arial', sans-serif;
  font-size: 18px;
  line-height: 1.6;
`;


export const InputContainer = styled.div`
  display: flex;
  padding: 10px;
  height: 5%; 
  width: 100%;
  border-top: 1px solid #ccc;
  background-color: #fff;
`;

export const InputField = styled.input`
  flex-grow: 1;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 20px;
  outline: none;
`;

export const SendButton = styled.button`
  margin-left: 10px;
  padding: 12px 18px;
  font-size: 16px;
  background-color: ${Colors.grey2};
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  outline: none;

  &:hover {
    background-color: ${Colors.grey4};
  }
`;


export const EditorContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;

export const SaveButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 8px 12px;
  font-size: 14px;
  background-color: ${Colors.white};
  
  color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  z-index: 1;

  &:hover {
    background-color:${Colors.grey4};
    color: #FFFFFF;
  }
`;



export const CodePane = styled.div`
  display: flex;
  /* align-items: flex-end; */
  flex-direction: column;
  height: 60px; 
  color: ${Colors.black};
  align-items: space-between; 
`;

export const FileNameText = styled.text `
  padding: 22px;
  font-family: 'Courier New', Courier, monospace;
  color: ${Colors.white};
  font-size: 18px;
`

export const SplitContainer = styled(Split)`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

// In ../ss.js

// Attachment Button
export const AttachButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 8px;
  font-size: 30px;
  color: #555;
  display: flex;
  align-items: center;

  &:hover {
    color: #000;
  }
`;

// Attached Files Preview
export const AttachedFilesContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 100px;
  overflow-y: auto;
  margin-left: 8px;
`;

export const AttachedFile = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
`;

export const RemoveFileButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #e74c3c;
  font-size: 16px;
  margin-left: 8px;

  &:hover {
    color: #c0392b;
  }
`;



