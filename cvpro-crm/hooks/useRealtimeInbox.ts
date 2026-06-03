import { useEffect, useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

type WSEvent =
  | { type: "connected" }
  | { type: "new_message"; conversationId: string; messageId: string }
  | { type: "new_conversation"; conversationId: string; contactName: string }
  | { type: "conversation_updated"; conversationId: string }
  | { type: "ai_reply"; conversationId: string; messageId: string }
  | { type: "ai_typing"; conversationId: string }
  | { type: "ai_typing_done"; conversationId: string };

export function useRealtimeInbox(selectedConversationId: string | null) {
  const queryClient = useQueryClient();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const [typingConversationId, setTypingConversationId] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${protocol}//${window.location.host}/api/ws`;

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    socket.onmessage = (event) => {
      try {
        const data: WSEvent = JSON.parse(event.data as string);

        if (data.type === "connected") return;

        if (data.type === "ai_typing") {
          setTypingConversationId(data.conversationId);
          return;
        }

        if (data.type === "ai_typing_done") {
          setTypingConversationId(null);
          return;
        }

        if (data.type === "new_conversation") {
          queryClient.invalidateQueries({ queryKey: ["listConversations"] });
        }

        if (
          data.type === "new_message" ||
          data.type === "ai_reply" ||
          data.type === "conversation_updated"
        ) {
          queryClient.invalidateQueries({ queryKey: ["listConversations"] });

          if (
            selectedConversationId === data.conversationId &&
            (data.type === "new_message" || data.type === "ai_reply")
          ) {
            queryClient.invalidateQueries({
              queryKey: ["listMessages", data.conversationId],
            });
          }
        }
      } catch {
      }
    };

    socket.onclose = () => {
      if (!isMountedRef.current) return;
      reconnectTimerRef.current = setTimeout(() => connect(), 3000);
    };

    socket.onerror = () => {
      socket.close();
    };
  }, [queryClient, selectedConversationId]);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
    };
  }, [connect]);

  const isAITyping =
    typingConversationId !== null &&
    typingConversationId === selectedConversationId;

  return { isAITyping };
}
