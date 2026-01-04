---
allowed-tools: Read, Edit, CodebaseSearch, Grep, ReadLints
description: Quality check - Is this implementation production-ready and something you'd proudly show your mom or boss?
---

# Mom Test - Quality Check

**STOP. THINK. Is this REALLY ready?**

This is THE moment of truth. Before you ship this, before you merge this, before you show this to anyone - ask yourself: **Would I be PROUD to show this to my mom? Would I be CONFIDENT showing this to my boss?** 

If there's even a SLIVER of doubt, we need to find it NOW. Not later. Not in production. NOW.

Review the current implementation with ZERO tolerance for "good enough". This needs to be EXCELLENT. This needs to be PRODUCTION-READY. This needs to be something you'd stand behind with complete confidence.

## Step 1: Understand Context

**DIG DEEP. Don't just skim.**

1. Check what files are currently open or recently viewed - EVERYTHING matters
2. Identify what was recently implemented or changed - Did you touch everything you needed to?
3. Understand the scope of the work - Is this REALLY complete or did you cut corners?

## Step 2: Multi-Angle Review Using Subagents

**USE MULTIPLE PERSPECTIVES. ONE SET OF EYES ISN'T ENOUGH.**

Launch 5 subagents in PARALLEL to review the code from completely different angles. Each agent should focus on ONE specific dimension and be RUTHLESS about finding issues in that area.

### Subagent 1: Bug Hunter (Opus)
**Mission**: Find bugs, logic errors, and runtime issues.
- Scan for obvious bugs that will cause incorrect behavior
- Look for logic errors, race conditions, null/undefined issues
- Check for edge cases that will break
- Flag ONLY real bugs that will cause problems - no false positives
- Focus on the actual code, not theoretical concerns

### Subagent 2: UX Critic (Sonnet)
**Mission**: Evaluate user experience and polish.
- Is the UX smooth and intuitive?
- Are loading states handled properly?
- Are error messages user-friendly?
- Is the UI polished and professional?
- Would a real user be confused or frustrated?
- Does it feel like a finished product?

### Subagent 3: Code Quality Auditor (Opus)
**Mission**: Assess code quality, maintainability, and technical debt.
- Is the code clean, readable, and well-structured?
- Is it maintainable? Will someone understand this in 6 months?
- Are there performance issues?
- Is error handling properly implemented?
- Does it follow project conventions and patterns?
- Is it properly typed (no `any`, no `@ts-ignore`)?

### Subagent 4: Completeness Checker (Sonnet)
**Mission**: Find missing pieces and incomplete implementations.
- Is the feature FULLY implemented or half-baked?
- Are there TODO comments or incomplete parts?
- Did you forget to handle edge cases?
- Are there missing validations (frontend AND backend)?
- Did you forget to clean up temporary code or console.logs?
- Are there missing imports or dependencies?
- Did you forget to update related files (types, constants, tests)?

### Subagent 5: Security & Production Readiness (Opus)
**Mission**: Check security, production readiness, and critical issues.
- Are there security concerns? Input validation? Output sanitization?
- Are there linting errors?
- Is this ACTUALLY production-ready?
- What will break in production that works in dev?
- Are there any critical issues that MUST be fixed?

**CRITICAL**: Each subagent should:
- Review the SAME codebase but from their specific angle
- Return a list of issues with specific descriptions and file locations
- Be BRUTAL but ACCURATE - no false positives, but don't hold back on real issues
- Provide SPECIFIC, ACTIONABLE feedback

## Step 3: Consolidate Findings

After all subagents complete, consolidate their findings:
- Merge duplicate issues found by multiple agents
- Prioritize critical issues that multiple agents flagged
- Organize by severity: Critical → Missing Pieces → Nice-to-Haves

## Step 4: Comprehensive Quality Review

**BE RUTHLESS. BE THOROUGH. LEAVE NO STONE UNTURNED.**

Review the implementation across these dimensions with EXTREME scrutiny, using the subagent findings:

