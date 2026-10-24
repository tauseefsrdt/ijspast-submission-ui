import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setSession as setSessionAction,
  showToast as showToastAction,
  clearToast,
  openModal as openModalAction,
  closeModal as closeModalAction,
  resetDemo as resetDemoAction,
  advanceDay as advanceDayAction,
  submitManuscript as submitManuscriptAction,
  setAuthorPassword as setAuthorPasswordAction,
  recordSimilarity as recordSimilarityAction,
  editorPushBack as editorPushBackAction,
  authorResubmitPushback as authorResubmitPushbackAction,
  editorReject as editorRejectAction,
  authorResubmitRejected as authorResubmitRejectedAction,
  registerReviewer as registerReviewerAction,
  editorForwardToReviewers as editorForwardToReviewersAction,
  reviewerSubmitReview as reviewerSubmitReviewAction,
  editorSendComments as editorSendCommentsAction,
  authorSubmitReply as authorSubmitReplyAction,
  editorForwardRevision as editorForwardRevisionAction,
  editorFinalDecision as editorFinalDecisionAction,
  authorSubmitCameraReady as authorSubmitCameraReadyAction,
  editorUploadFormatted as editorUploadFormattedAction,
  authorApproveProof as authorApproveProofAction,
  authorRequestChanges as authorRequestChangesAction,
  processPayment as processPaymentAction,
  editorPublish as editorPublishAction,
  saveFeeRule as saveFeeRuleAction,
  saveLimits as saveLimitsAction,
} from '../store/journalSlice';

export function useApp() {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.journal);
  const modalContent = data.modal;
  const toastMessage = data.toastMessage;

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        dispatch(clearToast());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, dispatch]);

  const setSession = (patch) => {
    dispatch(setSessionAction(patch));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (msg) => {
    dispatch(showToastAction(msg));
  };

  const openModal = (content) => {
    dispatch(openModalAction(content));
  };

  const closeModal = () => {
    dispatch(closeModalAction());
  };

  const advanceDay = (daysCount) => {
    dispatch(advanceDayAction(daysCount));
  };

  const resetDemo = () => {
    dispatch(resetDemoAction());
  };

  const submitManuscript = (payload) => {
    dispatch(submitManuscriptAction(payload));
    const todayPapers = data.papers.filter(
      (p) => p.journal === payload.formValues.journal
    );
    return `${payload.formValues.journal}0${todayPapers.length + 1}-131026`;
  };

  const setAuthorPassword = (email, password) => {
    dispatch(setAuthorPasswordAction({ email, password }));
  };

  const recordSimilarity = (paperId, percent) => {
    dispatch(recordSimilarityAction({ paperId, percent }));
  };

  const editorPushBack = (paperId, reason) => {
    dispatch(editorPushBackAction({ paperId, reason }));
  };

  const authorResubmitPushback = (paperId, title, abstract, fileName) => {
    dispatch(authorResubmitPushbackAction({ paperId, title, abstract, fileName }));
  };

  const editorReject = (paperId, reason) => {
    dispatch(editorRejectAction({ paperId, reason }));
  };

  const authorResubmitRejected = (paperId, title, fileName) => {
    dispatch(authorResubmitRejectedAction({ paperId, title, fileName }));
  };

  const registerReviewer = (payload) => {
    dispatch(registerReviewerAction(payload));
  };

  const editorForwardToReviewers = (paperId, reviewer1Id, reviewer2Id) => {
    dispatch(editorForwardToReviewersAction({ paperId, reviewer1Id, reviewer2Id }));
  };

  const reviewerSubmitReview = (payload) => {
    dispatch(reviewerSubmitReviewAction(payload));
  };

  const editorSendComments = (paperId, selectedComments, note) => {
    dispatch(editorSendCommentsAction({ paperId, selectedComments, note }));
  };

  const authorSubmitReply = (paperId, replyText, newTitle, fileName) => {
    dispatch(authorSubmitReplyAction({ paperId, replyText, newTitle, fileName }));
  };

  const editorForwardRevision = (paperId) => {
    dispatch(editorForwardRevisionAction({ paperId }));
  };

  const editorFinalDecision = (paperId, isAccept, comment) => {
    dispatch(editorFinalDecisionAction({ paperId, isAccept, comment }));
  };

  const authorSubmitCameraReady = (paperId, fileName) => {
    dispatch(authorSubmitCameraReadyAction({ paperId, fileName }));
  };

  const editorUploadFormatted = (paperId, fileName, pages, overrideAmt, overrideReason) => {
    dispatch(
      editorUploadFormattedAction({
        paperId,
        fileName,
        pages,
        overrideAmt,
        overrideReason,
      })
    );
  };

  const authorApproveProof = (paperId) => {
    dispatch(authorApproveProofAction({ paperId }));
  };

  const authorRequestChanges = (paperId, changesText, fileName) => {
    dispatch(authorRequestChangesAction({ paperId, changesText, fileName }));
  };

  const processPayment = (paperId, isSuccess) => {
    dispatch(processPaymentAction({ paperId, isSuccess }));
  };

  const editorPublish = (paperId, doi) => {
    dispatch(editorPublishAction({ paperId, doi }));
  };

  const saveFeeRule = (journal, feeData) => {
    dispatch(saveFeeRuleAction({ journal, feeData }));
  };

  const saveLimits = (newLimits) => {
    dispatch(saveLimitsAction(newLimits));
  };

  const calculateFee = (journal, pages) => {
    const f = data.journals[journal]?.fee || { base: 10, amt: 5000, extra: 500 };
    const ex = Math.max(0, pages - f.base);
    const sub = f.amt + ex * f.extra;
    return {
      pages,
      limit: f.base,
      baseAmt: f.amt,
      rate: f.extra,
      ex,
      sub,
      gst: 0,
      gstPct: 0,
      total: sub,
    };
  };

  return {
    data,
    modalContent,
    toastMessage,
    setSession,
    showToast,
    openModal,
    closeModal,
    advanceDay,
    resetDemo,
    submitManuscript,
    setAuthorPassword,
    recordSimilarity,
    editorPushBack,
    authorResubmitPushback,
    editorReject,
    authorResubmitRejected,
    registerReviewer,
    editorForwardToReviewers,
    reviewerSubmitReview,
    editorSendComments,
    authorSubmitReply,
    editorForwardRevision,
    editorFinalDecision,
    authorSubmitCameraReady,
    editorUploadFormatted,
    authorApproveProof,
    authorRequestChanges,
    processPayment,
    editorPublish,
    saveFeeRule,
    saveLimits,
    calculateFee,
  };
}
