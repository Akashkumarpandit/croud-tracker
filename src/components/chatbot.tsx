'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Loader2, MessageSquare, Send, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getChatReply } from '@/app/actions';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  role: 'user' | 'model';
  text: string;
}

const starterMessages = [
    "What can this app do?",
    "How do I add a new location?",
    "Explain the real-time view.",
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  const sendMessage = (messageText: string) => {
    if (!messageText.trim() || isPending) return;

    const userMessage: Message = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    
    if(input) {
        setInput('');
    }

    startTransition(async () => {
      const result = await getChatReply(messages, messageText);
      if (result.success && result.reply) {
        const modelMessage: Message = { role: 'model', text: result.reply };
        setMessages(prev => [...prev, modelMessage]);
      } else {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: result.message,
        });
        setMessages(prev => prev.slice(0, -1));
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };
  
  const handleStarterClick = (question: string) => {
    sendMessage(question);
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50">
        <Button onClick={() => setIsOpen(!isOpen)} size="icon" className="rounded-full h-14 w-14 shadow-lg">
          <Sparkles className="h-6 w-6" />
          <span className="sr-only">Toggle Chat</span>
        </Button>
      </div>
      {isOpen && (
        <Card className="fixed bottom-20 left-4 z-50 w-80 h-[500px] shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary"/>
                AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
              {messages.length === 0 ? (
                 <div className="p-4 text-center text-sm text-muted-foreground">
                    <p className="mb-4">Hi! I'm your AI assistant for CrowdWatch. Ask me anything about the app.</p>
                    <div className="flex flex-col gap-2 text-left">
                        {starterMessages.map((q, i) => (
                            <Button key={i} variant="outline" size="sm" className="h-auto whitespace-normal" onClick={() => handleStarterClick(q)}>
                                {q}
                            </Button>
                        ))}
                    </div>
                 </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex gap-3 text-sm',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'model' && (
                          <Avatar className="h-8 w-8">
                              <AvatarImage src="https://placehold.co/40x40.png" alt="AI Assistant" data-ai-hint="robot" />
                              <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                          </Avatar>
                      )}
                      <div
                        className={cn(
                          'rounded-lg px-3 py-2',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        {message.text}
                      </div>
                       {message.role === 'user' && (
                          <Avatar className="h-8 w-8">
                              <AvatarFallback><User/></AvatarFallback>
                          </Avatar>
                      )}
                    </div>
                  ))}
                  {isPending && (
                    <div className="flex justify-start gap-3 text-sm">
                      <Avatar className="h-8 w-8">
                          <AvatarImage src="https://placehold.co/40x40.png" alt="AI Assistant" data-ai-hint="robot" />
                          <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg px-3 py-2 bg-muted flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin"/>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={isPending}
              />
              <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}
    </>
  );
}
