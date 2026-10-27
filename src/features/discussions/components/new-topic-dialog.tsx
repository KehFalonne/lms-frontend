"use client";
import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTopic } from "../hooks/useDiscussions";

interface Props {
  forumId: string;
}

export function NewTopicDialog({ forumId }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const create = useCreateTopic(forumId);

  const reset = () => {
    setTitle("");
    setBody("");
  };

  const onClose = () => {
    if (create.isPending) return;
    setOpen(false);
    reset();
  };

  const onSubmit = () => {
    create.mutate(
      { title: title.trim(), body: body.trim() },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      }
    );
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1.5 h-4 w-4" /> New topic
      </Button>

      <Dialog
        open={open}
        onClose={onClose}
        title="New topic"
        description="Start a conversation in this forum."
        size="lg"
        locked={create.isPending}
        footer={
          <>
            <Button variant="outline" onClick={onClose} disabled={create.isPending}>
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              loading={create.isPending}
              disabled={!title.trim() || !body.trim()}
            >
              Post topic
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question?"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Body</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Add details..."
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
