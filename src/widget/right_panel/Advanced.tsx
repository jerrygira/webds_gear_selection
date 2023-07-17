import React, { useState } from "react";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionSummary, {
  AccordionSummaryProps
} from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { styled } from "@mui/material/styles";

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    marginBottom: "8px"
  },
  "&:before": {
    display: "none"
  }
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<KeyboardArrowDownIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, .05)"
      : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)"
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1)
  }
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)"
}));

export const Advanced = (props: any): JSX.Element => {
  const [baselineFrames, setBaselineFrames] = useState<number | null>(
    props.baselineFrames
  );
  const [gramDataFrames, setGramDataFrames] = useState<number | null>(
    props.gramDataFrames
  );

  const handleDoneButtonClick = () => {
    props.setBaselineFrames(baselineFrames);
    props.setGramDataFrames(gramDataFrames);
    props.setOpenSetting(false);
  };

  const handleCancelButtonClick = () => {
    props.setOpenSetting(false);
  };

  const handleCovarianceInputChange = (id: string, value: string) => {
    if (value !== "" && isNaN(Number(value))) {
      return;
    }
    if (value === "") {
      if (id === "baselineFrames") {
        setBaselineFrames(null);
      } else if (id === "gramDataFrames") setGramDataFrames(null);
      return;
    }
    const num = parseInt(value, 10);
    if (num < 4096) {
      if (id === "baselineFrames") {
        setBaselineFrames(num);
      } else if (id === "gramDataFrames") setGramDataFrames(num);
    }
  };

  return (
    <Stack>
      <div
        style={{
          width: "500px",
          height: "150px",
          position: "relative"
        }}
      >
        <div style={{ marginTop: "0px", overflow: "auto" }}>
          <Accordion>
            <AccordionSummary expandIcon={<KeyboardArrowRightIcon />}>
              <Typography sx={{ width: "33%", flexShrink: 0, fontSize: 14 }}>
                Covariance Params
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                Baseline Frames:&nbsp;{baselineFrames}, Gram Data Frames:&nbsp;
                {gramDataFrames}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack justifyContent="center" spacing={5} direction="row">
                <div>
                  <Typography sx={{ fontSize: 14 }}>Baseline Frames</Typography>
                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{ width: "150px" }}
                  >
                    <OutlinedInput
                      id="baselineFrames"
                      value={baselineFrames}
                      onChange={(event) =>
                        handleCovarianceInputChange(
                          event.target.id,
                          event.target.value
                        )
                      }
                    />
                  </FormControl>
                </div>
                <div>
                  <Typography sx={{ fontSize: 14 }}>
                    Gram Data Frames
                  </Typography>
                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{ width: "150px" }}
                  >
                    <OutlinedInput
                      id="gramDataFrames"
                      value={gramDataFrames}
                      onChange={(event) =>
                        handleCovarianceInputChange(
                          event.target.id,
                          event.target.value
                        )
                      }
                    />
                  </FormControl>
                </div>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </div>
      </div>
      <Stack spacing={1} direction="row" justifyContent={"flex-end"}>
        <Button
          onClick={() => handleCancelButtonClick()}
          sx={{ width: "100px" }}
        >
          Cancel
        </Button>
        <Button
          disabled={baselineFrames === null || gramDataFrames === null}
          onClick={() => handleDoneButtonClick()}
          sx={{ width: "100px" }}
        >
          Done
        </Button>
      </Stack>
    </Stack>
  );
};

export default Advanced;
