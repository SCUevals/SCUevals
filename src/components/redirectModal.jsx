import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { Link } from 'react-router-dom';
import { historyPT } from '../utils/propTypes';

class RedirectModal extends Component {
  static propTypes = {
    history: historyPT,
    redirectModalOpen: PropTypes.bool.isRequired,
    submitted: PropTypes.bool,
    classInfoExists: PropTypes.bool,
    permissionsUpgrade: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.state = {
      seconds: 3,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.seconds !== this.state.seconds) {
      if (this.state.seconds === 0) this.props.history.replace('/');
      else {
        setTimeout(() => {
          if (this.redirectModal) this.setState({ seconds: this.state.seconds - 1 });
        }, 1000);
      }
    }
  }

  render() {
    const {
      redirectModalOpen, classInfoExists, submitted, permissionsUpgrade,
    } = this.props;
    const { seconds } = this.state;
    return (
      <ReactModal
        ref={node => (this.redirectModal = node)}
        isOpen={redirectModalOpen}
        onAfterOpen={() => setTimeout(() => {
          if (this.redirectModal) this.setState({ seconds: seconds - 1 });
        }, 1000)}
        className="reactModal container"
        appElement={document.getElementById('app')}
      >
        <div className="modalWrapper">
          <div className="modalHeader">
            <h5>
              <Link className="homeBtn" to="/"><i className="fa fa-home" /></Link>
              {classInfoExists || !submitted ?
                'Oops!'
                : 'Thank you!'
              }
            </h5>
          </div>
          <div className="modalBlock">
            <p>{
              classInfoExists ?
                'Looks like you already posted for this class.'
                : submitted ?
                  'Great job submitting an eval!'
                  : 'Class does not exist for this page.'
            }
            </p>
            {submitted && permissionsUpgrade && (
              <p>You now have unlimited access to the site again until the end of this quarter.</p>
            )}
            <hr />
            Redirecting to home in {seconds}...
          </div>
        </div>
      </ReactModal>
    );
  }
}

export default RedirectModal;
