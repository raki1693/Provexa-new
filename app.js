document.addEventListener('DOMContentLoaded', () => {
  // Navbar scroll
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  // Mobile Menu
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if(hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Intersection Observer for animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-up').forEach(el => observer.observe(el));

  // Tabs logic
  const tabHeaders = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  tabHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const target = header.getAttribute('data-target');
      
      tabHeaders.forEach(h => h.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      header.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });

  // Verify Page Logic
  const verifyBtn = document.getElementById('verifyBtn');
  const veridocInput = document.getElementById('veridocInput');
  const resultArea = document.getElementById('resultArea');

  if(verifyBtn && veridocInput && resultArea) {
    verifyBtn.addEventListener('click', () => {
      const val = veridocInput.value.trim();
      resultArea.innerHTML = '<div style="text-align:center"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p>Verifying Blockchain Anchor...</p></div>';
      
      setTimeout(() => {
        if(val === 'PRX-2025-001') {
          resultArea.innerHTML = `
            <div class="alert alert-success animate-up visible">
              <h3 style="margin-bottom:10px;"><i class="fa-solid fa-check-circle"></i> GENUINE</h3>
              <p><strong>Name:</strong> Rahul Sharma</p>
              <p><strong>University:</strong> IIT Delhi</p>
              <p><strong>Degree:</strong> B.Tech Computer Science</p>
              <p><strong>Grade:</strong> 8.7 CGPA (2024)</p>
              <hr style="margin:10px 0; border-color: rgba(40,167,69,0.3);">
              <p style="font-size:0.8rem;word-break:break-all;"><strong>Blockchain TX:</strong> 0x7F2A3B...E9D4C2A1B</p>
            </div>
          `;
        } else if(val === 'PRX-FAKE-001') {
          resultArea.innerHTML = `
            <div class="alert alert-danger animate-up visible">
              <h3 style="margin-bottom:10px;"><i class="fa-solid fa-times-circle"></i> FORGED</h3>
              <p>This certificate ID has been flagged as forged or revoked.</p>
              <p><strong>Fraud Indicators:</strong> Digital seal mismatch.</p>
            </div>
          `;
        } else {
          resultArea.innerHTML = `
            <div class="alert alert-warning animate-up visible">
              <h3 style="margin-bottom:10px;"><i class="fa-solid fa-exclamation-triangle"></i> NOT REGISTERED</h3>
              <p>The ID "${val}" was not found on the PROVEXA ledger.</p>
            </div>
          `;
        }
      }, 1500);
    });
  }

  // University Issue Form
  const issueForm = document.getElementById('issueForm');
  if(issueForm) {
    issueForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = issueForm.querySelector('button');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Anchoring to Blockchain...';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        issueForm.reset();
        alert("Certificate successfully issued and anchored to the blockchain! PROVEXA ID: PRX-NEW-" + Math.floor(Math.random()*1000));
      }, 2000);
    });
  }

  // AI Check Logic
  const aiAnalyzeBtn = document.getElementById('aiAnalyzeBtn');
  const aiResultArea = document.getElementById('aiResultArea');
  if(aiAnalyzeBtn && aiResultArea) {
    aiAnalyzeBtn.addEventListener('click', () => {
      aiResultArea.innerHTML = '<div style="text-align:center"><i class="fa-solid fa-robot fa-spin fa-2x"></i><p>Analyzing document...</p></div>';
      setTimeout(() => {
        aiResultArea.innerHTML = `
          <div class="glass-card animate-up visible">
            <h4>Analysis Complete</h4>
            <div style="margin-top:1rem;">
              <p><strong>Plagiarism:</strong> 23% Match (Wikipedia)</p>
              <div style="width:100%;background:#eee;height:10px;border-radius:5px;margin-bottom:1rem;"><div style="width:23%;background:var(--warning);height:100%;border-radius:5px;"></div></div>
              
              <p><strong>AI Content Detection:</strong> 67% AI Generated</p>
              <div style="width:100%;background:#eee;height:10px;border-radius:5px;margin-bottom:1rem;"><div style="width:67%;background:var(--danger);height:100%;border-radius:5px;"></div></div>
              
              <p>The text exhibits high perplexity and burstiness patterns typical of LLMs.</p>
            </div>
          </div>
        `;
      }, 3000);
    });
  }

  // Share Modal
  const shareBtns = document.querySelectorAll('.share-btn');
  const modal = document.getElementById('shareModal');
  const closeBtn = document.querySelector('.modal-close');
  if(shareBtns.length > 0 && modal) {
    shareBtns.forEach(btn => {
      btn.addEventListener('click', () => modal.classList.add('active'));
    });
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
      if(e.target === modal) modal.classList.remove('active');
    });
  }
});
