# KNOWN BUGS (distinct from unimplemented)

- IRR is still very wonky, and limited to -1000% to 1000%

- when doing PV,FV,PMT,N,I:

  - computation of I is limited between 0 and 10000%
  - computation of N is wonky if partial periods are enabled (they are) and give you +1 more than it should

- errors are not reported correctly
- 360 day date calculations can be off by a day
