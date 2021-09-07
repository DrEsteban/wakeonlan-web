import React from 'react';
import './Discover.css';

function Discover() {
  return (
    <>
      <div className="host-discovery-notice text-muted">
        Note: For host discovery, hosts must be powered on.
      </div>

      <ul className="list-group">
        <li className="list-group-item list-group-item-action link-primary host-item">
          <div>
            <div className="fw-bold">Hostname 1</div>
            <div className="opacity-75">00:11:22:33:44:55</div>
          </div>
        </li>
        <li className="list-group-item list-group-item-action link-primary host-item">
          <div>
            <div className="fw-bold">Hostname 2</div>
            <div className="opacity-75">00:11:22:33:44:55</div>
          </div>
        </li>
        <li className="list-group-item list-group-item-action link-primary host-item">
          <div>
            <div className="fw-bold">Hostname 3</div>
            <div className="opacity-75">00:11:22:33:44:55</div>
          </div>
        </li>
      </ul>

      <div className="d-flex align-items-center mt-3 mx-2 spinner">
        <span className="fw-bold">Scanning 192.168.188.0/24</span>
        <div className="spinner-border ms-auto" role="status" aria-hidden="true"></div>
      </div>

      <div className="d-flex flex-column align-items-center mx-2 mt-4 scan-finished-notice d-none">
        <div>
          <div className="fw-bold text-center">Scan finished.</div>
        </div>
        <div className="mt-3">
          <div className="text-center mb-2">Host not found?</div>
          <div className="d-flex">
            <button type="button" className="btn btn-sm btn-secondary">Rescan</button>
            <button type="button" className="btn btn-sm btn-secondary ms-2">Add manually</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Discover;