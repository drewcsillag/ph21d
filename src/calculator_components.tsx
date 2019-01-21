import {VisibilityProperty} from 'csstype';
import Decimal from 'decimal.js';
import * as React from 'react';
import {render} from 'react-dom';
import {connect, Provider} from 'react-redux';
import {Store} from 'redux';
import {isUndefined} from 'util';
import {CashFlowEntry, digit, EEXData, ProgramWord, ResultState, State} from './interfaces';
import {
  computeDisplay,
  computeEEXDisplay,
  displayCodeLine,
  nbspify,
  postprocessDisplay,
  zeroPad,
} from './util';
interface CalculatorStackProps {
  x: Decimal;
  xInpPrec: number;
  y: Decimal;
  z: Decimal;
  t: Decimal;
  hasInput: boolean;
  fPrecision: number;
  inputChars: string;
  error: digit | null;
  programMode: boolean;
  programEditCounter: number;
  programMemory: ProgramWord[];
  programCounter: number;
  displaySpecial?: string;
  wasResult: ResultState;
  eexValue: EEXData;
}

interface CalculatorRegsProps {
  N: Decimal;
  I: Decimal;
  PV: Decimal;
  PMT: Decimal;
  FV: Decimal;
  registers: Decimal[];
  wasSto: boolean;
  wasRcl: boolean;
  wasG: boolean;
  wasF: boolean;
  lastX: Decimal;
}

interface CashFlowProps {
  cashFlowCounts: Decimal[];
  registers: Decimal[];
  N: Decimal;
}
class CalculatorStack extends React.Component<CalculatorStackProps, {}> {
  public render() {
    return (
      <div>
        <RegisterDisplay label="T" value={this.props.t} />
        <RegisterDisplay label="Z" value={this.props.z} />
        <RegisterDisplay label="Y" value={this.props.y} />
        <div id="displayX">
          X&nbsp;&nbsp;
          <span className="display" dangerouslySetInnerHTML={{__html: this.getDisplay()}} />
        </div>
        {this.displayInstruction()}
      </div>
    );
  }
  private getDisplay() {
    try {
      return this.internalGetDisplay();
    } catch (e) {
      console.log('error displaying:', e);
      return 'EXC:' + this.props.x.toNumber();
    }
  }

  private internalGetDisplay() {
    if (this.props.error !== null) {
      return 'ERROR: ' + this.props.error;
    }
    // special display
    if (this.props.displaySpecial !== null) {
      return this.props.displaySpecial;
    }
    // eex mode
    if (this.props.eexValue !== null) {
      const eexValue = this.props.eexValue;
      const zp = zeroPad(eexValue.exponent, 2);
      const expString = (eexValue.positive ? '   ' : ' - ') + zp.charAt(0) + ' ' + zp.charAt(1);
      return nbspify(computeDisplay(eexValue.origX, 7, 7) + expString);
    }
    // normal entry
    if (this.props.xInpPrec !== 0 && ResultState.NONE === this.props.wasResult) {
      return nbspify(postprocessDisplay(this.props.x.toPrecision(this.props.xInpPrec).toString()));
    }
    // programming mode
    if (this.props.programMode) {
      return nbspify(
        displayCodeLine(
          this.props.programEditCounter,
          this.props.programMemory[this.props.programEditCounter]
        )
      );
    }

    // scientific notation mode
    if (this.props.fPrecision === -1) {
      const res = nbspify(computeEEXDisplay(this.props.x));
      console.log('get display', res);
      return res;
    }
    // regular
    return nbspify(computeDisplay(this.props.x, this.props.fPrecision));
  }

  private displayInstruction() {
    return (
      <div
        className="displayInsn"
        dangerouslySetInnerHTML={{
          __html: displayCodeLine(
            this.props.programCounter,
            this.props.programMemory[this.props.programCounter]
          ).replace(' ', '&nbsp;'),
        }}
      />
    );
  }
}

