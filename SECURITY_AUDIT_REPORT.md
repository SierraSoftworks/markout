# MarkOut Security Audit Report (May 6, 2026)

## Executive summary
MarkOut currently has **high-risk content injection paths** from untrusted compose HTML to outbound rendered HTML. The most severe issue is that Markdown rendering explicitly allows raw HTML (`markdown-it` with `html: true`) and the output is written back to Outlook body HTML without a robust allowlist sanitizer. This can preserve dangerous tags/attributes/URLs in sent content, leading to stored active-content risk across recipients/clients and significant phishing/privacy abuse potential.

The add-in also supports user-defined CSS persisted in roaming settings and injected into rendering/inlining, creating a second attacker-controlled path for styling abuse, tracking URLs, and message spoofing effects. Development/test manifests enable on-send auto-transformation; if enabled in production-like deployments without strict sanitization and explicit UX controls, this creates silent pre-send mutation risk.

**Go/No-Go recommendation:** **NO-GO** for production security posture until High findings (F1–F4) are remediated and sanitizer regression tests are in place.

## Threat model
Attacker profiles considered:
1. External sender induces reply/forward of malicious HTML/Markdown already in compose chain.
2. Internal sender crafts malicious body content to trigger unsafe transformation.
3. User pastes untrusted web content into compose body.
4. Social engineering to sideload add-in with permissive manifest or altered host URLs.
5. Attacker tampering with roaming settings/custom stylesheet value.
6. Host/CDN compromise of deployed add-in assets.
7. Malicious dependency maintainer / compromised lockfile transitive package.
8. Recipient-side exploit when permissive client renders generated HTML/CSS/URIs.

## Attack surface map
- **Entrypoints**
  - Command surface function `render` (`ExecuteFunction`).
  - On-send function `onSend` (enabled in test/beta manifests).
  - Taskpane settings persistence (stylesheet + autorender).
  - Debug surface in test/beta manifests.
- **Transformation pipeline**
  - Outlook compose HTML `getAsync(Html)` -> `cleanse()` -> Markdown render -> CSS inline -> `DOMParser` parse -> `body.innerHTML` -> `setAsync(Html)`.
- **Persistent state**
  - `Office.context.roamingSettings` for stylesheet/autorender.
  - `Office.CustomProperties` render-state key.
- **External trust dependencies**
  - Hosted command/taskpane pages and icon/resource URLs from manifest domains.
  - npm supply chain and build tooling.

## Trust boundaries
1. Outlook item body (untrusted) -> add-in runtime logic (trusted code).
2. Roaming settings/custom properties (tamperable per account/context) -> renderer.
3. Markdown/HTML/CSS parser libraries (third-party trust boundary).
4. Add-in hosted web origin in manifest -> client execution context.
5. Generated email HTML -> heterogeneous downstream clients/gateways.

## Data-flow analysis
1. **Read compose body**
   - Source: `Office.context.mailbox.item.body.getAsync(Html)`.
   - Trust: untrusted.
   - Sink: `current` in `renderItem()`/`ensureRendered()`.
2. **Cleanse HTML to markdown-like text**
   - `cleanse()` parses with `DOMParser`, strips only specific tags, preserves others via `outerHTML`.
   - Control weakness: not an allowlist sanitizer; returns many raw tags/attrs.
3. **Markdown render**
   - `markdown-it` config has `html: true` so raw HTML input is preserved into output.
4. **Inline CSS**
   - `inline-css` receives rendered HTML + `extraCss` from roaming settings.
   - Removes style/link tags but does not guarantee URI/attribute safety.
5. **Parse and return HTML**
   - `DOMParser(...rendered...)` then returns `dom.body.innerHTML`.
   - Parsing is not sanitization.
6. **Write back to compose body**
   - `setAsync(..., coercionType: Html)` stores generated HTML in draft/sent body.
7. **Send lifecycle**
   - `onSend` path may auto-transform at send-time when setting enabled.
8. **Recipient render**
   - Downstream clients may execute/interpret subset of dangerous content differently.

## Findings table
| ID | Title | Severity | Confidence |
|---|---|---|---|
| F1 | Raw HTML passthrough in Markdown renderer without strict sanitizer | High | High |
| F2 | Cleanser is not sanitization; preserves dangerous tags/attributes | High | High |
| F3 | Unsafe HTML sink: rendered attacker-influenced HTML written via `setAsync(Html)` | High | High |
| F4 | Custom CSS from roaming settings can be injected into outbound rendering | High | Medium-High |
| F5 | Auto-render-on-send can silently transform untrusted content pre-send | Medium | High |
| F6 | External resource/URI privacy leak vectors (links/images/CSS URLs) not constrained | Medium | Medium-High |
| F7 | Manifest/deployment and hosted-asset compromise impact is high | Medium | Medium |
| F8 | Dev server CORS `*` + source maps increase dev/test exposure blast radius | Low | High |
| F9 | Render-state logic appears inconsistent; state-tampering/logic confusion risk | Low | Medium |
| F10 | Supply-chain hardening gaps for high-risk parser/transformation libs | Medium | Medium |

