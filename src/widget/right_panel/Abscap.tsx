import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import ToggleButton from "@mui/material/ToggleButton";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";

import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";

import { styled, useTheme } from "@mui/material/styles";

import {
  NoiseData,
  NoiseDataSet,
  NoiseDataEntry,
  NoiseCondition
} from "../GearSelectionComponent";

import {
  ALERT_MESSAGE_WRITE_TO_RAM,
  ALERT_MESSAGE_WRITE_TO_FLASH,
  TEST_DIALOG_TITLE,
  COMMIT_DIALOG_TITLE
} from "../constants";

import { Content } from "../mui_extensions/Content";
import { Controls } from "../mui_extensions/Controls";

import { requestAPI } from "../local_exports";

const ISTRETCH = 9;
const RESET = 14;
const SAMPLE = 7;
const OVERHEAD = 3;
const CLOCK = 29;

type Column = { intDur: number; displayNoise: boolean };

type Columns = Column[];

type Selected = { [intDur: string]: boolean };

type Excluded = { [conditionID: string]: boolean };

type Frequency = { [intDur: string]: number };

type SelectedGear = {
  gear: number;
  frequency: number | undefined;
  intDur: number | undefined;
  rstretch: number | undefined;
};

type SelectedGears = SelectedGear[];

let sort = "freq";

let testCommit = "test";

let noiseData: NoiseData = [];

let intDurs: Columns = [];

let frequencies: Frequency = {};

let conditions: NoiseCondition[] = [];

let t2dNoise: boolean = false;

let selectedGears: SelectedGears = [];

let alertMessage = "";

let dialogTitle = "";

const CustomFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  "& .MuiTypography-root": {
    fontSize: "0.875rem"
  }
}));

const sendSetAbsGearsRequest = async (
  selections: number[],
  numGears: number,
  commit: boolean
): Promise<void> => {
  const dataToSend = {
    function: "set_abs_gears",
    arguments: [selections, numGears, commit]
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
    return Promise.reject("Failed to set abscap gears");
  }
};

const updateSelectedGears = (
  selected: Selected,
  numGears: number,
  showT2D: boolean
) => {
  t2dNoise = false;
  selectedGears = [];
  for (let idx = 0; idx < numGears; idx++) {
    selectedGears.push({
      gear: idx,
      frequency: undefined,
      intDur: undefined,
      rstretch: undefined
    });
  }
  const selections = intDurs.filter((item) => selected[item.intDur]);
  if (selections.length) {
    selectedGears[0].intDur = selections[0].intDur;
    for (let idx = 0; idx < selections.length; idx++) {
      let intDur = selections[idx].intDur;
      if (
        showT2D &&
        noiseData.find((item) => {
          return item.intDur === intDur && item.displayNoise;
        })
      ) {
        t2dNoise = true;
      }
      selectedGears[idx].frequency = frequencies[intDur];
      selectedGears[idx].intDur = intDur;
      selectedGears[idx].rstretch = intDur - selectedGears[0].intDur;
    }
  }
};

const findMaxNoise = (column: Column): number | undefined => {
  const dataSet = noiseData.find((item) => item.intDur === column.intDur);
  if (dataSet) {
    const maxDataEntry = dataSet.data.reduce(
      (prev, cur) => {
        if (cur.max > prev.max) {
          return cur;
        } else {
          return prev;
        }
      },
      { max: Number.NEGATIVE_INFINITY }
    );
    if (maxDataEntry.max === Number.NEGATIVE_INFINITY) {
      return undefined;
    }
    return maxDataEntry.max;
  }
};

const findMaxNoiseNonExcluded = (
  column: Column,
  exclusions: Excluded
): number | undefined => {
  const dataSet = noiseData.find((item) => item.intDur === column.intDur);
  if (dataSet) {
    const maxDataEntry = dataSet.data.reduce(
      (prev, cur) => {
        if (exclusions[cur.condition.id]) {
          return prev;
        }
        if (cur.max > prev.max) {
          return cur;
        } else {
          return prev;
        }
      },
      { max: Number.NEGATIVE_INFINITY }
    );
    if (maxDataEntry.max === Number.NEGATIVE_INFINITY) {
      return undefined;
    }
    return maxDataEntry.max;
  }
};

