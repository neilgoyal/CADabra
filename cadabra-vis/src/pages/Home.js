// Home.js
import React, { Component, createRef } from 'react';
import HorizontalTimeline from 'react-horizontal-timeline';
import Viewer from './Viewer';
import CodeEditor from './CodeEditor';
import { CADspace, VersionSpace, PromptSpace, HomeSpace, CodePane, SaveButton, FileNameText } from '../ss';
import Chat from './Chat';
import '../App.css';

const TIMELINE_KEY = 'timeline_value';

class Home extends Component {
  codeEditorRef = createRef();

  state = {
    values: [],
    value: parseInt(localStorage.getItem(TIMELINE_KEY), 10) || 0,
    fileUrl: '',
    isLoading: true,
    hasError: false,
    errorMessage: ''
  };

  componentDidMount() {
    this.fetchAvailableFiles();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.value !== this.state.value && this.state.values.length > 0) {
      this.loadFile();
    }
  }

  fetchAvailableFiles = async () => {
    try {
      const response = await fetch('http://localhost:4000/files');
      if (!response.ok) throw new Error('Failed to fetch available files');
      const data = await response.json();
      const files = data.files.map(file => file.replace('.glb', ''));
      this.setState({ values: files }, this.loadFile);
    } catch (error) {
      console.error('Error fetching files:', error);
      this.setState({ hasError: true, errorMessage: 'Failed to fetch available files' });
    }
  };

  loadFile = async () => {
    const { values, value } = this.state;
    if (values.length === 0) return;
    const currentDate = values[value];
    if (!currentDate) return;

    const fileUrl = `/assets/${currentDate}.glb?cache=${new Date().getTime()}`;
    this.setState({ isLoading: true, hasError: false, errorMessage: '' });

    try {
      await this.fetchWithRetries(fileUrl, 3);
      this.setState({ fileUrl, isLoading: false });
    } catch (error) {
      console.error('Failed to load .glb file:', error);
      this.setState({
        hasError: true,
        isLoading: false,
        errorMessage: error.message || 'Unknown error occurred',
      });
    }
  };

  fetchWithRetries = async (url, maxRetries, attempt = 1) => {
    const timeout = 10000;
    try {
      const response = await this.fetchWithTimeout(url, timeout);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (attempt < maxRetries) {
        const retryDelay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return this.fetchWithRetries(url, maxRetries, attempt + 1);
      } else {
        throw error;
      }
    }
  };

  fetchWithTimeout = (url, timeout) => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Request timed out')), timeout);
      fetch(url)
        .then((response) => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  };

  handleSave = async () => {
    if (this.codeEditorRef.current) {
      const code = this.codeEditorRef.current.getCode();
      const fileName = `${this.state.values[this.state.value]}.kcl`;
      const filePath = `/assets/${fileName}`;

      try {
        const saveResponse = await fetch('http://localhost:4000/save-file', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filePath, content: code }),
        });

        if (saveResponse.ok) {
          console.info('File saved successfully on server');
          const conversionResponse = await fetch('http://localhost:4500/kcltostep', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ filename: fileName }),
          });

          if (conversionResponse.ok) {
            console.info('Conversion to GLB successful');
          } else {
            console.error('Conversion to GLB failed');
          }
        } else {
          console.error('Failed to save file on server');
        }
      } catch (error) {
        console.error('Error during save or conversion:', error);
      }
    }
  };

  handleTimelineClick = (index) => {
    this.setState({ value: index }, () => {
      localStorage.setItem(TIMELINE_KEY, index);
    });
  };

  render() {
    const { values, value, fileUrl, isLoading, hasError, errorMessage } = this.state;
    const fileName = `${values[value] || 'loading'}.kcl`;
    const filePath = `/assets/${fileName}`;

    return (
      <HomeSpace>
        <CADspace>
          <div className="viewer-timeline-container">
            <div className="viewer-container">
              {isLoading ? (
                <div>Loading...</div>
              ) : hasError ? (
                <div>
                  <p className="error-text">Failed to load 3D model: {errorMessage}</p>
                  <button className="retry-button" onClick={this.loadFile}>Retry</button>
                </div>
              ) : fileUrl ? (
                <Viewer key={value} fileUrl={fileUrl} />
              ) : (
                <div>File not available for this date.</div>
              )}
            </div>
            <div className="timeline-container">
              <div style={{ width: '100%', height: '60px', margin: '0 auto' }}>
                {values.length > 0 ? (
                  <HorizontalTimeline
                    values={values}
                    index={this.state.value}
                    indexClick={this.handleTimelineClick}
                    getLabel={(date) => new Date(date).toDateString().substring(4)}
                    minEventPadding={15}
                    maxEventPadding={35}
                    linePadding={55}
                    labelWidth={80}
                    fillingMotion={{ stiffness: 120, damping: 20 }}
                    slidingMotion={{ stiffness: 120, damping: 20 }}
                    styles={{
                      background: '#f9f9f9',
                      foreground: '#333333',
                      outline: '#bbbbbb',
                    }}
                    isTouchEnabled={true}
                    isKeyboardEnabled={true}
                    isOpenEnding={true}
                  />
                ) : (
                  <div>Loading timeline...</div>
                )}
              </div>
            </div>
          </div>
        </CADspace>

        <VersionSpace> 
          <CodePane>
            <FileNameText>{fileName}</FileNameText>
            <SaveButton onClick={this.handleSave}>Save</SaveButton>
          </CodePane>
          <CodeEditor ref={this.codeEditorRef} filePath={filePath} />
        </VersionSpace>

        <PromptSpace> <Chat /> </PromptSpace>
      </HomeSpace>
    );
  }
}

export default Home;
