import * as Yup from 'yup';
import { countWords, parseKeywords } from './validation';

/**
 * Standard reusable regex and constraints
 */
const ORCID_REGEX = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;

/**
 * 1. Sign In Schema
 */
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email('Please enter a valid institutional email address')
    .required('Email address is required'),
  password: Yup.string()
    .required('Password is required'),
});

/**
 * 2. Forgot Password - Step 1 Email Schema
 */
export const forgotPasswordEmailSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email('Please enter a valid institutional email address')
    .required('Registered institutional email is required')
    .test(
      'not-editor',
      'Editor accounts cannot be reset via the portal. Editor credentials are managed centrally by system administration.',
      (val) => !val || !val.trim().toLowerCase().startsWith('editor@')
    ),
});

/**
 * 3. Forgot Password - Step 2 OTP Verification Schema
 */
export const verifyOtpSchema = Yup.object().shape({
  otp: Yup.string()
    .trim()
    .required('6-digit OTP code is required')
    .matches(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});

/**
 * 4. Password Reset - Step 3 New Password Schema
 */
export const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters long')
    .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: Yup.string()
    .required('Please confirm your new password')
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match'),
});

/**
 * 5. Change Password Modal Schema
 */
export const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'New password must be at least 8 characters long')
    .matches(/[a-zA-Z]/, 'New password must contain at least one letter')
    .matches(/[0-9]/, 'New password must contain at least one number')
    .notOneOf([Yup.ref('currentPassword')], 'New password cannot be identical to current password'),
  confirmPassword: Yup.string()
    .required('Please confirm your new password')
    .oneOf([Yup.ref('newPassword')], 'New passwords do not match'),
});

/**
 * 6. Account Activation Schema
 */
export const activateAccountSchema = Yup.object().shape({
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords do not match'),
});

/**
 * 7. Manuscript Submission Schema
 */
export const submissionSchema = Yup.object().shape({
  name: Yup.string().trim().required('Corresponding author full name is required'),
  email: Yup.string().trim().email('Valid institutional email is required').required('Author email is required'),
  institution: Yup.string().trim().required('Institution or university is required'),
  department: Yup.string().trim(),
  cityCountry: Yup.string().trim().required('City and country is required'),
  orcid: Yup.string()
    .trim()
    .required('ORCID ID is required to submit a manuscript')
    .matches(ORCID_REGEX, 'Please enter a valid ORCID ID (e.g. 0000-0002-1825-0097)'),
  title: Yup.string().trim().required('Manuscript title is required'),
  domain: Yup.string().trim().required('Primary subject domain is required'),
  abstract: Yup.string()
    .trim()
    .required('Abstract is required')
    .test(
      'abstract-word-count',
      'Abstract must be between 150 and 250 words',
      (val) => {
        if (!val) return false;
        const count = countWords(val);
        return count >= 150 && count <= 250;
      }
    ),
  keywords: Yup.string()
    .trim()
    .required('Keywords are required')
    .test(
      'keywords-count',
      'Please provide between 4 and 8 comma-separated keywords',
      (val) => {
        if (!val) return false;
        const count = parseKeywords(val).length;
        return count >= 4 && count <= 8;
      }
    ),
  coauthors: Yup.string().trim(),
  declaration: Yup.boolean().oneOf([true], 'You must confirm the submission declaration'),
});

/**
 * 8. Manuscript Revision Schema
 */
export const revisionSchema = Yup.object().shape({
  response: Yup.string()
    .trim()
    .required('Please provide a point-by-point response addressing reviewer feedback')
    .min(10, 'Response should provide substantive explanation of changes'),
});

/**
 * 9. Reviewer Enrollment / Quick Create Schema
 */
export const reviewerEnrollmentSchema = Yup.object().shape({
  name: Yup.string().trim().required('Reviewer full name is required'),
  email: Yup.string().trim().email('Valid institutional email is required').required('Email is required'),
  phone: Yup.string().trim(),
  institution: Yup.string().trim().required('Institution is required'),
  domain: Yup.string().trim().required('Expert subject domain is required'),
});

/**
 * 10. Edit Reviewer Profile Schema
 */
export const editReviewerSchema = Yup.object().shape({
  name: Yup.string().trim().required('Full name and title is required'),
  email: Yup.string().trim().email('Valid email is required').required('Email address is required'),
  phone: Yup.string().trim(),
  institution: Yup.string().trim().required('Affiliated institution is required'),
  department: Yup.string().trim(),
  domain: Yup.string().trim().required('Expert subject domain is required'),
});

/**
 * 11. Peer Review Feedback Schema
 */
export const reviewSubmissionSchema = Yup.object().shape({
  commentsForAuthor: Yup.string()
    .trim()
    .required('Constructive feedback for the author is required')
    .min(15, 'Feedback for author must be at least 15 characters'),
  commentsForEditor: Yup.string()
    .trim()
    .required('Evaluation summary for the editor is required')
    .min(10, 'Evaluation summary for the editor must be at least 10 characters'),
  confidentialComments: Yup.string().trim(),
});

/**
 * 12. Editorial Rejection Schema
 */
export const rejectSchema = Yup.object().shape({
  reason: Yup.string()
    .trim()
    .required('Formal editorial reason for rejection is required')
    .min(5, 'Rejection reason must be informative'),
});

/**
 * 13. Open Access Publication Schema
 */
export const publishSchema = Yup.object().shape({
  doi: Yup.string().trim().required('Digital Object Identifier (DOI) is required'),
  volume: Yup.string().trim().required('Volume is required'),
  issue: Yup.string().trim().required('Issue is required'),
});
