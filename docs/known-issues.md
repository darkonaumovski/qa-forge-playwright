# Resolved QA Forge application issues

The five issues found by the first complete automation run were fixed in live Sites version 3. Their acceptance cases remain in the default suite as permanent regressions.

| ID | Repair | Regression coverage |
|---|---|---|
| QF-DEFECT-01 | Reopening Audit now renders results from the retained search value. | Search for `role`, navigate away and back, then verify the input and one matching event still agree. |
| QF-DEFECT-02 | Exercise 02 now uses the stable validation containers and the actual `Enter a valid work email` message. | Validate the published snippet and execute the same empty-form assertions. |
| QF-DEFECT-03 | Exercise 07 scopes the transient Updating assertion to the row's `Updating status` button. | Validate the guide locator and the one matching async control. |
| QF-DEFECT-05 | Checked demo sessions are stored in session storage, survive reload, and clear on sign-out. No password is stored. | Sign in with the option checked, reload, and verify the Users view remains authenticated. |
| QF-DEFECT-06 | Exercise 08 scopes Filtering and Ready to `#debounce-state`. | Validate the guide snippet and the visible audit state after debounced search. |

All five regression scenarios passed in Chromium, Firefox, and WebKit during the final 318-execution release run. No known application issue remains in this test plan.
