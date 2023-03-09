import React, { useEffect, useState } from "react";

import Alert from "@mui/material/Alert";

import CircularProgress from "@mui/material/CircularProgress";

import { ThemeProvider } from "@mui/material/styles";

import Landing from "./Landing";

import { requestAPI, webdsService } from "./local_exports";

import {
  ALERT_MESSAGE_READ_STATIC,
  ALERT_MESSAGE_ADD_PUBLIC_CONFIG_JSON,
  ALERT_MESSAGE_ADD_PRIVATE_CONFIG_JSON,
  DEFAULT_INT_DUR_MIN,
  DEFAULT_INT_DUR_STEPS,
  DEFAULT_BASELINE_FRAMES,
  DEFAULT_GRAM_DATA_FRAMES
} from "./constants";

export type NoiseCondition = {
  id: string;
  name: string;
};

export type NoiseDataEntry = {
  condition: NoiseCondition;
  trans: number;
  absx: number;
  absy: number;
  max: number;
  t2dScore: number;
};

export type NoiseDataSet = {
  intDur: number;
  data: NoiseDataEntry[];
  selected: boolean;
  displayNoise: boolean;
};

export type NoiseData = NoiseDataSet[];

let alertMessage = "";

export const GearSelectionComponent = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [numGears, setNumGears] = useState<number>(0);
  const [intDurMin, setIntDurMin] = useState<number>(DEFAULT_INT_DUR_MIN);
  const [intDurSteps, setIntDurSteps] = useState<number>(DEFAULT_INT_DUR_STEPS);
  const [noiseData, setNoiseData] = useState<NoiseData>([]);
  const [noiseConditions, setNoiseConditions] = useState<NoiseCondition[]>([]);
  const [baselineFrames, setBaselineFrames] = useState<number>(
    DEFAULT_BASELINE_FRAMES
  );
  const [gramDataFrames, setGramDataFrames] = useState<number>(
    DEFAULT_GRAM_DATA_FRAMES
  );

  const webdsTheme = webdsService.ui.getWebDSTheme();

  const showAlert = (message: string) => {
    alertMessage = message;
    setAlert(true);
  };

  const initialize = async () => {
    const external = webdsService.pinormos.isExternal();
    try {
      if (external) {
        await webdsService.packrat.cache.addPublicConfig();
      } else {
        await webdsService.packrat.cache.addPrivateConfig();
      }
    } catch (error) {
      console.error(error);
      if (external) {
        showAlert(ALERT_MESSAGE_ADD_PUBLIC_CONFIG_JSON);
      } else {
        showAlert(ALERT_MESSAGE_ADD_PRIVATE_CONFIG_JSON);
      }
      return;
    }
    const dataToSend: any = {
      command: "getStaticConfig"
    };
    try {
      const staticConfig = await requestAPI<any>("command", {
        body: JSON.stringify(dataToSend),
        method: "POST"
      });
      setNumGears(staticConfig["freqTable[0].rstretchDur"].length);
    } catch (error) {
      console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
      showAlert(ALERT_MESSAGE_READ_STATIC);
      return;
    }
    setInitialized(true);
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <ThemeProvider theme={webdsTheme}>
        <div className="jp-webds-widget-body">
          {alert && (
            <Alert
              severity="error"
              onClose={() => setAlert(false)}
              sx={{ whiteSpace: "pre-wrap" }}
            >
              {alertMessage}
            </Alert>
          )}
          {initialized && (
            <Landing
              intDurMin={intDurMin}
              setIntDurMin={setIntDurMin}
              intDurSteps={intDurSteps}
              setIntDurSteps={setIntDurSteps}
              noiseConditions={noiseConditions}
              setNoiseConditions={setNoiseConditions}
              numGears={numGears}
              setNumGears={setNumGears}
              baselineFrames={baselineFrames}
              setBaselineFrames={setBaselineFrames}
              gramDataFrames={gramDataFrames}
              setGramDataFrames={setGramDataFrames}
              noiseData={noiseData}
              setNoiseData={setNoiseData}
            />
          )}
        </div>
        {!initialized && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          >
            <CircularProgress color="primary" />
          </div>
        )}
      </ThemeProvider>
    </>
  );
};

export default GearSelectionComponent;
