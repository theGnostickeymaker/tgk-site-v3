# TGK Membership Gating System — v1.0

## Overview
This system ensures only entitled users (Free / Initiate / Adept) can access certain scrolls or series.  
Authorization is managed through a signed cookie `tgk_ent` issued by Netlify functions.

## How it works
1. After checkout or refresh, the Netlify function sets `tgk_ent={"tier":"initiate","exp":...}`.
2. Each scroll declares its required tier in front-matter:  
   `tier: initiate`
3. `gate.js` compares the cookie tier with the required tier.
4. If insufficient, the visitor is redirected to `/signin/?next=...`.
5. Locked cards and placeholders display “Upgrade to access”.

## Files
- `/src/js/gate.js` — client enforcement + card lock
- `/netlify/functions/verify-entitlement.js` — server validator
- `/src/_includes/partials/locked-card.njk` — overlay for gated cards
- `base.njk` modifications for content-level protection

## Tier Hierarchy

## Future Server Upgrade
To fully block static HTML delivery for Adept-only scrolls:
- Serve those pages via a Netlify function or dynamic content fetch.
- Call `verify-entitlement.js` before returning content.

---