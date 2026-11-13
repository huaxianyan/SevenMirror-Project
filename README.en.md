<div align="center">

  # SevenMirror Project

Project hub · [Server](https://github.com/huaxianyan/SevenMirror-Server) · [Chrome extension](https://github.com/huaxianyan/SevenMirror-Extension) · [Android app](https://github.com/huaxianyan/SevenMirror-Android)

English | [简体中文](README.md)
</div>

SevenMirror mirrors system notifications from an Android phone to the browsers authorised in the same private space, and lets you reply to or clear those notifications from the browser. The whole system is self-hostable, notification content stays end-to-end encrypted, and public registration is off by default on the server.

<p align="center">
  <a href="https://chromewebstore.google.com/detail/fibpoeijlejjkokmngpcoahdhbjigcma"><img src="docs/images/chrome-web-store-badge.png" height="56" alt="Get the SevenMirror extension on the Chrome Web Store"></a>
</p>

This repository is the **project hub**. It carries the documentation and the development record for the whole system, not runnable code. Each component lives in its own repository:

| Component | Repository | Responsibility |
| --- | --- | --- |
| Server | SevenMirror-Server | Relay, authoritative roster, admin pages, admin CLI |
| Chrome extension | SevenMirror-Extension | Chrome Manifest V3 extension: receives, presents and acts on notifications; published on the Chrome Web Store |
| Android app | SevenMirror-Android | Captures local notifications, keeps the authenticated relay connection |

## How it works

The server's authoritative roster decides trust for all three components; clients never trust each other bilaterally.

1. A device registers with a one-time join code issued by an administrator, and waits for approval.
2. Once approved, the server writes the device into the authoritative roster and signs it. That roster is the only runtime source of device identity, role and revocation state.
3. The phone encrypts notifications from the apps it selected, wraps them per recipient, and hands them to the server for relay.
4. The browser unwraps and presents them; replies and clearing travel back the same way.
5. The server only routes ciphertext. It can see ciphertext length and delivery timing, not titles, bodies, app names or reply text.

One boundary worth stating up front: the phone and the browser share no symmetric key, and the authority private key lives only on the server. Configuration shared across devices — notification priority rules, for example — therefore takes a different route: the browser derives a key from a passphrase and the server stores the ciphertext blind, equally unable to read it.

## Core principles

- Fully self-hosted; no dependency on project-operated cloud services.
- No paid unlock tiers.
- Notification sync, notification actions, replies and two-way clearing are the whole scope.
- Several Android devices and several browsers at once, with notification state kept consistent.
- End-to-end encryption is mandatory; the relay never parses business plaintext.
- Public registration is off by default; joining requires an administrator-issued join code.
- App icons and notification avatars are synced; content images are replaced by a placeholder.
- Android 10 (API 29) is the minimum.
- Collection, storage and logging are minimal by default.
- File transfer, clipboard and remote control are out of scope.

## Documentation

Product and specification:

- [Product requirements](docs/PRD.md): scope, requirements per component, flows, protocol model, acceptance criteria.
- [Product information architecture](docs/PRODUCT_INFORMATION_ARCHITECTURE.md): page structure, navigation model, user tasks.
- [Product redesign](docs/PRODUCT_REDESIGN.md): the settled direction for the redesign of all three surfaces.
- [Clickable prototype](docs/prototypes/index.html): low-fidelity UI prototype, for design reference only.

Plans and direction:

- [Implementation plan](docs/IMPLEMENTATION_PLAN.md): stack, multi-repository workflow, phase gates, test strategy.
- [Development direction correction](docs/DEVELOPMENT_DIRECTION_CORRECTION.md): a record of one course correction.
- [Near-term development plan](docs/DEVELOPMENT_PLAN.md): current todos, acceptance criteria and progress per round.

Record:

- [Implementation status](docs/STATUS.md): numbered delivery entries, each stating the change, how it was verified, the conclusion and the boundary.
- [Branch audit](docs/BRANCH_AUDIT.md): theme-branch governance and cleanup record.

## Records

`docs/STATUS.md` is the main timeline; higher entry numbers are newer. Each entry carries four kinds of information:

- **What changed**: which repository, which commit.
- **How far it was verified**: which commands ran, what was observed, how many samples.
- **Conclusion and boundary**: what was measured, what is only inferred, what was not covered.
- **Next step**: open items and blockers.

`docs/DEVELOPMENT_PLAN.md` holds the todo list and acceptance criteria for the current phase, and appends progress per round, matching the entries in `STATUS.md`.

## Caveats

Release gates that need external resources are parked and no longer count as acceptance thresholds: independent protocol and cryptography review, a second release approver, and a second device from another vendor. **What is parked is the threshold, not the risk**: the real state of those items is unchanged, and no record may be read as "gates passed" or "risk resolved".

The Chrome extension is published ([store listing](https://chromewebstore.google.com/detail/fibpoeijlejjkokmngpcoahdhbjigcma)). Being listed is a distribution fact, not a completed independent review or a second release approval.

## License

This project is licensed under [GNU General Public License v3.0 only (GPL-3.0-only)](LICENSE); commercial use is allowed, and distribution must follow GPLv3.

Previously released MIT versions are unaffected retroactively; the switching boundary for each of the three repositories is in [LICENSE-TRANSITION.md](LICENSE-TRANSITION.md).