interface RegisterProps {
  label: string;
  value: Decimal;
  isFinreg?: boolean;
}
class RegisterDisplay extends React.Component<RegisterProps, {}> {
  public render() {
    const finClass =
      !isUndefined(this.props.isFinreg) && this.props.isFinreg ? 'finreg' : 'notfinreg';
    return (
      <div className={finClass}>
        {this.props.label} &nbsp;
        <input
          readOnly={true}
          type="text"
          width="20"
          className="regDisplay"
          value={this.props.value.toPrecision(10) /*toString()*/}
        />
      </div>
    );
  }
}

interface RegisterFlagProps {
  value: boolean;
  label: string;
}
class RegisterFlagDisplay extends React.Component<RegisterFlagProps, {}> {
  public render() {
    const vp: VisibilityProperty = this.props.value ? 'visible' : 'hidden';
    const style = {
      display: 'inline',
      color: 'blue',
      visibility: vp,
    };
    return <div style={style}>&nbsp;&nbsp;&nbsp;&nbsp;{this.props.label}</div>;
  }
}
class CalculatorRegisters extends React.Component<CalculatorRegsProps, {}> {
  public render() {
    const regRowsCol1 = [];
    for (let i = 0; i < 10; i++) {
      regRowsCol1.push(
        <RegisterDisplay label={'R' + i} key={'undot.' + i} value={this.props.registers[i]} />
      );
    }
    const regRowsCol2 = [];
    for (let i = 0; i < 10; i++) {
      regRowsCol2.push(
        <RegisterDisplay label={'R.' + i} key={'dot.' + i} value={this.props.registers[10 + i]} />
      );
    }
    const style = {display: 'inline-block'};
    return (
      <div>
        <div>
          <RegisterDisplay isFinreg={true} label="N" value={this.props.N} />
          <RegisterDisplay isFinreg={true} label="I" value={this.props.I} />
          <RegisterDisplay isFinreg={true} label="PV" value={this.props.PV} />
          <RegisterDisplay isFinreg={true} label="PMT" value={this.props.PMT} />
          <RegisterDisplay isFinreg={true} label="FV" value={this.props.FV} />
        </div>

        <div style={style}>{regRowsCol1}</div>
        <div style={style}>{regRowsCol2}</div>
        <br />
        <div style={style}>
          <RegisterDisplay label="LastX" value={this.props.lastX} />
        </div>
      </div>
    );
  }
}

class CashFlowView extends React.Component<CashFlowEntry, {}> {
  public render() {
    return (
      <div key={'cfv.' + this.props.flowNumber} id={'xxx.' + this.props.flowNumber}>
        Flow: {this.props.flowNumber} Amount: {this.props.amount.toNumber()} Count:{' '}
        {this.props.count.toNumber()}
      </div>
    );
  }
}

class CashFlows extends React.Component<CashFlowProps, {}> {
  public render() {
    const rows = [];
    let limit = this.props.N.toNumber();
    if (limit >= 20) {
      limit = 19;
    }
    for (let i = 0; i <= limit; i++) {
      rows.push(
        <CashFlowView
          key={'cfs.' + i}
          amount={this.props.registers[i]}
          count={this.props.cashFlowCounts[i]}
          flowNumber={i}
        />
      );
    }
    return <div>{rows}</div>;
  }
}

interface ButtonProps {
  id: string;
  fLabel?: string;
  label: string;
  gLabel?: string;
  buttonNo: string;
}

class CalculatorButton extends React.Component<ButtonProps, {}> {
  public render() {
    let className = 'calcbutton';
    if (this.props.id === 'buttonEnter') {
      className = 'button-enter';
    }
    return (
      <div id={this.props.id} className={className} style={this.calcStyle()}>
        <div className="F" dangerouslySetInnerHTML={{__html: this.props.fLabel || ' '}} />
        <div className="R" dangerouslySetInnerHTML={{__html: '<br/>' + this.props.label}} />
        <div className="G" dangerouslySetInnerHTML={{__html: this.props.gLabel || ' '}} />
      </div>
    );
  }

