import React, { useEffect, useState } from "react";

import { v4 as uuidv4 } from "uuid";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";

import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddBoxIcon from "@mui/icons-material/AddBox";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { Content } from "../mui_extensions/Content";
import { Advanced } from "./Advanced";

export const Conditions = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSetting, setOpenSetting] = useState(false);
  const [intDurMin, setIntDurMin] = useState<number | null>(props.intDurMin);
  const [intDurSteps, setIntDurSteps] = useState<number | null>(
    props.intDurSteps
  );

  const [noiseConditionEntry, setNoiseConditionEntry] = useState<any>({
    id: null,
    name: "Noise Condition"
  });

  const handleAddButtonClick = () => {
    setOpenDialog(true);
  };

  const handleSettingButtonClick = () => {
    setOpenSetting(true);
  };

  const handleTextFieldChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNoiseConditionEntry({
      ...noiseConditionEntry,
      name: event.target.value
    });
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleSettingClose = () => {
    setOpenSetting(false);
  };

  const handleDeleteButtonClick = (id: string) => {
    const items = props.noiseConditions.filter((item: any) => item.id !== id);
    props.setNoiseConditions(items);
  };

  const handleDialogDone = () => {
    const items: any = Array.from(props.noiseConditions);
    if (noiseConditionEntry.id) {
      const index = items.findIndex((item: any) => {
        return item.id === noiseConditionEntry.id;
      });
      if (index !== -1) {
        items[index].name = noiseConditionEntry.name;
        //setNoiseConditions(items);
        props.setNoiseConditions(items);
      }
    } else {
      const item = {
        id: uuidv4(),
        name: noiseConditionEntry.name
      };
      items.push(item);
      props.setNoiseConditions(items);
    }
    handleDialogClose();
  };

  const handleListItemClick = (id: string, name: string) => {
    setNoiseConditionEntry({ id, name });
    setOpenDialog(true);
  };

  const handleDialogDoneButtonClick = () => {
    handleDialogDone();
  };

  const handleDialogCancelButtonClick = () => {
    handleDialogClose();
  };

  const generateListItems = (): JSX.Element[] => {
    return props.noiseConditions?.map(({ id, name }: any, index: number) => {
      return (
        <ListItem
          key={id}
          divider
          secondaryAction={
            <IconButton
              color="error"
              edge="start"
              onClick={() => handleDeleteButtonClick(id)}
            >
              <DeleteIcon />
            </IconButton>
          }
        >
          <ListItemButton
            onClick={() => handleListItemClick(id, name)}
            sx={{ marginRight: "16px", padding: "0px 16px" }}
          >
            <ListItemText primary={name} />
          </ListItemButton>
        </ListItem>
      );
    });
  };

  const handleIntDurInputChange = (id: string, value: string) => {
    if (value !== "" && isNaN(Number(value))) {
      return;
    }
    if (value === "") {
      if (id === "intDurMin") {
        setIntDurMin(null);
        props.setIntDurMin(null);
      } else if (id === "intDurSteps") {
        setIntDurSteps(null);
        props.setIntDurSteps(null);
      }
      return;
    }
    const num = parseInt(value, 10);
    if (num < 4096) {
      if (id === "intDurMin") {
        setIntDurMin(num);
        props.setIntDurMin(num);
      } else if (id === "intDurSteps") {
        setIntDurSteps(num);
        props.setIntDurSteps(num);
      }
    }
  };

  const handleTextFieldKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.keyCode === 13) {
      if (event.preventDefault) {
        event.preventDefault();
      }
      if (event.stopPropagation) {
        event.stopPropagation();
      }
      handleDialogDone();
    }
  };

  useEffect(() => {
    setInitialized(true);
  }, []);

  return (
    <>
      {initialized ? (
        <>
          <Content
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}
          >
            <Stack justifyContent="center" spacing={10} direction="row">
              <div>
                <Typography id="minIntDurText">Minimum Int-Dur</Typography>
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ width: "100px" }}
                >
                  <OutlinedInput
                    id="intDurMin"
                    value={intDurMin}
                    onChange={(event) =>
                      handleIntDurInputChange(
                        event.target.id,
                        event.target.value
                      )
                    }
                  />
                </FormControl>
              </div>
              <div>
                <Typography id="intDurStepsText">Int-Dur Steps</Typography>
                <FormControl
                  variant="outlined"
                  size="small"
                  sx={{ width: "100px" }}
                >
                  <OutlinedInput
                    id="intDurSteps"
                    value={intDurSteps}
                    onChange={(event) =>
                      handleIntDurInputChange(
                        event.target.id,
                        event.target.value
                      )
                    }
                  />
                </FormControl>
              </div>
            </Stack>
            <Divider
              orientation="horizontal"
              sx={{ width: "100%", marginTop: "10px" }}
            />
            <Stack justifyContent="center" direction="row"></Stack>

            <Button
              variant="text"
              sx={{
                width: "100%",
                marginTop: "5px",
                marginBottom: "10px",
                left: "145px"
              }}
              onClick={() => handleSettingButtonClick()}
            >
              <Typography variant="underline" sx={{ position: "absolute" }}>
                Advanced Settings
              </Typography>
            </Button>
            <Typography sx={{ marginTop: "25px" }}>Noise Conditions</Typography>
            <div
              id="webds_gear_selection_landing_noise_conditions_list"
              style={{
                width: "75%",
                marginTop: "0px",
                overflow: "auto"
              }}
            >
              <List>{generateListItems()}</List>
              <Stack justifyContent="center" direction="row">
                <IconButton
                  id="addNoiseConditionButton"
                  color="primary"
                  onClick={() => handleAddButtonClick()}
                  sx={{ marginTop: "px" }}
                >
                  <AddBoxIcon />
                </IconButton>
              </Stack>
            </div>
          </Content>
          <Dialog
            fullWidth
            maxWidth="xs"
            open={openDialog}
            onClose={handleDialogClose}
          >
            <DialogContent>
              <TextField
                fullWidth
                variant="standard"
                label="Name of Noise Condition"
                type="text"
                value={noiseConditionEntry.name}
                onChange={handleTextFieldChange}
                onKeyDown={handleTextFieldKeyDown}
                InputLabelProps={{
                  shrink: true
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => handleDialogCancelButtonClick()}
                sx={{ width: "100px" }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDialogDoneButtonClick()}
                sx={{ width: "100px" }}
              >
                Done
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog maxWidth="sm" open={openSetting} onClose={handleSettingClose}>
            <DialogContent>
              <Advanced
                baselineFrames={props.baselineFrames}
                setBaselineFrames={props.setBaselineFrames}
                gramDataFrames={props.gramDataFrames}
                setGramDataFrames={props.setGramDataFrames}
                openSetting={openSetting}
                setOpenSetting={setOpenSetting}
              />
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </>
  );
};

export default Conditions;
