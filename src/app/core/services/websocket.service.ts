import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private client: Client | null = null;
  private subscriptions = new Map<string, Subject<unknown>>();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  constructor(private notification: NotificationService) {}

  connect(): void {
    if (this.client?.active) return;

    // Use native WebSocket with ws:// URL (convert http:// to ws://)
    const wsUrl = environment.wsUrl
      .replace('http://', 'ws://')
      .replace('https://', 'wss://');

    this.client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 0,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.reconnectAttempts = 0;
        this.resubscribeAll();
      },
      onStompError: () => this.handleReconnect(),
      onWebSocketClose: () => this.handleReconnect(),
    });

    this.client.activate();
  }

  disconnect(): void {
    this.subscriptions.forEach(subject => subject.complete());
    this.subscriptions.clear();
    this.client?.deactivate();
    this.client = null;
    this.reconnectAttempts = 0;
  }

  subscribe<T>(topic: string): Observable<T> {
    if (!this.subscriptions.has(topic)) {
      const subject = new Subject<T>();
      this.subscriptions.set(topic, subject as Subject<unknown>);
      this.doSubscribe(topic);
    }
    return this.subscriptions.get(topic)!.asObservable() as Observable<T>;
  }

  private doSubscribe(topic: string): void {
    if (!this.client?.connected) return;
    this.client.subscribe(topic, (message: IMessage) => {
      const subject = this.subscriptions.get(topic);
      if (subject) {
        subject.next(JSON.parse(message.body));
      }
    });
  }

  private resubscribeAll(): void {
    this.subscriptions.forEach((_, topic) => this.doSubscribe(topic));
  }

  private handleReconnect(): void {
    this.reconnectAttempts++;
    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      this.notification.error('Las actualizaciones en tiempo real no están disponibles. Recargue la página.');
      return;
    }
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    setTimeout(() => this.connect(), delay);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