  protected calcStyle(): React.CSSProperties {
    const row = Math.floor(Number(this.props.buttonNo) / 10);
    const col = Math.floor(Number(this.props.buttonNo) % 10);
    return {
      position: 'absolute',
      display: 'inline-block',
      top: (row - 1) * 90 + 'px',
      left: 90 * ((col === 0 ? 10 : col) - 1) + 'px',
    };
  }
}

class FGButton extends CalculatorButton {
  public render() {
    return (
      <div id={this.props.id} className={'button' + this.props.label} style={this.calcStyle()}>
        <div className="innerFG">{this.props.label}</div>
      </div>
    );
  }
}
class CalculatorButtons extends React.Component<{}, {}> {
  public render() {
    return (
      <div className="buttonBox">
        <CalculatorButton id="buttonN" fLabel="Amort" label="n" gLabel="12&times;" buttonNo="11" />
        <CalculatorButton id="buttonI" fLabel="INT" label="i" gLabel="12÷" buttonNo="12" />
        <CalculatorButton
          id="buttonPV"
          fLabel="NPV"
          label="PV"
          gLabel="CF<sub>0</sub>"
          buttonNo="13"
        />
        <CalculatorButton
          id="buttonPMT"
          fLabel="RND"
          label="PMT"
          gLabel="CF<sub>j</sub>"
          buttonNo="14"
        />
        <CalculatorButton
          id="buttonFV"
          fLabel="IRR"
          label="FV"
          gLabel="N<sub>j</sub>"
          buttonNo="15"
        />
        <CalculatorButton id="buttonCHS" label="CHS" gLabel="DATE" buttonNo="16" />
        <CalculatorButton id="button7" label="7" gLabel="BEG" buttonNo="17" />
        <CalculatorButton id="button8" label="8" gLabel="END" buttonNo="18" />
        <CalculatorButton id="button9" label="9" gLabel="MEM" buttonNo="19" />
        <CalculatorButton id="buttonDiv" label="÷" buttonNo="10" />

        <CalculatorButton
          id="buttonYtoX"
          fLabel="PRICE"
          label="y<sup>x</sup>"
          gLabel="&radic;x"
          buttonNo="21"
        />
        <CalculatorButton
          id="buttonRecipX"
          fLabel="YTM"
          label="1/x"
          gLabel="e<sup>x</sup>"
          buttonNo="22"
        />
        <CalculatorButton
          id="buttonPercentTotal"
          fLabel="SL"
          label="%T"
          gLabel="LN"
          buttonNo="23"
        />
        <CalculatorButton
          id="buttonPercentChange"
          fLabel="SOYD"
          label="Δ%"
          gLabel="FRAC"
          buttonNo="24"
        />
        <CalculatorButton id="buttonPercent" fLabel="DB" label="%" gLabel="INTG" buttonNo="25" />
        <CalculatorButton id="buttonEEX" label="EEX" gLabel="ΔDAYS" buttonNo="26" />
        <CalculatorButton id="button4" label="4" gLabel="D.MY" buttonNo="27" />
        <CalculatorButton id="button5" label="5" gLabel="M.DY" buttonNo="28" />
        <CalculatorButton id="button6" label="6" gLabel="x̅w" buttonNo="29" />
        <CalculatorButton id="buttonTimes" label="&times;" gLabel="x²" buttonNo="20" />

        <CalculatorButton id="buttonRunStop" fLabel="P/R" label="R/S" gLabel="PSE" buttonNo="31" />
        <CalculatorButton id="buttonSingleStep" fLabel="Σ" label="SST" gLabel="BST" buttonNo="32" />
        <CalculatorButton
          id="buttonRotateStack"
          fLabel="PRGM"
          label="R↓"
          gLabel="GTO"
          buttonNo="33"
        />
        <CalculatorButton id="buttonSwapXY" fLabel="FIN" label="x↔y" gLabel="x≤y" buttonNo="34" />
        <CalculatorButton id="buttonCLx" fLabel="REG" label="CLx" gLabel="x=0" buttonNo="35" />
        <CalculatorButton
          id="buttonEnter"
          fLabel="PREFIX"
          label="ENT"
          buttonNo="36"
          gLabel="LST<i>x</i>"
        />
        <CalculatorButton id="button1" label="1" gLabel="x&#770;,r" buttonNo="37" />
        <CalculatorButton id="button2" label="2" gLabel="y&#770;,r" buttonNo="38" />
        <CalculatorButton id="button3" label="3" gLabel="n!" buttonNo="39" />
        <CalculatorButton id="buttonMinus" label="&minus;" gLabel="←" buttonNo="30" />

        <CalculatorButton id="buttonOnOff" fLabel="OFF" label="ON" buttonNo="41" />
        <FGButton id="buttonF" label="F" buttonNo="42" />
        <FGButton id="buttonG" label="G" buttonNo="43" />
        <CalculatorButton id="buttonSTO" label="STO" buttonNo="44" />
        <CalculatorButton id="buttonRCL" label="RCL" buttonNo="45" />

        <CalculatorButton id="button0" label="0" gLabel="x&#772;" buttonNo="47" />
        <CalculatorButton id="buttonPoint" label="." gLabel="s" buttonNo="48" />
        <CalculatorButton id="buttonSigmaPlus" label="Σ+" gLabel="Σ-" buttonNo="49" />
        <CalculatorButton id="buttonPlus" label="+" gLabel="LST <i>x</i>" buttonNo="40" />
      </div>
    );
  }
}

