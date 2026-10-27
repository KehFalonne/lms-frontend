import { get, post } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";
import type {
  DiscussionForum,
  DiscussionPost,
  DiscussionTopic,
} from "../types/discussion.types";

export async function getCourseForums(offeringId: string) {
  return get<ApiResponse<DiscussionForum[]>>(`/course-offerings/${offeringId}/forums/`);
}

export async function getForumTopics(forumId: string) {
  return get<ApiResponse<DiscussionTopic[]>>(`/forums/${forumId}/topics/`);
}

export async function getTopic(topicId: string) {
  return get<ApiResponse<DiscussionTopic>>(`/topics/${topicId}/`);
}

export async function getTopicPosts(topicId: string) {
  return get<ApiResponse<DiscussionPost[]>>(`/topics/${topicId}/posts/`);
}

export interface CreateTopicPayload {
  title: string;
  body: string;
}

export async function createTopic(forumId: string, payload: CreateTopicPayload) {
  return post<ApiResponse<DiscussionTopic>>(`/forums/${forumId}/topics/`, payload);
}

export interface CreatePostPayload {
  body: string;
  parentPost?: string;
}

export async function createPost(topicId: string, payload: CreatePostPayload) {
  return post<ApiResponse<DiscussionPost>>(`/topics/${topicId}/posts/`, payload);
}
