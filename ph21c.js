let x = 0;
let y = 0;
let stack3 = 0;
let stack4 = 0;
let dec = 0;
let g = 0;
let f = 0;
let wasresult = 0;
let registers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

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
  if (wasresult) {
    if (wasresult === 1) {
      y = x;
    }
    wasresult = 0;

    x = 0;
  }
  if (wasrcl) {
    x = registers[n];
    showx();
    wasrcl = 0;
    return;
  }
  if (wassto) {
    registers[n] = x;
    wassto = 0;
    showx();
    return;
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

function button1() {
  number(1);
}

function button2() {
  number(2);
}

function button3() {
  number(3);
}

function button4() {
  number(4);
}

function button5() {
  number(5);
}
function button6() {
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

function buttonCLx() {
  x = 0;
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
  x = (x / y) * 100;
  afterBinaryOp();
}
function buttonPercentChange() {
  x = ((x - y) / y) * 100;
  afterBinaryOp();
}
function buttonPercent() {
  x = y * (x / 100);
  afterBinaryOp();
}

function buttonSwapXY() {
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
  x = 1 / x;
  showx();
}

function buttonYtoX() {
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
