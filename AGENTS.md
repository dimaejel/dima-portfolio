<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Contact submissions use a public TanStack server function with shared Zod validation and insert-only behavior; this keeps validation and privileged storage out of the browser.
- Never report contact email delivery before a connected email provider confirms the send; stored messages and delivered emails are separate outcomes.
- Contact spam protection uses atomic, service-only database counters keyed by an HMAC of the trusted edge IP; this enforces limits across server instances without storing raw visitor IPs.
- Contact notification failures never change a successfully saved submission into an error; the visitor must not be prompted to create duplicate leads during provider outages.
- Portfolio media uses one private bucket with separate anonymous referenced-file and authenticated admin SELECT policies; anonymous policies must never call auth-only role helpers.
- Persist normalized storage paths, resolve fresh signed URLs for display, and confirm record writes before upload success; keep replaced files private rather than deleting possibly shared content.
- Shared media upload controls save existing-record references immediately and stage new-record uploads until the item is saved; this preserves the editor while preventing false success.
