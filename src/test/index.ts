import { writeFileSync } from "fs";
import { mdToPdf } from "md-to-pdf";
import path from "path";
import { ilog } from "../util.js";
import { dailyWork } from "../io.js";

dailyWork();
