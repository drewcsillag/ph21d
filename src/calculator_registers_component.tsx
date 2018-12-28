import * as React from 'react';
import {CashFlowEntry} from 'interfaces';
import {State} from 'interfaces';
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
    let regRowsCol1 = [];
    for (let i = 0; i < 10; i++) {
      regRowsCol1.push(
        <div key={'undot.' + i}>
          R{i} <input readOnly type="text" width="20" value={this.props.registers[i]} />
        </div>
      );
    }
    let regRowsCol2 = [];
    for (let i = 0; i < 10; i++) {
      regRowsCol2.push(
        <div key={'dot.' + i}>
          R.{i} <input readOnly type="text" width="20" value={this.props.registers[10 + i]} />
        </div>
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
                N <input readOnly type="text" width="20" value={this.props.N} />
                <br />
                I <input readOnly type="text" width="20" value={this.props.I} />
                <br />
                PV <input readOnly type="text" width="20" value={this.props.PV} />
                <br />
                PMT <input readOnly type="text" width="20" value={this.props.PMT} />
                <br />
                FV <input readOnly type="text" width="20" value={this.props.FV} />
              </td>
              <td>
                F <input readOnly type="text" value={'' + this.props.wasF} /> <br />
                G <input readOnly type="text" value={'' + this.props.wasG} /> <br />
                wassto <input readOnly type="text" value={'' + this.props.wasSto} /> <br />
                wasrcl <input readOnly type="text" value={'' + this.props.wasRcl} />
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

export class CashFlows extends React.Component<CashFlowProps, {}> {
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

export interface CalculatorButtonsProps {
  N: number; // need something here to placate lint;
}

export class CalculatorButtons extends React.Component<CalculatorButtonsProps, {}> {
  render() {
    return (
      <table>
        <tbody>
          <tr>
            <td>
              <div id="buttonN" className="calcbutton">
                <div className="F">Amort</div>
                <div className="R">n</div>
                <div className="G">12x</div>
              </div>
            </td>
            <td>
              <div id="buttonI" className="calcbutton">
                <div className="F">INT</div>
                <div className="R">i</div>
                <div className="G">12/</div>
              </div>
            </td>
            <td>
              <div id="buttonPV" className="calcbutton">
                <div className="F">NPV</div>
                <div className="R">PV</div>
                <div className="G">
                  CF<sub>0</sub>
                </div>
              </div>
            </td>
            <td>
              <div id="buttonPMT" className="calcbutton">
                <div className="F">RND</div>
                <div className="R">PMT</div>
                <div className="G">
                  CF<sub>j</sub>
                </div>
              </div>
            </td>
            <td>
              <div id="buttonFV" className="calcbutton">
                <div className="F">IRR</div>
                <div className="R">FV</div>
                <div className="G">
                  N<sub>j</sub>
                </div>
              </div>
            </td>
            <td>
              <div id="buttonCHS" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">CHS</div>
                <div className="G">DATE</div>
              </div>
            </td>
            <td>
              <div id="button7" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">7</div>
                <div className="G">BEG</div>
              </div>
            </td>
            <td>
              <div id="button8" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">8</div>
                <div className="G">END</div>
              </div>
            </td>
            <td>
              <div id="button9" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">9</div>
                <div className="G">MEM</div>
              </div>
            </td>
            <td>
              <div id="buttonDiv" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">/</div>
                <div className="G">&nbsp;</div>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div id="buttonYtoX" className="calcbutton">
                <div className="F">PRICE</div>
                <div className="R">
                  y<sup>x</sup>
                </div>
                <div className="G">&radic;x</div>
              </div>
            </td>
            <td>
              <div id="buttonRecipX" className="calcbutton">
                <div className="F">YTM</div>
                <div className="R">1/x</div>
                <div className="G">
                  e<sup>x</sup>
                </div>
              </div>
            </td>
            <td>
              <div id="buttonPercentTotal" className="calcbutton">
                <div className="F">SL</div>
                <div className="R">%T</div>
                <div className="G">LN</div>
              </div>
            </td>
            <td>
              <div id="buttonPercentChange" className="calcbutton">
                <div className="F">SOYD</div>
                <div className="R">&Delta;%</div>
                <div className="G">FRAC</div>
              </div>
            </td>
            <td>
              <div id="buttonPercent" className="calcbutton">
                <div className="F">DB</div>
                <div className="R">%</div>
                <div className="G">INTG</div>
              </div>
            </td>
            <td>
              <div id="buttonEEX" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">EEX</div>
                <div className="G">&Delta;DAYS</div>
              </div>
            </td>
            <td>
              <div id="button4" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">4</div>
                <div className="G">D.MY</div>
              </div>
            </td>
            <td>
              <div id="button5" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">5</div>
                <div className="G">M.DY</div>
              </div>
            </td>
            <td>
              <div id="button6" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">6</div>
                <div className="G">x&#772;w</div>
              </div>
            </td>
            <td>
              <div id="buttonTimes" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">x</div>
                <div className="G">
                  x<sup>2</sup>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div id="buttonRunStop" className="calcbutton">
                <div className="F">P/R</div>
                <div className="R">R/S</div>
                <div className="G">PSE</div>
              </div>
            </td>
            <td>
              <div id="buttonSingleStep" className="calcbutton">
                <div className="F">&Sigma;</div>
                <div className="R">SST</div>
                <div className="G">BST</div>
              </div>
            </td>
            <td>
              <div id="buttonRotateStack" className="calcbutton">
                <div className="F">PRGM</div>
                <div className="R">R&DownArrow;</div>
                <div className="G">GTO</div>
              </div>
            </td>
            <td>
              <div id="buttonSwapXY" className="calcbutton">
                <div className="F">FIN</div>
                <div className="R">x&harr;y</div>
                <div className="G">x&lt;=y</div>
              </div>
            </td>
            <td>
              <div id="buttonCLx" className="calcbutton">
                <div className="F">REG</div>
                <div className="R">CLx</div>
                <div className="G">x=0</div>
              </div>
            </td>
            <td>
              <div id="buttonEnter" className="calcbutton">
                <div className="F">PREFIX</div>
                <div className="R">ENT</div>
                <div className="G">&nbsp;</div>
              </div>
            </td>
            <td>
              <div id="button1" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">1</div>
                <div className="G">x&#770;,r</div>
              </div>
            </td>
            <td>
              <div id="button2" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">2</div>
                <div className="G">y&#770;,r</div>
              </div>
            </td>
            <td>
              <div id="button3" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">3</div>
                <div className="G">n!</div>
              </div>
            </td>
            <td>
              <div id="buttonMinus" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">-</div>
                <div className="G">&leftarrow;</div>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <div id="buttonOnOff" className="calcbutton">
                <div className="F">OFF</div>
                <div className="R">ON</div>
                <div className="G">&nbsp;</div>
              </div>
            </td>
            <td>
              <div id="buttonF" className="buttonF">
                F
              </div>
            </td>
            <td>
              <div id="buttonG" className="buttonG">
                G
              </div>
            </td>
            <td>
              <div id="buttonSTO" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">STO</div>
                <div className="G">&nbsp;</div>
              </div>
            </td>
            <td>
              <div id="buttonRCL" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">RCL</div>
                <div className="G">&nbsp;</div>
              </div>
            </td>
            <td>
              <div id="button0" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">0</div>
                <div className="G">x&#772;</div>
              </div>
            </td>
            <td>
              <div id="buttonPoint" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">.</div>
                <div className="G">s</div>
              </div>
            </td>
            <td>
              <div id="buttonSigmaPlus" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">&Sigma;+</div>
                <div className="G">&Sigma;-</div>
              </div>
            </td>
            <td>
              <div id="buttonPlus" className="calcbutton">
                <div className="F">&nbsp;</div>
                <div className="R">+</div>
                <div className="G">LST x</div>
              </div>
            </td>
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
