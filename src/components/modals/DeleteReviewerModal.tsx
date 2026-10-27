import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ReviewerProfile } from '../../types/user.types';
import { useAppDispatch } from '../../store';
import { deleteExistingReviewer } from '../../store/slices/reviewerSlice';
import { AlertTriangle, Trash2, Building, Mail, ShieldAlert } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface DeleteReviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewer: ReviewerProfile | null;
  onSuccess: (deletedId: string) => void;
}

export const DeleteReviewerModal: React.FC<DeleteReviewerModalProps> = ({
  isOpen,
  onClose,
  reviewer,
  onSuccess,
}) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!reviewer) return null;

  const handleDelete = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const resultAction = await dispatch(deleteExistingReviewer(reviewer.id));
      if (deleteExistingReviewer.fulfilled.match(resultAction)) {
        toast.success(`Reviewer account for ${reviewer.name} permanently deleted.`);
        onSuccess(reviewer.id);
        onClose();
      } else {
        const msg =
          (resultAction.payload as string) || 'Failed to delete reviewer. Please try again.';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred while deleting reviewer.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Reviewer Account"
      subtitle="Confirm irreversible removal of reviewer from database and directory"
      size="md"
    >
      <div className="space-y-4 text-xs">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Warning Banner */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-950 text-xs">Confirm Reviewer Deletion</h4>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Are you sure you want to permanently delete <strong>{reviewer.name}</strong>? Their login credentials will be revoked immediately and they will be unassigned from any associated manuscripts.
            </p>
          </div>
        </div>

        {/* Reviewer Details Box */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm">{reviewer.name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-mono">
              {reviewer.id}
            </span>
          </div>

          <div className="space-y-1 text-slate-600 text-[11px]">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{reviewer.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{reviewer.institution}</span>
            </div>
          </div>

          {reviewer.activeAssignmentsCount > 0 && (
            <div className="pt-2 border-t border-slate-200 text-rose-700 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>
                Notice: This reviewer currently has {reviewer.activeAssignmentsCount} active assignment(s). Deleting will unassign them from those papers.
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50 cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isLoading ? 'Deleting Reviewer...' : 'Yes, Delete Reviewer'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
