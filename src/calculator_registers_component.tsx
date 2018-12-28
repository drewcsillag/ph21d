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
  wasRcl: boolean;
  wasG: boolean;
  wasF: boolean;
}

export interface CashFlowProps {
  cashFlowCounts: Array<number>;
  registers: Array<number>;
  N: number;
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
    let regRows = [];
    for (let i = 0; i < 10; i++) {
      regRows.push(
        <div key={'undot.' + i}>
          R{i} <input readOnly type="text" width="20" value={this.props.registers[i]} />
        </div>
      );
    }
    for (let i = 0; i < 10; i++) {
      regRows.push(
        <div key={'dot.' + i}>
          R.{i} <input readOnly type="text" width="20" value={this.props.registers[10 + i]} />
        </div>
      );
    }
    return (
      <div>
        {regRows}
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
        wasrcl <input readOnly type="text" value={'' + this.props.wasRcl} /> <br />
        F <input readOnly type="text" value={'' + this.props.wasF} /> <br />
        G <input readOnly type="text" value={'' + this.props.wasG} /> <br />
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
    let rows = [];
    for (let i = 0; i <= this.props.N; i++) {
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