### Code Quality
- [ ] Is the code ACTUALLY clean, readable, and well-structured? Or is it just "working"?
- [ ] Are there ANY obvious bugs or logic errors? Check EVERY code path.
- [ ] Is error handling PROPERLY implemented? Not just try-catch, but ACTUAL error handling.
- [ ] Are edge cases handled? ALL of them? What about null, undefined, empty strings, negative numbers?
- [ ] Is the code following project conventions and patterns? Or did you just make it work?

### Completeness
- [ ] Is the feature FULLY implemented? Not 80%. Not 95%. FULLY. 100%.
- [ ] Are ALL user-facing aspects complete? Every button, every state, every interaction?
- [ ] Are there ANY TODO comments or incomplete parts? ZERO tolerance.
- [ ] Is the implementation consistent with the rest of the codebase? Does it feel like it belongs?

### User Experience
- [ ] Is the UX ACTUALLY smooth and intuitive? Or just functional?
- [ ] Are loading states handled? Every single async operation?
- [ ] Are error messages user-friendly? Can a real person understand what went wrong?
- [ ] Is the UI polished and professional? Does it look like a finished product?

### Technical Excellence
- [ ] Are there ANY performance issues? Will this scale? Will this be fast?
- [ ] Is the code maintainable? Will someone else understand this in 6 months?
- [ ] Are there ANY security concerns? Did you validate inputs? Sanitize outputs?
- [ ] Is the code properly typed (if TypeScript)? No `any`, no `@ts-ignore`?
- [ ] Are there ANY linting errors? ZERO errors. ZERO warnings.

### Missing Pieces
- [ ] Did you forget to handle ANY edge cases? Think harder. There's always more.
- [ ] Are there ANY missing validations? Frontend AND backend?
- [ ] Did you forget to clean up temporary code or console.logs? Check EVERY file you touched.
- [ ] Are there ANY missing imports or dependencies? Did you test this from scratch?
- [ ] Did you forget to update related files? Types? Constants? Tests? Documentation?

## Step 5: Provide Honest Assessment

**NO SUGAR-COATING. NO EXCUSES. BRUTAL HONESTY.**

Give a DIRECT, HONEST review. This is your reputation on the line:

1. **Overall Assessment**: Is this ACTUALLY production-ready? Would you BET YOUR JOB on showing this to your mom/boss RIGHT NOW?
2. **What's Good**: Highlight what's ACTUALLY done well - be specific, not generic
3. **What's Missing**: List EVERYTHING that needs attention - don't hold back
4. **Critical Issues**: Flag EVERYTHING that MUST be fixed before this is ready - these are blockers
5. **Nice-to-Haves**: Suggest improvements that would make it even better - but only after critical issues are fixed

## Guidelines

**REMEMBER: This is about EXCELLENCE, not "good enough".**

- Be BRUTALLY honest and EXTREMELY thorough - this is about quality, not ego. Your ego can wait.
- Focus on what ACTUALLY matters for production code - real users will see this
- Don't nitpick style unless it violates project conventions - but DO call out real problems
- Prioritize user-facing issues over internal refactoring - users don't care about your code structure
- If something is missing or incomplete, say so DIRECTLY - don't soften the blow
- Provide SPECIFIC, ACTIONABLE feedback - "fix this" is useless, "fix X because Y" is helpful
- If you find issues, they MUST be fixed. No "we can fix this later" - fix it NOW.

## Output Format

Provide your assessment in this format:

```
## Mom Test Results

**Overall**: [Ready / Needs Work / Not Ready]

**What's Good**:
- [List what's well done]

**Critical Issues** (must fix):
- [List critical problems]

**Missing Pieces**:
- [List what's incomplete or missing]

**Nice-to-Haves**:
- [Suggestions for improvement]

**Verdict**: [Would you show this to your mom/boss RIGHT NOW? Why or why not? Be HONEST. If not, what needs to happen first?]
```

