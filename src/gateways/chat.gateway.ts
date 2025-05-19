import {  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Type } from '@nestjs/common';
import { ObjectId, Types } from 'mongoose';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict this to your frontend domain
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');
  private userSocketMap = new Map<string, string>(); // userId -> socketId
  private socketUserMap = new Map<string, string>(); // socketId -> userId

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove user mapping when they disconnect
    const userId = this.socketUserMap.get(client.id);
    if (userId) {
      this.userSocketMap.delete(userId);
      this.socketUserMap.delete(client.id);
      this.logger.log(`Removed user ${userId} from socket maps`);
    }
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, userId: string) {
    this.logger.log(`User ${userId} registered with socket ${client.id}`);

    // Store user -> socket mapping
    this.userSocketMap.set(userId, client.id);
    this.socketUserMap.set(client.id, userId);

    return { status: 'ok', message: 'Registered successfully' };
  }

  @SubscribeMessage('join_conversation')
  handleJoinRoom(client: Socket, conversationId: string) {
    this.logger.log(
      `Client ${client.id} joining conversation ${conversationId}`,
    );
    client.join(conversationId);
    return { status: 'ok', message: `Joined conversation ${conversationId}` };
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveRoom(client: Socket, conversationId: string) {
    this.logger.log(
      `Client ${client.id} leaving conversation ${conversationId}`,
    );
    client.leave(conversationId);
    return { status: 'ok', message: `Left conversation ${conversationId}` };
  }

  @SubscribeMessage('send_message')
  handleMessage(client: Socket, payload: any) {
    const { conversationId, message } = payload;
    this.logger.log(
      `Message received in conversation ${conversationId}: ${JSON.stringify(message)}`,
    );

    // Broadcast to everyone in the conversation room (including sender for consistency)
    this.server.to(conversationId).emit('receive_message', message);

    return { status: 'ok', message: 'Message sent' };
  }

  // Method to be called from services to notify clients
  sendMessage(conversationId: Types.ObjectId, message: any) {
    this.logger.log(`Broadcasting message to conversation ${conversationId}`);
    this.server.to(conversationId.toString()).emit('receive_message', message);
  }

  notifyConversationUpdate(
    userId: Types.ObjectId,
    conversationId: Types.ObjectId,
  ) {
    const socketId = this.userSocketMap.get(userId.toString());
    if (socketId) {
      this.logger.log(`Notifying user ${userId} about conversation update`);
      this.server.to(socketId).emit('conversation_updated', { conversationId });
    }
  }
}
