import React, { useState } from 'react';
import './App.css';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

import Navbar from './Navbar/Navbar';
import SavedHosts from './SavedHosts/SavedHosts';
import Discover from './Discover/Discover';
import Settings from './Settings/Settings';
import SettingsPreLoad from './Settings/SettingsPreLoad';
import EditHost from './EditHost/EditHost';
import NotFound from './NotFound';

import ToastContainer from './Toasts/ToastContainer';
import ToastItem from './Toasts/ToastItem';

import { Host, IPNetwork } from 'wakeonlan-utilities';

export const WAKEONLAN_DEFAULT_PORT: number = 9;

function App() {
  const [savedHosts, setSavedHosts] = useState<Host[]>([
    { name: 'Hostname 1', mac: '00:11:22:33:44:55' },
    { name: 'Hostname 2', mac: '00:11:22:33:44:66' },
    { name: 'Hostname 3', mac: '00:11:22:33:44:77' }
  ]);

  const [hostToBeAdded, setHostToBeAdded] = useState<Host | null>(null);

  const [scanned, setScanned] = useState(false);
  const [discoveredHosts, setDiscoveredHosts] = useState<Host[]>([]);

  const [autoDetectedNetworks, setAutoDetectedNetworks] = useState<IPNetwork[]>([]);
  const [autoDetectNetworks, setAutoDetectNetworks] = useState<boolean>(true);
  const [ipNetworks, setIpNetworks] = useState<IPNetwork[]>([]);
  const [wolPort, setWolPort] = useState<number>(WAKEONLAN_DEFAULT_PORT);

  const [toastItems, setToastItems] = useState<React.ReactNode[]>([]);

  function onHostWoken(hostname: string, mac: string, result: boolean) {
    if (!result) {
      setToastItems(toastItems.concat(
        <ToastItem key={Date.now()}>
          Failed to send Wake-on-LAN packet to:<br />
          {hostname}
        </ToastItem>
      ));
      return;
    }

    setToastItems(toastItems.concat(
      <ToastItem key={Date.now()}>
        Wake-on-LAN packet sent to:<br />
        {hostname}
      </ToastItem>
    ));
  }

  function getIpNetworks(): IPNetwork[] {
    if (autoDetectNetworks) {
      return autoDetectedNetworks;
    } else {
      return ipNetworks;
    }
  }

  return (
    <Router>
      <SettingsPreLoad
        onAutoDetectedNetworksChange={setAutoDetectedNetworks}
        onAutoDetectNetworksChange={setAutoDetectNetworks}
        onIpNetworksChange={setIpNetworks}
        onWolPortChange={setWolPort}
      />
      <Navbar />
      <hr className="header-separator" />
      <main>
        <Switch>
          <Route exact path={["/hosts", "/"]}>
            <SavedHosts
              onHostToBeAddedChange={setHostToBeAdded}
              onHostWoken={onHostWoken}
              savedHosts={savedHosts}
            />
          </Route>
          <Route path="/discover">
            <Discover
              onHostToBeAddedChange={setHostToBeAdded}
              onDiscoveredHostsChange={setDiscoveredHosts}
              discoveredHosts={discoveredHosts}
              onScannedChange={setScanned}
              scanned={scanned}
              ipNetworks={getIpNetworks()}
            />
          </Route>
          <Route path="/settings">
            <Settings
              autoDetectedNetworks={autoDetectedNetworks}
              autoDetectNetworks={autoDetectNetworks}
              onAutoDetectNetworksChange={setAutoDetectNetworks}
              ipNetworks={ipNetworks}
              onIpNetworksChange={setIpNetworks}
              wolPort={wolPort}
              onWolPortChange={setWolPort}
            />
          </Route>
          <Route path="/add">
            <EditHost
              host={hostToBeAdded}
              add={true}
              savedHosts={savedHosts}
              onSavedHostsChange={setSavedHosts}
            />
          </Route>
          <Route path="/edit/:id">
            <EditHost
              host={hostToBeAdded}
              savedHosts={savedHosts}
              onSavedHostsChange={setSavedHosts}
            />
          </Route>
          <Route path="*">
            <NotFound />
          </Route>
        </Switch>
      </main>
      <ToastContainer>
        {toastItems}
      </ToastContainer>
    </Router>
  );
}

export default App;
