import RemoteFluxServer from 'nexus-flux-socket.io/server';
import { flux } from './config';

const { port } = flux;
const server = new RemoteFluxServer(port);

const info = server.Store('/info', server.lifespan);
info.set('name', 'React Nexus App')
.set('clock', Date.now())
.set('connected', 0).commit();
server.on('link:add', () => info.set('connected', info.working.get('connected') + 1).commit(), server.lifespan)
.on('link:remove', () => info.set('connected', info.working.get('connected') - 1).commit(), server.lifespan);

server.lifespan.setInterval(() => info.set('clock', Date.now()).commit(), 187);

console.log('flux-server listening on port', port);
