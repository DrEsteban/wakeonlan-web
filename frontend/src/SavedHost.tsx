import React from 'react';
import './SavedHost.css';

import { Link } from 'react-router-dom';

interface SavedHostProps {
  hostname: string;
  mac: string;
}
  
function SavedHost(props: SavedHostProps) {
  function showToast() {
    // TODO: Use props.hostname
  }

  function handleHostItemClick(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    alert('wol');
    showToast();
  }

  const editLink = '/edit/' + props.mac.replace(':', '-');

  return (
    <li className="list-group-item list-group-item-action link-primary host-item" onClick={handleHostItemClick}>
      <div>
        <div className="fw-bold hostname">{props.hostname}</div>
        <div className="opacity-75">{props.mac}</div>
      </div>
      <div>
        <Link to={editLink} className="link-secondary text-decoration-none edit-trigger">
          <i className="bi bi-pencil"></i>
        </Link>
      </div>
    </li>
  );
}

export default SavedHost;