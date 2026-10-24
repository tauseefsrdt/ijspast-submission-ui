export const BASE_DATE = new Date(2026, 9, 13); // 13 Oct 2026

export const DOMAINS = [
  'Political Science and International Relations (Social Sciences)',
  'Computer Science and Engineering',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Management and Commerce',
  'Economics',
  'Education',
  'Law',
  'Life Sciences',
];

export const JOURNAL_INFO = {
  IJMAR: {
    name: 'IJMAR',
    full: 'International Journal of Multidisciplinary Advanced Research',
    site: '(journal website address to be confirmed)',
    sign: 'Editor-in-Chief and Deputy Editors (names to be confirmed)',
    editorEmail: 'editorial.office@ijmar.org',
    fee: { base: 10, amt: 5000, extra: 500, gst: 0 },
  },
  IJSPAST: {
    name: 'IJSPAST',
    full: 'International Journal of Scientific Progress in Applied Science and Engineering',
    site: 'srmu-ijspast.com',
    sign: 'Prof. Vijay Tiwari (Editor-in-Chief), Prof. Nabeel Ahmad (Deputy Editor-in-Chief), Prof. Alkesh Agrawal (Deputy Editor-in-Chief)',
    editorEmail: 'editor@ijspast.com',
    fee: { base: 10, amt: 5000, extra: 500, gst: 0 },
  },
};

export const CRITERIA = [
  'Relevance and significance of the topic',
  'Originality of the paper',
  'Clarity of research objectives',
  'Clarity and quality of literature review',
  'Suitability and rigor of methodology',
  'Appropriateness of analysis and interpretation',
  'Support for conclusion by results',
  'Organization and clarity of writing',
  'Quality and relevance of references',
  'Quality of tables, and figures',
  'Ethical and reporting standards',
];

export const RECOMMENDATIONS = [
  'Accept',
  'Accept with minor revisions',
  'Revise and resubmit / major revisions',
  'Reject',
];

export const STATUS_COLORS = {
  'Under Screening': 'info',
  'Pushed Back': 'warn',
  'Rejected': 'bad',
  'Sent to Reviewers': 'info',
  'Review Received': 'info',
  'Comments Sent': 'warn',
  'Revision Received': 'info',
  'Re-review': 'info',
  'Reviews Complete': 'info',
  'Accepted': 'ok',
  'Camera-Ready Received': 'info',
  'Proofreading': 'warn',
  'Changes Requested': 'warn',
  'Payment Pending': 'warn',
  'Paid': 'ok',
  'Published': 'ok',
};

export const STATUS_OWNERS = {
  'Under Screening': 'Editor',
  'Pushed Back': 'Author',
  'Sent to Reviewers': 'Reviewer',
  'Review Received': 'Editor',
  'Comments Sent': 'Author',
  'Revision Received': 'Editor',
  'Re-review': 'Reviewer',
  'Reviews Complete': 'Editor',
  'Accepted': 'Author',
  'Camera-Ready Received': 'Editor',
  'Changes Requested': 'Editor',
  'Proofreading': 'Author',
  'Payment Pending': 'Author',
  'Paid': 'Editor',
  'Published': null,
  'Rejected': null,
};

export const DEFAULT_LIMITS = {
  screen: 7,
  rev1: 7,
  rev1max: 14,
  sendComments: 2,
  authorReply: 7,
  forward: 2,
  rev2: 2,
  rev2max: 4,
  decision: 2,
  camera: 7,
  format: 7,
  proof: 2,
  pay: 2,
  maxPushback: 2,
  maxProof: 5,
  sms: true,
};

// ORCID Checksum and Formatter functions
export function ocheck(b) {
  let t = 0;
  for (const c of b) t = (t + +c) * 2;
  const r = (12 - (t % 11)) % 11;
  return r === 10 ? 'X' : String(r);
}

export function ofmt(b) {
  return (b + ocheck(b)).match(/.{4}/g).join('-');
}

export function ovalid(id) {
  if (!id) return false;
  const d = id.replace(/-/g, '').toUpperCase();
  return /^\d{15}[\dX]$/.test(d) && ocheck(d.slice(0, 15)) === d[15];
}

