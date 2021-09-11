import React, { useState } from 'react';
import './Settings.css';

interface IPNetwork {
  ip: string,
  prefix: number
}

function ipNetworkToString(ipNetwork: IPNetwork): string {
  return ipNetwork.ip + "/" + ipNetwork.prefix;
}

function ipNetworksToString(ipNetworks: IPNetwork[]): string {
  let result = "";
  let first: boolean = true;
  for (const ipNetwork of ipNetworks) {
    if (first) {
      first = false;
    } else {
      result += ", ";
    }
    result += ipNetworkToString(ipNetwork);
  }
  return result;
}

const ipNetworksAutoDetectedMock: IPNetwork[] = [
  { ip: "192.168.178.0", prefix: 24 }
];

function Settings() {
  const [ipNetworks, setIpNetworks] = useState<IPNetwork[]>(ipNetworksAutoDetectedMock);
  const [autoDetectNetworks, setAutoDetectNetworks] = useState<boolean>(true);

  function onCheckboxAutoDetectChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.checked) {
      setIpNetworks(ipNetworksAutoDetectedMock);
      setAutoDetectNetworks(true);
    } else {
      setAutoDetectNetworks(false);
    }
  }

  function onInputNetworkChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log(e.target.value); // TODO
  }

  return (
    <div className="settings">
      <form>
        <h6 className="mb-3 fw-bold">Host discovery</h6>
        <div className="mb-3">
          <label htmlFor="inputNetwork" className="form-label">IP network</label>
          <input
            type="text"
            className="form-control"
            id="inputNetwork"
            value={ipNetworksToString(ipNetworks)}
            placeholder="Enter network, e.g. 192.168.178.0/24"
            required
            onChange={onInputNetworkChange}
            disabled={autoDetectNetworks}
          />
        </div>
        <div className="mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="checkboxAutoDetect"
            checked={autoDetectNetworks}
            onChange={onCheckboxAutoDetectChange}
          />
          &nbsp;
          <label className="form-check-label checkbox-fix" htmlFor="checkboxAutoDetect">Automatically detect network</label>
        </div>
        {/* <div className="mb-3">
          <label htmlFor="selectMethod" className="form-label">Method</label>
          <select className="form-select" id="selectMethod">
            <option value="arp-scan" selected>arp-scan</option>
            <option value="arp-cache-and-ping">ARP cache and ping</option>
          </select>
        </div> */}
        <h6 className="mb-3 fw-bold">Wake on LAN</h6>
        <div className="mb-3">
          <label htmlFor="inputPort" className="form-label">UDP Port</label>
          <input type="text" className="form-control" id="inputPort" value="9" placeholder="Enter port number" required />
        </div>
        <hr />
        <div className="mb-3">
          <button type="button" className="btn btn-secondary">Cancel</button>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
        </form>
    </div>
  );
}

export default Settings;
