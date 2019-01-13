# PH21C

An implementation of a Pewlett Hackard 21 C Financial Calculator, likeness to any calculators, living or dead, is strictly coincidental. That said, if you've used a certain famous financial calculator, you'll feel right at home.

This was originally started as a way to learn webpack and modern web technologies more intimately. I use TypeScript at work, but the environment already had a number of things already dealt with, so I didn't have to know how all the stuff under the hood worked. Additionally, I usually only work ond backends, so this was a way to learn React/Redux/browser side JS/TS.

# TODOs (outside of those things marked //TODO)

- Mobile

  - add IndexedDB support to retain calculator state between invocations
  - service-worker-plugin
  - pwa stuff (a2hs serviceworker business)

- see what can be done with lighthouse audits
- fix needing the symlinks under @types for redux, decimal.js

# KNOWN BUGS (distinct from unimplemented)

- IRR only handles positive values at most 1000%. Will give weird results for negative IRR

- when doing PV,FV,PMT,N,I:

  - computation of I is limited between 0 and 10000%
  - computation of N is wonky if partial periods are enabled (they are) and give you +1 more than it should

- The following errors are not detected/reported (see appendix c in HP12c or D in HP12cPT)

  - 3 for IRR
  - 5,6,7,8,9

- 365 day date calculations don't properly deal with leap years on 100/400 boundaries (or something like that)
