export interface DiscussionAuthor {
  id: string;
  firstName: string;
  lastName: string;
  universityId: string;
}

export interface DiscussionForum {
  id: string;
  courseOfferingId: string;
  title: string;
  description: string;
  isLocked: boolean;
  createdBy: DiscussionAuthor | null;
  topicCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionTopic {
  id: string;
  forumId: string;
  title: string;
  body: string;
  isPinned: boolean;
  isLocked: boolean;
  isEdited: boolean;
  createdBy: DiscussionAuthor | null;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionPost {
  id: string;
  topic: string;
  parentPost: string | null;
  body: string;
  author: DiscussionAuthor | null;
  replyCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Client-side threaded view. */
export interface ThreadedPost extends DiscussionPost {
  children: ThreadedPost[];
}
