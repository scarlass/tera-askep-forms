#!/usr/bin/env node

import { createCommand } from "commander";
import generateV1 from "./scripts/generator.v1.js";
import generateV2 from "./scripts/generator.v2.js";
import { program } from "commander";

program
    .addCommand(
        createCommand("v1").action(function () {
            console.log("GENERATE ASKEP IMUNISASI CALENDAR - V1");
            generateV1(
                import.meta.dirname,
                "templates/v1.html",
                "../../../dist/forms/imunisasi/calendar/v1.html",
            );
        })
    )
    .addCommand(
        createCommand("v2").action(function () {
            console.log("GENERATE ASKEP IMUNISASI CALENDAR - V2");
            generateV2(
                import.meta.dirname,
                "templates/v2.html",
                "../../../dist/forms/imunisasi/calendar/v2.html",
            );
        })
    )
    .parse();
