"use client";
import { useState } from "react";
import { Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreatePost } from "../hooks/useDiscussions";
import type { DiscussionPost } from "../types/discussion.types";
import { cn } from "@/lib/utils/cn";

interface ChatInputProps {
  topicId: string;
  replyTo: DiscussionPost | null;
  onCancelReply: () => void;
}

export function ChatInput({ topicId, replyTo, onCancelReply }: ChatInputProps) {
  const [body, setBody] = useState("");
  const mutation = useCreatePost(topicId);

  const canSend = body.trim().length > 0;

  const onSubmit = () => {
    if (!canSend) return;
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
    <div className="border-border/70 bg-background/95 relative border-t backdrop-blur">
      {/* hairline gradient accent */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,hsl(var(--primary)/0.45),transparent)]"
      />

      {/* Reply context */}
      {replyTo && (
        <div className="flex items-center gap-2.5 border-b border-border/60 px-3 py-2">
          <span aria-hidden className="h-9 w-[3px] rounded-full bg-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-primary text-[9px] font-semibold uppercase tracking-[0.18em]">
              Replying to{" "}
              {replyTo.author
                ? `${replyTo.author.firstName} ${replyTo.author.lastName}`
                : "Unknown"}
            </p>
            <p className="text-muted-foreground mt-0.5 truncate text-xs">{replyTo.body}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancelReply}
            aria-label="Cancel reply"
            className="h-8 w-8 shrink-0 rounded-lg"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      )}

      {/* Input row */}
      <div className="pb-safe flex items-end gap-2 px-3 py-2.5">
        <div className="relative flex-1">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={replyTo ? "Type your reply..." : "Type a message..."}
            rows={1}
            disabled={mutation.isPending}
            className="max-h-36 min-h-11 resize-none rounded-2xl bg-muted/50 py-2.5 pl-4 pr-10 text-sm leading-6 transition-colors placeholder:text-muted-foreground focus:bg-background"
          />
          <p className="text-muted-foreground/80 pointer-events-none absolute bottom-2 right-3 hidden text-[9px] font-medium uppercase tracking-[0.14em] sm:block">
            Enter to send
          </p>
        </div>
        <Button
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!canSend}
          size="icon"
          aria-label="Send message"
          className={cn(
            "h-11 w-11 shrink-0 rounded-full bg-[linear-gradient(150deg,hsl(221_83%_55%)_0%,hsl(226_72%_48%)_100%)] text-white shadow-[0_10px_24px_-10px_hsl(221_83%_53%/0.8)] transition-all duration-200",
            canSend ? "scale-100 opacity-100 hover:-translate-y-0.5" : "opacity-40 saturate-0",
          )}
        >
          <Send className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