## Detailed vulnerability writeups

### F1
Title: Raw HTML passthrough in Markdown renderer without strict sanitizer
Severity: High
Confidence: High
Affected files/functions: `src/lib/renderer.ts` (`md` initialization, `renderMarkdown`)
Category: Injection / Stored XSS in generated content
CWE: CWE-79, CWE-116
OWASP mapping: A03 Injection
Attack scenario: Attacker-controlled compose content includes inline/raw HTML that survives `cleanse()`, is preserved by markdown renderer, and becomes outbound HTML.
Technical details: `markdown-it` is initialized with `html: true`; output is later inlined and returned as HTML string with no allowlist sanitizer stage.
Evidence: `html: true` and return of `dom.body.innerHTML` after render/inlining.
Proof of concept: Body contains `<img src=x onerror=alert(1)>` or `<svg><a xlink:href="javascript:...">` variants; whether client executes depends on recipient client, but payload can persist.
Impact: Stored active-content risk, phishing augmentation, downstream client exploit surface.
Exploitability: Moderate to High (depends on client filtering and policy).
Prerequisites: User triggers render or on-send autorender.
Affected users: Sender and recipients.
Recommended fix: Set `html: false` in markdown-it; add strict post-render sanitizer (DOMPurify configured for email-safe allowlist).
Secure code pattern: Parse -> sanitize allowlist tags/attrs/URIs -> inline style from trusted policy -> sanitize again.
Regression tests: Raw HTML blocks/inline HTML must render as escaped text or be stripped.
Residual risk: Medium (email-client differential parsing still requires defensive policy).

### F2
Title: Cleanser is not sanitization; preserves dangerous tags/attributes
Severity: High
Confidence: High
Affected files/functions: `src/lib/cleanser.ts` (`cleanseElement`, default `outerHTML` returns)
Category: Injection
CWE: CWE-79, CWE-20
OWASP mapping: A03 Injection
Attack scenario: Crafted HTML in compose body bypasses simplistic tag handling and is passed through as `outerHTML`.
Technical details: Only `script` is removed; many elements return `outerHTML` unchanged (including attributes/events/styles).
Evidence: default branch returns `[el.outerHTML]`; `a` and `img` also returned as HTML.
Proof of concept: `<a href="javascript:alert(1)" onclick="...">click</a>`; `<iframe src=...>` etc may persist.
Impact: Dangerous markup propagation to render pipeline and outbound email.
Exploitability: High for phishing/privacy, variable for script execution.
Prerequisites: Untrusted HTML present in compose source.
Affected users: Sender and recipients.
Recommended fix: Replace `cleanse` with true sanitization/HTML-to-Markdown conversion library and explicit allowlist.
Secure code pattern: Use robust sanitizer with forbidden tags (`script`, `svg`, `math`, `iframe`, etc) and strip all `on*` attrs.
Regression tests: Malformed, mixed-case, encoded-URI bypass payloads.
Residual risk: Low-Medium after rigorous test corpus.

### F3
Title: Unsafe HTML sink through Outlook `setAsync` coercion type HTML
Severity: High
Confidence: High
Affected files/functions: `src/lib/item.ts` (`setContent`, callers in render paths)
Category: DOM/HTML Injection sink
CWE: CWE-79
OWASP mapping: A03 Injection
Attack scenario: Any attacker-controlled content reaching `rendered` is persisted by `setAsync(...Html...)`.
Technical details: Both manual render and ensureRendered paths write HTML directly.
Evidence: `setContent(rendered, Office.CoercionType.Html)`.
Proof of concept: payloads in F1/F2 persist in draft/sent output.
Impact: Stored distribution of malicious/phishing content; compliance risk.
Exploitability: High when combined with F1/F2.
Prerequisites: Render flow invoked.
Affected users: Sender+all recipients.
Recommended fix: Sanitize before sink; enforce URI policy; optionally convert to safe subset HTML template renderer.
Secure code pattern: Trusted template output only; strip unsafe attrs/URIs.
Regression tests: Sink-guard test verifying no forbidden tags/attrs reach `setContent`.
Residual risk: Medium due to downstream client variance.

