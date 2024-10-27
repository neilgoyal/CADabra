import React, { Component } from 'react';
import HorizontalTimeline from 'react-horizontal-timeline';
import Viewer from './Viewer';
import { CADspace, VersionSpace, PromptSpace, HomeSpace, CodePane, SaveButton, FileNameText } from '../ss';
import Chat from './Chat';
import CodeEditor from './CodeEditor';
import '../App.css';

const VALUES = [
  "2022-01-01",
  "2022-02-15",
  "2022-03-10",
  "2022-04-25",
  "2022-05-30",
  "2022-07-04",
  "2022-08-20",
  "2022-10-05",
  "2022-12-25",
];

class Home extends Component {
  state = {
    value: 0,
    previous: 0,
    fileUrl: '', // Holds the URL for the current .glb file
    isLoading: true, // New state to handle loading
    hasError: false // New state to handle errors
  };

  componentDidMount() {
    this.loadFile();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.value !== this.state.value) {
      this.loadFile();
    }
  }

  // Load the .glb file based on the current value with error handling
  loadFile = async () => {
    const currentDate = VALUES[this.state.value];
    const fileUrl = `/assets/${currentDate}.glb`;
    this.setState({ isLoading: true, hasError: false });

    try {
      // Assuming Viewer component can handle async loading
      this.setState({ fileUrl, isLoading: false });
    } catch (error) {
      console.error('Failed to load .glb file:', error);
      this.setState({ hasError: true, isLoading: false });
    }
  };

  render() {
    const { value, fileUrl, isLoading, hasError } = this.state;

    return (
      <HomeSpace>
        <CADspace>
          <div className="viewer-timeline-container">
            {/* 3D Viewer with dynamic fileUrl */}
            <div className="viewer-container">
              {isLoading ? (
                <div>Loading...</div>
              ) : hasError ? (
                <div>Failed to load 3D model. Please try again.</div>
              ) : fileUrl ? (
                <Viewer key={value} fileUrl={fileUrl} />
              ) : (
                <div>File not available for this date.</div>
              )}
            </div>

            {/* Horizontal Timeline */}
            <div className="timeline-container">
              <div style={{ width: '100%', height: '60px', margin: '0 auto' }}>
                <HorizontalTimeline
                  values={VALUES}
                  index={this.state.value}
                  indexClick={(index) => this.setState({ value: index, previous: this.state.value })}
                  getLabel={(date) => new Date(date).toDateString().substring(4)}
                  minEventPadding={20}
                  maxEventPadding={30}
                  linePadding={30}
                  labelWidth={90}
                  fillingMotion={{ stiffness: 150, damping: 25 }}
                  slidingMotion={{ stiffness: 150, damping: 25 }}
                  styles={{
                    background: '#ffffff',
                    foreground: '#000000',
                    outline: '#d3d3d3',
                  }}
                  isTouchEnabled={true}
                  isKeyboardEnabled={true}
                  isOpenEnding={true}
                />
              </div>
            </div>
          </div>
        </CADspace>

        <VersionSpace> 
          <CodePane>
            <FileNameText>sample.kcl</FileNameText>
            <SaveButton>save</SaveButton>
          </CodePane>
          <CodeEditor /> 
        </VersionSpace>

        <PromptSpace> <Chat></Chat> </PromptSpace>
      </HomeSpace>
    );
  }
}

export default Home;
