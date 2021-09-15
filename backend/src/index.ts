#!/usr/bin/env node

/*!
 * ==================================================================
 * 
 * wakeonlan-web
 * 
 * Created by Max Geissler
 * License: See LICENSE.md in the root directory of this repository.
 * 
 * ==================================================================
 */
 
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import path from "path";
import net from "net";

import wrap from "./wrap";
import getDate from "./date";

import { WakeOnLan } from "./WakeOnLan/WakeOnLan";
import WolNativeNode from "./WakeOnLan/WolNativeNode";

import { HostDiscovery } from "./HostDiscovery/HostDiscovery";
import ARPScan from "./HostDiscovery/ARPScan"
import ARPCacheAndPing from "./HostDiscovery/ARPCacheAndPing";

import { HostNaming } from "./HostNaming/HostNaming";
import { DNSNaming } from "./HostNaming/DNSNaming";

import { IPFunctions, IPNetwork, MACFunctions } from "wakeonlan-utilities";
import { IPNetworks } from "./IPNetworks/IPNetworks";

const app = express();
const port = process.env.PORT || 8000;

// Parse application/json and application/x-www-form-urlencoded in POST requests.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic logging
app.use(wrap(async function (req, res, next) {
	console.log("[" + getDate() + "] " + req.method + " " + req.url);
	next();
}));

// Allow all cross origin requests (controlled by CORS).
// https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
app.use(cors());

// Serve static files
app.use("/", express.static(path.join(__dirname, "httpdocs")));

/**
 * In the following, the REST API is defined.
 */

app.get("/api/ip-networks", wrap(async (req, res, next) => {
	const networks = await IPNetworks.getNetworks();
	const networkStrings = networks.map((network) => {
		return IPFunctions.getStringFromIPNetwork(network);
	});

	res.set("Content-Type", "application/json");
	res.send(JSON.stringify(networkStrings));
}));

app.post("/api/device-name/host-name", wrap(async (req, res, next) => {
	const ip = req.body["ip"];
	if (!net.isIP(ip)) {
		// Invalid input
		// Send 400: Bad Request
		res.sendStatus(400);
		return;
	}

	const hostNaming: HostNaming = new DNSNaming();
	let hostname = await hostNaming.getHostNameByIP(ip);
	if (!hostname) {
		hostname = ip;
	}

	res.set("Content-Type", "text/plain; charset=utf-8");
	res.send(hostname);
}));

app.post("/api/device-name/vendor-name", wrap(async (req, res, next) => {
	const mac = req.body["mac"];

	// Send 501: Not Implemented
	res.sendStatus(501);
}));

async function hostDiscovery(method: HostDiscovery, req: Request, res: Response, next: NextFunction) {
	const cidrIpNetwork = req.body["ip-network"];
	let ipNetwork: IPNetwork;
	try {
		ipNetwork = IPFunctions.getIPNetworkFromString(cidrIpNetwork);
	} catch (err) {
		// Invalid input
		// Send 400: Bad Request
		res.sendStatus(400);
		return;
	}

	// Prepare for streaming
	res.set("Content-Type", "text/plain; charset=utf-8");
	res.set("Transfer-Encoding", "chunked");

	try {
		await method.discover(ipNetwork, undefined, (ip, mac) => {
			// Host discovered
			const host = {
				ip: ip,
				mac: MACFunctions.getMacAddressFromByteArray(mac)
			};
			res.write(JSON.stringify(host) + "\n");
		});
	} catch (err) {
		console.log("Error:", err);
		const errorNotice = {
			result: false
		}
		res.write(JSON.stringify(errorNotice) + "\n");
		return;
	} finally {
		// Finish streaming
		res.end();
	}
	next();
}

app.post("/api/host-discovery/arp-scan", wrap(async (req, res, next) => {
	await hostDiscovery(new ARPScan(), req, res, next);
}));

app.post("/api/host-discovery/arp-cache-and-ping", wrap(async (req, res, next) => {
	await hostDiscovery(new ARPCacheAndPing(), req, res, next);
}));

app.post("/api/wakeonlan", wrap(async (req, res, next) => {
	const mac = req.body["mac"];
	const options = {
		port: req.body["port"] || WakeOnLan.DEFAULT_PORT,
		address: req.body["ip"] || WakeOnLan.IP_BROADCAST_ADDRESS
	}
	options.port = parseInt(options.port);
	if (!MACFunctions.isValidMac(mac) || options.port === NaN || options.port < 1 || options.port > 65535 || !net.isIP(options.address)) {
		// Invalid input
		// Send 400: Bad Request
		res.sendStatus(400);
		return;
	}

	try {
		const wolManager: WakeOnLan = new WolNativeNode();
		await wolManager.wake(MACFunctions.getByteArrayFromMacAddress(mac), options);
	} catch (err) {
		console.log("Error:", err);
		// Send 500: Internal Server Error
		res.sendStatus(500);
		return;
	}
	res.send(JSON.stringify({
		result: true
	}));
	next();
}));

app.listen(port, () => {
	console.log(`wakeonlan-web listening at http://localhost:${port}`);
});
