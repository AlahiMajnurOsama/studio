
"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useSettings } from '@/context/SettingsContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, Send, MessageCircle, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function LiveChatWidget() {
  const { user } = useAuth();
  const { session, sendMessage, isSending } = useChat();
  const { isChatEnabled } = useSettings();
  
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && scrollAreaRef.current) {
      setTimeout(() => {
        const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }, 100);
    }
  }, [session?.messages, isOpen]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message.trim(), 'text');
      setMessage('');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "Image too large",
          description: "Please upload an image smaller than 2MB.",
          variant: "destructive"
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        sendMessage(dataUrl, 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isChatEnabled) {
    return null;
  }

  return (
    <>
      <div className={cn("fixed bottom-4 right-4 z-50 transition-transform duration-300", isOpen ? "translate-x-[200%]" : "translate-x-0")}>
        <Button
          size="icon"
          className="rounded-full h-16 w-16 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-8 w-8" />
        </Button>
      </div>

      <div
        className={cn(
          "fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm transition-all duration-300 ease-in-out",
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        )}
      >
        <Card className="h-[70vh] flex flex-col shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Live Chat</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden p-0">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="p-4 space-y-4">
                {session?.messages.map((msg) => (
                  <div key={msg.id} className={cn("flex items-end gap-2", msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
                    {msg.sender === 'admin' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn(
                      "max-w-[75%] rounded-lg p-3 text-sm",
                      msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'
                    )}>
                      {msg.type === 'image' ? (
                        <Image src={msg.content} alt="User upload" width={200} height={200} className="rounded-md" />
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                     {msg.sender === 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="pt-4 border-t">
            <div className="relative w-full">
              <Textarea
                placeholder="Type your message..."
                className="pr-20"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="h-5 w-5" />
                </Button>
                <Button size="icon" onClick={handleSendMessage} disabled={isSending || !message.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