const findTotalNoiseNonExcluded = (
  column: Column,
  exclusions: Excluded
): number | undefined => {
  const dataSet = noiseData.find((item) => item.intDur === column.intDur);
  if (dataSet) {
    const totalNoise = dataSet.data.reduce(
      (prev, cur) => {
        if (exclusions[cur.condition.id]) {
          return prev;
        }
        return { max: prev.max + cur.max };
      },
      { max: 0 }
    );
    if (totalNoise.max) {
      return Math.round(totalNoise.max * 100) / 100;
    }
  }
};

const findMinGearNoise = (condition: NoiseCondition): number | undefined => {
  const gearNoise: number[] = [];
  noiseData.forEach((item) => {
    if (item.selected) {
      const dataEntry = item.data.find(
        (item) => item.condition.id === condition.id
      );
      if (dataEntry) {
        gearNoise.push(dataEntry.max);
      }
    }
  });
  if (gearNoise.length) {
    return Math.min.apply(null, gearNoise);
  }
};

const findT2dMinNoise = (
  condition: NoiseCondition,
  showT2D: boolean
): number | undefined => {
  const noise: number[] = [];
  noiseData.forEach((item) => {
    if (!showT2D || !item.displayNoise) {
      const dataEntry = item.data.find(
        (item) => item.condition.id === condition.id
      );
      if (dataEntry) {
        noise.push(dataEntry.max);
      }
    }
  });
  if (noise.length) {
    return Math.min.apply(null, noise);
  }
};

const sortByFrequency = (): Columns => {
  return noiseData.map((item) => {
    return {
      intDur: item.intDur,
      displayNoise: item.displayNoise
    };
  });
};

const sortByTotalNoise = (exclusions: Excluded): Columns => {
  const selectedGroup: Columns = [];
  const nonSelectedGroup: Columns = [];
  noiseData.forEach((item) => {
    if (item.selected) {
      selectedGroup.push({
        intDur: item.intDur,
        displayNoise: item.displayNoise
      });
    }
  });
  selectedGroup.sort((a, b) => {
    const aVal = findTotalNoiseNonExcluded(a, exclusions);
    const bVal = findTotalNoiseNonExcluded(b, exclusions);
    if (aVal && bVal) {
      return aVal - bVal;
    } else {
      return 0;
    }
  });
  noiseData.forEach((item) => {
    if (!item.selected) {
      nonSelectedGroup.push({
        intDur: item.intDur,
        displayNoise: item.displayNoise
      });
    }
  });
  nonSelectedGroup.sort((a, b) => {
    const aVal = findTotalNoiseNonExcluded(a, exclusions);
    const bVal = findTotalNoiseNonExcluded(b, exclusions);
    if (aVal && bVal) {
      return aVal - bVal;
    } else {
      return 0;
    }
  });
  return [...selectedGroup, ...nonSelectedGroup];
};

