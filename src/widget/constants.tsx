export const WIDTH = 1000;

export const DEFAULT_INT_DUR_MIN = 24;

export const DEFAULT_INT_DUR_STEPS = 10;

export const DEFAULT_BASELINE_FRAMES = 16;

export const DEFAULT_GRAM_DATA_FRAMES = 400;

export const TEST_DIALOG_TITLE = "Gear Settings to Write to RAM";

export const COMMIT_DIALOG_TITLE = "Gear Settings to Write to Flash";

export const EVENT_NAME = "gear_selection";

export const ALERT_MESSAGE_TUNING_RESULTS =
  "Failed to obtain tuning results. Please ensure valid finger delta provided during data collection.";

  export const ALERT_MESSAGE_READ_STATIC =
  "Failed to read static config and obtain gear information from device. Please ensure device and running firmware support Carme gear selection.";

export const ALERT_MESSAGE_ADD_PUBLIC_CONFIG_JSON =
  "Failed to retrieve config JSON file. Please check in file browser in left sidebar and ensure availability of config JSON file in /Packrat/ directory (e.g. /Packrat/1234567/config.json for PR1234567).";

export const ALERT_MESSAGE_ADD_PRIVATE_CONFIG_JSON =
  "Failed to retrieve config JSON file. Please check in file browser in left sidebar and ensure availability of config JSON file in /Packrat/ directory (e.g. /Packrat/1234567/config_private.json for PR1234567).";

export const ALERT_MESSAGE_WRITE_TO_RAM =
  "Failed to write gear settings to RAM.";

export const ALERT_MESSAGE_WRITE_TO_FLASH =
  "Failed to write gear settings to flash.";

export const ALERT_MESSAGE_PRE_PDNR_SWEEP =
  "Failed to do Pre-PDNR sweep. Please ensure device and running firmware support Carme gear selection.";

export const ALERT_MESSAGE_PDNR_SWEEP =
  "Failed to do PDNR sweep. Please ensure device and running firmware support Carme gear selection.";

export const ALERT_MESSAGE_ABORT_PRE_PDNR_SWEEP =
  "Failed to abort Pre-PDNR sweep.";

export const ALERT_MESSAGE_ABORT_PDNR_SWEEP = "Failed to abort PDNR sweep.";

export const ALERT_MESSAGE_CLEAR_PDNR_TUNING = "Failed to clear PDNR tuning.";

export const STEPPER_STEPS = {
  1: {
    label: " 1. Set Up Noise Conditions",
    content: `Determine the number of Int-Dur and minimum Int-Dur at first, 
    and create each test condition for different test environment.
    `
  },
  2: {
    label: " 2. PDNR Sweeps a Range Of Frequencies.",
    content: ``,
    alert: `Please set up at least one noise condition in step 1.`
  },
  3: {
    label: " 3. T2D Sweeps a Range Of Frequencies.",
    content: ``,
    alert: `Please complete PDNR sweep in step 2 first.`
  },
  4: {
    label: " 4. Create Transcap Selection Matrix",
    content: `Use right panel to select integration duration.`,
    alert: `Please complete PDNR sweep in step 2 first.`
  },
  5: {
    label: " 5. Create Abs Selection Matrix",
    content: `Use right panel to select integration duration.`,
    alert: `Please complete PDNR sweep in step 2 first.`
  }
};

export const CANVAS_ATTRS = {
  WIDTH: 1200,
  HEIGHT_TITLE: 70,
  MIN_HEIGHT_CONTENT: 500,
  MIN_HEIGHT_CONTROLS: 120,
  PADDING: 24
};

export interface ContentAttrs {
  LEFT_PANEL_WIDTH: number;
  RIGHT_PANEL_WIDTH: number;
  PANEL_SPACING: number;
}

export const getContentAttrs = (
  canvasWidth = CANVAS_ATTRS.WIDTH
): ContentAttrs => {
  const panelSpacing = 2;
  const leftPanelWidth =
    (canvasWidth - CANVAS_ATTRS.PADDING * 2 - panelSpacing * 8 * 2) / 4;
  const rightPanelWidth =
    ((canvasWidth - CANVAS_ATTRS.PADDING * 2 - panelSpacing * 8 * 2) / 4) * 3;
  return {
    LEFT_PANEL_WIDTH: leftPanelWidth,
    RIGHT_PANEL_WIDTH: rightPanelWidth,
    PANEL_SPACING: panelSpacing
  };
};

export const STEPPER_ATTRS = {
  ICON_SIZE: 32,
  CONNECTOR_MIN_HEIGHT: 20
};
