/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "button2", function() { return button2; });
var x = 0;
var y = 0;
var stack3 = 0;
var stack4 = 0;
var dec = 0;
var g = 0;
var f = 0;
var wasresult = 0;
var registers = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var N = 0;
var I = 0;
var PV = 0;
var PMT = 0;
var FV = 0;
var hasInput = 0;
var begend = 0;
var wasrcl = 0;
var wassto = 0;
function setValue(id, value) {
    document.getElementById(id).value = value;
}
/// doesn't do sto op number
function showx() {
    setValue('output', x);
    setValue('y', y);
    setValue('s3', stack3);
    setValue('s4', stack4);
    for (var i = 0; i < 10; i++) {
        setValue('reg' + i, registers[i]);
    }
    setValue('regN', N);
    setValue('regI', I);
    setValue('regPV', PV);
    setValue('regPMT', PMT);
    setValue('regFV', FV);
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
        hasInput = 1;
        return;
    }
    if (wassto) {
        registers[n] = x;
        wassto = 0;
        wasresult = 1;
        showx();
        //FIXME hasInput?
        return;
    }
    hasInput = 1;
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
    }
    else {
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
function buttonF() {
    f = 1;
    wassto = 0;
    wasrcl = 0;
    g = 0;
}
function button0() {
    if (g) {
        // mean
        g = 0;
        x = registers[2] / registers[1];
        y = registers[4] / registers[1];
        wasresult = 1;
        hasInput = 1;
        showx();
        return;
    }
    number(0);
}
function computeABr() {
    var sy = registers[4];
    var sy2 = registers[5];
    var n = registers[1];
    var sx = registers[2];
    var sxy = registers[6];
    var sx2 = registers[3];
    var Bnum = sxy - (sx * sy) / n;
    var Bden = sx2 - (sx * sx) / n;
    var B = Bnum / Bden;
    var A = sy / n - B * (sx / n);
    var Rnum = sxy - (sx * sy) / n;
    var Rden1 = sx2 - (sx * sx) / n;
    var Rden2 = sy2 - (sy * sy) / n;
    var R = Rnum / Math.pow((Rden1 * Rden2), 0.5);
    return [A, B, R];
}
function button1() {
    if (g) {
        // xhat, r
        var ab = computeABr();
        var A = ab[0];
        var B = ab[1];
        var R = ab[2];
        x = (x - A) / B;
        y = R;
        wasresult = 1;
        hasInput = 1;
        g = 0;
        showx();
        return;
    }
    number(1);
}
function button2() {
    if (g) {
        // yhat,r
        var ab = computeABr();
        var A = ab[0];
        var B = ab[1];
        var R = ab[2];
        x = A + B * x;
        y = R;
        wasresult = 1;
        hasInput = 1;
        g = 0;
        showx();
        return;
    }
    number(2);
}
function afterGUnary() {
    g = 0;
    wasresult = 1;
    hasInput = 1;
    showx();
}
function button3() {
    if (g) {
        // factorial
        var c = x;
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
        hasInput = 1;
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
        var n = registers[1];
        var sx = registers[2];
        var sx2 = registers[3];
        var sy = registers[4];
        var sy2 = registers[5];
        var den = n * (n - 1);
        var xnum = n * sx2 - Math.pow(sx, 2);
        x = Math.pow((xnum / den), 0.5);
        var ynum = n * sy2 - Math.pow(sy, 2);
        y = Math.pow((ynum / den), 0.5);
        g = 0;
        showx();
        wasresult = 1;
        hasInput = 1;
        return;
    }
    dec = 1;
    showx();
}
function buttonSingleStep() {
    if (f) {
        // clear stats
        for (var i = 1; i < 7; i++) {
            registers[i] = 0;
        }
        f = 0;
        hasInput = 0;
        return;
    }
    alert('notimplemented');
}
function buttonCLx() {
    if (f) {
        for (var i = 0; i < 10; i++) {
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
    hasInput = 0;
    x = 0;
    dec = 0;
    showx();
}
function afterBinaryOp() {
    y = stack3;
    stack3 = stack4;
    wasresult = 1;
    hasInput = 1;
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
function frac(n) {
    var wasneg = 1;
    if (n < 0) {
        wasneg = -1;
    }
    return wasneg * (n * wasneg - Math.floor(n * wasneg));
}
function buttonPercentChange() {
    if (g) {
        x = frac(x);
        afterGUnary();
        return;
    }
    x = ((x - y) / y) * 100;
    afterBinaryOp();
}
function intg(n) {
    var wasneg = 1;
    if (n < 0) {
        wasneg = -1;
    }
    return Math.floor(n * wasneg) * wasneg;
}
function buttonPercent() {
    if (g) {
        x = intg(x);
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
        showx();
        return;
    }
    var t = x;
    x = y;
    y = t;
    hasInput = 1;
    showx();
}
function buttonRotateStack() {
    var t = x;
    x = y;
    y = stack3;
    stack3 = stack4;
    stack4 = t;
    hasInput = 1;
    showx();
}
function buttonRecipX() {
    if (g) {
        x = Math.exp(x);
        afterGUnary();
        return;
    }
    x = 1 / x;
    hasInput = 1;
    showx();
}
function buttonYtoX() {
    if (g) {
        x = Math.pow(x, 0.5);
        afterGUnary();
        return;
    }
    x = Math.pow(y, x);
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
    }
    else {
        registers[1] += 1;
        registers[2] += x;
        registers[3] += x * x;
        registers[4] += y;
        registers[5] += y * y;
        registers[6] += x * y;
    }
    x = registers[1];
    wasresult = 2;
    hasInput = 1;
    showx();
}
function buttonN() {
    //TODO F
    if (hasInput) {
        if (g) {
            N = 12 * x;
            g = 0;
        }
        else {
            N = x;
        }
    }
    else {
        x = computeN();
        N = x;
    }
    hasInput = 0;
    wasresult = 1;
    showx();
}
function buttonI() {
    //TODO F
    if (hasInput) {
        if (g) {
            I = x / 12;
            g = 0;
        }
        else {
            I = x;
        }
    }
    else {
        x = computeI();
        wasresult = 1;
        I = x;
    }
    hasInput = 0;
    showx();
}
function buttonPV() {
    //TODO F/G
    if (hasInput) {
        PV = x;
    }
    else {
        computePV();
        wasresult = 1;
    }
    showx();
}
function buttonPMT() {
    //TODO F/G
    if (hasInput) {
        PMT = x;
    }
    else {
        computePMT();
        wasresult = 1;
    }
    showx();
}
function buttonFV() {
    //TODO F/G
    if (hasInput) {
        FV = x;
    }
    else {
        computeFV();
        wasresult = 1;
    }
    showx();
}
function computeN() {
    return 0;
}
function computeI() {
    return 0;
}
function computePMT() {
    var i = I / 100;
    var p1 = PV * Math.pow((1 + i), frac(N));
    var f1 = FV * Math.pow((1 + i), -intg(N));
    var bigI = (1 - Math.pow((1 + i), -intg(N))) / i;
    var b1 = 1 + i * begend;
    PMT = -((p1 + f1) / (b1 * bigI));
    x = PMT;
}
function computePV() {
    var i = I / 100;
    var f1 = FV * Math.pow((1 + i), -intg(N));
    var bigI = (1 - Math.pow((1 + i), -intg(N))) / i;
    var b1 = 1 + i * begend;
    PV = -((f1 + b1 * PMT * bigI) / Math.pow((1 + i), frac(N)));
    x = PV;
}
function computeFV() {
    var i = I / 100;
    var p1 = PV * Math.pow((1 + i), frac(N));
    var bigI = (1 - Math.pow((1 + i), -intg(N))) / i;
    var b1 = 1 + i * begend;
    FV = -((p1 + b1 * PMT * bigI) / Math.pow((1 + i), -intg(N)));
    x = FV;
}
function buttonEEX() {
    ///TODO
}
function buttonRunStop() {
    ///TODO
}
function buttonOnOff() {
    ///TODO
}
window.document.getElementById('buttonN').addEventListener('click', buttonN);
window.document.getElementById('buttonI').addEventListener('click', buttonI);
window.document.getElementById('buttonPV').addEventListener('click', buttonPV);
window.document.getElementById('buttonPMT').addEventListener('click', buttonPMT);
window.document.getElementById('buttonFV').addEventListener('click', buttonFV);
window.document.getElementById('buttonCHS').addEventListener('click', buttonCHS);
window.document.getElementById('button7').addEventListener('click', button7);
window.document.getElementById('button8').addEventListener('click', button8);
window.document.getElementById('button9').addEventListener('click', button9);
window.document.getElementById('buttonDiv').addEventListener('click', buttonDiv);
window.document.getElementById('buttonYtoX').addEventListener('click', buttonYtoX);
window.document.getElementById('buttonRecipX').addEventListener('click', buttonRecipX);
window.document.getElementById('buttonPercentTotal').addEventListener('click', buttonPercentTotal);
window.document
    .getElementById('buttonPercentChange')
    .addEventListener('click', buttonPercentChange);
window.document.getElementById('buttonPercent').addEventListener('click', buttonPercent);
window.document.getElementById('buttonEEX').addEventListener('click', buttonEEX);
window.document.getElementById('button4').addEventListener('click', button4);
window.document.getElementById('button5').addEventListener('click', button5);
window.document.getElementById('button6').addEventListener('click', button6);
window.document.getElementById('buttonTimes').addEventListener('click', buttonTimes);
window.document.getElementById('buttonRunStop').addEventListener('click', buttonRunStop);
window.document.getElementById('buttonSingleStep').addEventListener('click', buttonSingleStep);
window.document.getElementById('buttonRotateStack').addEventListener('click', buttonRotateStack);
window.document.getElementById('buttonSwapXY').addEventListener('click', buttonSwapXY);
window.document.getElementById('buttonCLx').addEventListener('click', buttonCLx);
window.document.getElementById('buttonEnter').addEventListener('click', buttonEnter);
window.document.getElementById('button1').addEventListener('click', button1);
window.document.getElementById('button2').addEventListener('click', button2);
window.document.getElementById('button3').addEventListener('click', button3);
window.document.getElementById('buttonMinus').addEventListener('click', buttonMinus);
window.document.getElementById('buttonOnOff').addEventListener('click', buttonOnOff);
window.document.getElementById('buttonF').addEventListener('click', buttonF);
window.document.getElementById('buttonG').addEventListener('click', buttonG);
window.document.getElementById('buttonSTO').addEventListener('click', buttonSTO);
window.document.getElementById('buttonRCL').addEventListener('click', buttonRCL);
window.document.getElementById('button0').addEventListener('click', button0);
window.document.getElementById('buttonPoint').addEventListener('click', buttonPoint);
window.document.getElementById('buttonSigmaPlus').addEventListener('click', buttonSigmaPlus);
window.document.getElementById('buttonPlus').addEventListener('click', buttonPlus);
showx();


/***/ })
/******/ ]);