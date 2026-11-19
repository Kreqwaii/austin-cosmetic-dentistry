(function () {
  'use strict';

  var TREATMENTS = {
    veneers: {
      id: 'veneers',
      title: 'Porcelain Veneers Smile Plan',
      usesSlider: true,
      minPerUnit: 1500,
      maxPerUnit: 2500,
      avgPerUnit: 1800,
      contextTemplate: function (count) {
        return 'Custom handcrafted porcelain across ' + count + ' teeth, completed in 2 to 3 appointments.';
      },
      badgeTemplate: function (count) {
        return count + ' Porcelain Veneers';
      },
      highlights: [
        'Step 1: Free Consult & Digital Smile Design',
        'Step 2: Custom Trial Temporaries to Preview Look',
        'Step 3: Permanent Porcelain Bonding with Warranty'
      ]
    },
    invisalign: {
      id: 'invisalign',
      title: 'Invisalign Clear Aligner Plan',
      usesSlider: false,
      unitHeading: 'Alignment Complexity',
      scopes: [
        { id: 'express', label: 'Refinement (6-9 mos)', min: 3800, max: 4600, avg: 4200 },
        { id: 'comprehensive', label: 'Full Dual Arch (12-18 mos)', min: 4800, max: 6200, avg: 5400 }
      ],
      defaultScope: 1,
      note: 'Includes iTero 3D digital scan, projected smile simulation before starting, and clear custom aligner series.',
      highlights: [
        'iTero 3D Digital Mapping (Zero Putty Impressions)',
        'Virtually Invisible, Removable Daily Trays',
        'Seamless Pairing with Whitening or Edge Contouring'
      ]
    },
    whitening: {
      id: 'whitening',
      title: 'Professional Teeth Whitening',
      usesSlider: false,
      unitHeading: 'Whitening System',
      scopes: [
        { id: 'takehome', label: 'Custom Take-Home Trays', min: 350, max: 480, avg: 420 },
        { id: 'inoffice', label: 'In-Office Brightening + Trays', min: 550, max: 850, avg: 690 }
      ],
      defaultScope: 1,
      note: 'Clinical-strength brightening supervised by Dr. Patel or Dr. Bradford for comfortable, even shade elevation.',
      highlights: [
        'Single In-Office Session in Suite 940',
        'Desensitizing Enamel Conditioning Included',
        'Custom Touch-Up Trays to Maintain Shade'
      ]
    },
    implants: {
      id: 'implants',
      title: 'Dental Implant Restoration',
      usesSlider: false,
      unitHeading: 'Implant Units',
      scopes: [
        { id: 'single', label: '1 Implant + Custom Crown', min: 3500, max: 5200, avg: 4300 },
        { id: 'two', label: '2 Implants + Crowns', min: 6800, max: 9800, avg: 8300 },
        { id: 'bridge', label: '3-Unit Implant Bridge', min: 8900, max: 12800, avg: 10800 }
      ],
      defaultScope: 0,
      note: 'Titanium post placement with custom ceramic crown matched to surrounding teeth for natural root-to-crown stability.',
      highlights: [
        'Preserves Natural Jawbone & Facial Structure',
        'Aesthetic Crown Custom-Shaded to Adjacent Teeth',
        'Digital X-Ray & 3D Surgical Planning'
      ]
    },
    consult: {
      id: 'consult',
      title: 'Smile Makeover Consultation',
      usesSlider: false,
      unitHeading: 'Consultation Format',
      scopes: [
        { id: 'office', label: 'In-Office Suite 940 Exam', min: 0, max: 0, avg: 0 },
        { id: 'virtual', label: 'Virtual Smile Evaluation', min: 0, max: 0, avg: 0 }
      ],
      defaultScope: 0,
      note: 'Meet directly with Dr. Tejas Patel or Dr. Bradford Picot in downtown Austin or virtually to review goals, timelines, and exact pricing.',
      highlights: [
        'Complimentary Cosmetic Consultation ($0)',
        'iTero Digital Scan & Smile Goal Review',
        'Personalized Written Treatment & Payment Roadmap'
      ]
    }
  };

  var state = {
    treatment: 'veneers',
    veneerCount: 8,
    scopeIndex: 1,
    paymentPlan: '12m'
  };

  var elements = {
    treatmentBtns: document.querySelectorAll('.treatment-option'),
    veneerControls: document.getElementById('veneerControls'),
    unitControls: document.getElementById('unitControls'),
    veneerSlider: document.getElementById('veneerSlider'),
    veneerCountReadout: document.getElementById('veneerCountReadout'),
    presetPills: document.querySelectorAll('.preset-pill'),
    unitHeading: document.getElementById('unitHeading'),
    unitReadout: document.getElementById('unitReadout'),
    scopePills: document.getElementById('scopePills'),
    scopeNote: document.getElementById('scopeNote'),
    paymentStepNum: document.getElementById('paymentStepNum'),
    paymentBtns: document.querySelectorAll('.payment-btn'),
    summaryBadge: document.getElementById('summaryBadge'),
    summaryTitle: document.getElementById('summaryTitle'),
    summaryContext: document.getElementById('summaryContext'),
    primaryMetricLabel: document.getElementById('primaryMetricLabel'),
    monthlyRange: document.getElementById('monthlyRange'),
    totalRange: document.getElementById('totalRange'),
    avgBenchmark: document.getElementById('avgBenchmark'),
    summaryHighlights: document.getElementById('summaryHighlights'),
    consultForm: document.getElementById('consultForm'),
    patientName: document.getElementById('patientName'),
    patientContact: document.getElementById('patientContact'),
    formFeedback: document.getElementById('formFeedback'),
    mailtoShortcut: document.getElementById('mailtoShortcut'),
    jumpBtns: document.querySelectorAll('[data-jump-treatment]'),
    navToggle: document.getElementById('navToggle'),
    mobileMenu: document.getElementById('mobileMenu'),
    mobileLinks: document.querySelectorAll('.mobile-link')
  };

  function formatUSD(amount) {
    return '$' + Math.round(amount).toLocaleString('en-US');
  }

  function formatRange(min, max, suffix) {
    var tail = suffix ? ' ' + suffix : '';
    if (min === 0 && max === 0) {
      return '$0' + tail;
    }
    if (min === max) {
      return formatUSD(min) + tail;
    }
    return formatUSD(min) + ' - ' + formatUSD(max) + tail;
  }

  function calcMonthly24(principal) {
    // Representative 9.9% APR fixed 24-month calculation for planning illustration
    var r = 0.099 / 12;
    var n = 24;
    return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  function renderScopeControls(cfg) {
    elements.unitHeading.textContent = cfg.unitHeading;
    elements.scopeNote.textContent = cfg.note;
    elements.scopePills.innerHTML = '';

    cfg.scopes.forEach(function (scope, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'scope-pill' + (idx === state.scopeIndex ? ' is-active' : '');
      btn.textContent = scope.label;
      btn.addEventListener('click', function () {
        state.scopeIndex = idx;
        renderEstimator();
      });
      elements.scopePills.appendChild(btn);
    });

    var activeScope = cfg.scopes[state.scopeIndex] || cfg.scopes[0];
    elements.unitReadout.textContent = activeScope.label;
  }

  function renderEstimator() {
    var cfg = TREATMENTS[state.treatment];

    elements.treatmentBtns.forEach(function (btn) {
      var active = btn.getAttribute('data-treatment') === state.treatment;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });

    if (cfg.usesSlider) {
      elements.veneerControls.hidden = false;
      elements.unitControls.hidden = true;
      elements.veneerSlider.value = String(state.veneerCount);
      elements.veneerCountReadout.textContent = state.veneerCount + ' Veneers';

      elements.presetPills.forEach(function (pill) {
        var val = Number(pill.getAttribute('data-veneers'));
        pill.classList.toggle('is-active', val === state.veneerCount);
      });
    } else {
      elements.veneerControls.hidden = true;
      elements.unitControls.hidden = false;
      if (state.scopeIndex >= cfg.scopes.length) {
        state.scopeIndex = cfg.defaultScope || 0;
      }
      renderScopeControls(cfg);
    }

    elements.paymentBtns.forEach(function (btn) {
      var active = btn.getAttribute('data-plan') === state.paymentPlan;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });

    var minTotal = 0;
    var maxTotal = 0;
    var avgTotal = 0;
    var badgeText = '';
    var contextText = '';

    if (cfg.id === 'veneers') {
      minTotal = cfg.minPerUnit * state.veneerCount;
      maxTotal = cfg.maxPerUnit * state.veneerCount;
      avgTotal = cfg.avgPerUnit * state.veneerCount;
      badgeText = cfg.badgeTemplate(state.veneerCount);
      contextText = cfg.contextTemplate(state.veneerCount);
    } else {
      var scope = cfg.scopes[state.scopeIndex] || cfg.scopes[0];
      minTotal = scope.min;
      maxTotal = scope.max;
      avgTotal = scope.avg;
      badgeText = scope.label;
      contextText = cfg.note;
    }

    elements.summaryBadge.textContent = badgeText;
    elements.summaryTitle.textContent = cfg.title;
    elements.summaryContext.textContent = contextText;

    if (minTotal === 0 && maxTotal === 0) {
      elements.primaryMetricLabel.textContent = 'Consultation Fee';
      elements.monthlyRange.textContent = 'Complimentary ($0)';
      elements.totalRange.textContent = '$0 Initial Consult';
      elements.avgBenchmark.textContent = '15-30 min review';
    } else if (state.paymentPlan === 'full') {
      elements.primaryMetricLabel.textContent = 'Pay in Full Estimated Investment';
      elements.monthlyRange.textContent = formatRange(minTotal, maxTotal, '');
      elements.totalRange.textContent = formatRange(minTotal, maxTotal, '');
      elements.avgBenchmark.textContent = formatUSD(avgTotal) + ' avg';
    } else if (state.paymentPlan === '12m') {
      elements.primaryMetricLabel.textContent = 'Estimated Monthly Payment (12 Months, 0% APR)';
      elements.monthlyRange.textContent = formatRange(minTotal / 12, maxTotal / 12, '/ mo');
      elements.totalRange.textContent = formatRange(minTotal, maxTotal, '');
      elements.avgBenchmark.textContent = formatUSD(avgTotal) + ' avg';
    } else {
      elements.primaryMetricLabel.textContent = 'Estimated Monthly Payment (24-Month Extended Plan)';
      elements.monthlyRange.textContent = formatRange(calcMonthly24(minTotal), calcMonthly24(maxTotal), '/ mo');
      elements.totalRange.textContent = formatRange(minTotal, maxTotal, '');
      elements.avgBenchmark.textContent = formatUSD(avgTotal) + ' avg';
    }

    elements.summaryHighlights.innerHTML = '';
    cfg.highlights.forEach(function (item) {
      var li = document.createElement('li');
      li.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg><span></span>';
      li.querySelector('span').textContent = item;
      elements.summaryHighlights.appendChild(li);
    });

    updateMailtoShortcut(badgeText, elements.monthlyRange.textContent);
  }

  function updateMailtoShortcut(scopeLabel, monthlyText) {
    var subject = encodeURIComponent('Smile Consultation Request: ' + scopeLabel);
    var body = encodeURIComponent(
      'Hello Austin Cosmetic Dentistry team,\n\n' +
      'I would like to schedule a consultation based on my online estimate:\n' +
      '- Selected Plan: ' + scopeLabel + '\n' +
      '- Payment Preference: ' + state.paymentPlan.toUpperCase() + ' (' + monthlyText + ')\n\n' +
      'Please let me know your next available appointment times.'
    );
    elements.mailtoShortcut.href = 'mailto:downtown@austincosmetic.com?subject=' + subject + '&body=' + body;
  }

  // Event Listeners
  elements.treatmentBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var nextId = btn.getAttribute('data-treatment');
      if (TREATMENTS[nextId]) {
        state.treatment = nextId;
        state.scopeIndex = TREATMENTS[nextId].defaultScope || 0;
        renderEstimator();
      }
    });
  });

  elements.veneerSlider.addEventListener('input', function (e) {
    state.veneerCount = Number(e.target.value);
    renderEstimator();
  });

  elements.presetPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      state.veneerCount = Number(pill.getAttribute('data-veneers'));
      renderEstimator();
    });
  });

  elements.paymentBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.paymentPlan = btn.getAttribute('data-plan');
      renderEstimator();
    });
  });

  elements.jumpBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-jump-treatment');
      if (TREATMENTS[target]) {
        state.treatment = target;
        state.scopeIndex = TREATMENTS[target].defaultScope || 0;
        renderEstimator();
        document.getElementById('estimator').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  elements.consultForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = elements.patientName.value.trim();
    var contact = elements.patientContact.value.trim();
    var visitTypeEl = elements.consultForm.querySelector('input[name="visitType"]:checked');
    var visitType = visitTypeEl ? visitTypeEl.value : 'In-Office (Suite 940)';

    elements.formFeedback.hidden = false;

    if (!name || !contact) {
      elements.formFeedback.className = 'form-feedback is-error';
      elements.formFeedback.textContent = 'Please enter your name and an email address or phone number so our downtown team can follow up.';
      return;
    }

    var summaryName = elements.summaryBadge.textContent;
    var monthlyText = elements.monthlyRange.textContent;
    var refId = 'ACD-' + String(Math.floor(1000 + Math.random() * 9000));

    elements.formFeedback.className = 'form-feedback';
    elements.formFeedback.innerHTML =
      '<strong>Request Prepared (' + refId + ')</strong><br>' +
      'Thank you, ' + escapeHtml(name) + '. Your <strong>' + escapeHtml(visitType) + '</strong> inquiry for <strong>' +
      escapeHtml(summaryName) + '</strong> (' + escapeHtml(monthlyText) + ') is ready for our desk at ' +
      '<a href="mailto:downtown@austincosmetic.com">downtown@austincosmetic.com</a>. ' +
      'For immediate scheduling, call <a href="tel:+15124762336">(512) 476-2336</a>.';

    elements.consultForm.reset();
  });

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  if (elements.navToggle && elements.mobileMenu) {
    elements.navToggle.addEventListener('click', function () {
      var isHidden = elements.mobileMenu.hidden;
      elements.mobileMenu.hidden = !isHidden;
      elements.navToggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });

    elements.mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        elements.mobileMenu.hidden = true;
        elements.navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  renderEstimator();
})();
