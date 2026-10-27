"use client";
import { useState } from "react";
import { Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePost } from "../hooks/useDiscussions";
import type { DiscussionPost } from "../types/discussion.types";

interface ChatInputProps {
  topicId: string;
  replyTo: DiscussionPost | null;
  onCancelReply: () => void;
}

export function ChatInput({ topicId, replyTo, onCancelReply }: ChatInputProps) {
  const [body, setBody] = useState("");
  const mutation = useCreatePost(topicId);

  const onSubmit = () => {
    if (!body.trim()) return;
    mutation.mutate(
      {
        body: body.trim(),
        parentPost: replyTo?.id,
      },
      {
        onSuccess: () => {
          setBody("");
          onCancelReply();
        },
      }
    );
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter adds newline (WhatsApp behavior)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="border-border bg-background border-t">
      {replyTo && (
        <div className="border-border bg-primary/5 flex items-center gap-2 border-b px-3 py-2">
          <div className="bg-primary h-8 w-0.5 rounded" />
          <div className="min-w-0 flex-1">
            <p className="text-primary text-xs font-semibold">
              Replying to{" "}
              {replyTo.author
                ? `${replyTo.author.firstName} ${replyTo.author.lastName}`
                : "Unknown"}
            </p>
            <p className="text-muted-foreground truncate text-xs">{replyTo.body}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancelReply}
            aria-label="Cancel reply"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="pb-safe flex items-end gap-2 px-3 py-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={replyTo ? "Type your reply..." : "Type a message..."}
          rows={1}
          disabled={mutation.isPending}
          className="max-h-32 min-h-10 resize-none py-2"
        />
        <Button
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!body.trim()}
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
