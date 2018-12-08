let x = 0;
let y = 0;
let stack3 = 0;
let stack4 = 0;
let dec = 0;
let g = 0;
let f = 0;
let wasresult = 0;
let registers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let N = 0;
let I = 0;
let PV = 0;
let PMT = 0;
let FV = 0;

let wasrcl = 0;
let wassto = 0;

/// doesn't do sto op number

function showx() {
  document.getElementById('output').value = x;
  document.getElementById('y').value = y;
  document.getElementById('s3').value = stack3;
  document.getElementById('s4').value = stack4;
  for (let i = 0; i < 10; i++) {
    document.getElementById('reg' + i).value = registers[i];
  }
  wasrcl = 0;
}

function buttonRCL() {
  wasrcl = 1;
  wassto = 0;
}

function buttonSTO() {
  wassto = 1;
  wasrcl = 0;
}

function number(n) {
  if (wasrcl) {
    x = registers[n];
    showx();
    wasrcl = 0;
    wasresult = 1;
    return;
  }
  if (wassto) {
    registers[n] = x;
    wassto = 0;
    wasresult = 1;
    showx();
    return;
  }
  if (wasresult) {
    if (wasresult === 1) {
      y = x;
    }
    wasresult = 0;
    dec = 0;
    x = 0;
  }
  if (dec === 0) {
    x = x * 10 + n;
  } else {
    dec /= 10;
    x += dec * n;
  }
  showx();
}

function buttonG() {
  f = 0;
  wassto = 0;
  wasrcl = 0;
  g = 1;
}

function button0() {
  if (g) {
    // mean
    g = 0;
    x = registers[2] / registers[1];
    y = registers[4] / registers[1];
    wasresult = 1;
    showx();
    return;
  }
  number(0);
}

function computeABr() {
  let sy = registers[4];
  let sy2 = registers[5];
  let n = registers[1];
  let sx = registers[2];
  let sxy = registers[6];
  let sx2 = registers[3];
  let Bnum = sxy - (sx * sy) / n;
  let Bden = sx2 - (sx * sx) / n;
  let B = Bnum / Bden;
  let A = sy / n - B * (sx / n);

  let Rnum = sxy - (sx * sy) / n;
  let Rden1 = sx2 - (sx * sx) / n;
  let Rden2 = sy2 - (sy * sy) / n;
  let R = Rnum / (Rden1 * Rden2) ** 0.5;
  return [A, B, R];
}

function button1() {
  if (g) {
    // xhat, r
    let ab = computeABr();
    let A = ab[0];
    let B = ab[1];
    let R = ab[2];
    x = (x - A) / B;
    y = R;
    wasresult = 1;
    g = 0;
    showx();
    return;
  }
  number(1);
}

function button2() {
  if (g) {
    // yhat,r
    let ab = computeABr();
    let A = ab[0];
    let B = ab[1];
    let R = ab[2];
    x = A + B * x;
    y = R;
    wasresult = 1;
    g = 0;
    showx();
    return;
  }
  number(2);
}

function afterGUnary() {
  g = 0;
  wasresult = 1;
  showx();
}
function button3() {
  if (g) {
    // factorial
    let c = x;
    while (c > 1) {
      c -= 1;
      x *= c;
    }
    afterGUnary();
    return;
  }
  number(3);
}

function button4() {
  number(4);
}

function button5() {
  number(5);
}
function button6() {
  if (g) {
    x = registers[6] / registers[2];
    g = 0;
    showx();
    wasresult = 1;
    return;
  }
  number(6);
}
function button7() {
  number(7);
}
function button8() {
  number(8);
}
function button9() {
  number(9);
}
function buttonPoint() {
  if (g) {
    //stddev
    n = registers[1];
    sx = registers[2];
    sx2 = registers[3];
    sy = registers[4];
    sy2 = registers[5];
    den = n * (n - 1);

    xnum = n * sx2 - sx ** 2;
    x = (xnum / den) ** 0.5;

    ynum = n * sy2 - sy ** 2;
    y = (ynum / den) ** 0.5;

    g = 0;
    showx();
    wasresult = 1;
    return;
  }
  dec = 1;
  showx();
}

function buttonSingleStep() {
  if (f) {
    // clear stats
    for (let i = 1; i < 7; i++) {
      registers[i] = 0;
    }
    f = 0;
    return;
  }
  alert('notimplemented');
}
function buttonCLx() {
  if (f) {
    for (let i = 0; i < 10; i++) {
      registers[i] = 0;
    }
    f = 0;
    stack3 = 0;
    stack4 = 0;
    y = 0;
    N = 0;
    I = 0;
    PMT = 0;
    PV = 0;
    FV = 0;
  }

  x = 0;
  dec = 0;
  showx();
}

function afterBinaryOp() {
  y = stack3;
  stack3 = stack4;
  wasresult = 1;
  showx();
}
function buttonEnter() {
  stack4 = stack3;
  stack3 = y;
  y = x;
  wasresult = 1;
  showx();
}

function buttonPlus() {
  x = x + y;
  afterBinaryOp();
}

function buttonMinus() {
  x = y - x;
  afterBinaryOp();
}
function buttonTimes() {
  if (g) {
    // square
    x = x * x;
    afterGUnary();
    return;
  }
  x = y * x;
  afterBinaryOp();
}

function buttonDiv() {
  x = y / x;
  afterBinaryOp();
}

function buttonCHS() {
  x = -x;
  showx();
}
function buttonPercentTotal() {
  if (g) {
    x = Math.log(x);
    afterGUnary();
    return;
  }
  x = (x / y) * 100;
  afterBinaryOp();
}
function buttonPercentChange() {
  if (g) {
    let wasneg = 1;
    if (x < 0) {
      wasneg = -1;
    }

    x = wasneg * (x * wasneg - Math.floor(x * wasneg));
    afterGUnary();
    return;
  }
  x = ((x - y) / y) * 100;
  afterBinaryOp();
}
function buttonPercent() {
  if (g) {
    let wasneg = 1;
    if (x < 0) {
      wasneg = -1;
    }
    x = Math.floor(x * wasneg) * wasneg;

    afterGUnary();
    return;
  }
  x = y * (x / 100);
  afterBinaryOp();
}

function buttonSwapXY() {
  if (f) {
    // clear FIN
    N = 0;
    I = 0;
    PV = 0;
    PMT = 0;
    FV = 0;
    f = 0;
    return;
  }
  let t = x;
  x = y;
  y = t;
  showx();
}

function buttonRotateStack() {
  let t = x;
  x = y;
  y = stack3;
  stack3 = stack4;
  stack4 = t;
  showx();
}

function buttonRecipX() {
  if (g) {
    x = Math.exp(x);
    afterGUnary();
    return;
  }
  x = 1 / x;
  showx();
}

function buttonYtoX() {
  if (g) {
    x = x ** 0.5;
    afterGUnary();
    return;
  }
  x = y ** x;
  afterBinaryOp();
}

function buttonSigmaPlus() {
  if (g) {
    registers[1] -= 1;
    registers[2] -= x;
    registers[3] -= x * x;
    registers[4] -= y;
    registers[5] -= y * y;
    registers[6] -= x * y;
    g = 0;
  } else {
    registers[1] += 1;
    registers[2] += x;
    registers[3] += x * x;
    registers[4] += y;
    registers[5] += y * y;
    registers[6] += x * y;
  }
  x = registers[1];
  wasresult = 2;
  showx();
}
