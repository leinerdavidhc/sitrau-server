import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import IndexRoutes from '../routes/index.routes';

export class App {
    public app: Application;
    private server: http.Server;
    private io: SocketIOServer;
    private Routes = new IndexRoutes();

    constructor(private port: number | 3000) {
        this.app = express();
        this.server = http.createServer(this.app); // Crear el servidor HTTP
        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: '*', // Permitir todos los orígenes
                methods: ['GET', 'POST'],
                allowedHeaders: ['Content-Type'],
                credentials: true,
            },
        }); // Configurar Socket.IO con el servidor HTTP

        this.setting();
        this.middlewares();
        this.routes();
        this.sockets(); // Configurar los eventos de Socket.IO
    }

    private setting(): void {
        this.app.set('port', this.port);
    }

    private middlewares(): void {
        this.app.use(morgan('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cors({
            origin: '*', // Permitir todos los orígenes
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true,
        }));

        this.app.use(cookieParser());
    }

    private routes(): void {
        this.app.use('/admin', this.Routes.RouterSuperUser.router);
        this.app.use('/auth', this.Routes.RouterUser.router);
    }

    private sockets(): void {
        this.io.on('connection', (socket) => {
            // Escuchar eventos personalizados
            socket.on('message', (data) => {
                console.log('Received message:', data);
                // Emitir mensaje a otros clientes conectados
                socket.broadcast.emit('message', data);
            });

            // Manejo de errores
            socket.on('error', (error) => {
                console.error('Socket error:', error);
            });

            // Desconexión del socket
            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
            });
        });
    }

    // Modificación del método start para usar el servidor HTTP con Socket.IO
    async start(): Promise<void> {
        await this.server.listen(this.app.get('port'));
        console.log('Server on port', this.app.get('port'));
    }
} 
