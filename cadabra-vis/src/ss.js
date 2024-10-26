import styled, {css } from "styled-components";
import grid from "./assets/grid.jpg" ;
import wavyGrid from "./assets/wavyGrid.jpg" ;

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
    height: 8vh;
    width: 100%;
    position: relative;
`


export const HomeSpace = styled.div `
    display: flex ;
    flex-direction: ${(props) => props.direc? props.direc: 'row' };
    background-color: ${(props) => props.color? props.color: Colors.grey1 };
    align-items: center;
    text-align: left;
    height: 100vh;
    width: 100%;
    position: relative;

`

export const CADspace = styled.div `
    display: flex ;
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
    flex-direction: ${(props) => props.direc? props.direc: 'column' };
    background-color: ${(props) => props.color? props.color: Colors.grey3 };
    align-items: center;
    text-align: left;
    height: 100vh;
    width: 40%;
    position: relative;
`

export const PromptSpace = styled.div `
    display: flex ;
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

// export const MainSpace = styled.div `
//     display: flex ;
//     gap: 0px;
//     flex-direction: ${(props) => props.direc? props.direc: 'column' };
//     background-color: ${(props) => props.color? props.color: Colors.black };
//     align-items: center;
//     text-align: left;
//     //justify-content: center; --> vertical
//     height: 210vh;
//     width: 100%; 
//     position: relative;
//     top: 0px;
// `
// export const Space2 = styled.div `
//     display: flex ;
//     flex-direction: ${(props) => props.direc? props.direc: 'row' };
//     align-items: center;
//     background-color: ${(props) => props.color? props.color: Colors.black };
//     padding: 10px;
//     vertical-align: middle;
//     height: 150px;
//     width: 500px;
//     justify-content: center;
    
// `


// export const Space3 = styled.div `
//     display: flex ;
//     overflow: auto;
//     flex-direction: ${(props) => props.direc? props.direc: 'row' };
//     align-items: center;
//     background-color: ${(props) => props.color? props.color: Colors.black };
//     padding: 10px;
//     vertical-align: middle;
//     //height: 40vh;
//     justify-content: center;

// `

// export const Space4 = styled.div `
//     display: flex ;
//     grid-gap: 2px;
//     padding-top: 12px;
//     padding-bottom: 15px;
//     //position: relative;
//     //overflow: auto;
//     flex-direction: ${(props) => props.direc? props.direc: 'column' };
//     align-items: center;
//     background-color: ${(props) => props.color? props.color: Colors.black };
//     padding: 10px;
//     vertical-align: middle;
//     width: 80%;
//     //height: 100vh;
//     justify-content: space-evenly;
// `


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