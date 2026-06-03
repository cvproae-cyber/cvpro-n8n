"use client";

import { useState, useRef, useEffect } from "react";
import { useListConversations, useListMessages, useSendMessage, useUpdateConversation, useGetConversation, useGetContact } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Bot, User, Send, MessageSquare } from "lucide-react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

export default function InboxPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: conversations, isLoading: listLoading } = useListConversations();
  const { data: conversation, refetch: refetchConv } = useGetConversation(selectedId!);
  const { data: messages, refetch: refetchMsgs } = useListMessages(selectedId);
  useGetContact(conversation?.contactId);
  const { mutate: sendMessage, isPending: sending } = useSendMessage();
  const { mutate: updateConv } = useUpdateConversation();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim() || !selectedId) return;
    sendMessage(
      { id: selectedId, data: { content: messageText } },
      {
        onSuccess: () => {
          setMessageText("");
          refetchMsgs();
        },
        onError: () => toast({ title: "Failed to send message", variant: "destructive" }),
      }
    );
  };

  const toggleAI = () => {
    if (!selectedId || !conversation) return;
    updateConv(
      { id: selectedId, data: { aiEnabled: !conversation.aiEnabled } },
      {
        onSuccess: () => {
          toast({ title: conversation.aiEnabled ? "AI Agent Activated" : "Human Takeover Active" });
          refetchConv();
        },
      }
    );
  };

  const filtered = conversations?.filter(
    (c) =>
      c.contactName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPhone?.includes(search)
  ) || [];

  return (
    <div className="flex h-full w-full overflow-hidden bg-background text-foreground">
      {/* Left sidebar – conversation list */}
      <div className="w-[380px] flex flex-col border-r border-border bg-card shrink-0">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-xl tracking-tight">Inbox</h2>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 bg-sidebar border-border"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {listLoading ? (
            Array(6)
              .fill(0)
              .map((_, i) => <Skeleton key={i} className="h-20 m-2" />)
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No conversations found.</div>
          ) : (
            filtered.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={cn(
                  "p-4 border-b border-border cursor-pointer hover:bg-sidebar transition-colors",
                  selectedId === conv.id && "bg-sidebar border-l-4 border-l-primary"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm truncate pr-2">{conv.contactName}</span>
                  <div className="flex gap-1 shrink-0">
                    {conv.aiEnabled ? (
                      <Badge variant="secondary" className="bg-primary/20 text-primary text-[9px] px-1 h-4">
                        AI
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] px-1 h-4">
                        HUMAN
                      </Badge>
                    )}
                    {conv.channel === "whatsapp" ? (
                      <FaWhatsapp className="text-[#25D366]" />
                    ) : (
                      <FaInstagram className="text-pink-500" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {conv.lastMessagePreview || "No messages"}
                </p>
                <div className="mt-2 flex justify-between items-center text-[10px] text-muted-foreground">
                  <span className="capitalize">{conv.status}</span>
                  {conv.lastMessageAt &&
                    new Date(conv.lastMessageAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-sidebar/30">
        {selectedId ? (
          <>
            {/* Chat header */}
            <div className="h-16 px-6 border-b border-border flex items-center justify-between bg-card shrink-0">
              {!conversation ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="font-semibold text-lg flex items-center gap-2">
                    {conversation.contactName}
                    {conversation.channel === "whatsapp" ? (
                      <FaWhatsapp className="text-[#25D366]" />
                    ) : (
                      <FaInstagram className="text-pink-500" />
                    )}
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {conversation.status}
                  </Badge>
                </div>
              )}
              <Button
                variant={conversation?.aiEnabled ? "outline" : "default"}
                size="sm"
                onClick={toggleAI}
                className={
                  !conversation?.aiEnabled
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border-primary text-primary hover:bg-primary/10"
                }
              >
                {conversation?.aiEnabled ? (
                  <>
                    <User className="w-4 h-4 mr-2" /> Take Over (Human)
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 mr-2" /> Release to AI
                  </>
                )}
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
              {!messages ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-[60%] rounded-2xl rounded-tl-sm self-start" />
                  <Skeleton className="h-16 w-[60%] rounded-2xl rounded-tr-sm self-end" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No messages in this conversation.
                </div>
              ) : (
                messages.map((msg) => {
                  const isOutbound = msg.direction === "outbound";
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[75%]",
                        isOutbound ? "self-end items-end ml-auto" : "self-start items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "p-3 rounded-2xl text-sm relative group",
                          isOutbound
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-card border border-border text-card-foreground rounded-tl-sm"
                        )}
                      >
                        {msg.content}
                        <div className="text-[10px] opacity-70 mt-1 flex justify-end">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {isOutbound
                          ? msg.is_ai_generated
                            ? "AI Agent"
                            : "Human Agent"
                          : conversation?.contactName}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input area */}
            <div className="p-4 bg-card border-t border-border">
              <div className="relative flex items-end gap-2">
                <Textarea
                  placeholder={
                    conversation?.aiEnabled
                      ? "Take over to send a message..."
                      : "Type your message..."
                  }
                  className="min-h-[80px] max-h-[160px] resize-none bg-sidebar border-border pr-12"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={conversation?.aiEnabled}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="absolute right-3 bottom-3 h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleSend}
                  disabled={!messageText.trim() || sending || conversation?.aiEnabled}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {conversation?.aiEnabled && (
                <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  AI is currently handling this conversation. Take over to send manual messages.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <MessageSquare className="w-16 h-16 opacity-20" />
            <p>Select a conversation to view</p>
          </div>
        )}
      </div>
    </div>
  );
}
