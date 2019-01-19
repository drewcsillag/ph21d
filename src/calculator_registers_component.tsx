import Decimal from 'decimal.js';
import * as React from 'react';
import {render} from 'react-dom';
import {connect, Provider} from 'react-redux';

import {CashFlowEntry, digit, EEXData, ProgramWord, ResultState, State} from './interfaces';
import {
  computeDisplay,
  computeEEXDisplay,
  displayCodeLine,
  nbspify,
  postprocessDisplay,
  zeroPad,
} from './util';
import { Store } from 'redux';

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
        <div>
          X&nbsp;
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
      // return commaify(this.props.x.toPrecision(this.props.xInpPrec).toString());
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
        className="display"
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
}
class RegisterDisplay extends React.Component<RegisterProps, {}> {
  public render() {
    return (
      <div>
        {this.props.label}&nbsp;
        <input readOnly={true} type="text" width="20" value={this.props.value.toString()} />
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
    return (
      <div>
        {this.props.label}&nbsp;
        <input readOnly={true} type="checkbox" checked={this.props.value} />
      </div>
    );
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
        <div style={style}>{regRowsCol1}</div>
        <div style={style}>{regRowsCol2}</div>
        <br />
        <div style={style}>
          <RegisterDisplay label="N" value={this.props.N} />
          <RegisterDisplay label="I" value={this.props.I} />
          <RegisterDisplay label="PV" value={this.props.PV} />
          <RegisterDisplay label="PMT" value={this.props.PMT} />
          <RegisterDisplay label="FV" value={this.props.FV} />
        </div>
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
    if (this.props.id !== 'buttonEnter' && this.props.id !== 'buttonEnter2') {
      return (
        <div id={this.props.id} className="calcbutton" style={this.calcStyle()}>
          <div className="F" dangerouslySetInnerHTML={{__html: this.props.fLabel || ' '}} />
          <div className="R" dangerouslySetInnerHTML={{__html: '<br/>' + this.props.label}} />
          <div className="G" dangerouslySetInnerHTML={{__html: this.props.gLabel || ' '}} />
        </div>
      );
    } else {
      if (this.props.buttonNo === '36') {
        return (
          <div id={this.props.id} className="button-enter-top" style={this.calcStyle()}>
            <div className="F">PREFIX</div>
            <div className="R">
              <br />
              Enter
            </div>
          </div>
        );
      } else {
        // assume buttonNo === 37
        return (
          <div id={this.props.id} className="button-enter-bottom" style={this.calcStyle()}>
            <div className="G">
              LST <i>x</i>
            </div>
          </div>
        );
      }
    }
  }
  private calcStyle(): React.CSSProperties {
    const nums = '0123456789';
    const row: number = nums.indexOf(this.props.buttonNo.charAt(0));
    let col: number = nums.indexOf(this.props.buttonNo.charAt(1));
    if (col === 0) {
      col = 10;
    }
    const p: React.CSSProperties = {
      position: 'relative',
      display: 'inline-block',
      top: '0',
      left: '0', // col >= 7 && row === 4 ? '89px' : '0px',
    };
    return p;
  }
}

interface FGButtonProps {
  label: string;
  buttonNo: string;
}
class FGButton extends React.Component<FGButtonProps, {}> {
  public render() {
    return (
      <div id={'button' + this.props.label} className={'button' + this.props.label}>
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
        <CalculatorButton id="buttonEnter" fLabel="PREFIX" label="ENT" buttonNo="36" />
        <CalculatorButton id="button1" label="1" gLabel="x&#770;,r" buttonNo="37" />
        <CalculatorButton id="button2" label="2" gLabel="y&#770;,r" buttonNo="38" />
        <CalculatorButton id="button3" label="3" gLabel="n!" buttonNo="39" />
        <CalculatorButton id="buttonMinus" label="&minus;" gLabel="←" buttonNo="30" />

        <CalculatorButton id="buttonOnOff" fLabel="OFF" label="ON" buttonNo="41" />
        <FGButton label="F" buttonNo="42" />
        <FGButton label="G" buttonNo="43" />
        <CalculatorButton id="buttonSTO" label="STO" buttonNo="44" />
        <CalculatorButton id="buttonRCL" label="RCL" buttonNo="45" />
        <CalculatorButton id="buttonEnter2" fLabel="PREFIX" label="ENT" buttonNo="46" />

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
}
class Indicators extends React.Component<IndicatorProps> {
  public render() {
    return (
      <div>
        <RegisterFlagDisplay label="F" value={this.props.wasF} />
        <RegisterFlagDisplay label="G" value={this.props.wasG} />
        <RegisterFlagDisplay label="STO" value={this.props.wasSto} />
        <RegisterFlagDisplay label="RCS" value={this.props.wasRcl} />
        <RegisterFlagDisplay label="PGM Running" value={this.props.programRunning} />
        <RegisterFlagDisplay label="PGM Editing" value={this.props.programMode} />
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
