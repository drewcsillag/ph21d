import * as React from 'react';
import {CashFlowEntry} from 'interfaces';
import {State} from 'interfaces';

interface CalculatorStackProps {
  x: number;
  y: number;
  stack3: number;
  stack4: number;
}

interface CalculatorRegsProps {
  N: number;
  I: number;
  PV: number;
  PMT: number;
  FV: number;
  registers: Array<number>;
  wasSto: boolean;
  wasRcl: boolean;
  wasG: boolean;
  wasF: boolean;
  lastX: number;
}

interface CashFlowProps {
  cashFlowCounts: Array<number>;
  registers: Array<number>;
  N: number;
}

class CalculatorStack extends React.Component<CalculatorStackProps, {}> {
  render() {
    return (
      <div>
        <RegisterDisplay label="S4" value={this.props.stack4} />
        <RegisterDisplay label="S3" value={this.props.stack3} />
        <RegisterDisplay label="Y" value={this.props.y} />
        <RegisterDisplay label="X" value={this.props.x} />
      </div>
    );
  }
}

interface RegisterProps {
  label: string;
  value: number;
}
class RegisterDisplay extends React.Component<RegisterProps, {}> {
  render() {
    return (
      <div>
        {this.props.label}&nbsp;
        <input readOnly type="text" width="20" value={this.props.value} />
      </div>
    );
  }
}

