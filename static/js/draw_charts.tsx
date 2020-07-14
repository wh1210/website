/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from "react";
import ReactDOM from "react-dom";
import { randDomId } from "./util";
import { fetchStatsData } from "./data_fetcher";
import { drawGroupLineChart } from "./chart/draw";
import {getPerCapita} from "./dc";

const MAX_CHART_WIDTH = 1000;
const MAX_CHART_HEIGHT = 500;

interface DrawChartParams {
  chartElem: string,
  placeIds: string[],
  statVarsAndMeasuredProps: string[],
  perCapita: boolean,
}

class DrawChart extends Component<DrawChartParams, {}> {
  measuredPropGroup: {string: string[]};

  constructor(props) {
    // What is inside props. This should be well handled by upstream.
    super(props);

    this.state = {
      measuredPropGroup: this.groupByMeasuredProp(),
    }
  }

  groupByMeasuredProp() {
    let measuredPropGroup = {};
    for (let statVarAndMeasuredProp of this.props.statVarsAndMeasuredProps) {
      let mprop = statVarAndMeasuredProp[1];
      if (mprop in measuredPropGroup) {
        measuredPropGroup[mprop].push(statVarAndMeasuredProp[0]);
      } else {
        measuredPropGroup[mprop] = [statVarAndMeasuredProp[0]];
      }
    }
    this.setState({
      measuredPropGroup: measuredPropGroup,
    });
  }

  showBelowChartLegend(listElem, statsVars, colors) {
    if (statsVars.length > 0) {
      let ind = 0;
      console.log(statsVars);
      console.log(statsVars.length);
      for (const statsVar of statsVars) {
        let elem = document.createElement("div");
        listElem.appendChild(elem);
        elem.classList.add("pv-chip");
        elem.classList.add("mdl-chip--deletable");
        // TODO: get the same colors.
        elem.style.backgroundColor = colors[ind];
        const text = document.createElement("span");
        text.classList.add("mdl-chip__text");
        let legend = statsVar;
        text.innerHTML = legend;
        elem.appendChild(text);
        const button = document.createElement("button");
        button.classList.add("mdl-chip__action");
        const cancel = document.createElement("i");
        cancel.classList.add("material-icons");
        cancel.innerHTML = "cancel";
        button.appendChild(cancel);
        elem.appendChild(button);
        elem.appendChild(document.createElement("br"));
        // TODO: add event here.
        // cancel.addEventListener("click", () => removePVTFromUrl(ptpv["urlarg"]));
        ind++;
      }
    }
  }

  render() {
    for (let mprop in this.measuredPropGroup) {
      const obsElem = document.getElementById(this.props.chartElem);
      const elem2 = document.createElement("div");
      elem2.id = "gchart-container";
      obsElem.appendChild(elem2);
      let perCapita = getPerCapita();
      console.log(this.props.statVarsAndMeasuredProps);

      let width = Math.min(obsElem.offsetWidth - 20, MAX_CHART_WIDTH);
      let height = Math.min(Math.round(width * 0.5), MAX_CHART_HEIGHT);

      let statsVarsArray = this.measuredPropGroup[mprop];
      // draw chart directly in front-end
      console.log(statsVarsArray);
      fetchStatsData(this.props.placeIds, statsVarsArray, this.props.perCapita, 1).then((data) => {
        console.log(data);
        const card = document.createElement("div");
        card.className = "card";
        card.id = randDomId();
        elem2.appendChild(card);

        console.log("Test getStatsVarGroupWithTime");
        console.log(data.getStatsVarGroupWithTime("geoId/06"));

        // generate dict {geoId: DataGroup}.
        let dataGroupsDict = {};
        for (let geo of data.places) {
          dataGroupsDict[geo] = data.getStatsVarGroupWithTime(geo);
        }

        let colors = drawGroupLineChart(card.id, width, height, dataGroupsDict);
        console.log(dataGroupsDict);

        this.showBelowChartLegend(card, statsVarsArray, colors);
      });
    }
    return {};
  }
}

export {
  DrawChartParams,
  DrawChart,
}
