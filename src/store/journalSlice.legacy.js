import { createSlice } from '@reduxjs/toolkit';
import {
  BASE_DATE,
  JOURNAL_INFO,
  STATUS_OWNERS,
  getDateString,
  getDdmmyy,
  formatINR,
  getInitialSeedData,
} from '../constants/initialData';

const STORAGE_KEY = 'ijmar_portal_mock_v4';

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.version === 4) {
        return {
          ...parsed,
          toastMessage: null,
          modal: null, // { type, data }
        };
      }
    }
  } catch (e) {
    console.error('Failed to parse localStorage state:', e);
  }
  const seed = getInitialSeedData();
  return {
    ...seed,
    toastMessage: null,
    modal: null,
  };
}

const getSimulatedTime = (tick) => {
  const minutes = (540 + tick * 7) % 1440;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const calculateDueDates = (status, currentDay, limits) => {
  const map = {
    'Under Screening': [limits.screen],
    'Sent to Reviewers': [limits.rev1, limits.rev1max],
    'Review Received': [limits.sendComments],
    'Comments Sent': [limits.authorReply],
    'Revision Received': [limits.forward],
    'Re-review': [limits.rev2, limits.rev2max],
    'Reviews Complete': [limits.decision],
    'Accepted': [limits.camera],
    'Camera-Ready Received': [limits.format],
    'Changes Requested': [limits.format],
    'Proofreading': [limits.proof],
    'Payment Pending': [limits.pay],
  };
  const m = map[status];
  return {
    due: m ? currentDay + m[0] : null,
    dueMax: m && m[1] ? currentDay + m[1] : null,
  };
};

const calculateFeeHelper = (journals, journal, pages) => {
  const f = journals[journal]?.fee || { base: 10, amt: 5000, extra: 500 };
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

export const journalSlice = createSlice({
  name: 'journal',
  initialState: loadInitialState(),
  reducers: {
    setSession: (state, action) => {
      state.session = {
        ...state.session,
        ...action.payload,
      };
    },
    showToast: (state, action) => {
      state.toastMessage = action.payload;
    },
    clearToast: (state) => {
      state.toastMessage = null;
    },
    openModal: (state, action) => {
      state.modal = action.payload;
    },
    closeModal: (state) => {
      state.modal = null;
    },
    resetDemo: (state) => {
      const fresh = getInitialSeedData();
      Object.assign(state, fresh, { toastMessage: 'Demo reset to initial state', modal: null });
    },
    advanceDay: (state, action) => {
      const daysCount = action.payload || 1;
      const getOwners = (p) => {
        const ownerType = STATUS_OWNERS[p.status];
        if (ownerType === 'Author') return [{ to: p.author.email, n: p.author.name }];
        if (ownerType === 'Editor') return [{ to: state.journals[p.journal]?.editorEmail, n: 'Editor' }];
        if (ownerType === 'Reviewer') {
          return p.reviewers
            .filter((rId) => !p.reviews.some((v) => v.rid === rId && v.round === p.round))
            .map((rId) => {
              const r = state.reviewers.find((x) => x.id === rId);
              return { to: r?.email, n: r?.name };
            });
        }
        return [];
      };

      for (let i = 0; i < daysCount; i++) {
        state.day++;
        state.papers.forEach((p) => {
          if (p.due == null) return;
          const daysLeft = p.due - state.day;
          let noticeTitle = null;
          if (daysLeft === 1) noticeTitle = 'Warning: 1 day left';
          else if (daysLeft === 0) noticeTitle = 'Due today';
          else if (daysLeft < 0 && -daysLeft % 2 === 0) noticeTitle = `Overdue by ${-daysLeft} days`;

          if (noticeTitle) {
            getOwners(p).forEach((owner) => {
              if (!owner.to) return;
              state.tick++;
              const time = getSimulatedTime(state.tick);
              state.mail.unshift({
                n: ++state.mailNumber,
                day: state.day,
                time,
                to: owner.to,
                subject: `${noticeTitle} for ${p.id}`,
                body: `Paper ${p.id} (${p.status}) needs your action. Due date: ${getDateString(
                  BASE_DATE,
                  p.due
                )}. No button is blocked; please act as soon as possible.`,
                links: [],
                kind: 'Email',
              });

              if (state.limits.sms) {
                state.mail.unshift({
                  n: ++state.mailNumber,
                  day: state.day,
                  time,
                  to: owner.to,
                  subject: 'SMS',
                  body: `SRMU Journals: ${p.id} pending. ${noticeTitle}.`,
                  links: [],
                  kind: 'SMS',
                });
              }
            });
          }
        });
      }
      state.toastMessage = `Date moved +${daysCount} day${daysCount > 1 ? 's' : ''}`;
    },
    submitManuscript: (state, action) => {
      const { formValues, file, orcidStatus } = action.payload;
      const journal = formValues.journal;
      const todayCode = getDdmmyy(BASE_DATE, state.day);
      const countToday =
        state.papers.filter((p) => p.journal === journal && p.id.endsWith(`-${todayCode}`)).length + 1;
      const newPaperId = `${journal}${String(countToday).padStart(2, '0')}-${todayCode}`;

      const authorEmail = formValues.email.trim().toLowerCase();
      const isNewAuthor = !state.users[authorEmail];
      if (isNewAuthor) {
        state.users[authorEmail] = {
          name: formValues.name,
          pw: null,
        };
      }

      state.tick++;
      const time = getSimulatedTime(state.tick);

      const newPaper = {
        id: newPaperId,
        journal,
        title: formValues.title,
        domain: formValues.domain,
        abstract: formValues.abstract,
        keywords: formValues.keywords,
        author: {
          name: formValues.name,
          email: authorEmail,
          inst: formValues.institution,
          dept: formValues.department,
          city: formValues.city,
          coauthors: formValues.coauthors,
          orcid: formValues.orcid.toUpperCase(),
        },
        orc: {
          status: orcidStatus.status,
          name: orcidStatus.name || '',
        },
        status: 'Under Screening',
        day0: state.day,
        stepStart: state.day,
        due: state.day + state.limits.screen,
        dueMax: null,
        pushbacks: 0,
        reviewers: [],
        round: 0,
        reviews: [],
        sent: [],
        replies: [],
        files: [{ t: 'Submission', name: file.name, day: state.day }],
        proof: 0,
        pages: null,
        calc: null,
        override: null,
        invoice: null,
        paidDay: null,
        sim: null,
        trail: [
          {
            n: ++state.trailNumber,
            day: state.day,
            time,
            actor: formValues.name,
            text: `Submitted the manuscript. Paper ID ${newPaperId} created.`,
            vis: 'au',
          },
          {
            n: ++state.trailNumber,
            day: state.day,
            time,
            actor: 'System',
            text: `ORCID ${orcidStatus.status} (${formValues.orcid.toUpperCase()}).`,
            vis: 'ed',
          },
          {
            n: ++state.trailNumber,
            day: state.day,
            time,
            actor: 'System',
            text: 'Acknowledgement sent. Paper is with the editor.',
            vis: 'au',
          },
        ],
      };

      state.papers.push(newPaper);

      const jInfo = state.journals[journal] || JOURNAL_INFO[journal];
      const coAuthorsList = formValues.coauthors
        ? formValues.coauthors.split(',').map((x) => x.trim()).filter(Boolean)
        : [];
      const allAuthors = [formValues.name, ...coAuthorsList].join(', ');

      const ackSubj = `${journal} Journal: Paper Receipt Acknowledgement ${newPaperId}`;
      const ackBody = `Dear Corresponding Author,\nThis is to inform you that we have properly received the submission of the paper:\nTitle: ${formValues.title}\n\nby ${allAuthors}\n\nThe paper id assigned to your paper is: ${newPaperId}\n\nPlease refer to this id in all correspondence referred to the above paper.\nYou can check the status of your manuscript at the author center:\nlog in Journal website: ${jInfo.site}\n\nWe will let you know about the decision from our Editorial Board as soon as possible.\nThank you for the submission of your paper to our journal.\nYours' sincerely\n\n${jInfo.sign}\n\nOn behalf of\n${journal} Editorial and Production Office\n${jInfo.editorEmail}`;

      state.mail.unshift({
        n: ++state.mailNumber,
        day: state.day,
        time,
        to: authorEmail,
        subject: ackSubj,
        body: ackBody,
        links: isNewAuthor
          ? [{ l: 'Set your password', a: 'setpw', d: authorEmail }]
          : [{ l: 'Log in', a: 'login', d: `author|${authorEmail}` }],
        kind: 'Email',
      });

      state.mail.unshift({
        n: ++state.mailNumber,
        day: state.day,
        time,
        to: jInfo.editorEmail,
        subject: `${ackSubj} (copy to the journal email)`,
        body: `${ackBody}\n\n[Editor note] ORCID: ${orcidStatus.status}`,
        links: [{ l: 'Open as editor', a: 'login', d: `editor|${journal}` }],
        kind: 'Email',
      });

      state.toastMessage = `Manuscript ${newPaperId} submitted successfully!`;
    },
    setAuthorPassword: (state, action) => {
      const { email, password } = action.payload;
      if (!state.users[email]) {
        state.users[email] = { name: 'Author', pw: password };
      } else {
        state.users[email].pw = password;
      }
      state.session = { role: 'author', who: email, pid: null };
      state.toastMessage = 'Password saved! You are now logged in.';
    },
    recordSimilarity: (state, action) => {
      const { paperId, percent } = action.payload;
      const p = state.papers.find((x) => x.id === paperId);
      if (!p) return;
      state.tick++;
      const time = getSimulatedTime(state.tick);
      const editorEmail = state.journals[p.journal]?.editorEmail || 'editor@journal.org';

      p.sim = percent;
      p.trail.push({
        n: ++state.trailNumber,
        day: state.day,
        time,
        actor: editorEmail,
        text: `Recorded the similarity check: ${percent}%${
          percent > 10 ? ' (above the 10% benchmark)' : ' (within the 10% benchmark)'
        }.`,
        vis: 'ed',
      });
      state.toastMessage = 'Similarity check recorded';
    },
    editorPushBack: (state, action) => {
      const { paperId, reason } = action.payload;
      const p = state.papers.find((x) => x.id === paperId);
      if (!p) return;
      state.tick++;
      const time = getSimulatedTime(state.tick);
      const editorEmail = state.journals[p.journal]?.editorEmail || 'editor@journal.org';

      p.status = 'Pushed Back';
      p.pushbacks += 1;
      p.due = null;
      p.dueMax = null;

      p.trail.push({
        n: ++state.trailNumber,
        day: state.day,
        time,
        actor: editorEmail,
        text: `Pushed back: ${reason}`,
        vis: 'au',
      });

      state.mail.unshift({
        n: ++state.mailNumber,
        day: state.day,
        time,
        to: p.author.email,
        subject: `Your paper needs changes: ${p.id}`,
        body: reason,
        links: [{ l: 'Log in to revise', a: 'login', d: `author|${p.author.email}` }],
        kind: 'Email',
      });

      state.toastMessage = 'Pushed back to the author';
    },
    authorResubmitPushback: (state, action) => {
      const { paperId, title, abstract, fileName } = action.payload;
      const p = state.papers.find((x) => x.id === paperId);
      if (!p) return;
      state.tick++;
      const time = getSimulatedTime(state.tick);
      const dueDates = calculateDueDates('Under Screening', state.day, state.limits);
      const editorEmail = state.journals[p.journal]?.editorEmail || 'editor@journal.org';

      p.title = title || p.title;
      p.abstract = abstract || p.abstract;
      p.status = 'Under Screening';
      p.stepStart = state.day;
      p.due = dueDates.due;
      p.dueMax = dueDates.dueMax;
      p.files.push({ t: 'Resubmission', name: fileName || 'corrected_paper.pdf', day: state.day });

      p.trail.push({
        n: ++state.trailNumber,
        day: state.day,
        time,
        actor: p.author.name,
        text: 'Resubmitted the corrected paper.',
        vis: 'au',
      });

      state.mail.unshift({
        n: ++state.mailNumber,
        day: state.day,
        time,
        to: editorEmail,
        subject: `Resubmitted: ${p.id}`,
        body: 'The author resubmitted the paper after your push-back.',
        links: [{ l: 'Open as editor', a: 'login', d: `editor|${p.journal}` }],
        kind: 'Email',
      });

      state.toastMessage = 'Resubmitted to the editor';
    },
    editorReject: (state, action) => {
      const { paperId, reason } = action.payload;
      const p = state.papers.find((x) => x.id === paperId);
      if (!p) return;
      state.tick++;
      const time = getSimulatedTime(state.tick);
      const editorEmail = state.journals[p.journal]?.editorEmail || 'editor@journal.org';

      p.status = 'Rejected';
      p.due = null;
      p.dueMax = null;

      p.trail.push({
        n: ++state.trailNumber,
        day: state.day,
        time,
        actor: editorEmail,
        text: `Rejected: ${reason}`,
        vis: 'au',
      });

      state.mail.unshift({
        n: ++state.mailNumber,
        day: state.day,
        time,
        to: p.author.email,
        subject: `Decision on ${p.id}`,
        body: `Your paper was rejected. ${reason}\nYou may resubmit the paper under the same paper ID (${p.id}).`,
        links: [{ l: 'Log in to view / resubmit', a: 'login', d: `author|${p.author.email}` }],
        kind: 'Email',
      });

      state.toastMessage = 'Paper rejected';
    },
    authorResubmitRejected: (state, action) => {
      const { paperId, title, fileName } = action.payload;
      const p = state.papers.find((x) => x.id === paperId);
      if (!p) return;
      state.tick++;
      const time = getSimulatedTime(state.tick);
      const resubCount = (p.resub || 0) + 1;
      const dueDates = calculateDueDates('Under Screening', state.day, state.limits);

      const archivedReviews = [
        ...(p.archive || []),
        ...p.reviews.map((v) => ({ ...v, cycle: resubCount })),
      ];

      p.resub = resubCount;
      p.title = title || p.title;
      p.status = 'Under Screening';
      p.day0 = state.day;
      p.stepStart = state.day;
      p.due = dueDates.due;
      p.dueMax = dueDates.dueMax;
      p.reviews = [];
      p.reviewers = [];
      p.round = 0;
      p.sent = [];
      p.replies = [];
      p.pushbacks = 0;
      p.proof = 0;
      p.pages = null;
      p.calc = null;
      p.override = null;
      p.invoice = null;
      p.sim = null;
      p.archive = archivedReviews;
      p.files.push({
        t: `Resubmission ${resubCount}`,
        name: fileName || 'resubmitted_paper.pdf',
        day: state.day,
      });

      p.trail.push({
        n: ++state.trailNumber,
        day: state.day,
        time,
        actor: p.author.name,
        text: `Resubmitted the paper after rejection. The paper ID stays ${p.id}. Day 0 restarts today (resubmission ${resubCount}). Earlier reviews are archived.`,
        vis: 'au',
      });

      const jInfo = state.journals[p.journal] || JOURNAL_INFO[p.journal];
      state.mail.unshift({
        n: ++state.mailNumber,
        day: state.day,
        time,
        to: jInfo.editorEmail,
        subject: `${p.journal} Journal: Resubmission ${p.id}`,
        body: `The author has resubmitted rejected paper ${p.id} for a new evaluation cycle.`,
        links: [{ l: 'Open as editor', a: 'login', d: `editor|${p.journal}` }],
        kind: 'Email',
      });

      state.toastMessage = `Resubmitted under the same paper ID ${paperId}`;
    },
    registerReviewer: (state, action) => {
      const { name, email, phone, domain } = action.payload;
      const newRevId = `R${state.reviewers.length + 1}`;
      const pw = `Rv@${Math.floor(1000 + Math.random() * 9000)}`;
      state.reviewers.push({
        id: newRevId,
        name,
        email: email.trim().toLowerCase(),
        phone,
        domain,
        pw,
      });
      state.toastMessage = 'Reviewer registered successfully';
    },
    editorForwardToReviewers: (state, action) => {
      const { paperId, reviewer1Id, reviewer2Id } = action.payload;
      const p = state.papers.find((x) => x.id === paperId);
      if (!p) return;
      const editorEmail = state.journals[p.journal]?.editorEmail || 'editor@journal.org';
      const dueDates = calculateDueDates('Sent to Reviewers', state.day, state.limits);

      const r1 = state.reviewers.find((r) => r.id === reviewer1Id);
      const r2 = state.reviewers.find((r) => r.id === reviewer2Id);

      [r1, r2].forEach((rev) => {
        if (!rev) return;
        state.tick++;
        const time = getSimulatedTime(state.tick);
        state.mail.unshift({
          n: ++state.mailNumber,
          day: state.day,
          time,
          to: rev.email,
          subject: `Paper for review: ${p.id}`,
          body: `Please review the attached paper.\nLogin ID: ${rev.email}\nPassword: ${rev.pw}\nYou will see only the paper and the review form.`,
          links: [{ l: 'Log in as reviewer', a: 'login', d: `reviewer|${rev.email}` }],
          kind: 'Email',
        });

        if (state.limits.sms) {
          state.mail.unshift({
            n: ++state.mailNumber,
            day: state.day,
            time,
            to: rev.email,
            subject: 'SMS',
            body: `SRMU Journals: a paper is waiting for your review (${p.id}). Check your email.`,
            links: [],
            kind: 'SMS',
          });
        }
      });

      state.tick++;
      const time = getSimulatedTime(state.tick);
      p.status = 'Sent to Reviewers';
      p.stepStart = state.day;
      p.due = dueDates.due;
      p.dueMax = dueDates.dueMax;
      p.reviewers = [reviewer1Id, reviewer2Id];
      p.round = 1;

      p.trail.push({
        n: ++state.trailNumber,
        day: state.day,
        time,
        actor: editorEmail,
        text: 'Forwarded to two reviewers.',
        vis: 'ed',
      });

      state.toastMessage = 'Sent to reviewers. Reviewer login details logged in Outbox.';
    },
    reviewerSubmitReview: (state, action) => {
      const { paperId, reviewerId, round, scores, recommendation, toAuthor, toEd } = action.payload;
      const p = state.papers.find((x) => x.id === paperId);
      if (!p) return;
      const rev = state.reviewers.find((r) => r.id === reviewerId);
      state.tick++;
      const time = getSimulatedTime(state.tick);
      const editorEmail = state.journals[p.journal]?.editorEmail || 'editor@journal.org';

      p.reviews.push({
        rid: reviewerId,
        round,
        sc: scores,
        toAuthor,
        toEd,
        rec: recommendation,
        day: state.day,
      });

      const allSubmitted = p.reviewers.every((rid) =>
        p.reviews.some((v) => v.rid === rid && v.round === round)
      );

      state.mail.unshift({
        n: ++state.mailNumber,
        day: state.day,
        time,
        to: editorEmail,
        subject: `Review submitted: ${p.id}`,
        body: `${rev ? rev.name : 'Reviewer'} submitted a review for round ${round}.`,
        links: [{ l: 'Open as editor', a: 'login', d: `editor|${p.journal}` }],
        kind: 'Email',
      });

      if (allSubmitted) {
        if (round === 1) {
          p.status = 'Review Received';
          const dueDates = calculateDueDates('Review Received', state.day, state.limits);
          p.due = dueDates.due;
          p.dueMax = dueDates.dueMax;
        } else {
          p.status = 'Reviews Complete';
          const dueDates = calculateDueDates('Reviews Complete', state.day, state.limits);
          p.due = dueDates.due;
          p.dueMax = dueDates.dueMax;
        }
        p.stepStart = state.day;

        state.tick++;
        state.mail.unshift({
          n: ++state.mailNumber,
          day: state.day,
          time: getSimulatedTime(state.tick),
          to: editorEmail,
          subject: `Both reviews in: ${p.id}`,
          body: `Both reviewers have completed their reviews for round ${round}.`,
          links: [{ l: 'Open as editor', a: 'login', d: `editor|${p.journal}` }],
          kind: 'Email',
        });
      }

      p.trail.push({
        n: ++state.trailNumber,
        day: state.day,
        time,
        actor: rev ? rev.name : 'Reviewer',
        text: `Submitted review round ${round} (${recommendation}).`,
        vis: 'ed',
      });

      state.toastMessage = 'Review submitted successfully';
    },
    editorSendComments: (state, action) => {
      const { paperId, selectedComments, note } = action.payload;
      const p = state.papers.find((x) => x.id === paperId);
      if (!p) return;
      state.tick++;
      const time = getSimulatedTime(state.tick);
      const editorEmail = state.journals[p.journal]?.editorEmail || 'editor@journal.org';
      const dueDates = calculateDueDates('Comments Sent', state.day, state.limits);

      p.status = 'Comments Sent';
      p.stepStart = state.day;
      p.due = dueDates.due;
      p.dueMax = dueDates.dueMax;
      p.sent.push({
        round: 1,
        lines: selectedComments,
        note,
      });

      p.trail.push({
        n: ++state.trailNumber,
        day: state.day,
        time,
        actor: editorEmail,
        text: `Sent ${selectedComments.length} reviewer comment(s) to the author.`,
        vis: 'au',
      });

      state.mail.unshift({
        n: ++state.mailNumber,
        day: state.day,
        time,
        to: p.author.email,
        subject: `Reviewer comments: ${p.id}`,
        body: `The reviewers' comments are available. Reply within ${
          state.limits.authorReply
        } days.\n${note ? `\nEditor note: ${note}` : ''}`,
        links: [{ l: 'Log in to reply', a: 'login', d: `author|${p.author.email}` }],
        kind: 'Email',
      });

      state.toastMessage = 'Comments sent to the author';
    },
    authorSubmitReply: (state, action) => {
      const { paperId, replyText, newTitle, fileName } = action.payload;
      const p = state.papers.find((x) => x.id === paperId);
      if (!p) return;
      state.tick++;
      const time = getSimulatedTime(state.tick);
      const editorEmail = state.journals[p.journal]?.editorEmail || 'editor@journal.org';
      const dueDates = calculateDueDates('Revision Received', state.day, state.limits);

      p.title = newTitle || p.title;
      p.status = 'Revision Received';
      p.stepStart = state.day;
      p.due = dueDates.due;
      p.dueMax = dueDates.dueMax;
      p.replies.push({ day: state.day, text: replyText });
      p.files.push({ t: 'Revision', name: fileName || 'revised_manuscript.docx', day: state.day });

      p.trail.push({
        n: ++state.trailNumber,
        day: state.day,
        time,
        actor: p.author.name,
        text: 'Submitted a reply and the revised paper.',
        vis: 'au',
      });

      state.mail.unshift({
        n: ++state.mailNumber,
        day: state.day,
        time,
        to: editorEmail,
        subject: `Author reply: ${p.id}`,
        body: `The author replied to the comments and uploaded a revised paper.\n\n${replyText}`,
        links: [{ l: 'Open as editor', a: 'login', d: `editor|${p.journal}` }],
        kind: 'Email',
      });

      state.toastMessage = 'Reply and revised paper submitted';
    },
    editorForwardRevision: (state, action) => {
      const { paperId } = action.payload;
      const p = state.papers.find((x) => x.id === paperId);
      if (!p) return;
      const editorEmail = state.journals[p.journal]?.editorEmail || 'editor@journal.org';
      const dueDates = calculateDueDates('Re-review', state.day, state.limits);

      p.reviewers.forEach((rid) => {
        const r = state.reviewers.find((x) => x.id === rid);
        if (!r) return;
        state.tick++;
        state.mail.unshift({
          n: ++state.mailNumber,
          day: state.day,
          time: getSimulatedTime(state.tick),
          to: r.email,
          subject: `Re-check: ${p.id}`,
          body: 'The author replied to your comments. Please re-check and give a final recommendation.',
          links: [{ l: 'Log in as reviewer', a: 'login', d: `reviewer|${r.email}` }],
          kind: 'Email',
        });
      });

      state.tick++;
      p.status = 'Re-review';
      p.round = 2;
      p.stepStart = state.day;
      p.due = dueDates.due;
      p.dueMax = dueDates.dueMax;

      p.trail.push({
        n: ++state.trailNumber,
        day: state.day,
        time: getSimulatedTime(state.tick),
        actor: editorEmail,
        text: 'Forwarded the reply to the reviewers.',
        vis: 'ed',
      });

      state.toastMessage = 'Forwarded to reviewers for re-evaluation';
    },
    editorFinalDecision: (state, action) => {
      const { paperId, isAccept, comment } = action.payload;
      const p = state.papers.find((x) => x.id === paperId);
      if (!p) return;
      state.tick++;
      const time = getSimulatedTime(state.tick);
      const editorEmail = state.journals[p.journal]?.editorEmail || 'editor@journal.org';

      if (isAccept) {
        const dueDates = calculateDueDates('Accepted', state.day, state.limits);
        p.status = 'Accepted';
        p.stepStart = state.day;
        p.due = dueDates.due;
        p.dueMax = dueDates.dueMax;

        p.trail.push({
          n: ++state.trailNumber,
          day: state.day,
          time,
          actor: editorEmail,
          text: `Accepted the paper. ${comment || ''}`,
          vis: 'au',
        });

        state.mail.unshift({
          n: ++state.mailNumber,
          day: state.day,
          time,
          to: p.author.email,
          subject: `Accepted: ${p.id}`,
          body: `Your paper is accepted. Please upload the camera-ready paper in Word within ${
            state.limits.camera
          } days.${comment ? `\nEditor comments: ${comment}` : ''}`,
          links: [{ l: 'Upload camera-ready', a: 'login', d: `author|${p.author.email}` }],
          kind: 'Email',
        });
      } else {
        p.status = 'Rejected';
        p.due = null;
        p.dueMax = null;

        p.trail.push({
          n: ++state.trailNumber,
          day: state.day,
          time,
          actor: editorEmail,
          text: `Rejected the paper after review. ${comment || ''}`,
          vis: 'au',
        });

        state.mail.unshift({
          n: ++state.mailNumber,
          day: state.day,
          time,
          to: p.author.email,
          subject: `Decision on ${p.id}`,
          body: `Your paper was not accepted. ${comment || ''}\nYou may resubmit the paper under the same paper ID (${p.id}).`,
          links: [{ l: 'Log in to view / resubmit', a: 'login', d: `author|${p.author.email}` }],
          kind: 'Email',
        });
      }

      state.toastMessage = `Decision recorded: ${isAccept ? 'Accepted' : 'Rejected'}`;
    },
    authorSubmitCameraReady: (state, action) => {
      const { paperId, fileName } = action.payload;
      const p = state.papers.find((x) => x.id === paperId);
      if (!p) return;
      state.tick++;
      const time = getSimulatedTime(state.tick);
      const editorEmail = state.journals[p.journal]?.editorEmail || 'editor@journal.org';
      const dueDates = calculateDueDates('Camera-Ready Received', state.day, state.limits);

      p.status = 'Camera-Ready Received';
      p.stepStart = state.day;
      p.due = dueDates.due;
      p.dueMax = dueDates.dueMax;
      p.files.push({ t: 'Camera-ready', name: fileName || 'camera_ready.docx', day: state.day });

      p.trail.push({
        n: ++state.trailNumber,
        day: state.day,
        time,
        actor: p.author.name,
        text: 'Uploaded the camera-ready paper.',
        vis: 'au',
      });

      state.mail.unshift({
        n: ++state.mailNumber,
        day: state.day,
        time,
        to: editorEmail,
        subject: `Camera-ready received: ${p.id}`,
        body: 'The author uploaded the camera-ready paper.',
        links: [{ l: 'Format paper', a: 'login', d: `editor|${p.journal}` }],
        kind: 'Email',
      });

      state.toastMessage = 'Camera-ready paper uploaded';
    },
    editorUploadFormatted: (state, action) => {
      const { paperId, fileName, pages, overrideAmt, overrideReason } = action.payload;
      const p = state.papers.find((x) => x.id === paperId);
      if (!p) return;
      state.tick++;
      const time = getSimulatedTime(state.tick);
      const editorEmail = state.journals[p.journal]?.editorEmail || 'editor@journal.org';
      const dueDates = calculateDueDates('Proofreading', state.day, state.limits);
      const feeCalc = calculateFeeHelper(state.journals, p.journal, pages);
      const finalAmt = overrideAmt != null ? overrideAmt : feeCalc.total;

      p.status = 'Proofreading';
      p.stepStart = state.day;
      p.due = dueDates.due;
      p.dueMax = dueDates.dueMax;
      p.pages = pages;
      p.calc = feeCalc;
      p.override = overrideAmt != null ? overrideAmt : null;
      p.proof += 1;
      p.files.push({ t: 'Formatted', name: fileName || 'formatted_manuscript.docx', day: state.day });

      p.trail.push({
        n: ++state.trailNumber,
        day: state.day,
        time,
        actor: editorEmail,
        text: `Uploaded the formatted paper (${pages} pages). Amount ${formatINR(finalAmt)}${
          overrideAmt != null
            ? ` (changed by the editor: ${overrideReason})`
            : ' (calculated by the system)'
        }.`,
        vis: 'au',
      });

      state.mail.unshift({
        n: ++state.mailNumber,
        day: state.day,
        time,
        to: p.author.email,
        subject: `Proofreading: ${p.id}`,
        body: `The formatted paper is ready. Invoice preview: ${formatINR(
          finalAmt
        )} for ${pages} pages. Press OK or Changes Needed within ${state.limits.proof} days.`,
        links: [{ l: 'Review proof', a: 'login', d: `author|${p.author.email}` }],
        kind: 'Email',
      });

      state.toastMessage = 'Formatted paper sent to author for proofreading';
    },
    authorApproveProof: (state, action) => {
      const { paperId } = action.payload;
      const p = state.papers.find((x) => x.id === paperId);
      if (!p) return;
      state.tick++;
      const time = getSimulatedTime(state.tick);
      const editorEmail = state.journals[p.journal]?.editorEmail || 'editor@journal.org';
      const dueDates = calculateDueDates('Payment Pending', state.day, state.limits);

      const totalAmt = p.override != null ? p.override : p.calc?.total || 5000;
      const curDate = new Date(BASE_DATE.getTime() + state.day * 864e5);
      const dayInvoiceCount =
        state.papers.filter((q) => q.invoice && q.invoice.day === state.day).length + 1;
      const invNo = `${String(curDate.getFullYear()).slice(2)}${String(
        curDate.getMonth() + 1
      ).padStart(2, '0')}${String(curDate.getDate()).padStart(2, '0')}${String(
        dayInvoiceCount
      ).padStart(2, '0')}`;

      p.status = 'Payment Pending';
      p.stepStart = state.day;
      p.due = dueDates.due;
      p.dueMax = dueDates.dueMax;
      p.invoice = {
        no: invNo,
        pages: p.pages,
        total: totalAmt,
        status: 'Pending',
        day: state.day,
      };

      p.trail.push({
        n: ++state.trailNumber,
        day: state.day,
        time,
        actor: p.author.name,
        text: `Approved the proof (OK). Amount frozen at ${formatINR(
          totalAmt
        )}. Invoice ${invNo} created.`,
        vis: 'au',
      });

      state.mail.unshift({
        n: ++state.mailNumber,
        day: state.day,
        time,
        to: p.author.email,
        subject: `Invoice ${invNo} (${p.id})`,
        body: `Your proof is approved. Publication charge: ${formatINR(totalAmt)} for ${
          p.pages
        } pages. Scan the QR code in the invoice to pay within ${state.limits.pay} days.`,
        links: [{ l: 'Pay APC online', a: 'login', d: `author|${p.author.email}` }],
        kind: 'Email',
      });

      state.tick++;
      state.mail.unshift({
        n: ++state.mailNumber,
        day: state.day,
        time: getSimulatedTime(state.tick),
        to: editorEmail,
        subject: `Author pressed OK: ${p.id}`,
        body: `The invoice was created at once for ${formatINR(totalAmt)}.`,
        links: [{ l: 'Open as editor', a: 'login', d: `editor|${p.journal}` }],
        kind: 'Email',
      });

      state.toastMessage = 'Proof approved. Invoice created.';
    },
    authorRequestChanges: (state, action) => {
      const { paperId, changesText, fileName } = action.payload;
      const p = state.papers.find((x) => x.id === paperId);
      if (!p) return;
      state.tick++;
      const time = getSimulatedTime(state.tick);
      const editorEmail = state.journals[p.journal]?.editorEmail || 'editor@journal.org';
      const dueDates = calculateDueDates('Changes Requested', state.day, state.limits);

      p.status = 'Changes Requested';
      p.stepStart = state.day;
      p.due = dueDates.due;
      p.dueMax = dueDates.dueMax;
      if (fileName) {
        p.files.push({ t: 'Author corrections', name: fileName, day: state.day });
      }

      p.trail.push({
        n: ++state.trailNumber,
        day: state.day,
        time,
        actor: p.author.name,
        text: `Changes needed: ${changesText}`,
        vis: 'au',
      });

      state.mail.unshift({
        n: ++state.mailNumber,
        day: state.day,
        time,
        to: editorEmail,
        subject: `Changes needed: ${p.id}`,
        body: changesText,
        links: [{ l: 'Open as editor', a: 'login', d: `editor|${p.journal}` }],
        kind: 'Email',
      });

      state.toastMessage = 'Changes request sent to editor';
    },
    processPayment: (state, action) => {
      const { paperId, isSuccess } = action.payload;
      const p = state.papers.find((x) => x.id === paperId);
      if (!p || !p.invoice) return;
      state.tick++;
      const time = getSimulatedTime(state.tick);
      const editorEmail = state.journals[p.journal]?.editorEmail || 'editor@journal.org';

      if (!isSuccess) {
        p.trail.push({
          n: ++state.trailNumber,
          day: state.day,
          time,
          actor: 'Gateway',
          text: 'Payment failed. The invoice stays pending and the author can try again.',
          vis: 'au',
        });
        state.toastMessage = 'Payment simulation marked as failed. Invoice remains pending.';
      } else {
        const dueDates = calculateDueDates('Paid', state.day, state.limits);
        p.status = 'Paid';
        p.paidDay = state.day;
        p.stepStart = state.day;
        p.due = dueDates.due;
        p.dueMax = dueDates.dueMax;
        p.invoice.status = 'Paid';

        p.trail.push({
          n: ++state.trailNumber,
          day: state.day,
          time,
          actor: 'System',
          text: `Payment of ${formatINR(p.invoice.total)} verified automatically.`,
          vis: 'au',
        });

        state.mail.unshift({
          n: ++state.mailNumber,
          day: state.day,
          time,
          to: p.author.email,
          subject: `Receipt ${p.invoice.no}`,
          body: `We received ${formatINR(p.invoice.total)}. This is your official receipt for ${
            p.id
          }.`,
          links: [{ l: 'View receipt', a: 'login', d: `author|${p.author.email}` }],
          kind: 'Email',
        });

        state.tick++;
        state.mail.unshift({
          n: ++state.mailNumber,
          day: state.day,
          time: getSimulatedTime(state.tick),
          to: editorEmail,
          subject: `Author paid: ${p.id}`,
          body: `Payment of ${formatINR(
            p.invoice.total
          )} was verified automatically. You can publish the paper.`,
          links: [{ l: 'Publish paper', a: 'login', d: `editor|${p.journal}` }],
          kind: 'Email',
        });

        state.toastMessage = 'Payment verified automatically! Receipt issued.';
      }
    },
    editorPublish: (state, action) => {
      const { paperId, doi } = action.payload;
      const p = state.papers.find((x) => x.id === paperId);
      if (!p) return;
      state.tick++;
      const time = getSimulatedTime(state.tick);
      const editorEmail = state.journals[p.journal]?.editorEmail || 'editor@journal.org';

      p.status = 'Published';
      p.doi = doi || null;
      p.due = null;
      p.dueMax = null;

      p.trail.push({
        n: ++state.trailNumber,
        day: state.day,
        time,
        actor: editorEmail,
        text: `Published the paper online${doi ? ` with DOI ${doi}` : ''}.`,
        vis: 'au',
      });

      state.mail.unshift({
        n: ++state.mailNumber,
        day: state.day,
        time,
        to: p.author.email,
        subject: `Published: ${p.id}`,
        body: `Your paper is now live on the journal website.${doi ? `\nDOI: ${doi}` : ''}`,
        links: [{ l: 'View published paper', a: 'login', d: `public|${p.id}` }],
        kind: 'Email',
      });

      state.toastMessage = 'Paper published online!';
    },
    saveFeeRule: (state, action) => {
      const { journal, feeData } = action.payload;
      if (!state.journals[journal]) return;
      state.journals[journal].editorEmail =
        feeData.editorEmail || state.journals[journal].editorEmail;
      state.journals[journal].fee = {
        base: Number(feeData.base),
        amt: Number(feeData.amt),
        extra: Number(feeData.extra),
        gst: 0,
      };
      state.toastMessage = `Fee rule for ${journal} updated`;
    },
    saveLimits: (state, action) => {
      state.limits = {
        ...state.limits,
        ...action.payload,
      };
      state.toastMessage = 'Time limits updated';
    },
  },
});

export const {
  setSession,
  showToast,
  clearToast,
  openModal,
  closeModal,
  resetDemo,
  advanceDay,
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
} = journalSlice.actions;

export default journalSlice.reducer;
