
"use client";

import { useEffect, useState, useRef } from 'react';
import { useAdminChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send, Paperclip, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { useNavigation } from '@/hooks/useNavigation';
import { useToast } from '@/hooks/use-toast';

export default function AdminChatPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { handleNav } = useNavigation();
  const { sessions, activeSession, loadSession, sendMessageAsAdmin, markAsRead } = useAdminChat();
  const { toast } = useToast();

  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef(0);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push("/admin");
    }
  }, [user, authLoading, isAdmin, router]);
  
  useEffect(() => {
    if (activeSession) {
      markAsRead(activeSession.id);
    }
  }, [activeSession, markAsRead]);

  useEffect(() => {
    if (activeSession && activeSession.messages.length > messageCountRef.current) {
      messageCountRef.current = activeSession.messages.length;
      setTimeout(() => {
        const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }, 100);
    }
  }, [activeSession, activeSession?.messages]);


  const handleSendMessage = () => {
    if (message.trim() && activeSession) {
      sendMessageAsAdmin(message.trim(), 'text');
      setMessage('');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && activeSession) {
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
        sendMessageAsAdmin(dataUrl, 'image');
      };
      reader.readAsDataURL(file);
    }
  };


  if (authLoading || !user || !isAdmin) {
    return <div className="p-8"><Skeleton className="h-[80vh] w-full" /></div>;
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
       <div className="flex items-center gap-4 p-4 border-b">
        <Button variant="outline" size="icon" onClick={handleNav('/admin')}>
            <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold font-headline tracking-tight">
          Live Chat
        </h1>
      </div>
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 overflow-hidden">
        <aside className="border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Conversations ({sessions.length})</h2>
          </div>
          <ScrollArea className="flex-grow">
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => loadSession(session.id)}
                className={cn(
                  "w-full text-left p-4 border-b flex items-center gap-3 hover:bg-muted/50 transition-colors",
                  activeSession?.id === session.id && "bg-muted"
                )}
              >
                <div className="relative">
                    <Avatar>
                        <AvatarFallback>{session.userName[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {!session.isReadByAdmin && (
                        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
                    )}
                </div>
                <div className='flex-grow overflow-hidden'>
                    <p className="font-semibold truncate">{session.userName}</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(session.lastMessageAt), { addSuffix: true })}</p>
                </div>
              </button>
            ))}
          </ScrollArea>
        </aside>
        <main className="md:col-span-2 lg:col-span-3 flex flex-col">
            {activeSession ? (
                <>
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-bold text-lg">{activeSession.userName}</h3>
                    <Button variant="outline" size="sm" onClick={() => console.log('Close chat')}>Close Chat</Button>
                </div>
                <ScrollArea className="flex-grow bg-muted/20" ref={scrollAreaRef}>
                    <div className="p-4 space-y-4">
                     {activeSession.messages.map(msg => (
                         <div key={msg.id} className={cn("flex items-end gap-2", msg.sender === 'admin' ? 'justify-end' : 'justify-start')}>
                            {msg.sender === 'user' && <Avatar className="h-8 w-8"><AvatarFallback>{activeSession.userName[0]}</AvatarFallback></Avatar>}
                            <div className={cn(
                                "max-w-[75%] rounded-lg p-3 text-sm",
                                msg.sender === 'admin' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'
                            )}>
                                {msg.type === 'image' ? <Image src={msg.content} alt="Upload" width={200} height={200} className="rounded-md" /> : <p>{msg.content}</p>}
                            </div>
                             {msg.sender === 'admin' && <Avatar className="h-8 w-8"><AvatarFallback>A</AvatarFallback></Avatar>}
                         </div>
                     ))}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t bg-background">
                    <div className="relative">
                        <Textarea
                            placeholder="Type your message..."
                            className="pr-20"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                        />
                        <div className="absolute top-1/2 right-2 -translate-y-1/2 flex items-center gap-1">
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}><Paperclip className="h-5 w-5" /></Button>
                            <Button size="icon" onClick={handleSendMessage} disabled={!message.trim()}><Send className="h-5 w-5" /></Button>
                        </div>
                    </div>
                </div>
                </>
            ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                    <CheckCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h2 className="text-xl font-semibold">No Conversation Selected</h2>
                    <p className="text-muted-foreground mt-1">Select a conversation from the left to view messages.</p>
                </div>
            )}
        </main>
      </div>
    </div>
  );
}
