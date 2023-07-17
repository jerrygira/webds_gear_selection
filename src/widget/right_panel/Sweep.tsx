import React, { useEffect, useState } from "react";

import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import LinearProgress from "@mui/material/LinearProgress";

import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";

import {
  NoiseData,
  NoiseDataSet,
  NoiseCondition
} from "../GearSelectionComponent";

import {
  ALERT_MESSAGE_PRE_PDNR_SWEEP,
  ALERT_MESSAGE_PDNR_SWEEP,
  ALERT_MESSAGE_ABORT_PRE_PDNR_SWEEP,
  ALERT_MESSAGE_ABORT_PDNR_SWEEP,
  ALERT_MESSAGE_CLEAR_PDNR_TUNING
} from "../constants";

import { Content } from "../mui_extensions/Content";
import { Controls } from "../mui_extensions/Controls";

import { requestAPI } from "../local_exports";

const SSE_CLOSED = 2;

let intDurs: number[] = [];

let noiseData: NoiseData = [];

let eventSource: EventSource | undefined = undefined;

let alertMessage = "";

const sendAbortRequest = async (): Promise<void> => {
  const dataToSend = {
    function: "stop"
  };
  try {
    await requestAPI<any>("tutor/GearSelection", {
      body: JSON.stringify(dataToSend),
      method: "POST"
    });
    return Promise.resolve();
  } catch (error) {
    console.error(
      `Error - POST /webds/tutor/GearSelection\n${dataToSend}\n${error}`
    );
    return Promise.reject("Failed to abort sweep");
  }
};

const sendClearPDNRTuningRequest = async (): Promise<void> => {
  const dataToSend = {
    function: "clear_pdnr_tuning"
  };
  try {
    await requestAPI<any>("tutor/GearSelection", {
      body: JSON.stringify(dataToSend),
      method: "POST"
    });
    return Promise.resolve();
  } catch (error) {
    console.error(
      `Error - POST /webds/tutor/GearSelection\n${dataToSend}\n${error}`
    );
    return Promise.reject("Failed to clear PDNR tuning");
  }
};

const sendSweepRequest = async (
  fnName: string,
  numGears: number,
  baselineFrames: number,
  gramDataFrames: number
): Promise<void> => {
  const dataToSend = {
    function: fnName,
    arguments: [intDurs, numGears, baselineFrames, gramDataFrames],
  };
  try {
    await requestAPI<any>("tutor/GearSelection", {
      body: JSON.stringify(dataToSend),
      method: "POST"
    });
    return Promise.resolve();
  } catch (error) {
    console.error(
      `Error - POST /webds/tutor/GearSelection\n${dataToSend}\n${error}`
    );
    return Promise.reject("Failed to do sweep");
  }
};

