"use client";
import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";
import { useCreatePost } from "../hooks/useDiscussions";

interface Props {
  topicId: string;
  parentPost?: string;
  placeholder?: string;
  compact?: boolean;
  onPosted?: () => void;
}

export function PostForm({
  topicId,
  parentPost,
  placeholder = "Write a message...",
  compact = false,
  onPosted,
}: Props) {
  const [body, setBody] = useState("");
  const mutation = useCreatePost(topicId);

  const onSubmit = () => {
    mutation.mutate(
      { body: body.trim(), parentPost },
      {
        onSuccess: () => {
          setBody("");
          onPosted?.();
        },
      }
    );
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={compact ? 3 : 4}
        disabled={mutation.isPending}
        className={cn(compact && "text-sm")}
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!body.trim()}
        >
          <Send className="mr-1.5 h-3.5 w-3.5" />
          {parentPost ? "Reply" : "Post"}
        </Button>
      </div>
    </div>
  );
}