interface ProgramInfoProps {
  programCounter: number;
  programEditCounter: number;
}
class ProgramInfo extends React.Component<ProgramInfoProps> {
  public render() {
    return (
      <div>
        PC: {this.props.programCounter}
        <br />
        PEC: {this.props.programEditCounter}
      </div>
    );
  }
}

interface IndicatorProps {
  wasF: boolean;
  wasG: boolean;
  wasSto: boolean;
  wasRcl: boolean;
  programRunning: boolean;
  programMode: boolean;
  mDotDY: boolean;
  begEnd: Decimal;
  simpleInterest: boolean;
}
class Indicators extends React.Component<IndicatorProps> {
  public render() {
    return (
      <div>
        <RegisterFlagDisplay label="f" value={this.props.wasF} />
        <RegisterFlagDisplay label="g" value={this.props.wasG} />
        <RegisterFlagDisplay label="BEGIN" value={this.props.begEnd.equals(1)} />
        <RegisterFlagDisplay label="D.MY" value={!this.props.mDotDY} />
        <RegisterFlagDisplay label="PRGM" value={this.props.programMode} />
        <RegisterFlagDisplay label="C" value={this.props.simpleInterest} />
        <RegisterFlagDisplay label="STO" value={this.props.wasSto} />
        <RegisterFlagDisplay label="RCL" value={this.props.wasRcl} />
        <RegisterFlagDisplay label="PRGM Running" value={this.props.programRunning} />
      </div>
    );
  }
}
class CalcApp extends React.Component<State, {}> {
  public render() {
    return (
      <div>
        <CalculatorStack {...this.props} />
        <CalculatorButtons {...this.props} />
        <span>
          <Indicators {...this.props} />
          <ProgramInfo {...this.props} />
          <CalculatorRegisters {...this.props} />
          <CashFlows {...this.props} />
        </span>
      </div>
    );
  }
}

function identity(x: State): State {
  return x;
}

function nullx() {
  return {};
}

const HookedApp = connect<State, {}, any>(
  identity,
  nullx
)(CalcApp);

export function renderUI(store: Store) {
  render(
    <Provider store={store}>
      <HookedApp />
    </Provider>,
    document.getElementById('app')
  );
}
