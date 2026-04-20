// Cache to store processed Post identifiers to prevent duplicate API calls
const processedPosts = new Map();

// CSS Selectors for Instagram (Updated dynamically based on general structure)
const POST_SELECTOR = 'article';
const CAPTION_SELECTOR = 'h1'; // Instagram generally wraps the main caption in an h1

/**
 * IntersectionObserver ensures we only process posts the user is actually looking at.
 */
const viewportObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      processPost(entry.target);
    }
  });
}, { threshold: 0.6 }); // Post must be 60% visible to trigger analysis

/**
 * MutationObserver to detect new posts loaded via infinite scroll.
 */
const domObserver = new MutationObserver(debounce(() => {
  const posts = document.querySelectorAll(POST_SELECTOR);
  posts.forEach(post => {
    if (!processedPosts.has(post)) {
      processedPosts.set(post, 'queued');
      viewportObserver.observe(post);
    }
  });
}, 500));

// Start observing the document
domObserver.observe(document.body, { childList: true, subtree: true });

/**
 * Extracts text and triggers the analysis pipeline.
 */
function processPost(postElement) {
  if (processedPosts.get(postElement) === 'processed') return;
  
  const captionNode = postElement.querySelector(CAPTION_SELECTOR);
  if (!captionNode) return;

  const text = captionNode.innerText.trim();
  if (text.length < 15) return; // Ignore very short, likely harmless text

  processedPosts.set(postElement, 'processing');

  // Send to background script for hybrid detection
  chrome.runtime.sendMessage({ type: 'ANALYZE_TEXT', payload: text }, (response) => {
    processedPosts.set(postElement, 'processed');
    
    if (chrome.runtime.lastError) {
      console.error("ClaimGuard Error:", chrome.runtime.lastError.message);
      return;
    }

    if (response && response.is_suspicious) {
      injectBadge(postElement, response);
    }
  });
}

/**
 * Injects the warning badge into the Instagram UI.
 */
function injectBadge(postElement, data) {
  if (postElement.querySelector('.cg-badge')) return;

  const header = postElement.querySelector('header') || postElement.firstChild;
  if (!header) return;
  
  header.style.position = 'relative';

  const badge = document.createElement('div');
  const confidencePercent = Math.round(data.confidence * 100);
  const riskClass = data.confidence > 0.7 ? 'cg-risk-high' : 'cg-risk-med';
  
  badge.className = `cg-badge ${riskClass}`;
  badge.innerHTML = `⚠️ Suspicious [${confidencePercent}%]`;
  
  badge.addEventListener('click', (e) => {
    e.stopPropagation();
    showVerificationModal(data);
  });

  header.appendChild(badge);
}

/**
 * Displays the detailed explanation modal.
 */
function showVerificationModal(data) {
  const existingModal = document.querySelector('.cg-modal-overlay');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.className = 'cg-modal-overlay';
  
  const headerColor = data.confidence > 0.7 ? '#ed4956' : '#fbad50';

  modal.innerHTML = `
    <div class="cg-modal-card">
      <h2 style="color: ${headerColor}; margin-top: 0;">Claim Verification Report</h2>
      <div class="cg-modal-body">
        <p><strong>Flagged Category:</strong> ${data.category}</p>
        <p><strong>Identified Phrase:</strong> <mark>"${data.flagged_phrase}"</mark></p>
        <div class="cg-reasoning-box">
          <strong>AI Analysis:</strong><br/>
          ${data.reasoning}
        </div>
      </div>
      <div class="cg-modal-footer">
        <a href="https://www.google.com/search?q=${encodeURIComponent('fact check ' + data.flagged_phrase)}" target="_blank" class="cg-btn-link">Search Fact Checks</a>
        <button id="cg-close-btn" class="cg-btn-primary">Acknowledge</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  
  document.getElementById('cg-close-btn').onclick = () => modal.remove();
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

/**
 * Utility: Debounce function for performance
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => { clearTimeout(timeout); func(...args); };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}