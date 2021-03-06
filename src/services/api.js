/* eslint-disable no-console */
import axios from 'axios';

import { storeWithMiddleware } from '../index';
import { setUserInfo, setSearchResults } from '../actions';
import history from '../components/history';

class API {
  constructor() {
    const headers = { 'Content-Type': 'application/json' }; // Content-Type will be stripped in GET requests automatically by axios
    /* userInfo initial state looks for localStorage and initializes with it if exists.
       Assume jwt exists if userInfo exists. */
    if (storeWithMiddleware.getState().userInfo) headers.Authorization = `Bearer ${storeWithMiddleware.getState().userInfo.jwt}`;

    this.api = axios.create({
      headers,
      baseURL: API_URL, // eslint-disable-line no-undef
      timeout: 10000,
    });
  }

  handleError = (error) => {
    if (error.response) {
      // sign out if 401
      if (error.response.status === 401) {
        if (error.response.config.url === `${error.response.config.baseURL}/auth/refresh` || error.response.config.url === `${error.response.config.baseURL}/auth`) return; // don't handle error twice
        this.get('/auth/refresh', (responseData) => {
          storeWithMiddleware.dispatch(setUserInfo(responseData.jwt));
          if (history.location.pathname !== '/') history.push('/');
        })
          .catch(() => { // ex. user suspended
            if (history.location.pathname !== '/') history.push('/');
            storeWithMiddleware.dispatch(setUserInfo(null));
            storeWithMiddleware.dispatch(setSearchResults(null));
          });
      }
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(
        'Server responded with status code out of range of 2xx.\n',
        'Data:', error.response.data, '\n',
        'Status:', error.response.status, '\n',
        'Header:', error.response.headers, '\n\n',
        'Request config:', error.config,
      );
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.error(
        'Server didn\'t respond to request.\n',
        'Request config:', error.config,
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error(
        'Something happened in request setup that triggered an error.\n',
        'Message:', error.message, '\n\n',
        'Request config:', error.config,
      );
    }
    throw error;
  }

  get(path, callback, passedParams) { // passedParams (obj) and customHandleError (func) optional
    return this.api.get(path, { params: passedParams })
      .then((response) => { callback(response.data); return response; })
      .catch(this.handleError);
  }

  patch(path, payload, callback) {
    return this.api.patch(path, payload)
      .then((response) => { callback(response.data); return response; })
      .catch(this.handleError);
  }

  post(path, payload, callback) {
    return this.api.post(path, payload)
      .then((response) => { callback(response.data); return response; })
      .catch(this.handleError);
  }

  put(path, value, callback) {
    return this.api.put(path, { value })
      .then((response) => { callback(response.data); return response; })
      .catch(this.handleError);
  }

  delete(path, callback) {
    return this.api.delete(path)
      .then((response) => { callback(response.data); return response; })
      .catch(this.handleError);
  }
}

export default API;