export const Abscap = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [showXY, setShowXY] = useState<boolean>(true);
  const [showT2D, setShowT2D] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [columns, setColumns] = useState<Columns>([]);
  const [selected, setSelected] = useState<Selected>({});
  const [excluded, setExcluded] = useState<Excluded>({});
  const [openT2dWarning, setOpenT2dWarning] = React.useState(false);

  const theme = useTheme();
  const dark = theme.palette.mode === "dark" ? "-dark" : "";

  const showAlert = (message: string) => {
    alertMessage = message;
    setAlert(true);
  };

  const updateDisplayNoise = () => {
    noiseData.forEach((item, index: number) => {
      item.displayNoise = false;
      item.data.forEach((testCondition) => {
        if (testCondition.t2dScore !== 0) {
          item.displayNoise = true;
        }
      });
    });
    if (sort === "freq") {
      setColumns(sortByFrequency());
    } else {
      setColumns(sortByTotalNoise(excluded));
    }
  };

  const unclickT2dNoiseGear = () => {
    const updatedSelection: Selected = {};
    noiseData.forEach((item, index: number) => {
      updatedSelection[item.intDur] =
        !item.displayNoise && item.selected ? true : false;
    });
    setSelected(updatedSelection);
    return;
  };

  const handleSortCheckboxClick = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      sort = "total";
      setColumns(sortByTotalNoise(excluded));
    } else {
      sort = "freq";
      setColumns(sortByFrequency());
    }
  };

  const handleHideXYCheckboxClick = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setShowXY(!event.target.checked);
  };

  const handleDisplayNoiseCheckboxClick = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setShowT2D(event.target.checked);
    updateDisplayNoise();
    if (event.target.checked) {
      unclickT2dNoiseGear();
    }
  };

  const handleT2dItemClick = (column: Column) => {
    if (showT2D && column.displayNoise && !selected[column.intDur]) {
      setOpenT2dWarning(true);
    }
  };

  const handleExcludeAllButtonClick = () => {
    const exclusions = { ...excluded };
    Object.keys(exclusions).forEach((item) => {
      exclusions[item] = true;
    });
    setExcluded(exclusions);
    if (sort === "total") {
      setColumns(sortByTotalNoise(exclusions));
    }
  };

  const handleClearExclusionsButtonClick = () => {
    const exclusions = { ...excluded };
    Object.keys(exclusions).forEach((item) => {
      exclusions[item] = false;
    });
    setExcluded(exclusions);
    if (sort === "total") {
      setColumns(sortByTotalNoise(exclusions));
    }
  };

  const handleTestButtonClick = () => {
    testCommit = "test";
    dialogTitle = TEST_DIALOG_TITLE;
    updateSelectedGears(selected, props.numGears, showT2D);
    setOpenDialog(true);
  };

  const handleCommitButtonClick = () => {
    testCommit = "commit";
    dialogTitle = COMMIT_DIALOG_TITLE;
    updateSelectedGears(selected, props.numGears, showT2D);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleDialogWriteButtonClick = () => {
    const selections = intDurs
      .filter((item) => selected[item.intDur])
      .map((item) => item.intDur);
    const commit = testCommit === "commit";
    try {
      sendSetAbsGearsRequest(selections, props.numGears, commit);
    } catch (error) {
      console.error(error);
      if (testCommit === "commit") {
        showAlert(ALERT_MESSAGE_WRITE_TO_FLASH);
      } else {
        showAlert(ALERT_MESSAGE_WRITE_TO_RAM);
      }
    }
    handleDialogClose();
  };

  const handleDialogCancelButtonClick = () => {
    handleDialogClose();
  };

  const handleT2dWarningClose = () => {
    setOpenT2dWarning(false);
  };

  const getSelection = (column: Column) => {
    return selected[column.intDur];
  };

  const updateSelection = (column: Column) => {
    const index = noiseData.findIndex((item) => {
      return item.intDur === column.intDur;
    });
    if (
      !noiseData[index].selected &&
      Object.values(selected).filter((item) => item === true).length >=
        props.numGears
    ) {
      return;
    }
    noiseData[index].selected = !noiseData[index].selected;
    setSelected({ ...selected, [column.intDur]: !selected[column.intDur] });
    if (sort === "total") {
      setColumns(sortByTotalNoise(excluded));
    }
  };

  const getExclusion = (condition: NoiseCondition) => {
    return excluded[condition.id];
  };

  const updateExclusion = (condition: NoiseCondition) => {
    const exclusions = { ...excluded };
    exclusions[condition.id] = !exclusions[condition.id];
    setExcluded(exclusions);
    if (sort === "total") {
      setColumns(sortByTotalNoise(exclusions));
    }
  };

  const generateSelectButtons = (): JSX.Element[] => {
    const output: JSX.Element[] = [];
    columns.forEach((item) => {
      if (showXY) {
        output.push(<TableCell key={item.intDur + "_x"}></TableCell>);
        output.push(<TableCell key={item.intDur + "_y"}></TableCell>);
      }
      output.push(
        <TableCell key={item.intDur + ""}>
          <ToggleButton
            value={item.intDur}
            onClick={() => {
              handleT2dItemClick(item);
            }}
            selected={getSelection(item)}
            onChange={() => {
              updateSelection(item);
            }}
            sx={{
              width: "20px",
              height: "20px",
              borderColor:
                dark === "" ? "rgba(160, 160, 160, 1)" : "rgba(96, 96, 96, 1)"
            }}
          >
            {getSelection(item) ? (
              <CheckIcon sx={{ width: "20px", height: "20px" }} />
            ) : null}
          </ToggleButton>
        </TableCell>
      );
    });

    return output;
  };

  const generateIntegrationDurations = (): JSX.Element[] => {
    const output: JSX.Element[] = [];
    columns.forEach((item) => {
      let bgColor = "transparent";
      if (showT2D && item.displayNoise) {
        bgColor = "gray";
      }
      if (showXY) {
        output.push(
          <TableCell
            key={item.intDur + "_x"}
            sx={{ backgroundColor: bgColor }}
          ></TableCell>
        );
        output.push(
          <TableCell
            key={item.intDur + "_y"}
            sx={{ backgroundColor: bgColor }}
          ></TableCell>
        );
      }
      output.push(
        <TableCell key={item.intDur + ""} sx={{ backgroundColor: bgColor }}>
          {item.intDur}
        </TableCell>
      );
    });
    return output;
  };

  const generateFrequencies = (): JSX.Element[] => {
    const output: JSX.Element[] = [];
    columns.forEach((item) => {
      let bgColor = "transparent";
      if (showT2D && item.displayNoise) {
        bgColor = "gray";
      }
      if (showXY) {
        output.push(
          <TableCell
            key={item.intDur + "_x"}
            sx={{ backgroundColor: bgColor }}
          ></TableCell>
        );
        output.push(
          <TableCell
            key={item.intDur + "_y"}
            sx={{ backgroundColor: bgColor }}
          ></TableCell>
        );
      }
      output.push(
        <TableCell key={item.intDur + ""} sx={{ backgroundColor: bgColor }}>
          {frequencies[item.intDur]}
        </TableCell>
      );
    });
    return output;
  };

  const generateMaxNoises = (): JSX.Element[] => {
    const output: JSX.Element[] = [];
    columns.forEach((item) => {
      let bgColor = "transparent";
      if (showT2D && item.displayNoise) {
        bgColor = "gray";
      }
      if (showXY) {
        output.push(
          <TableCell
            key={item.intDur + "_x"}
            sx={{ backgroundColor: bgColor }}
          ></TableCell>
        );
        output.push(
          <TableCell
            key={item.intDur + "_y"}
            sx={{ backgroundColor: bgColor }}
          ></TableCell>
        );
      }
      output.push(
        <TableCell key={item.intDur + ""} sx={{ backgroundColor: bgColor }}>
          {findMaxNoise(item)}
        </TableCell>
      );
    });
    return output;
  };

  const generateMaxNoisesNonExcluded = (): JSX.Element[] => {
    const output: JSX.Element[] = [];
    columns.forEach((item) => {
      let bgColor = "transparent";
      if (showT2D && item.displayNoise) {
        bgColor = "gray";
      }
      if (showXY) {
        output.push(
          <TableCell
            key={item.intDur + "_x"}
            sx={{ backgroundColor: bgColor }}
          ></TableCell>
        );
        output.push(
          <TableCell
            key={item.intDur + "_y"}
            sx={{ backgroundColor: bgColor }}
          ></TableCell>
        );
      }
      output.push(
        <TableCell key={item.intDur + ""} sx={{ backgroundColor: bgColor }}>
          {findMaxNoiseNonExcluded(item, excluded)}
        </TableCell>
      );
    });
    return output;
  };

  const generateLabelCells = (): JSX.Element[] => {
    const output: JSX.Element[] = [];
    columns.forEach((item) => {
      let bgColor = "transparent";
      if (showT2D && item.displayNoise) {
        bgColor = "gray";
      }
      if (showXY) {
        output.push(
          <TableCell key={item.intDur + "_x"} sx={{ backgroundColor: bgColor }}>
            AbsX
          </TableCell>
        );
        output.push(
          <TableCell key={item.intDur + "_y"} sx={{ backgroundColor: bgColor }}>
            AbxY
          </TableCell>
        );
      }
      output.push(
        <TableCell key={item.intDur + ""} sx={{ backgroundColor: bgColor }}>
          max
        </TableCell>
      );
    });
    return output;
  };

  const generateTotalNoisesNonExcluded = (): JSX.Element[] => {
    const output: JSX.Element[] = [];
    columns.forEach((item) => {
      let bgColor = "transparent";
      if (showT2D && item.displayNoise) {
        bgColor = "gray";
      }
      if (showXY) {
        output.push(
          <TableCell
            key={item.intDur + "_x"}
            sx={{ backgroundColor: bgColor }}
          ></TableCell>
        );
        output.push(
          <TableCell
            key={item.intDur + "_y"}
            sx={{ backgroundColor: bgColor }}
          ></TableCell>
        );
      }
      output.push(
        <TableCell key={item.intDur + ""} sx={{ backgroundColor: bgColor }}>
          {findTotalNoiseNonExcluded(item, excluded)}
        </TableCell>
      );
    });
    return output;
  };

  const createConditionData = (condition: NoiseCondition): any => {
    const data: any[] = [];
    columns.forEach((col) => {
      const dataSet = noiseData.find((item) => item.intDur === col.intDur);
      const dataEntry = dataSet!.data.find(
        (item: NoiseDataEntry) => item.condition.id === condition.id
      );
      if (showXY) {
        data.push({
          value: dataEntry!.absx,
          displayNoise: dataSet!.displayNoise
        });
        data.push({
          value: dataEntry!.absy,
          displayNoise: dataSet!.displayNoise
        });
      }
      data.push({ value: dataEntry!.max, displayNoise: dataSet!.displayNoise });
    });
    let maxVals: number[];
    if (showXY) {
      maxVals = data
        .map((item) => {
          return item.value;
        })
        .filter((item, index) => {
          return (index + 1) % 3 === 0;
        });
    } else {
      maxVals = data.map((item) => {
        return item.value;
      });
    }
    return {
      data,
      minNoise: Math.min.apply(null, maxVals)
    };
  };

  const createT2dData = (condition: NoiseCondition): any => {
    const data: any[] = [];
    columns.forEach((col) => {
      const dataSet = noiseData.find((item) => item.intDur === col.intDur);
      const dataEntry = dataSet!.data.find(
        (item: NoiseDataEntry) => item.condition.id === condition.id
      );
      if (showXY) {
        data.push({
          value: undefined,
          displayNoise: dataSet!.displayNoise
        });
        data.push({
          value: undefined,
          displayNoise: dataSet!.displayNoise
        });
      }
      data.push({
        value: dataEntry!.t2dScore,
        displayNoise: dataSet!.displayNoise
      });
    });

    return {
      data
    };
  };

  const generateConditionRows = (): JSX.Element[] => {
    const output: JSX.Element[] = [];
    conditions.forEach((item: NoiseCondition, index: number) => {
      const conditionData = createConditionData(item);
      output.push(
        <TableRow key={index}>
          <TableCell>
            <ToggleButton
              value={item.name}
              selected={getExclusion(item)}
              onChange={() => {
                updateExclusion(item);
              }}
              sx={{
                width: "20px",
                height: "20px",
                borderColor:
                  dark === "" ? "rgba(160, 160, 160, 1)" : "rgba(96, 96, 96, 1)"
              }}
            >
              {getExclusion(item) ? (
                <ClearIcon sx={{ width: "20px", height: "20px" }} />
              ) : null}
            </ToggleButton>
          </TableCell>
          <TableCell>
            {props.t2dCompleted
              ? findT2dMinNoise(item, showT2D)
              : conditionData.minNoise}
          </TableCell>
          <TableCell sx={{ fontWeight: "bold" }}>
            {findMinGearNoise(item)}
          </TableCell>
          <TableCell component="th">{item.name}</TableCell>
          {conditionData.data.map((item: any, index: number) => {
            let bgColor = "transparent";
            if (showT2D && item.displayNoise) {
              bgColor = "gray";
            }
            return (
              <TableCell key={index} sx={{ backgroundColor: bgColor }}>
                {item.value}
              </TableCell>
            );
          })}
        </TableRow>
      );
    });
    return output;
  };

  const generateT2dRows = (): JSX.Element[] => {
    const output: JSX.Element[] = [];
    conditions.forEach((item: NoiseCondition, index: number) => {
      const conditionData = createT2dData(item);
      output.push(
        <TableRow key={index}>
          <TableCell />
          <TableCell />
          <TableCell />
          <TableCell component="th">{item.name}</TableCell>

          {conditionData.data.map((item: any, index: number) => {
            let bgColor = "transparent";
            if (showT2D && item.displayNoise) {
              bgColor = "gray";
            }
            return (
              <TableCell key={index} sx={{ backgroundColor: bgColor }}>
                {item.value}
              </TableCell>
            );
          })}
        </TableRow>
      );
    });
    return output;
  };

  useEffect(() => {
    if (props.noiseData.length > 0) {
      noiseData = props.noiseData.map((item: NoiseDataSet) =>
        Object.assign({}, item)
      );
      intDurs = noiseData.map((item) => {
        return { intDur: item.intDur, displayNoise: item.displayNoise };
      });
      setColumns(intDurs);
      const selected: Selected = {};
      intDurs.forEach((item) => {
        let freq =
          1000 /
          (((ISTRETCH + item.intDur + RESET + SAMPLE + OVERHEAD) / CLOCK) * 2);
        freq = Math.floor(freq * 10) / 10;
        frequencies[item.intDur] = freq;
        selected[item.intDur] = false;
      });
      setSelected(selected);
      conditions = noiseData[0].data.map((item) => {
        return item.condition;
      });
      const excluded: Excluded = {};
      conditions.forEach((item) => {
        excluded[item.id] = false;
      });
      setExcluded(excluded);
      setInitialized(true);
    }
  }, [props.noiseData]);

  useEffect(() => {
    if (props.sweepCompleted) {
      setInitialized(true);
    } else {
      setInitialized(false);
    }
  }, [props.sweepCompleted]);

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
            <Typography>Abscap Table</Typography>
            <TableContainer
              component={Box}
              sx={{
                marginTop: "16px",
                border: "2px solid rgba(128, 128, 128, 1)",
                overflowX: "auto"
              }}
            >
              <div className={"jp-webds-gear-selection-table" + dark}>
                <Table padding="none" sx={{ tableLayout: "fixed" }}>
                  <TableBody>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell component="th">Select</TableCell>
                      {generateSelectButtons()}
                    </TableRow>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell component="th">Integration Duration</TableCell>
                      {generateIntegrationDurations()}
                    </TableRow>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell component="th">Frequency (kHz)</TableCell>
                      {generateFrequencies()}
                    </TableRow>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell component="th">Overall Max Noise</TableCell>
                      {generateMaxNoises()}
                    </TableRow>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell component="th">
                        Max Noise (non-excluded)
                      </TableCell>
                      {generateMaxNoisesNonExcluded()}
                    </TableRow>
                    <TableRow
                      sx={{ borderTop: "2px solid rgba(128, 128, 128, 1)" }}
                    >
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell component="th">T2D Test Condition</TableCell>
                    </TableRow>
                    {props.t2dCompleted && generateT2dRows()}
                    <TableRow
                      sx={{ borderTop: "2px solid rgba(128, 128, 128, 1)" }}
                    ></TableRow>
                    <TableRow
                      sx={{
                        borderBottom: "2px solid rgba(128, 128, 128, 1)"
                      }}
                    >
                      <TableCell>Exclude</TableCell>
                      <TableCell>Min Noise</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Min Gear Noise
                      </TableCell>
                      <TableCell component="th">Test Condition</TableCell>
                      {generateLabelCells()}
                    </TableRow>
                    {generateConditionRows()}
                    <TableRow
                      sx={{ borderTop: "2px solid rgba(128, 128, 128, 1)" }}
                    >
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell component="th">
                        Total Noise (non-excluded)
                      </TableCell>
                      {generateTotalNoisesNonExcluded()}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </TableContainer>
            <Controls
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "top",
                justifyContent: "space-between"
              }}
            >
              <Stack spacing={1} sx={{ width: "150px" }}>
                <Button
                  size="small"
                  onClick={() => handleExcludeAllButtonClick()}
                  sx={{
                    width: "120px",
                    textTransform: "none"
                  }}
                >
                  Exclude All
                </Button>
                <Button
                  size="small"
                  onClick={() => handleClearExclusionsButtonClick()}
                  sx={{
                    width: "120px",
                    textTransform: "none"
                  }}
                >
                  Exclude None
                </Button>
                <CustomFormControlLabel
                  control={
                    <Checkbox
                      onChange={(event) => handleSortCheckboxClick(event)}
                      sx={{ width: "24px", height: "24px" }}
                    />
                  }
                  label="&nbsp;Sort by Total Noise"
                />
                <CustomFormControlLabel
                  control={
                    <Checkbox
                      onChange={(event) => handleHideXYCheckboxClick(event)}
                      sx={{ width: "24px", height: "24px" }}
                    />
                  }
                  label="&nbsp;Hide X/Y"
                />
                <CustomFormControlLabel
                  control={
                    <Checkbox
                      disabled={!props.t2dCompleted}
                      onChange={(event) =>
                        handleDisplayNoiseCheckboxClick(event)
                      }
                      sx={{ width: "24px", height: "24px" }}
                    />
                  }
                  label="&nbsp;Select Zero T2D score"
                />
              </Stack>
              <Stack spacing={1}>
                <Button
                  size="small"
                  onClick={() => handleTestButtonClick()}
                  sx={{
                    width: "120px",
                    textTransform: "none"
                  }}
                >
                  Test
                </Button>
                <Button
                  size="small"
                  onClick={() => handleCommitButtonClick()}
                  sx={{
                    width: "120px",
                    textTransform: "none"
                  }}
                >
                  Commit
                </Button>
              </Stack>
            </Controls>
          </Content>
          <Dialog open={openDialog} onClose={handleDialogClose}>
            <DialogTitle sx={{ textAlign: "center" }}>
              {dialogTitle}
            </DialogTitle>
            <DialogContent>
              {t2dNoise ? (
                <DialogContentText sx={{ color: "red" }}>
                  This gear set includes frequencies that may result in T2D
                  noise.
                </DialogContentText>
              ) : null}
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Gear</TableCell>
                    <TableCell align="right">Frequency&nbsp;(kHz)</TableCell>
                    <TableCell align="right">Int-Dur</TableCell>
                    <TableCell align="right">Rstretch</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedGears.map((item) => (
                    <TableRow key={item.gear}>
                      <TableCell align="center">{item.gear}</TableCell>
                      <TableCell align="center">{item.frequency}</TableCell>
                      <TableCell align="center">{item.intDur}</TableCell>
                      <TableCell align="center">{item.rstretch}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => handleDialogCancelButtonClick()}
                sx={{ width: "100px" }}
              >
                Cancel
              </Button>
              <Button
                disabled={!selectedGears[0] || !selectedGears[0].frequency}
                onClick={() => handleDialogWriteButtonClick()}
                sx={{ width: "100px" }}
              >
                Write
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog open={openT2dWarning} onClose={() => handleT2dWarningClose()}>
            <DialogContent>
              <DialogContentText>
                This gear set includes frequencies that may result in T2D noise.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button autoFocus onClick={() => handleT2dWarningClose()}>
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : null}
    </>
  );
};

export default Abscap;
