import React, { useEffect, useState } from "react";

import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

import Typography from "@mui/material/Typography";

import { NoiseCondition, NoiseData } from "./GearSelectionComponent";

import {
  STEPPER_STEPS,
  DEFAULT_BASELINE_FRAMES,
  DEFAULT_GRAM_DATA_FRAMES
} from "./constants";

import { Canvas } from "./mui_extensions/Canvas";
import { Content } from "./mui_extensions/Content";
import { Controls } from "./mui_extensions/Controls";
import { BackButton, NextButton } from "./mui_extensions/Buttons";

import Conditions from "./right_panel/Conditions";
import Sweep from "./right_panel/Sweep";
import T2dSweep from "./right_panel/T2dSweep";
import Transcap from "./right_panel/Transcap";
import Abscap from "./right_panel/Abscap";

import { useTheme } from "@mui/material/styles";

import { VerticalStepper } from "./Stepper";

import {
  CANVAS_ATTRS,
  ContentAttrs,
  getContentAttrs
} from "./mui_extensions/constants";
const contentAttrs: ContentAttrs = getContentAttrs();

export const Landing = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [intDurMin, setIntDurMin] = useState<number | null>(props.intDurMin);
  const [intDurSteps, setIntDurSteps] = useState<number | null>(
    props.intDurSteps
  );
  const [noiseConditions, setNoiseConditions] = useState<NoiseCondition[]>([]);
  const [sweepInProgress, setSweepInProgress] = useState<boolean>(false);
  const [sweepAborted, setSweepAborted] = useState<boolean>(false);
  const [sweepCompleted, setSweepCompleted] = useState<boolean>(false);
  const [t2dCompleted, setT2dCompleted] = useState<boolean>(false);
  const [stepsCompleted, setStepsCompleted] = useState<number[]>([]);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [noiseData, setNoiseData] = useState<NoiseData>([]);
  const [numGears, setNumGears] = useState<number>(props.numGears);
  const [baselineFrames, setBaselineFrames] = useState<number>(
    DEFAULT_BASELINE_FRAMES
  );
  const [gramDataFrames, setGramDataFrames] = useState<number>(
    DEFAULT_GRAM_DATA_FRAMES
  );
  const theme = useTheme();

  const setStepComplete = (step: number) => {
    setStepsCompleted((prev) => {
      const completed = [...prev];
      if (!completed.includes(step)) {
        completed.push(step);
      }
      return completed;
    });
  };

  const resetStepComplete = (step: number) => {
    setStepsCompleted((prev) => {
      const completed = [...prev];
      const index = completed.indexOf(step);
      if (index > -1) {
        completed.splice(index, 1);
      }
      return completed;
    });
  };

  const handleBackButtonClick = () => {
    setActiveStep((prevActiveStep) => {
      return prevActiveStep - 1;
    });
  };

  const handleNextButtonClick = () => {
    setActiveStep((prevActiveStep) => {
      return prevActiveStep + 1;
    });
  };

  const rightPanel: (JSX.Element | null)[] = [
    <Conditions
      intDurMin={intDurMin}
      setIntDurMin={setIntDurMin}
      intDurSteps={intDurSteps}
      setIntDurSteps={setIntDurSteps}
      noiseConditions={noiseConditions}
      setNoiseConditions={setNoiseConditions}
      baselineFrames={baselineFrames}
      setBaselineFrames={setBaselineFrames}
      gramDataFrames={gramDataFrames}
      setGramDataFrames={setGramDataFrames}
    />,
    <Sweep
      disabled={!stepsCompleted.includes(1)}
      intDurMin={intDurMin}
      intDurSteps={intDurSteps}
      noiseConditions={noiseConditions}
      numGears={numGears}
      setNumGears={setNumGears}
      baselineFrames={baselineFrames}
      gramDataFrames={gramDataFrames}
      noiseData={noiseData}
      setNoiseData={setNoiseData}
      setSweepInProgress={setSweepInProgress}
      setSweepAborted={setSweepAborted}
      setSweepCompleted={setSweepCompleted}
    />,
    <T2dSweep
      disabled={!stepsCompleted.includes(2)}
      intDurMin={intDurMin}
      intDurSteps={intDurSteps}
      noiseConditions={noiseConditions}
      numGears={numGears}
      setNumGears={setNumGears}
      noiseData={noiseData}
      setNoiseData={setNoiseData}
      sweepCompleted={sweepCompleted}
      setT2dCompleted={setT2dCompleted}
    />,
    <Transcap
      disabled={!stepsCompleted.includes(2)}
      numGears={numGears}
      setNumGears={setNumGears}
      noiseData={noiseData}
      sweepCompleted={sweepCompleted}
    />,
    <Abscap
      disabled={!stepsCompleted.includes(2)}
      numGears={numGears}
      setNumGears={setNumGears}
      noiseData={noiseData}
      sweepCompleted={sweepCompleted}
      t2dCompleted={t2dCompleted}
    />
  ];

  const steps = [
    {
      label: STEPPER_STEPS["1"].label,
      content: (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "left"
          }}
        >
          <Typography variant="body2">{STEPPER_STEPS["1"].content}</Typography>
        </div>
      )
    },
    {
      label: STEPPER_STEPS["2"].label,
      content: (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "left"
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: !stepsCompleted.includes(1)
                ? theme.palette.text.disabled
                : theme.palette.text.primary
            }}
          >
            {STEPPER_STEPS["2"].content}
          </Typography>
          {!stepsCompleted.includes(1) && (
            <Typography variant="body2" color="red">
              {STEPPER_STEPS["2"].alert}
            </Typography>
          )}
        </div>
      )
    },
    {
      label: STEPPER_STEPS["3"].label,
      content: (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "left"
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: !stepsCompleted.includes(2)
                ? theme.palette.text.disabled
                : theme.palette.text.primary
            }}
          >
            {STEPPER_STEPS["3"].content}
          </Typography>
          {!stepsCompleted.includes(2) && (
            <Typography variant="body2" color="red">
              {STEPPER_STEPS["3"].alert}
            </Typography>
          )}
        </div>
      )
    },
    {
      label: STEPPER_STEPS["4"].label,
      content: (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "left"
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: !stepsCompleted.includes(2)
                ? theme.palette.text.disabled
                : theme.palette.text.primary
            }}
          >
            {STEPPER_STEPS["4"].content}
          </Typography>
          {!stepsCompleted.includes(2) && (
            <Typography
              variant="body2"
              color="red"
              sx={{
                marginTop: "5px"
              }}
            >
              {STEPPER_STEPS["4"].alert}
            </Typography>
          )}
        </div>
      )
    },
    {
      label: STEPPER_STEPS["5"].label,
      content: (
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "left"
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: !stepsCompleted.includes(2)
                ? theme.palette.text.disabled
                : theme.palette.text.primary
            }}
          >
            {STEPPER_STEPS["5"].content}
          </Typography>
          {!stepsCompleted.includes(2) && (
            <Typography
              variant="body2"
              color="red"
              sx={{
                marginTop: "5px"
              }}
            >
              {STEPPER_STEPS["5"].alert}
            </Typography>
          )}
        </div>
      )
    }
  ];

  useEffect(() => {
    setNoiseData([]);
    setSweepCompleted(false);
    if (noiseConditions.length > 0) {
      setStepComplete(1);
    } else {
      resetStepComplete(1);
    }
    setInitialized(true);
  }, [noiseConditions]);

  useEffect(() => {
    if (sweepCompleted) {
      setStepComplete(2);
    } else {
      resetStepComplete(2);
      setT2dCompleted(false);
    }
  }, [sweepCompleted]);

  useEffect(() => {
    setActiveStep(1);
    setSweepAborted(false);
  }, [sweepAborted]);

  useEffect(() => {
    setInitialized(true);
  }, []);

  return (
    <>
      {initialized ? (
        <>
          <Canvas title="Gear Selection" stretch>
            <Content>
              <Stack
                spacing={contentAttrs.PANEL_SPACING}
                direction="row"
                divider={
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      minHeight:
                        CANVAS_ATTRS.MIN_HEIGHT_CONTENT -
                        CANVAS_ATTRS.PADDING * 2 +
                        "px"
                    }}
                  />
                }
              >
                <div
                  style={{
                    width: "20%",
                    minHeight:
                      CANVAS_ATTRS.MIN_HEIGHT_CONTENT -
                      CANVAS_ATTRS.PADDING * 2 +
                      "px",
                    position: "relative"
                  }}
                >
                  <VerticalStepper
                    steps={steps}
                    strict={sweepInProgress}
                    activeStep={activeStep}
                    onStepClick={(clickedStep) => {
                      setActiveStep(clickedStep);
                    }}
                  />
                </div>
                <div
                  style={{
                    width: "80%",
                    minHeight:
                      CANVAS_ATTRS.MIN_HEIGHT_CONTENT -
                      CANVAS_ATTRS.PADDING * 2 +
                      "px",
                    position: "relative"
                  }}
                >
                  {rightPanel[activeStep - 1]}
                </div>
              </Stack>
            </Content>
            <Divider orientation="vertical" flexItem />
            <Controls
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <BackButton
                disabled={activeStep === 1 || sweepInProgress}
                onClick={() => handleBackButtonClick()}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "24px",
                  transform: "translate(0%, -50%)"
                }}
              />
              <NextButton
                disabled={activeStep === steps.length || sweepInProgress}
                onClick={() => handleNextButtonClick()}
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: "24px",
                  transform: "translate(0%, -50%)"
                }}
              />
            </Controls>
          </Canvas>
        </>
      ) : null}
    </>
  );
};

export default Landing;
