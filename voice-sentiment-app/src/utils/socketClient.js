// Abstracts socket connection with STT / SA servers
class SocketClient {
  constructor(serverUrl, responseHandler) {
    // keep config
    this.serverUrl = serverUrl;
    this.responseHandler = responseHandler;
  }

  // Opens socket connection wth server
  openSocket() {
    // init socket
    this.ws = new WebSocket(this.serverUrl);

    // wire intent server events
    this.ws.onopen = () => {
      console.log("Socket connection with server opened: " + this.serverUrl)
    }
    this.ws.onclose = () => {
      console.log("Socket connection with server closed: " + this.serverUrl)
    }
    this.ws.onmessage = (evt) => {
      this.handleResponse(evt.data);
    }
  }

  // Sends data to server socket
  sendRequest(data) {
    this.ws.send(data);
  }

  // Handles response from server
  handleResponse(data) {
    this.responseHandler(data);
  }

  // Closes socket connection with server
  closeSocket() {
    this.ws.close();
    this.ws = null;
  }
}

export default SocketClient;