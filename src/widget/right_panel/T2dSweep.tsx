import React, { useEffect, useState } from "react";

import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Content } from "../mui_extensions/Content";
import { Controls } from "../mui_extensions/Controls";
import { NoiseData, NoiseDataSet } from "../GearSelectionComponent";

let alertMessage = "";

let intDurs: number[] = [];

let selectScore: number = 0;

let noiseData: NoiseData = [];

export const Sweep = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [goLabel, setGoLabel] = useState<string>("Go");
  const [inputScore, setInputScore] = useState<string>("0");
  const [intDurIdx, setIntDurIdx] = useState<number>(0);
  const [openT2dDialog, setOpenT2dDialog] = useState(false);
  const [t2dDialogContent, setT2dDialogContent] = useState<string>("");
  const [nextLabel, setNextLabel] = useState<string>("Next");

  const handleScoreChange = (event: SelectChangeEvent) => {
    setInputScore(event.target.value as string);
  };

  const handleGoButtonClick = () => {
    setIntDurIdx(0);
    if (intDurIdx === intDurs.length - 1) {
      setNextLabel("Done");
    } else {
      setNextLabel("Next");
    }
    setOpenT2dDialog(true);
  };

  const handleT2dDialogClose = () => {
    setOpenT2dDialog(false);
  };

  const handleT2dDialogNext = () => {
    noiseData[intDurIdx].data[step].t2dScore = selectScore;
    if (nextLabel === "Done") {
      handleT2dDialogClose();
      if (step < props.noiseConditions.length - 1) {
        setStep(step + 1);
      } else {
        props.setNoiseData(noiseData);
        props.setT2dCompleted(true);
        setGoLabel("Done");
      }
      return;
    } else {
      setIntDurIdx(intDurIdx + 1);
    }
  };

  const handleT2dDialogNextButtonClick = () => {
    handleT2dDialogNext();
  };

  const handleT2dDialogCancelButtonClick = () => {
    handleT2dDialogClose();
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
    if (props.sweepCompleted) {
      noiseData = props.noiseData.map((item: NoiseDataSet) =>
        Object.assign({}, item)
      );
      intDurs = noiseData.map((item) => {
        return item.intDur;
      });
      setInitialized(true);
    } else {
      setInitialized(false);
    }
  }, [props.sweepCompleted, props.noiseConditions, props.noiseData]);

  useEffect(() => {
    selectScore = Number(inputScore);
  }, [inputScore]);

  useEffect(() => {
    if (openT2dDialog === true) {
    }
  }, [openT2dDialog]);

  useEffect(() => {
    setInputScore("0");
    if (intDurIdx === intDurs.length - 1) {
      setNextLabel("Done");
    } else {
      setNextLabel("Next");
    }
    setT2dDialogContent("T2D Visual Score for IntDur: " + intDurs[intDurIdx]);
  }, [intDurIdx]);

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
            <Typography sx={{ fontSize: "1rem" }}>
              T2D Visual Score Sweep
            </Typography>
            <Typography
              sx={{
                marginTop: "8px",
                fontSize: "1rem",
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
                disabled={goLabel === "Done"}
                onClick={() => handleGoButtonClick()}
                sx={{ width: "150px" }}
              >
                {goLabel}
              </Button>
            </Controls>
          </Content>
          <Dialog
            maxWidth="sm"
            open={openT2dDialog}
            onClose={handleT2dDialogClose}
          >
            <DialogContent>
              <Typography sx={{ fontSize: "1rem" }}>
                {t2dDialogContent}
              </Typography>
              <Divider
                orientation="horizontal"
                sx={{ width: "100%", marginTop: "5px" }}
              />
              <FormControl
                sx={{ minWidth: 150, marginTop: "15px", marginLeft: "150px" }}
                size="small"
              >
                <InputLabel>Score</InputLabel>
                <Select
                  value={inputScore}
                  label="Score"
                  onChange={handleScoreChange}
                >
                  <MenuItem value={0}>0</MenuItem>
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={6}>6</MenuItem>
                  <MenuItem value={7}>7</MenuItem>
                  <MenuItem value={8}>8</MenuItem>
                  <MenuItem value={9}>9</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions sx={{ minWidth: 80, marginBottom: "5px" }}>
              <Button
                onClick={() => handleT2dDialogCancelButtonClick()}
                sx={{ width: "80px" }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleT2dDialogNextButtonClick()}
                sx={{ width: "80px" }}
              >
                {nextLabel}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
    </>
  );
};

export default Sweep;