export const ORCID_REGISTRY = {
  [ofmt('000000021825009')]: 'Josiah Carberry',
  [ofmt('000000031234567')]: 'Rajesh Kumar',
  [ofmt('000000029876543')]: 'Anita Sharma',
  [ofmt('000000034455667')]: 'Vikram Singh',
  [ofmt('000000015109370')]: 'Laurel Haak',
};

const TITLE_REGEX = /^(dr|prof|mr|mrs|ms|shri|smt)$/i;
export function nameTokens(n) {
  if (!n) return [];
  return n
    .toLowerCase()
    .replace(/[.,]/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !TITLE_REGEX.test(t));
}

export function isNameMatch(a, b) {
  const A = nameTokens(a);
  const B = nameTokens(b);
  return (
    A.length > 0 &&
    B.length > 0 &&
    A[A.length - 1] === B[B.length - 1] &&
    A[0][0] === B[0][0]
  );
}

export function formatINR(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

export function getDateString(baseDate, offsetDays) {
  const d = new Date(baseDate.getTime() + offsetDays * 864e5);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getDdmmyy(baseDate, offsetDays) {
  const x = new Date(baseDate.getTime() + offsetDays * 864e5);
  return (
    String(x.getDate()).padStart(2, '0') +
    String(x.getMonth() + 1).padStart(2, '0') +
    String(x.getFullYear()).slice(2)
  );
}

export function countWords(text) {
  if (!text) return 0;
  return (text.trim().match(/\S+/g) || []).length;
}

export function getInitialSeedData() {
  const demoUsers = {
    'rajesh.kumar@univ.example': { name: 'Dr. Rajesh Kumar', pw: 'demo' },
    'anita.sharma@univ.example': { name: 'Dr. Anita Sharma', pw: 'demo' },
    'vikram.singh@univ.example': { name: 'Prof. Vikram Singh', pw: 'demo' },
  };

  const demoReviewers = [
    {
      id: 'R1',
      name: 'Dr. Meera Iyer',
      email: 'meera.iyer@review.example',
      phone: '+91 98100 11111',
      domain: 'Physics',
      pw: 'Rv@4821',
    },
    {
      id: 'R2',
      name: 'Prof. Sanjay Gupta',
      email: 'sanjay.gupta@review.example',
      phone: '+91 98100 22222',
      domain: 'Computer Science and Engineering',
      pw: 'Rv@7310',
    },
    {
      id: 'R3',
      name: 'Dr. Farhan Ali',
      email: 'farhan.ali@review.example',
      phone: '+91 98100 33333',
      domain: 'Economics',
      pw: 'Rv@2294',
    },
    {
      id: 'R4',
      name: 'Dr. Neha Kapoor',
      email: 'neha.kapoor@review.example',
      phone: '+91 98100 44444',
      domain: 'Management and Commerce',
      pw: 'Rv@6603',
    },
  ];

  const authors = {
    a1: {
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@univ.example',
      inst: 'Shri Ramswaroop Memorial University',
      dept: 'Dept. of Computer Science and Engineering',
      city: 'Lucknow, India',
      orcid: ofmt('000000031234567'),
    },
    a2: {
      name: 'Dr. Anita Sharma',
      email: 'anita.sharma@univ.example',
      inst: 'Banaras Hindu University',
      dept: 'Dept. of Economics',
      city: 'Varanasi, India',
      orcid: ofmt('000000029876543'),
    },
    a3: {
      name: 'Prof. Vikram Singh',
      email: 'vikram.singh@univ.example',
      inst: 'University of Lucknow',
      dept: 'Dept. of Political Science',
      city: 'Lucknow, India',
      orcid: ofmt('000000034455667'),
    },
  };

  const sampleAbstract =
    'This study examines the topic using a mixed-method design and a sample drawn from public institutions. It states the research objective, describes the data and the method, and reports the main findings with their significance for practice. The analysis shows a clear and consistent pattern across the cases studied, and the authors discuss limitations and directions for further research. The results are relevant for administrators, researchers and policy makers who work in the same area and need evidence that can be applied in a real setting without extra cost.';

  const calculateFee = (journal, pages) => {
    const f = JOURNAL_INFO[journal].fee;
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

  const createPaper = (id, j, title, dom, auKey, st, day0, extra = {}) => {
    const au = authors[auKey];
    return {
      id,
      journal: j,
      title,
      domain: dom,
      abstract: sampleAbstract,
      keywords: 'workflow, higher education, analysis, evidence, policy',
      author: au,
      orc: { status: 'Verified', name: au.name },
      status: st,
      day0,
      stepStart: day0,
      due: null,
      dueMax: null,
      pushbacks: 0,
      reviewers: [],
      round: 0,
      reviews: [],
      sent: [],
      replies: [],
      files: [{ t: 'Submission', name: `manuscript_${id.replace('/', '_')}.pdf`, day: day0 }],
      proof: 0,
      pages: null,
      calc: null,
      override: null,
      invoice: null,
      paidDay: null,
      trail: [
        {
          n: 1,
          day: day0,
          time: '09:00',
          actor: au.name,
          text: `Submitted the manuscript. Paper ID ${id} created.`,
          vis: 'au',
        },
        {
          n: 2,
          day: day0,
          time: '09:05',
          actor: 'System',
          text: `ORCID Verified (${au.orcid}).`,
          vis: 'ed',
        },
      ],
      ...extra,
    };
  };

  // Seed papers p1 to p7 matching the HTML prototype
  const p1 = createPaper(
    'IJMAR01-131026',
    'IJMAR',
    'Digital Workflow Adoption in State Universities',
    'Management and Commerce',
    'a1',
    'Under Screening',
    0,
    { stepStart: 0, due: 7 }
  );

  const p2 = createPaper(
    'IJSPAST01-081026',
    'IJSPAST',
    'Sensor Data Calibration for Low-Cost Air Monitors',
    'Physics',
    'a2',
    'Sent to Reviewers',
    -5,
    {
      reviewers: ['R2', 'R1'],
      round: 1,
      stepStart: -3,
      due: 4,
      dueMax: 11,
      trail: [
        { n: 1, day: -5, time: '09:00', actor: authors.a2.name, text: 'Submitted the manuscript. Paper ID IJSPAST01-081026 created.', vis: 'au' },
        { n: 2, day: -5, time: '09:05', actor: 'System', text: `ORCID Verified (${authors.a2.orcid}).`, vis: 'ed' },
        { n: 3, day: -3, time: '11:00', actor: JOURNAL_INFO.IJSPAST.editorEmail, text: 'Forwarded to two reviewers.', vis: 'ed' },
      ],
    }
  );

  const p3 = createPaper(
    'IJMAR01-091026',
    'IJMAR',
    'Fiscal Transfers and Student Outcomes in Uttar Pradesh',
    'Economics',
    'a3',
    'Comments Sent',
    -4,
    {
      reviewers: ['R3', 'R4'],
      round: 1,
      stepStart: -1,
      due: 6,
      reviews: [
        {
          rid: 'R3',
          round: 1,
          sc: [4, 3, 4, 4, 3, 4, 4, 5, 4, 3, 5],
          toAuthor: 'Add the data source for Table 2.\nExplain why the sample ends in 2022.\nThe conclusion should state the limits.',
          toEd: 'Suitable for publication after the changes.',
          rec: 'Accept with minor revisions',
          day: -2,
        },
        {
          rid: 'R4',
          round: 1,
          sc: [3, 4, 3, 3, 4, 3, 4, 4, 3, 4, 4],
          toAuthor: 'Clarify the research question in the introduction.\nThe literature review misses recent work.',
          toEd: 'Needs revision before acceptance.',
          rec: 'Revise and resubmit / major revisions',
          day: -2,
        },
      ],
      sent: [
        {
          round: 1,
          lines: [
            { f: 'Reviewer 1', t: 'Add the data source for Table 2.' },
            { f: 'Reviewer 1', t: 'Explain why the sample ends in 2022.' },
            { f: 'Reviewer 2', t: 'Clarify the research question in the introduction.' },
          ],
          note: 'Please reply within 7 days with the revised paper.',
        },
      ],
      trail: [
        { n: 1, day: -4, time: '09:00', actor: authors.a3.name, text: 'Submitted the manuscript. Paper ID IJMAR01-091026 created.', vis: 'au' },
        { n: 2, day: -4, time: '09:05', actor: 'System', text: `ORCID Verified (${authors.a3.orcid}).`, vis: 'ed' },
        { n: 3, day: -2, time: '14:20', actor: 'Editor', text: 'Both reviews received.', vis: 'ed' },
        { n: 4, day: -1, time: '10:15', actor: 'Editor', text: 'Comments from the reviewers sent to the author.', vis: 'au' },
      ],
    }
  );

  const p4 = createPaper(
    'IJMAR02-071026',
    'IJMAR',
    'Teacher Training and Classroom Practice',
    'Education',
    'a1',
    'Camera-Ready Received',
    -8,
    {
      reviewers: ['R1', 'R4'],
      round: 2,
      stepStart: -1,
      due: 6,
      reviews: [
        { rid: 'R1', round: 1, sc: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4], toAuthor: 'Tighten the abstract.', toEd: 'Good paper.', rec: 'Accept with minor revisions', day: -6 },
        { rid: 'R4', round: 1, sc: [4, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4], toAuthor: 'Add two references.', toEd: 'Good paper.', rec: 'Accept with minor revisions', day: -6 },
        { rid: 'R1', round: 2, sc: [5, 4, 5, 4, 5, 5, 4, 5, 4, 4, 5], toAuthor: 'Changes are satisfactory.', toEd: 'Ready.', rec: 'Accept', day: -3 },
        { rid: 'R4', round: 2, sc: [5, 4, 4, 5, 4, 4, 5, 4, 5, 4, 5], toAuthor: 'Accepted as revised.', toEd: 'Approved.', rec: 'Accept', day: -3 },
      ],
      files: [
        { t: 'Submission', name: 'manuscript_IJMAR02_071026.pdf', day: -8 },
        { t: 'Revision', name: 'revised_IJMAR02_071026.docx', day: -4 },
        { t: 'Camera-ready', name: 'camera_ready_IJMAR02.docx', day: -1 },
      ],
      trail: [
        { n: 1, day: -8, time: '09:00', actor: authors.a1.name, text: 'Submitted the manuscript. Paper ID IJMAR02-071026 created.', vis: 'au' },
        { n: 2, day: -2, time: '10:24', actor: 'Editor', text: 'Accepted. Camera-ready paper requested.', vis: 'au' },
        { n: 3, day: -1, time: '10:31', actor: authors.a1.name, text: 'Uploaded the camera-ready paper.', vis: 'au' },
      ],
    }
  );

  const p5 = createPaper(
    'IJSPAST02-061026',
    'IJSPAST',
    'Edge Computing for Rural Sensor Networks',
    'Computer Science and Engineering',
    'a2',
    'Proofreading',
    -10,
    {
      reviewers: ['R2', 'R1'],
      round: 2,
      pages: 12,
      proof: 1,
      calc: calculateFee('IJSPAST', 12),
      files: [
        { t: 'Submission', name: 'manuscript_IJSPAST02_061026.pdf', day: -10 },
        { t: 'Camera-ready', name: 'camera_ready_IJSPAST02.docx', day: -3 },
        { t: 'Formatted', name: 'formatted_IJSPAST02_061026.docx', day: 0 },
      ],
      trail: [
        { n: 1, day: -10, time: '09:00', actor: authors.a2.name, text: 'Submitted the manuscript. Paper ID IJSPAST02-061026 created.', vis: 'au' },
        { n: 2, day: 0, time: '11:00', actor: 'Editor', text: 'Formatted paper uploaded for proofreading (12 pages).', vis: 'au' },
      ],
    }
  );

  const p6Calc = calculateFee('IJMAR', 9);
  const p6 = createPaper(
    'IJMAR01-021026',
    'IJMAR',
    'Governance Reform in Public Universities',
    'Political Science and International Relations (Social Sciences)',
    'a3',
    'Published',
    -11,
    {
      reviewers: ['R3', 'R4'],
      round: 2,
      pages: 9,
      paidDay: -3,
      calc: p6Calc,
      invoice: {
        no: '26100201',
        pages: 9,
        total: p6Calc.total,
        status: 'Paid',
        day: -4,
      },
      files: [
        { t: 'Submission', name: 'manuscript_IJMAR01_021026.pdf', day: -11 },
        { t: 'Formatted', name: 'formatted_IJMAR01_021026.docx', day: -5 },
      ],
      doi: '10.0000/ijmar.sample.2026.002',
      trail: [
        { n: 1, day: -11, time: '09:00', actor: authors.a3.name, text: 'Submitted the manuscript. Paper ID IJMAR01-021026 created.', vis: 'au' },
        { n: 2, day: -4, time: '14:00', actor: 'System', text: 'Payment of ₹5,000 verified automatically.', vis: 'au' },
        { n: 3, day: -2, time: '16:00', actor: 'Editor', text: 'Published online with DOI 10.0000/ijmar.sample.2026.002.', vis: 'au' },
      ],
    }
  );

  const p7 = createPaper(
    'IJSPAST02-051026',
    'IJSPAST',
    'Untitled Draft on Smart Grids',
    'Physics',
    'a1',
    'Rejected',
    -8,
    {
      orc: { status: 'Not verified', name: 'R. Kumar' },
      trail: [
        { n: 1, day: -8, time: '09:00', actor: authors.a1.name, text: 'Submitted the manuscript. Paper ID IJSPAST02-051026 created.', vis: 'au' },
        { n: 2, day: -7, time: '15:10', actor: JOURNAL_INFO.IJSPAST.editorEmail, text: 'Rejected at screening: the paper is outside the journal scope.', vis: 'au' },
      ],
    }
  );

  // Initial outbox email
  const initialMail = [
    {
      n: 1,
      day: 0,
      time: '09:00',
      to: 'rajesh.kumar@univ.example',
      subject: 'IJMAR Journal: Paper Receipt Acknowledgement IJMAR01-131026',
      body: `Dear Corresponding Author,\nThis is to inform you that we have properly received the submission of the paper:\nTitle: Digital Workflow Adoption in State Universities\n\nby Dr. Rajesh Kumar\n\nThe paper id assigned to your paper is: IJMAR01-131026\n\nPlease refer to this id in all correspondence referred to the above paper.\nYou can check the status of your manuscript at the author center:\nlog in Journal website: (journal website address to be confirmed)\n\nWe will let you know about the decision from our Editorial Board as soon as possible.\nThank you for the submission of your paper to our journal.\nYours' sincerely\n\nEditor-in-Chief and Deputy Editors (names to be confirmed)\n\nOn behalf of\nIJMAR Editorial and Production Office\neditorial.office@ijmar.org`,
      links: [{ l: 'Log in', a: 'login', d: 'author|rajesh.kumar@univ.example' }],
      kind: 'Email',
    },
    {
      n: 2,
      day: 0,
      time: '09:01',
      to: 'editorial.office@ijmar.org',
      subject: 'IJMAR Journal: Paper Receipt Acknowledgement IJMAR01-131026 (copy to the journal email)',
      body: `Dear Corresponding Author,\nThis is to inform you that we have properly received the submission of the paper:\nTitle: Digital Workflow Adoption in State Universities\n\nby Dr. Rajesh Kumar\n\nThe paper id assigned to your paper is: IJMAR01-131026\n\n[Editor note] ORCID: Verified`,
      links: [{ l: 'Open as editor', a: 'login', d: 'editor|IJMAR' }],
      kind: 'Email',
    },
  ];

  return {
    version: 4,
    day: 0,
    tick: 2,
    mailNumber: 2,
    trailNumber: 15,
    mail: initialMail,
    session: { role: 'login', who: null, pid: null, tab: null },
    journals: JSON.parse(JSON.stringify(JOURNAL_INFO)),
    limits: { ...DEFAULT_LIMITS },
    users: demoUsers,
    reviewers: demoReviewers,
    papers: [p1, p2, p3, p4, p5, p6, p7],
  };
}
