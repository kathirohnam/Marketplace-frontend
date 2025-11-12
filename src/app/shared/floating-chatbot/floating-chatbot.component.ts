// src/app/shared/floating-chatbot/floating-chatbot.component.ts
import { Component, OnInit, OnDestroy, HostListener, inject, ViewChild, ElementRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, NavigationEnd } from "@angular/router";
import { trigger, state, style, transition, animate } from "@angular/animations";
import { Subscription, Subject, firstValueFrom } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { NgIconComponent } from "@ng-icons/core";
import { LottieComponent, AnimationOptions } from "ngx-lottie";
import { MaterialModule } from "src/app/material.module";
import { ChatbotService, ChatMessage as ApiChatMessage } from "src/app/services/chatbot.service";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isError?: boolean;
  originalMessage?: string;
  feedback?: 'like' | 'dislike';
}

interface QuickReply {
  text: string;
  prompt: string;
}

@Component({
    selector: "app-floating-chatbot",
    imports: [CommonModule, FormsModule, NgIconComponent, LottieComponent, MaterialModule],
    templateUrl: "./floating-chatbot.component.html",
    styleUrls: ["./floating-chatbot.component.scss"],
    animations: [
        trigger("slideInOut", [
            state("closed", style({ transform: "scale(0)", opacity: 0, transformOrigin: 'bottom right' })),
            state("open", style({ transform: "scale(1)", opacity: 1, transformOrigin: 'bottom right' })),
            transition("closed <=> open", animate("300ms ease-in-out")),
        ]),
        trigger("fadeInOut", [
            state("in", style({ opacity: 1 })),
            transition(":enter", [style({ opacity: 0 }), animate(300)]),
            transition(":leave", [animate(300, style({ opacity: 0 }))]),
        ]),
        trigger("bounceIn", [
            transition(":enter", [
                style({ transform: "scale(0)" }),
                animate("300ms cubic-bezier(0.8, -0.6, 0.2, 1.5)", style({ transform: "scale(1)" })),
            ]),
        ]),
    ]
})
export class FloatingChatbotComponent implements OnInit, OnDestroy {
  @ViewChild('chatBody') private chatBody: ElementRef<HTMLDivElement>;

  private chatbotService = inject(ChatbotService);
  private router = inject(Router);
  
  isOpen = false;
  isMinimized = false;
  currentMessage = "";
  messages: ChatMessage[] = [];
  isTyping = false;
  unreadCount = 0;
  hasApiError = false;
  showQuickReplies = true;
  routeAllowsChat = true;
  showFeedbackFormFor: string | null = null;
  currentRating = 0;
  feedbackText = "";
  feedbackSent = new Map<string, boolean>();
  copiedMessageId: string | null = null;

  private routeSubscription?: Subscription;
  private destroyed$ = new Subject<void>();
  private readonly STORAGE_KEY = "floating-chatbot-history";

  quickReplies: QuickReply[] = [
    { text: "How to start an LLC?", prompt: "I want to start an LLC. Can you guide me through the complete process step by step?" },
    { text: "Costs & pricing", prompt: "What are all the costs involved in forming and maintaining an LLC?" },
    { text: "Timeline", prompt: "How long does it take to form an LLC?" }
  ];

  lottieOptions: AnimationOptions = {
    path: "assets/CHATBOT.json",
    autoplay: true,
    loop: true,
  };

  ngOnInit() {
    this.loadChatHistory();
    if (this.messages.length === 0) {
        this.showQuickReplies = true;
    }
    this.setupRouteSubscription();
  }

