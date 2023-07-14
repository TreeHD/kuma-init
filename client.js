"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const csv_parse_1 = require("csv-parse");
const socket_io_client_1 = require("socket.io-client");
commander_1.program
    .requiredOption('-s, --server <url>', 'URL of the Uptime Kuma server')
    .option('-u, --username <username>', 'Username of the Uptime Kuma server')
    .option('-p, --password <password>', 'Password of the Uptime Kuma server')
    .option('-v, --verbose', 'Output Socket.IO debug messages')
    .option('-d, --dry-run', 'Do not send any data to the server')
    .version('0.1.0')
    .parse(process.argv);
const options = commander_1.program.opts();
if (options.verbose) {
    process.env.DEBUG = 'socket.io-client:*';
}
const monitor = {
    accepted_statuscodes: ["200-299"],
    authMethod: null,
    dns_resolve_server: "1.1.1.1",
    dns_resolve_type: "A",
    docker_container: "",
    docker_host: null,
    expiryNotification: true,
    ignoreTls: true,
    interval: 30,
    maxredirects: 10,
    maxretries: 0,
    method: "GET",
    mqttPassword: "",
    mqttSuccessMessage: "",
    mqttTopic: "",
    mqttUsername: "",
    notificationIDList: {},
    proxyId: null,
    resendInterval: 0,
    retryInterval: 20,
    upsideDown: false,
    packetSize: 56,
    url: "https://",
};
const socket = (0, socket_io_client_1.io)("https://" + options.server, { 'transports': ['websocket'] });
const data = [];
socket.on('connect', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Connected to Uptime Kuma');
    // login
    socket.emit('login', { username: options.username, password: options.password, token: '' }, (res) => {
        if (res.ok) {
            console.log('Logged in successfully');
            process.stdin
                .pipe((0, csv_parse_1.parse)())
                .on('data', (record) => {
                if (options.dryRun !== true) {
                    // add monitor
                    socket.emit('add', Object.assign(Object.assign({}, monitor), { type: 'port', port: 8291, name: record[0], hostname: record[1] }));
                }
                else {
                    console.log('Dry run: would add monitor', { type: 'port', name: record[0], hostname: record[1] });
                }
            })
                .on('end', () => {
                console.log('All monitors added');
                process.exit(0);
            });
        }
        else {
            console.log('Login failed: ' + res.msg);
        }
    });
}));