### F4
Title: Attacker-controlled custom CSS can be persisted and inlined into outgoing messages
Severity: High
Confidence: Medium-High
Affected files/functions: `src/lib/config.ts`, `src/lib/renderer.ts`
Category: CSS injection / spoofing / privacy leakage
CWE: CWE-159, CWE-200
OWASP mapping: A01 Broken Access Control (settings tamper context), A03 Injection
Attack scenario: Malicious CSS in roaming settings modifies outbound email rendering (hiding text, spoofing buttons, remote URL beacons via CSS `url()` depending client support).
Technical details: `getStylesheet()` returns roaming value; `renderMarkdown` passes it as `extraCss` to inline-css with no sanitizer.
Evidence: `Office.context.roamingSettings.get(...)` and `extraCss: css`.
Proof of concept: `a{display:none}.warning{display:none}.cta:before{content:'Verify account';}` and `background-image:url(https://attacker.tld/pixel)`.
Impact: Phishing enhancement, message tampering, potential tracking.
Exploitability: Medium to High (client-dependent CSS behavior).
Prerequisites: Ability to set stylesheet setting (UI abuse/account compromise/sync tamper).
Affected users: Sender + recipients.
Recommended fix: Disable custom CSS by default; enforce strict CSS allowlist and remove all `url()`, `@import`, `position`, visibility-hiding properties.
Secure code pattern: structured theme tokens instead of raw CSS text.
Regression tests: Reject CSS containing URLs/imports/forbidden selectors.
Residual risk: Low with tokenized styling system.

### F5
Title: Auto-render-on-send enables silent transformation of untrusted content
Severity: Medium
Confidence: High
Affected files/functions: `src/commands/commands.ts`, `src/lib/config.ts`, manifests with ItemSend event
Category: Unsafe workflow / integrity
CWE: CWE-345
OWASP mapping: A04 Insecure Design
Technical details: `onSend` calls `ensureRendered()` when setting true; user may send modified content not explicitly reviewed.
Recommended fix: Explicit pre-send confirmation diff + secure-mode toggle default off + policy banner.

### F6
Title: Unconstrained external URLs in links/images/CSS enable privacy leaks and client-side request abuse
Severity: Medium
Confidence: Medium-High
Affected files/functions: `cleanser.ts`, `renderer.ts`
Category: Privacy/Tracking
CWE: CWE-200
OWASP mapping: A01/A02/A04 depending deployment
Technical details: No URI protocol/domain allowlist for `href/src`; email recipients may trigger beacon requests.
Recommended fix: URI scheme allowlist (`https`, `mailto` optionally), block `data:`, `file:`, `javascript:`, `vbscript:`; optional image proxying/blocking.

### F7
Title: Manifest/deployment trust concentration in hosted asset origin
Severity: Medium
Confidence: Medium
Affected files/functions: `manifest*.xml`
Category: Supply chain / deployment
CWE: CWE-829
OWASP: A08 Software and Data Integrity Failures
Technical details: Add-in behavior depends entirely on hosted URLs; compromise of origin/TLS/DNS alters add-in logic.
Recommended fix: Harden hosting, enforce CI signing, monitor domain and certificate integrity, implement subresource integrity equivalent where possible.

### F8
Title: Dev server permissive CORS and source maps increase development exposure
Severity: Low
Confidence: High
Affected files/functions: `webpack.config.js`
Category: Security misconfiguration
CWE: CWE-16
OWASP: A05 Security Misconfiguration
Technical details: `Access-Control-Allow-Origin: *` and always-on `devtool: source-map`.
Recommended fix: Limit CORS to localhost toolchain; disable source maps in production build profiles.

### F9
Title: Render-state custom property logic inconsistency may cause state confusion/tampering
Severity: Low
Confidence: Medium
Affected files/functions: `src/lib/item.ts`
Category: Integrity/logic
CWE: CWE-840
Technical details: `updateRenderState(customProperties, original)` stores literal `"false"` instead of original body; toggle behavior can be inconsistent and tamperable via custom props.
Recommended fix: Store cryptographic digest + explicit structured state, or remove reversible toggle if insecure.

### F10
Title: High-risk parser/transformation dependency surface requires stronger supply-chain controls
Severity: Medium
Confidence: Medium
Affected files/functions: `package.json`, `package-lock.json`
Category: Supply chain
CWE: CWE-1104
Technical details: Markdown/HTML/CSS processing libs execute on attacker-controlled input; build toolchain can execute arbitrary scripts during install/build.
Recommended fix: pin exact versions, enable npm audit/SCA in CI, lockfile integrity policy, provenance checks, dependency review gates.

