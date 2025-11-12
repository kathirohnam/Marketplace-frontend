// src/app/services/chatbot.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { TokenService } from './token/token.service';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  role: string | null;
}

export interface ChatResponse {
  reply: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService); // Inject TokenService
  private backendApiUrl = `${environment.apiBaseUrl}/chatbot/chat`;

  getBotReply(userMessage: string, history: ChatMessage[]): Observable<string> {
    const role = this.tokenService.getRole(); // Get the role
    const requestPayload: ChatRequest = {
      message: userMessage,
      history: history,
      role: role
    };

    return this.http.post<ChatResponse>(this.backendApiUrl, requestPayload).pipe(
      map(response => response.reply)
    );
  }
}