interface RegisterFlagProps {
  value: boolean;
  label: string;
}
class RegisterFlagDisplay extends React.Component<RegisterFlagProps, {}> {
  render() {
    return (
      <div>
        {this.props.label}&nbsp;
        <input readOnly type="checkbox" checked={this.props.value} />
      </div>
    );
  }
}
class CalculatorRegisters extends React.Component<CalculatorRegsProps, {}> {
  render() {
    let regRowsCol1 = [];
    for (let i = 0; i < 10; i++) {
      regRowsCol1.push(
        <RegisterDisplay label={'R' + i} key={'undot.' + i} value={this.props.registers[i]} />
      );
    }
    let regRowsCol2 = [];
    for (let i = 0; i < 10; i++) {
      regRowsCol2.push(
        <RegisterDisplay label={'R.' + i} key={'dot.' + i} value={this.props.registers[10 + i]} />
      );
    }
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <td>{regRowsCol1}</td>
              <td>{regRowsCol2}</td>
            </tr>
            <tr>
              <td>
                <RegisterDisplay label="N" value={this.props.N} />
                <RegisterDisplay label="I" value={this.props.I} />
                <RegisterDisplay label="PV" value={this.props.PV} />
                <RegisterDisplay label="PMT" value={this.props.PMT} />
                <RegisterDisplay label="FV" value={this.props.FV} />
              </td>
              <td>
                <RegisterDisplay label="LastX" value={this.props.lastX} />
                <RegisterFlagDisplay label="F" value={this.props.wasF} />
                <RegisterFlagDisplay label="G" value={this.props.wasG} />
                <RegisterFlagDisplay label="STO" value={this.props.wasSto} />
                <RegisterFlagDisplay label="RCS" value={this.props.wasRcl} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

class CashFlowView extends React.Component<CashFlowEntry, {}> {
  render() {
    return (
      <div key={'cfv.' + this.props.flowNumber} id={'xxx.' + this.props.flowNumber}>
        Flow: {this.props.flowNumber} Amount: {this.props.amount} Count: {this.props.count}
      </div>
    );
  }
}

class CashFlows extends React.Component<CashFlowProps, {}> {
  render() {
    let rows = [];
    let limit = this.props.N;
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
}

class CalculatorButton extends React.Component<ButtonProps, {}> {
  render() {
    return (
      <td>
        <div id={this.props.id} className="calcbutton">
          <div className="F" dangerouslySetInnerHTML={{__html: this.props.fLabel || ' '}} />
          <div className="R" dangerouslySetInnerHTML={{__html: this.props.label}} />
          <div className="G" dangerouslySetInnerHTML={{__html: this.props.gLabel || ' '}} />
        </div>
      </td>
    );
  }
}

interface FGButtonProps {
  label: string;
}
class FGButton extends React.Component<FGButtonProps, {}> {
  render() {
    return (
      <td>
        <div id={'button' + this.props.label} className={'button' + this.props.label}>
          <div className="innerFG">{this.props.label}</div>
        </div>
      </td>
    );
  }
}
export class CalculatorButtons extends React.Component<{}, {}> {
  render() {
    return (
      <table>
        <tbody>
          <tr>
            <CalculatorButton id="buttonN" fLabel="Amort" label="n" gLabel="12x" />
            <CalculatorButton id="buttonI" fLabel="INT" label="i" gLabel="12/" />
            <CalculatorButton id="buttonPV" fLabel="NPV" label="PV" gLabel="CF<sub>0</sub>" />
            <CalculatorButton id="buttonPMT" fLabel="RND" label="PMT" gLabel="CF<sub>j</sub>" />
            <CalculatorButton id="buttonFV" fLabel="IRR" label="FV" gLabel="N<sub>j</sub>" />
            <CalculatorButton id="buttonCHS" label="CHS" gLabel="DATE" />
            <CalculatorButton id="button7" label="7" gLabel="BEG" />
            <CalculatorButton id="button8" label="8" gLabel="END" />
            <CalculatorButton id="button9" label="9" gLabel="MEM" />
            <CalculatorButton id="buttonDiv" label="÷" />
          </tr>
          <tr>
            <CalculatorButton
              id="buttonYtoX"
              fLabel="PRICE"
              label="y<sup>x</sup>"
              gLabel="&radic;x"
            />
            <CalculatorButton id="buttonRecipX" fLabel="YTM" label="1/x" gLabel="e<sup>x</sup>" />
            <CalculatorButton id="buttonPercentTotal" fLabel="SL" label="%T" gLabel="LN" />
            <CalculatorButton id="buttonPercentChange" fLabel="SOYD" label="Δ" gLabel="FRAC" />
            <CalculatorButton id="buttonPercent" fLabel="DB" label="%" gLabel="INTG" />
            <CalculatorButton id="buttonEEX" label="EEX" gLabel="ΔDAYS" />
            <CalculatorButton id="button4" label="4" gLabel="D.MY" />
            <CalculatorButton id="button5" label="5" gLabel="M.DY" />
            <CalculatorButton id="button6" label="6" gLabel="x̅w" />
            <CalculatorButton id="buttonTimes" label="x" gLabel="x²" />
          </tr>
          <tr>
            <CalculatorButton id="buttonRunStop" fLabel="P/R" label="R/S" gLabel="PSE" />
            <CalculatorButton id="buttonSingleStep" fLabel="Σ" label="SST" gLabel="BST" />
            <CalculatorButton id="buttonRotateStack" fLabel="PRGM" label="R↓" gLabel="GTO" />
            <CalculatorButton id="buttonSwapXY" fLabel="FIN" label="x↔y" gLabel="x≤y" />
            <CalculatorButton id="buttonCLx" fLabel="REG" label="CLx" gLabel="x=0" />
            <CalculatorButton id="buttonEnter" fLabel="PREFIX" label="ENT" />
            <CalculatorButton id="button1" label="1" gLabel="x&#770;,r" />
            <CalculatorButton id="button2" label="2" gLabel="y&#770;,r" />
            <CalculatorButton id="button3" label="3" gLabel="n!" />
            <CalculatorButton id="buttonMinus" label="-" gLabel="←" />
          </tr>
          <tr>
            <CalculatorButton id="buttonOnOff" fLabel="OFF" label="ON" />
            <FGButton label="F" />
            <FGButton label="G" />
            <CalculatorButton id="buttonSTO" label="STO" />
            <CalculatorButton id="buttonRCL" label="RCL" />
            <CalculatorButton id="buttonSecondEnter" fLabel="PREFIX" label="ENT" />
            <CalculatorButton id="button0" label="0" gLabel="̅x" />
            <CalculatorButton id="buttonPoint" label="." gLabel="s" />
            <CalculatorButton id="buttonSigmaPlus" label="Σ+" gLabel="Σ-" />
            <CalculatorButton id="buttonPlus" label="+" gLabel="LST x" />
          </tr>
        </tbody>
      </table>
    );
  }
}

export class CalcApp extends React.Component<State, {}> {
  render() {
    return (
      <div>
        <CalculatorStack {...this.props} />
        <CalculatorButtons {...this.props} />
        <span>
          <CalculatorRegisters {...this.props} />
          <CashFlows {...this.props} />
        </span>
      </div>
    );
  }
}