## Hypotheses validation (explicit)
1. **Validated**: raw HTML enabled in markdown-it (`html: true`).
2. **Validated**: cleanser removes scripts but preserves many tags/attrs via `outerHTML`.
3. **Validated**: DOMParser used for parsing only, not sanitization.
4. **Validated**: rendered HTML written via `setAsync(...Html...)`.
5. **Validated**: custom CSS persisted in roaming settings and inlined.
6. **Validated**: on-send handler auto-renders when enabled.
7. **Validated**: URLs in links/images/CSS are not strictly constrained.
8. **Partially validated**: `ReadWriteItem` appears broad but may be operationally needed; least-privilege review still warranted.
9. **Validated (dev/test posture)**: dev server CORS `*` and source-map enabled.
10. **Validated**: dependency set includes multiple untrusted-content parser libs; supply-chain risk is material.

## False-positive analysis
- Some script payloads may be stripped by Outlook or recipient gateways, reducing direct XSS reliability.
- Many email clients disable JavaScript entirely; however, this does **not** eliminate phishing, spoofing, or tracking via links/images/CSS.
- `removeStyleTags`/`removeLinkTags` in inline-css is not equivalent to a full sanitizer and does not neutralize all dangerous attributes/URIs.

## Concrete remediation guidance
1. Introduce sanitizer stage with strict allowlist (email-safe tags only).
2. Set markdown-it `html: false` unless explicit trusted-mode.
3. Enforce URL protocol validation for all href/src and CSS URLs.
4. Remove raw custom CSS input; replace with safe theme presets.
5. Add pre-send user confirmation + diff when autorender is active.
6. Add security unit tests/fuzz corpus for malicious Markdown/HTML/CSS.
7. Harden manifests and deployment domain controls.
8. Add CI SCA checks and dependency governance.

## Secure-by-default design recommendations
- Default mode: Markdown subset only, no raw HTML.
- Policy object controlling allowed tags/attrs/protocols, versioned and tested.
- Deterministic renderer that emits known-safe HTML subset.
- Disable external images by default or rewrite via safe proxy.
- Separate “preview rendering” from “commit-to-body” with explicit consent.

## Security tests that should be added
- Raw HTML block `<iframe>`, `<svg>`, `<math>` stripping tests.
- Attribute stripping for `on*`, `style`, `srcdoc`, `xlink:href`.
- URI scheme tests for `javascript:`, `data:`, `file:`, encoded variants.
- CSS sanitizer tests for `url()`, `@import`, remote fonts.
- Nested malformed HTML/Unicode confusable payload tests.
- Large/deep markdown input performance & timeout tests.
- Auto-render-on-send integration tests confirming safe output only.
- Roaming settings tamper tests for stylesheet/autorender values.

## Prioritized fix plan
### Immediate 24-hour fixes
1. Force `markdown-it` `html: false`.
2. Disable custom stylesheet feature by default and block remote URLs.
3. Add emergency sanitizer blocklist for dangerous tags/attributes/URI schemes before `setContent`.
4. Disable on-send autorender in prod manifests until sanitizer is complete.

### 7-day remediation plan
1. Integrate robust allowlist sanitizer (DOMPurify configured for email-safe output).
2. Implement URI canonicalization + protocol allowlist.
3. Implement CSS policy sanitizer or migrate to preset themes.
4. Add regression test suite for all payload families listed.
5. Perform dependency audit and patch/update vulnerable packages.

### Longer-term architecture
1. Replace HTML round-trip cleansing with AST-based Markdown pipeline.
2. Build signed/reproducible artifacts and provenance verification.
3. Add security telemetry for blocked payload categories (non-content logging).
4. Run periodic cross-client rendering security QA matrix.

## Top 10 risks (ranked by exploitability × impact)
1. Raw HTML preserved into outbound content (F1).
2. Non-sanitizing cleanser passes dangerous markup (F2).
3. Direct HTML sink writes attacker-influenced output (F3).
4. Custom CSS injection and persistence (F4).
5. Auto-render-on-send silent mutation risk (F5).
6. External tracking/resource URI leakage (F6).
7. Hosted origin compromise impact (F7).
8. Dependency compromise in parser toolchain (F10).
9. Dev/test CORS+source-map exposure (F8).
10. Render state tamper/logic confusion (F9).

## Production recommendation
**No-Go** until F1–F4 remediated and regression tests demonstrate sanitizer effectiveness across targeted payload corpus and major email-client rendering variants.