export const Sweep = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [prog, setProg] = useState(0);
  const [sweep, setSweep] = useState<string>("Pre-PDNR Sweep");
  const [goLabel, setGoLabel] = useState<string>("Go");

  const showAlert = (message: string) => {
    alertMessage = message;
    setAlert(true);
  };

  const collectNoiseData = (data: number[][]) => {
    noiseData.forEach((item, index: number) => {
      const condition: NoiseCondition = {
        id: props.noiseConditions[step].id,
        name: props.noiseConditions[step].name
      };
      const trans = Math.floor(data[0][index] * 1000) / 1000;
      const absx = Math.floor(data[1][index] * 1000) / 1000;
      const absy = Math.floor(data[2][index] * 1000) / 1000;
      let max = Math.max(data[1][index], data[2][index]);
      max = Math.floor(max * 1000) / 1000;
      let t2dScore = 0;
      item.data.push({
        condition,
        trans,
        absx,
        absy,
        max,
        t2dScore
      });
    });
  };

  const eventHandler = (event: any) => {
    const data = JSON.parse(event.data);
    console.log(data);
    const progress = (data.progress * 100) / data.total;
    setProg(progress);

    if (data.state === "stopped") {
      eventSource!.removeEventListener("GearSelection", eventHandler, false);
      eventSource!.close();
      eventSource = undefined;
      return;
    } else if (data.state === "completed") {
      if (sweep === "PDNR Sweep") {
        const data = JSON.parse(event.data);
        collectNoiseData(data.reports);
      }
      eventSource!.removeEventListener("GearSelection", eventHandler, false);
      eventSource!.close();
      eventSource = undefined;
      setTimeout(() => {
        if (step < props.noiseConditions.length - 1) {
          setStep(step + 1);
          setProg(0);
        } else if (sweep === "Pre-PDNR Sweep") {
          setSweep("PDNR Sweep");
          setStep(0);
          setProg(0);
        } else {
          setGoLabel("Done");
          setProg(100);
          props.setNoiseData(noiseData);
          props.setSweepCompleted(true);
        }
        props.setSweepInProgress(false);
      }, 1500);
    }
  };

  const removeEvent = () => {
    if (eventSource && eventSource.readyState !== SSE_CLOSED) {
      eventSource.removeEventListener("GearSelection", eventHandler, false);
      eventSource.close();
      eventSource = undefined;
    }
  };

  const errorHandler = (error: any) => {
    removeEvent();
    console.error(`Error - GET /webds/tutor/GearSelection\n${error}`);
  };

  const addEvent = () => {
    if (eventSource) {
      return;
    }
    eventSource = new window.EventSource("/webds/tutor/event");
    eventSource.addEventListener("GearSelection", eventHandler, false);
    eventSource.addEventListener("error", errorHandler, false);
  };

  const doSweep = () => {
    if (sweep === "Pre-PDNR Sweep" && step === 0) {
      try {
        sendClearPDNRTuningRequest();
        props.setSweepCompleted(false);
      } catch (error) {
        console.error(error);
        showAlert(ALERT_MESSAGE_CLEAR_PDNR_TUNING);
        return;
      }
    }
    if (
      sweep === "PDNR Sweep" &&
      step === props.noiseConditions.length - 1 &&
      prog === 100
    ) {
      setSweep("Pre-PDNR Sweep");
      setGoLabel("Go");
      return;
    }
    let fnName = "";
    if (sweep === "Pre-PDNR Sweep") {
      fnName = "pre_pdnr_sweep";
    } else {
      fnName = "pdnr_sweep";
    }

    try {
      sendSweepRequest(
        fnName,
        props.numGears,
        props.baselineFrames,
        props.gramDataFrames
      );
    } catch (error) {
      console.error(error);
      if (sweep === "Pre-PDNR Sweep") {
        showAlert(ALERT_MESSAGE_PRE_PDNR_SWEEP);
      } else {
        showAlert(ALERT_MESSAGE_PDNR_SWEEP);
      }
      return;
    }
    setProg(0.001);
    props.setSweepInProgress(true);
    addEvent();
  };

  const handleGoButtonClick = () => {
    doSweep();
  };

  const handleAbortButtonClick = () => {
    props.setSweepAborted(true);
    props.setSweepCompleted(false);
    props.setSweepInProgress(false);
    if (prog === 0 || goLabel === "Done") {
      removeEvent();
    }
    try {
      sendAbortRequest();
    } catch (error) {
      console.error(error);
      if (sweep === "Pre-PDNR Sweep") {
        showAlert(ALERT_MESSAGE_ABORT_PRE_PDNR_SWEEP);
      } else {
        showAlert(ALERT_MESSAGE_ABORT_PDNR_SWEEP);
      }
    }
  };

  const generateListItems = (): JSX.Element[] => {
    return props.noiseConditions?.map(({ id, name }: any, index: number) => {
      if (index === step) {
        return (
          <div
            key={id}
            style={{
              position: "relative"
            }}
          >
            <ListItem divider selected>
              <ListItemText primary={name} sx={{ paddingLeft: "16px" }} />
            </ListItem>
            <LinearProgress
              variant="determinate"
              value={prog}
              sx={{
                position: "absolute",
                bottom: "0px",
                width: "100%"
              }}
            />
          </div>
        );
      }
      return (
        <ListItem key={id} divider>
          <ListItemText primary={name} sx={{ paddingLeft: "16px" }} />
        </ListItem>
      );
    });
  };

  useEffect(() => {
    return () => {
      removeEvent();
    };
  }, []);

  useEffect(() => {
    if (props.noiseConditions.length > 0) {
      setInitialized(true);
    } else {
      setInitialized(false);
    }
  }, [props.noiseConditions]);

  useEffect(() => {
    intDurs = [];
    noiseData = [];
    for (
      let idx = props.intDurMin;
      idx < props.intDurMin + props.intDurSteps;
      idx++
    ) {
      intDurs.push(idx);
      noiseData.push({
        intDur: idx,
        data: [],
        selected: false,
        displayNoise: true
      } as NoiseDataSet);
    }

    if (props.noiseConditions.length > 0) {
      setInitialized(true);
    } else {
      setInitialized(false);
    }
  }, [props.intDurMin, props.intDurSteps, props.noiseConditions]);

  return (
    <>
      {alert ? (
        <Alert
          severity="error"
          onClose={() => setAlert(false)}
          sx={{ whiteSpace: "pre-wrap" }}
        >
          {alertMessage}
        </Alert>
      ) : null}
      {initialized ? (
        <>
          <Content
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <Typography sx={{ fontSize: "1.1rem" }}>{sweep}</Typography>
            <Typography
              sx={{
                marginTop: "8px",
                fontSize: "1.1rem",
                textDecoration: "underline"
              }}
            ></Typography>
            <Divider
              orientation="horizontal"
              sx={{ width: "100%", marginTop: "24px" }}
            />
            <Typography sx={{ marginTop: "24px" }}>Noise Conditions</Typography>
            <div
              id="webds_gear_selection_sweep_noise_conditions_list"
              style={{
                width: "75%",
                marginTop: "16px",
                overflow: "auto"
              }}
            >
              <List>{generateListItems()}</List>
            </div>
            <Controls
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Button
                disabled={prog !== 0 && goLabel !== "Next"}
                onClick={() => handleGoButtonClick()}
                sx={{ width: "150px" }}
              >
                {goLabel}
              </Button>
              <Button
                variant="text"
                onClick={() => handleAbortButtonClick()}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: "24px",
                  transform: "translate(0%, -50%)"
                }}
              >
                <Typography variant="underline">Abort</Typography>
              </Button>
            </Controls>
          </Content>
        </>
      ) : null}
    </>
  );
};

export default Sweep;
