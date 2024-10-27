import React, { Component } from 'react';
import HorizontalTimeline from 'react-horizontal-timeline';
import Viewer from './Viewer';
import { CADspace, VersionSpace, PromptSpace, HomeSpace } from '../ss';
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
  };

  componentDidMount() {
    this.loadFile();
  }

  componentDidUpdate(prevProps, prevState) {
    // Only load a new file if the selected date changes
    if (prevState.value !== this.state.value) {
      this.loadFile();
    }
  }

  // Load the .glb file based on the current value
  loadFile = async () => {
    const currentDate = VALUES[this.state.value];
    try {
      // Dynamically import the file based on the selected date
      const fileUrl = await import(`../assets/${currentDate}.glb`);
      this.setState({ fileUrl: fileUrl.default });
    } catch (error) {
      console.error(`Error loading file for ${currentDate}:`, error);
      this.setState({ fileUrl: '' }); // Clear fileUrl if load fails
    }
  };

  render() {
    return (
      <HomeSpace>
        <CADspace>
          <div className="viewer-timeline-container">
            {/* 3D Viewer with dynamic fileUrl */}
            <div className="viewer-container">
              {this.state.fileUrl ? (
                <Viewer key={this.state.value} fileUrl={this.state.fileUrl} />
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
                  minEventPadding={20}    // Increased for more spacing
                  maxEventPadding={30}    // Increased for more spacing
                  linePadding={30}        // Increased padding around the timeline line
                  labelWidth={90}         // Increased label width for better readability
                  fillingMotion={{ stiffness: 150, damping: 25 }}
                  slidingMotion={{ stiffness: 150, damping: 25 }}
                  styles={{
                    background: '#ffffff',
                    foreground: '#000000', // Black foreground for active elements
                    outline: '#d3d3d3',    // Light gray outline for inactive elements
                  }}
                  isTouchEnabled={true}
                  isKeyboardEnabled={true}
                  isOpenEnding={true}
                />
              </div>
            </div>
          </div>
        </CADspace>
        <VersionSpace />
        <PromptSpace />
      </HomeSpace>
    );
  }
}

export default Home;
