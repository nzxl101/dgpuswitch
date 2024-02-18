# dgpuswitch

dGPUSwitch is a simple Node wrapper for PowerShell to cycle through dGPUs on Laptops that don't have a Mux switch.  
For now it only supports the Razer Blade 14 (2021) out of the box, but by simply editing the source code it can be used for basically any machine.

This project was inspired by a script I had found online, which has been since deleted.

## How to use

If you have a Razer Blade 14 (2021) or any other model with the same QHD screen, you can just simply download the binary provided by GH Releases.

Other devices:

-   Navigate into the `app.js` file
-   Find `screenId` at the top of the file and adjust accordingly to your screen name/vendor. The model can be found through Device Manager -> Monitors
-   If you don't have an Nvidia GPU, you can try adjusting `dGPU` to match your AMD or other dGPUs. (not tested)

Compiling:

```
$ npm install
$ npm run build
```

> [!WARNING]
> This app needs to run with elevated priviliges, otherwise the PS commands WILL fail.  
> It is recommended to let this app run on boot/login.
