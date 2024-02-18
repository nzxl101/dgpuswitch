const PowerShell = require("powershell");
const consola = require("consola");
const fs = require("fs");
const path = require("path");

const screenId = "DISPLAY\\TMX1400*"; // Change this to your internal screen name
const dGPU = "*NVIDIA GeForce*"; // If you use AMD, adjust accordingly

let previousStatus = 0;
let dGPUSwitch = false;
let externalMonitorStatus = getMonitorStatus();

(async () => {
    consola.ready("dGPUSwitch is now running");

    while (true) {
        externalMonitorStatus = getMonitorStatus();
        consola.info(`External Monitor connected: ${externalMonitorStatus === 1 ? "YES" : "NO"} (${previousStatus} -> ${externalMonitorStatus})`);

        if (externalMonitorStatus === 0) {
            if (previousStatus !== externalMonitorStatus || dGPUSwitch === false) {
                // toggle the dGPU
                // - this will make sure every app running over dGPU will exit/move to iGPU
                // - after cycle, only specified apps will be running on dGPU
                consola.ready(`Cycling the dGPU ${dGPU} .. (Might hang for a sec)`);

                await new Promise((resolve) => {
                    new PowerShell(`$device = Get-PnpDevice | where {$_.friendlyname -like "${dGPU}"}
                          $device | Disable-PnpDevice -Confirm:$false -verbose
                          $device | Enable-PnpDevice -Confirm:$false -verbose
                        `).on("output", (data) => {
                        consola.warn("\n" + data);
                        resolve();
                    });
                });

                consola.success("All programs should be using the iGPU now!");
                dGPUSwitch = true;
            }
        }

        await new Promise((p) => setTimeout(p, 30e3));
    }
})();

function getMonitorStatus() {
    if (!fs.existsSync(path.join(__dirname, "monitor.txt"))) {
        fs.writeFileSync(path.join(__dirname, "monitor.txt"), "0", "utf8");
    }

    new PowerShell(`Get-PnpDevice -Status OK | ? {$_.class -like "Monitor"-and $_.instanceid -notlike "${screenId}"}`)
        .on("error-output", (data) => {
            consola.err(data);
        })
        .on("output", (data) => {
            if (data) {
                previousStatus = Number(fs.readFileSync(path.join(__dirname, "monitor.txt"))) || 0;
                fs.writeFileSync(path.join(__dirname, "monitor.txt"), "1", "utf8");
                dGPUSwitch = false;
            } else {
                previousStatus = Number(fs.readFileSync(path.join(__dirname, "monitor.txt"))) || 0;
                fs.writeFileSync(path.join(__dirname, "monitor.txt"), "0", "utf8");
            }
        });

    return Number(fs.readFileSync(path.join(__dirname, "monitor.txt"))) || 0;
}
