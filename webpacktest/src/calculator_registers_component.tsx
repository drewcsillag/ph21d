import * as React from 'react';

export interface CalculatorStackProps {
  x: number;
  y: number;
  stack3: number;
  stack4: number;
}

export interface CalculatorRegsProps {
  regN: number;
  regI: number;
  regPV: number;
  regPMT: number;
  regFV: number;
  registers: Array<number>;
}

export class CalculatorStack extends React.Component<CalculatorStackProps, {}> {
  render() {
    return (
      <div>
        s4: <input type="text" width="20" value={this.props.stack4} />
        <br />
        s3: <input type="text" width="20" value={this.props.stack3} />
        <br />
        y: <input type="text" width="20" value={this.props.y} />
        <br />
        x: <input type="text" width="20" value={this.props.x} />
        <br />
      </div>
    );
  }
}

export class CalculatorRegisters extends React.Component<CalculatorRegsProps, {}> {
  render() {
    return (
      <div>
        R0 <input type="text" width="20" value={this.props.registers[0]} />
        <br />
        R1 <input type="text" width="20" value={this.props.registers[1]} />
        <br />
        R2 <input type="text" width="20" value={this.props.registers[2]} />
        <br />
        R3 <input type="text" width="20" value={this.props.registers[3]} />
        <br />
        R4 <input type="text" width="20" value={this.props.registers[4]} />
        <br />
        R5 <input type="text" width="20" value={this.props.registers[5]} />
        <br />
        R6 <input type="text" width="20" value={this.props.registers[6]} />
        <br />
        R7 <input type="text" width="20" value={this.props.registers[7]} />
        <br />
        R8 <input type="text" width="20" value={this.props.registers[8]} />
        <br />
        R9 <input type="text" width="20" value={this.props.registers[9]} />
        <br />
        N <input type="text" width="20" value={this.props.regN} />
        <br />
        I <input type="text" width="20" value={this.props.regI} />
        <br />
        PV <input type="text" width="20" value={this.props.regPV} />
        <br />
        PMT <input type="text" width="20" value={this.props.regPMT} />
        <br />
        FV <input type="text" width="20" value={this.props.regFV} />
        <br />
      </div>
    );
  }
}