  ngOnDestroy() {
    this.routeSubscription?.unsubscribe();
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  @HostListener("document:keydown.escape")
  onEscapePressed() {
    if (this.isOpen) this.closeChat();
  }

  private setupRouteSubscription() {
    this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroyed$)
      ).subscribe((event: NavigationEnd) => {
        this.routeAllowsChat = !event.urlAfterRedirects.includes('/auth');
        if (!this.routeAllowsChat) this.closeChat();
      });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.isMinimized = false;
      this.unreadCount = 0;
      this.scrollToBottom();
    }
  }

  closeChat() {
    this.isOpen = false;
    this.isMinimized = false;
  }

  minimizeChat() {
    this.isOpen = false;
    this.isMinimized = true;
  }
  
  async sendMessage(messageText?: string) {
    const text = (messageText || this.currentMessage).trim();
    if (!text || this.isTyping) return;

    this.addUserMessage(text);
    this.currentMessage = '';
    this.isTyping = true;
    this.showQuickReplies = false;
    this.scrollToBottom();

    const history = this.getApiHistory();

    try {
      const response = await firstValueFrom(this.chatbotService.getBotReply(text, history));
      this.addBotMessage(response);
      this.hasApiError = false;
    } catch (error) {
      console.error('API Error:', error);
      this.handleAPIError(text);
    } finally {
      this.isTyping = false;
      this.scrollToBottom();
    }
  }
  
  private getApiHistory(): ApiChatMessage[] {
    return this.messages.map(msg => ({
      role: msg.isUser ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
  }

  sendQuickReply(reply: QuickReply) {
    this.sendMessage(reply.prompt);
  }

  retryMessage(originalMessage: string) {
    const errorMsgIndex = this.messages.findIndex(m => m.originalMessage === originalMessage);
    if(errorMsgIndex > -1) this.messages.splice(errorMsgIndex, 1);
    this.sendMessage(originalMessage);
  }

  private handleAPIError(originalMessage: string) {
    this.hasApiError = true;
    this.addBotMessage(
      "Sorry, I'm having trouble connecting. Please try again in a moment.",
      true,
      originalMessage
    );
  }

  private addUserMessage(text: string) {
    this.messages.push({
      id: this.generateId(),
      text,
      isUser: true,
      timestamp: new Date(),
    });
    this.saveChatHistory();
  }

  private addBotMessage(text: string, isError = false, originalMessage?: string): ChatMessage {
    const botMessage: ChatMessage = {
      id: this.generateId(),
      text,
      isUser: false,
      timestamp: new Date(),
      isError,
      originalMessage
    };
    this.messages.push(botMessage);
    if (!this.isOpen) this.unreadCount++;
    this.saveChatHistory();
    return botMessage;
  }
  
  formatMessageText(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      } catch(err) { }
    }, 0);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private loadChatHistory() {
    const history = localStorage.getItem(this.STORAGE_KEY);
    if (history) {
      this.messages = JSON.parse(history).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
  }

  private saveChatHistory() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.messages));
  }
  
  copyMessage(text: string, messageId: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.copiedMessageId = messageId;
      setTimeout(() => {
        this.copiedMessageId = null;
      }, 2000);
    });
  }

  shareConversation() {
    let conversationText = "LLC AI Assistant Chat\n\n";
    this.messages.forEach(message => {
        const prefix = message.isUser ? "You: " : "Assistant: ";
        conversationText += `${prefix}${message.text}\n`;
    });

    if (navigator.share) {
        navigator.share({
            title: 'Chat with LLC AI Assistant',
            text: conversationText,
        }).catch(err => console.error("Error sharing:", err));
    } else {
        navigator.clipboard.writeText(conversationText).then(() => {
            alert("Conversation copied to clipboard!");
        });
    }
  }

  giveFeedback(messageId: string, feedback: 'like' | 'dislike') {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      message.feedback = feedback;
      if (feedback === 'dislike') {
        this.showFeedbackFormFor = messageId;
        this.currentRating = 0;
        this.feedbackText = "";
      } else {
         this.feedbackSent.set(messageId, true);
      }
      this.saveChatHistory();
    }
  }
  
  submitFeedback(messageId: string) {
    console.log(`Feedback for message ${messageId}: Rating: ${this.currentRating}, Text: ${this.feedbackText}`);
    this.feedbackSent.set(messageId, true);
    this.showFeedbackFormFor = null;
  }
  
  cancelFeedback() {
    this.showFeedbackFormFor = null;
  }

  clearHistory() {
    this.messages = [];
    this.saveChatHistory();
    this.hasApiError = false;
    this.showQuickReplies = true;
    this.feedbackSent.clear();
  }
  
  formatTime(date: Date): string {
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "numeric", hour12: true }).format(date);
  }
  
  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }
}