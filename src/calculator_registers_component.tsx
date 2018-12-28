import * as React from 'react';
import {CashFlowEntry} from 'interfaces';
export interface CalculatorStackProps {
  x: number;
  y: number;
  stack3: number;
  stack4: number;
}

export interface CalculatorRegsProps {
  N: number;
  I: number;
  PV: number;
  PMT: number;
  FV: number;
  registers: Array<number>;
  wasSto: boolean;
}

export interface CashFlowProps {
  cashFlows: Array<CashFlowEntry>;
}

export class CalculatorStack extends React.Component<CalculatorStackProps, {}> {
  render() {
    return (
      <div>
        s4: <input readOnly type="text" width="20" value={this.props.stack4} />
        <br />
        s3: <input readOnly type="text" width="20" value={this.props.stack3} />
        <br />
        y: <input readOnly type="text" width="20" value={this.props.y} />
        <br />
        x: <input readOnly type="text" width="20" value={this.props.x} />
        <br />
      </div>
    );
  }
}

export class CalculatorRegisters extends React.Component<CalculatorRegsProps, {}> {
  render() {
    return (
      <div>
        R0 <input readOnly type="text" width="20" value={this.props.registers[0]} />
        <br />
        R1 <input readOnly type="text" width="20" value={this.props.registers[1]} />
        <br />
        R2 <input readOnly type="text" width="20" value={this.props.registers[2]} />
        <br />
        R3 <input readOnly type="text" width="20" value={this.props.registers[3]} />
        <br />
        R4 <input readOnly type="text" width="20" value={this.props.registers[4]} />
        <br />
        R5 <input readOnly type="text" width="20" value={this.props.registers[5]} />
        <br />
        R6 <input readOnly type="text" width="20" value={this.props.registers[6]} />
        <br />
        R7 <input readOnly type="text" width="20" value={this.props.registers[7]} />
        <br />
        R8 <input readOnly type="text" width="20" value={this.props.registers[8]} />
        <br />
        R9 <input readOnly type="text" width="20" value={this.props.registers[9]} />
        <br />
        N <input readOnly type="text" width="20" value={this.props.N} />
        <br />
        I <input readOnly type="text" width="20" value={this.props.I} />
        <br />
        PV <input readOnly type="text" width="20" value={this.props.PV} />
        <br />
        PMT <input readOnly type="text" width="20" value={this.props.PMT} />
        <br />
        FV <input readOnly type="text" width="20" value={this.props.FV} />
        <br />
        wassto <input readOnly type="text" value={'' + this.props.wasSto} /> <br />
      </div>
    );
  }
}

class CashFlowView extends React.Component<CashFlowEntry, {}> {
  render() {
    return (
      <div key={'cfv.' + this.props.flowNumber} id={'xxx.' + this.props.flowNumber}>
        Amount: {this.props.amount} Count: {this.props.count}
      </div>
    );
  }
}

export class CashFlows extends React.Component<CashFlowProps, {}> {
  render() {
    let rows = this.props.cashFlows.map(flow => (
      <CashFlowView
        key={'cfs.' + flow.flowNumber}
        amount={flow.amount}
        count={flow.count}
        flowNumber={flow.flowNumber}
      />
    ));
    return <div>{rows}</div>;
  }
}
