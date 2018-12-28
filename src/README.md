# PH21C

An implementation of a Pewlett Hackard 21 C Financial Calculator, likeness to any calculators, living or dead, is strictly coincidental.

This was originally started as a way to learn webpack and modern web technologies more intimately. I use TypeScript at work, but the environment already had a number of things already dealt with, so I didn't have to know how all the stuff under the hood worked. Additionally, I usually only work ond backends, so this was a way to learn React/Redux/browser side JS/TS.

# TODOs (outside of those things marked //TODO)

- use decimal.js to get necessary precision

# KNOWN BUGS (distinct from unimplemented)

- IRR is still very wonky, and limited to -1000% to 1000%

- when doing PV,FV,PMT,N,I:

  - computation of I is limited between 0 and 10000%
  - computation of N is wonky if partial periods are enabled (they are) and give you +1 more than it should

- errors are not reported correctly
- 360 day date calculations can be off by a day
- 365 day date calculations don't properly deal with leap years on 100/400 boundaries (or something like that)