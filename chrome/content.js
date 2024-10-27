chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'buttonClicked') {
      // Perform an action, e.g., display an alert
      alert('Button clicked in CADabra extension!');
      
      // Optionally, perform more complex actions here
    }
  });
  