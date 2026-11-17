"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  attachQuestion,
  attachQuestions,
  createBankQuestion,
  createQuestionBank,
  detachQuestion,
  getAssessmentQuestions,
  getBankQuestions,
  getQuestionBanks,
  importAnswerKey,
  importWordQuestions,
  updateBankQuestion,
  updateAssessmentQuestion,
  type CreateQuestionPayload,
} from "../api/assessments.api";
import {
  enterAssessmentCode,
  generateAccessCode,
  setAccessCode,
} from "../api/assessments.api";

import {
  getAssessment,
  getAttemptResult,
  getLiveAttempt,
  getMyAssessments,
  saveAnswer,
  startAttempt,
  submitAttempt,
  type SaveAnswerPayload,
} from "../api/assessments.api";

import { normalizeError } from "@/lib/api/errors";

export function useMyAssessments() {
  return useQuery({
    queryKey: ["my-assessments"],
    queryFn: getMyAssessments,
    staleTime: 30_000,
  });
}

export function useAssessment(id: string | null) {
  return useQuery({
    queryKey: ["assessment", id],
    queryFn: () => getAssessment(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useLiveAttempt(attemptId: string | null) {
  return useQuery({
    queryKey: ["attempt-live", attemptId],
    queryFn: () => getLiveAttempt(attemptId!),
    enabled: !!attemptId,
    refetchInterval: 3000,
    staleTime: 0, // always refetch — it's live state
    gcTime: 0,
  });
}

export function useAttemptResult(attemptId: string | null) {
  return useQuery({
    queryKey: ["attempt-result", attemptId],
    queryFn: () => getAttemptResult(attemptId!),
    enabled: !!attemptId,
    staleTime: 30_000,
  });
}

export function useStartAttempt(assessmentId: string) {
  return useMutation({
    mutationFn: () => startAttempt(assessmentId),
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useSaveAnswer(attemptId: string) {
  return useMutation({
    mutationFn: ({ aqId, payload }: { aqId: string; payload: SaveAnswerPayload }) =>
      saveAnswer(attemptId, aqId, payload),
  });
}

export function useSubmitAttempt(attemptId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => submitAttempt(attemptId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-assessments"] });
      qc.invalidateQueries({ queryKey: ["attempt-live", attemptId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

import {
  closeAssessment as closeAssessmentApi,
  createAssessment,
  publishAssessment as publishAssessmentApi,
  updateAssessment,
  type CreateAssessmentPayload,
} from "../api/assessments.api";
import { get } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api.types";

export function useCourseAssessments(offeringId: string | null) {
  return useQuery({
    queryKey: ["course-assessments", offeringId],
    queryFn: () =>
      get<ApiResponse<import("../types/assessment.types").AssessmentDetail[]>>(
        `/course-offerings/${offeringId}/assessments/`
      ),
    enabled: !!offeringId,
    staleTime: 30_000,
  });
}

export function useCreateAssessment(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssessmentPayload) =>
      createAssessment(offeringId, payload),
    onSuccess: () => {
      toast.success("Assessment created as draft");
      qc.invalidateQueries({ queryKey: ["course-assessments", offeringId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function usePublishAssessment(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishAssessmentApi(id),
    onSuccess: () => {
      toast.success("Assessment published");
      qc.invalidateQueries({ queryKey: ["course-assessments", offeringId] });
      qc.invalidateQueries({ queryKey: ["lecturer-dashboard"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useCloseAssessment(offeringId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => closeAssessmentApi(id),
    onSuccess: () => {
      toast.success("Assessment closed");
      qc.invalidateQueries({ queryKey: ["course-assessments", offeringId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useAssessmentQuestions(assessmentId: string | null) {
  return useQuery({
    queryKey: ["assessment-questions", assessmentId],
    queryFn: () => getAssessmentQuestions(assessmentId!),
    enabled: !!assessmentId,
    staleTime: 20_000,
  });
}

export function useQuestionBanks(courseOfferingId?: string | null) {
  return useQuery({
    queryKey: ["question-banks", courseOfferingId],
    queryFn: () => getQuestionBanks(courseOfferingId ?? undefined),
    enabled: !!courseOfferingId,
    staleTime: 60_000,
  });
}

export function useCreateQuestionBank(courseOfferingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => createQuestionBank(courseOfferingId, title),
    onSuccess: () => {
      toast.success("Question bank created");
      qc.invalidateQueries({ queryKey: ["question-banks", courseOfferingId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useBankQuestions(bankId: string | null) {
  return useQuery({
    queryKey: ["bank-questions", bankId],
    queryFn: () => getBankQuestions(bankId!),
    enabled: !!bankId,
    staleTime: 30_000,
  });
}

export function useImportWordQuestions(bankId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importWordQuestions(bankId, file),
    onSuccess: () => {
      toast.success("Word questions imported as drafts");
      qc.invalidateQueries({ queryKey: ["bank-questions", bankId] });
      qc.invalidateQueries({ queryKey: ["question-banks"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useImportAnswerKey(bankId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, questionIds }: { file: File; questionIds?: string[] }) =>
      importAnswerKey(bankId, file, questionIds),
    onSuccess: (res) => {
      toast.success(
        `Answer key applied to ${res.data.applied} of ${res.data.totalQuestions} questions`
      );
      qc.invalidateQueries({ queryKey: ["bank-questions", bankId] });
      qc.invalidateQueries({ queryKey: ["question-banks"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useUpdateBankQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      options,
    }: {
      questionId: string;
      options: { text: string; isCorrect: boolean; position: number }[];
    }) => updateBankQuestion(questionId, { options }),
    onSuccess: (_, variables) => {
      toast.success("Correct answer saved");
      qc.invalidateQueries({ queryKey: ["bank-questions"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useAttachQuestion(assessmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { questionId: string; points?: string }) =>
      attachQuestion(assessmentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["assessment-questions", assessmentId],
      });
      qc.invalidateQueries({ queryKey: ["assessment", assessmentId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useAttachQuestions(assessmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (questionIds: string[]) => attachQuestions(assessmentId, questionIds),
    onSuccess: (res) => {
      toast.success(`${res.data.length} questions added to the assessment`);
      qc.invalidateQueries({
        queryKey: ["assessment-questions", assessmentId],
      });
      qc.invalidateQueries({ queryKey: ["assessment", assessmentId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useUpdateAssessmentQuestion(assessmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      aqId,
      payload,
    }: {
      aqId: string;
      payload: { position?: number; points?: string };
    }) => updateAssessmentQuestion(assessmentId, aqId, payload),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["assessment-questions", assessmentId],
      });
      qc.invalidateQueries({ queryKey: ["assessment", assessmentId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useDetachQuestion(assessmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (aqId: string) => detachQuestion(assessmentId, aqId),
    onSuccess: () => {
      toast.success("Question removed");
      qc.invalidateQueries({
        queryKey: ["assessment-questions", assessmentId],
      });
      qc.invalidateQueries({ queryKey: ["assessment", assessmentId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useCreateBankQuestion(bankId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<CreateQuestionPayload, "questionBankId">) =>
      createBankQuestion(bankId, { ...payload, questionBankId: bankId }),
    onSuccess: () => {
      toast.success("Question created");
      qc.invalidateQueries({ queryKey: ["bank-questions", bankId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}
export function useEnterCode(assessmentId: string) {
  return useMutation({
    mutationFn: (code: string) => enterAssessmentCode(assessmentId, code),
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useGenerateCode(assessmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => generateAccessCode(assessmentId),
    onSuccess: () => {
      toast.success("New access code generated");
      qc.invalidateQueries({ queryKey: ["assessment", assessmentId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useSetCode(assessmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => setAccessCode(assessmentId, code),
    onSuccess: () => {
      toast.success("Access code set");
      qc.invalidateQueries({ queryKey: ["assessment", assessmentId] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}

export function useUpdateAssessment(assessmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      updateAssessment(assessmentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assessment", assessmentId] });
      toast.success("Assessment updated");
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });
}
